use std::{collections::HashMap, sync::Arc};
use axum::{Router, routing::{get, post}};
use tokio::sync::RwLock;
use tower_http::services::ServeDir;
use crate::{net::sse::TX, satellite::{Orbit, check_for_crash}, server::serve};

mod server;
mod satellite;
mod events;

mod net;

#[derive(Clone)]
pub struct Etat {
    orbit: Orbit,
    tx: TX
}

#[tokio::main]
async fn main() {
    let orbit: Orbit = Arc::new(RwLock::new(HashMap::new()));
    let tx = net::sse::initialize();

    let etat = Etat { orbit, tx };
    
    check_for_crash(etat.clone()).await;

    let fs = ServeDir::new("./public");
    let app = Router::new()
        // client rest routes
        .route("/orbit/launch", post(net::rest::launch))
        .route("/orbit/update", post(net::rest::update))
        .route("/orbit/signal", post(net::rest::signal))

        // client ws routes
        .route("/ws", get(net::ws::ws_handle))

        // monitor routes
        .route("/listen", get(net::sse::subscribe))
        .fallback_service(fs)
        .with_state(etat);

    serve(app).await;
}