use std::net::SocketAddr;

use axum::{Router, http::{HeaderName, HeaderValue}};
#[cfg(unix)]
use tokio::signal::{self, unix::{signal, SignalKind}};
use tower_http::{services::ServeDir, set_header::SetResponseHeaderLayer};

use crate::Etat;

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}

pub async fn serve(router: Router) {
    let listener = tokio::net::TcpListener::bind("0.0.0.0:80").await.unwrap();
    println!("Listening on http://localhost:80");

    axum::serve(listener, router.into_make_service_with_connect_info::<SocketAddr>())
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();

    println!("Stopped listening");
}

pub async fn file_router() -> Router<Etat> {
    let fs = ServeDir::new("./public");
    let cache_control = (
        HeaderName::from_static("Cache-Control"),
        HeaderValue::from_static("max-age=5184000, immutable, public")
    );

    let router = Router::new()
        .fallback_service(fs)
        .layer(SetResponseHeaderLayer::appending(cache_control.0, cache_control.1));

    router
}