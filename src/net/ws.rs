use std::net::SocketAddr;
use axum::{extract::{ConnectInfo, State, WebSocketUpgrade, ws::WebSocket}, response::IntoResponse};
use serde::Deserialize;

use crate::{Etat, events::Events, net::sse::broadcast, satellite::Satellite};

#[derive(Deserialize, Clone)]
#[serde(tag = "type")]
enum IncomingEvent {
    Launch { name: String, color: [u8; 3], citation: String },
    Update { name: Option<String>, color: Option<[u8; 3]> },
    Signal { position: (i32, i32, i32), rotation: Option<(i32, i32, i32)> }
}

pub async fn ws_handle(
    ws: WebSocketUpgrade,
    State(etat): State<Etat>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>
) -> impl IntoResponse {
    let ip = addr.ip().to_string();

    ws.on_upgrade(move |socket| handle_socket(socket, ip, etat))
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
        
        let mut orbit = etat.orbit.write().await;
        let outcoming_event = match incoming_event {
            IncomingEvent::Launch { name, color, citation } => {
                let satellite = Satellite::launch(&name, color);
                orbit.insert(ip.clone(), satellite);

                // Broadcast to everyone that a new satellite launched (with citation)
                let event = Events::Launch {
                    name: name, 
                    color, 
                    payload: citation
                };
                Some(event)
            },
            IncomingEvent::Signal { position, rotation } => {
                if let Some(satellite) =  orbit.get_mut(&ip) {
                    satellite.update_position(position, rotation);

                    // Broadcast to everyone, the satellite' signal
                    let event = Events::Position { 
                        name: satellite.name.clone(), 
                        position: position,
                        rotation: rotation
                    };
                    Some(event)
                } else {
                    None
                }
            },
            IncomingEvent::Update { name, color } => {
                if let Some(satellite) =  orbit.get_mut(&ip) {
                    if let Some(name) = name.clone() {
                        satellite.update_name(&name);
                    }
                    if let Some(color) = color {
                        satellite.update_color(color);
                    }
                    let event = Events::Update { 
                        name: satellite.name.clone(), 
                        color,
                        new_name: name
                    };
                    Some(event)
                } else {
                    None
                }
            }
        };

        if let Some(outcoming_event) = outcoming_event {
            broadcast(&etat.tx, outcoming_event).await;
        }
    }
}