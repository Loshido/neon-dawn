use std::net::SocketAddr;

use axum::{Json, extract::{ConnectInfo, State}, http::StatusCode, response::{IntoResponse, Response}};
use serde::Deserialize;
use crate::{Etat, net::sse::broadcast};

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
) -> Result<String, StatusCode> {
    let origin = addr.ip().to_string();

    let event = etat
        .launch(&origin, settings.name.clone(), settings.color, settings.citation)
        .await
        .ok();

    match event {
        Some(event) => {
            broadcast(&etat.tx, event).await;
        
            Ok(settings.name)
        },
        None => Err(StatusCode::CONFLICT)
    }
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

    let event = etat
        .update(&origin, update.name, update.color)
        .await
        .ok();

    match event {
        Some(event) => {
            broadcast(&etat.tx, event).await;

            ().into_response()
        },
        None => StatusCode::NOT_FOUND.into_response()
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

    let event = etat
        .signal(&origin, signal.position, signal.rotation)
        .await
        .ok();

    match event {
        Some(event) => {
            broadcast(&etat.tx, event).await;

            ().into_response()
        },
        None => StatusCode::NOT_FOUND.into_response()
    }
}