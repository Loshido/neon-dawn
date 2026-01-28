use axum::{
    extract::State,
    response::sse::{Event, Sse}
};
use futures::{Stream, StreamExt, stream};
use tokio::sync::broadcast;
use tokio_stream::wrappers::BroadcastStream;
use std::{convert::Infallible, time::Duration};
use crate::{Etat, events::Events, satellite::Satellite};

pub type TX = tokio::sync::broadcast::Sender<String>;

pub fn initialize() -> TX {
    let (tx, _rx) = broadcast::channel(100);

    tx
}

pub async fn subscribe(
    State(etat): State<Etat>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let orbit = etat.orbit.read().await;

    let satellites: Vec<Satellite> = orbit.values().cloned().collect();
    let sync = Events::Sync { satellites };

    let rx = etat.tx.subscribe();
    let broadcast = BroadcastStream::new(rx)
        .filter_map(|msg| async move { msg.ok() })
        .map(|msg| Ok(Event::default().data(msg)));

    let welcome = stream::once(async move {
        Ok(Event::default().data(sync.to_json()))
    });

    let stream = welcome.chain(broadcast);

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(5))
            .text("keep-alive"),
    )
}

pub(crate) async fn broadcast(tx: &TX, message: Events) -> Option<usize> {
    tx.send(message.to_json()).ok()
}