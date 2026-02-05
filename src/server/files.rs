use axum::{Router, http::{HeaderName, HeaderValue}};
use tower_http::{services::ServeDir, set_header::SetResponseHeaderLayer};
use crate::Etat;

pub async fn router() -> Router<Etat> {
    let fs = ServeDir::new("./dist");
    let cache_control = (
        HeaderName::from_lowercase(b"cache-control").unwrap(),
        HeaderValue::from_static("max-age=5184000, immutable, public")
    );

    let router = Router::new()
        .fallback_service(fs)
        .layer(SetResponseHeaderLayer::appending(cache_control.0, cache_control.1));

    router
}