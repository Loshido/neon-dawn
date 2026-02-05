use std::net::{IpAddr, SocketAddr};

use axum::{extract::{ConnectInfo, Request}, http::HeaderMap, middleware::Next, response::Response};


#[derive(Debug, Clone, Copy)]
pub struct ClientIp(pub IpAddr);

impl ToString for ClientIp {
    fn to_string(&self) -> String {
        self.0.to_string()
    }
}

pub async fn middleware(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    mut request: Request,
    next: Next,
) -> Response {
    let headers = request.headers();
    let client_ip = extract_client_ip(headers).unwrap_or(addr.ip());
    
    request.extensions_mut().insert(ClientIp(client_ip));
    next.run(request).await
}

fn extract_client_ip(headers: &HeaderMap) -> Option<IpAddr> {
    try_x_forwarded_for(headers)
        .or_else(|| try_x_real_ip(headers))
        .or_else(|| try_forwarded(headers))
}

fn try_x_forwarded_for(headers: &HeaderMap) -> Option<IpAddr> {
    if let Some(ip) = headers
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.split(',').next())
        .and_then(|s| s.trim().parse().ok())
    {
        return Some(ip);
    }
    None
}

fn try_x_real_ip(headers: &HeaderMap) -> Option<IpAddr> {
    if let Some(ip) = headers
        .get("x-real-ip")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.parse().ok())
    {
        return Some(ip);
    }
    None
}

fn try_forwarded(headers: &HeaderMap) -> Option<IpAddr> {
    headers.get("forwarded")?
        .to_str()
        .ok()?
        .split(';')
        .map(str::trim)
        .find(|part| part.starts_with("for="))?
        .strip_prefix("for=")?
        .trim_matches(|c| c == '"' || c == '[' || c == ']')
        .parse()
        .ok()
}