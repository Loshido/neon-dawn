use axum::{Extension, Json, extract::State, http::{HeaderMap, StatusCode}, response::{IntoResponse, Response}};
use serde::Deserialize;
use crate::{Etat, headers, server::ip::ClientIp};

#[derive(Deserialize)]
pub struct LaunchSettings {
    name: String,
    color: [u8; 3],
    citation: String
}

pub async fn launch(
    Extension(ip): Extension<ClientIp>,
    State(etat): State<Etat>, 
    Json(settings): Json<LaunchSettings>
) -> Result<(HeaderMap, String), (HeaderMap, StatusCode)> {
    let origin = ip.to_string();

    let event = etat
        .launch(&origin, settings.name.clone(), settings.color, settings.citation)
        .await
        .ok();

    let headers = headers! {
        "access-control-allow-origin" => "*"
    };
    match event {
        Some(event) => {
            etat.broadcast(event);
        
            Ok((headers, settings.name))
        },
        None => Err((headers, StatusCode::CONFLICT))
    }
}

#[derive(Deserialize)]
pub struct Update {
    name: Option<String>,
    color: Option<[u8; 3]>
}

pub async fn update(
    Extension(ip): Extension<ClientIp>,
    State(etat): State<Etat>, 
    Json(update): Json<Update>
) -> Response {
    let origin = ip.to_string();

    let event = etat
        .update(&origin, update.name, update.color)
        .await
        .ok();

    let headers = headers! {
        "access-control-allow-origin" => "*"
    };
    match event {
        Some(event) => {
            etat.broadcast(event);

            headers.into_response()
        },
        None => (headers, StatusCode::NOT_FOUND).into_response()
    }
}

#[derive(Deserialize)]
pub struct Signal {
    position: (f32, f32, f32),
    rotation: Option<(f32, f32, f32)>
}

pub async fn signal(
    Extension(ip): Extension<ClientIp>,
    State(etat): State<Etat>, 
    Json(signal): Json<Signal>
) -> Response {
    let origin = ip.to_string();

    let event = etat
        .signal(&origin, signal.position, signal.rotation)
        .await
        .ok();

    let headers = headers! {
        "access-control-allow-origin" => "*"
    };

    match event {
        Some(event) => {
            etat.broadcast(event);
            headers.into_response()
        },
        None => (headers, StatusCode::NOT_FOUND).into_response()
    }
}