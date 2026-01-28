use std::net::SocketAddr;

use axum::{Json, extract::{ConnectInfo, State}, http::StatusCode, response::{IntoResponse, Response}};
use serde::Deserialize;
use crate::{Etat, events::Events, net::sse::broadcast, satellite::Satellite};

#[derive(Deserialize)]
pub struct LaunchSettings {
    name: String,
    color: [u8; 3],
    citation: String
}

pub async fn launch(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(etat): State<Etat>, 
    Json(settings): Json<LaunchSettings>
) -> String {
    let satellite = Satellite::launch(&settings.name, settings.color);
    let origin = addr.ip().to_string();

    let mut orbit = etat.orbit.write().await;
    orbit.insert(origin, satellite);

    let event = Events::Launch {
        name: settings.name.clone(), 
        color: settings.color, 
        payload: settings.citation
    };

    // Broadcast to everyone that a new satellite launched (with citation)
    broadcast(&etat.tx, event).await;

    settings.name
}

#[derive(Deserialize)]
pub struct Update {
    name: Option<String>,
    color: Option<[u8; 3]>
}

pub async fn update(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(etat): State<Etat>, 
    Json(update): Json<Update>
) -> Response {
    let origin = addr.ip().to_string();

    let mut orbit = etat.orbit.write().await;

    let satellite= orbit.get_mut(&origin);    
    match satellite {
        Some(satellite) => {
            if let Some(name) = update.name.clone() {
                satellite.update_name(&name);
            }
            if let Some(color) = update.color {
                satellite.update_color(color);
            }
            let event = Events::Update {
                name: satellite.name.clone(), 
                color: update.color,
                new_name: update.name
            };
            broadcast(&etat.tx, event).await;

            // 200
            ().into_response()
        },
        None => 
            // 404
            StatusCode::NOT_FOUND.into_response()
    }
}

#[derive(Deserialize)]
pub struct Signal {
    position: (f32, f32, f32),
    rotation: Option<(f32, f32, f32)>
}

pub async fn signal(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(etat): State<Etat>, 
    Json(signal): Json<Signal>
) -> Response {
    let origin = addr.ip().to_string();

    let mut orbit = etat.orbit.write().await;

    let satellite= orbit.get_mut(&origin);    
    match satellite {
        Some(satellite) => {
            satellite.update_position(signal.position, signal.rotation);

            // Broadcast to everyone, the satellite' signal
            let event = Events::Position { 
                name: satellite.name.clone(), 
                position: signal.position,
                rotation: signal.rotation
            };
            broadcast(&etat.tx, event).await;

            // 200
            ().into_response()
        },
        None => 
            // 404
            StatusCode::NOT_FOUND.into_response()
    }
}