use axum::{Extension, extract::{State, WebSocketUpgrade, ws::WebSocket}, response::Response};
use serde::Deserialize;

use crate::{Etat, server::ip::ClientIp};

#[derive(Deserialize, Clone)]
#[serde(tag = "type")]
enum IncomingEvent {
    Launch { name: String, color: [u8; 3], citation: String },
    Update { name: Option<String>, color: Option<[u8; 3]> },
    Signal { position: (f32, f32, f32), rotation: Option<(f32, f32, f32)> }
}

pub async fn ws_handle(
    ws: WebSocketUpgrade,
    State(etat): State<Etat>,
    Extension(ip): Extension<ClientIp>
) -> Response {
    let ip = ip.to_string();
    let mut response = ws.on_upgrade(move |socket| handle_socket(socket, ip, etat));

    let headers = response.headers_mut();
    headers.insert("access-control-allow-origin", "*".parse().unwrap());

    response
}

async fn handle_socket(mut socket: WebSocket, ip: String, etat: Etat) {
    while let Some(Ok(data)) = socket.recv().await {
        let incoming_event: IncomingEvent = match data.to_text() {
            Ok(event) => match serde_json::from_str(event) {
                Ok(event) => event,
                Err(_) => continue
            },
            Err(_) => return
        };
        
        let outcoming_event = match incoming_event {
            IncomingEvent::Launch { name, color, citation } => {
                etat.launch(&ip, name, color, citation).await.ok()
            },
            IncomingEvent::Signal { position, rotation } => {
                etat.signal(&ip, position, rotation).await.ok()
            },
            IncomingEvent::Update { name, color } => {
                etat.update(&ip, name, color).await.ok()
            }
        };

        if let Some(outcoming_event) = outcoming_event {
            etat.broadcast(outcoming_event);
        }
    }
}