use std::net::SocketAddr;
use axum::Router;

pub mod files;
pub mod ip;
mod signal;

pub async fn serve(router: Router) {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:80").await.unwrap();
    println!("Listening on http://localhost:80");

    axum::serve(listener, router.into_make_service_with_connect_info::<SocketAddr>())
        .with_graceful_shutdown(signal::shutdown())
        .await
        .unwrap();

    println!("Stopped listening");
}