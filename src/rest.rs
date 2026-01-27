use std::net::SocketAddr;

use axum::{Json, extract::{ConnectInfo, State}, http::StatusCode, response::{IntoResponse, Response}};
use serde::Deserialize;
use crate::satellite::{Orbit, Satellite};

#[derive(Deserialize)]
pub struct LaunchSettings {
    name: String,
    color: [u8; 3],
    citation: String
}

pub async fn launch(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(orbit): State<Orbit>, 
    Json(settings): Json<LaunchSettings>
) -> String {
    let satellite = Satellite::launch(&settings.name, settings.color);
    let origin = addr.ip().to_string();

    let mut orbit = orbit.write().unwrap();
    orbit.insert(origin, satellite);

    // Broadcast to everyone that a new satellite launched (with citation)

    settings.name
}

#[derive(Deserialize)]
pub struct Update {
    name: Option<String>,
    color: Option<[u8; 3]>
}

pub async fn update(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(orbit): State<Orbit>, 
    Json(update): Json<Update>
) -> Response {
    let origin = addr.ip().to_string();

    let mut orbit = orbit.write().unwrap();

    let satellite= orbit.get_mut(&origin);    
    match satellite {
        Some(satellite) => {
            if let Some(name) = update.name {
                satellite.update_name(&name);
            }
            if let Some(color) = update.color {
                satellite.update_color(color);
            }

            // Broadcast to everyone, the satellite updated

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
    position: (i32, i32, i32),
    rotation: Option<(i32, i32, i32)>
}

pub async fn signal(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(orbit): State<Orbit>, 
    Json(signal): Json<Signal>
) -> Response {
    let origin = addr.ip().to_string();

    let mut orbit = orbit.write().unwrap();

    let satellite= orbit.get_mut(&origin);    
    match satellite {
        Some(satellite) => {
            satellite.update_position(signal.position, signal.rotation);

            // Broadcast to everyone, the satellite signal

            // 200
            ().into_response()
        },
        None => 
            // 404
            StatusCode::NOT_FOUND.into_response()
    }
}