use std::{collections::HashMap, sync::{Arc, RwLock}};
use axum::{Router, routing::post};
use crate::{satellite::Orbit, server::serve};

mod server;
mod satellite;
mod rest;

#[tokio::main]
async fn main() {
    let orbit: Orbit = Arc::new(RwLock::new(HashMap::new()));

    let app = Router::new()
        // client rest routes
        .route("/orbit/launch", post(rest::launch))
        .route("/orbit/update", post(rest::update))
        .route("/orbit/signal", post(rest::signal))

        // client ws routes
            // websocket to launch, update and signal

        // monitor routes
            // sse to broadcast
        .with_state(orbit);

    serve(app).await;
}