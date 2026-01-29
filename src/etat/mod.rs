use std::{collections::HashMap, sync::Arc};
use tokio::sync::{RwLock, broadcast::Sender};
use crate::{etat::satellite::Satellite, events::Events};

mod orbit;
pub(super) mod crash;
pub(crate) mod satellite;

#[derive(Clone)]
pub struct Etat {
    pub orbit: Arc<RwLock<HashMap<String, Satellite>>>,
    pub tx: Sender<String>
}

impl Etat {
    pub fn broadcast(&self, event: Events) -> Option<usize> {
        self.tx.send(event.to_json()).ok()
    }
}