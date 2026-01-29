use std::{collections::HashMap, sync::Arc};
use axum::{Router, routing::{get, post}};
use tokio::sync::RwLock;
use crate::{etat::{Etat, crash::check_for_crash}, server::serve};

mod server;
mod events;
mod etat;

mod net;

#[tokio::main]
async fn main() {
    let orbit = Arc::new(RwLock::new(HashMap::new()));
    let tx = net::sse::initialize();

    let etat = Etat { orbit, tx };
    
    check_for_crash(etat.clone()).await;

    let app = Router::new()
        // client rest routes
        .route("/orbit/launch", post(net::rest::launch))
        .route("/orbit/update", post(net::rest::update))
        .route("/orbit/signal", post(net::rest::signal))

        // client ws routes
        .route("/ws", get(net::ws::ws_handle))

        // monitor routes
        .route("/listen", get(net::sse::subscribe))
        .merge(server::file_router().await)
        .with_state(etat);

    serve(app).await;
}