use std::{collections::HashMap, sync::Arc};
use tokio::sync::{RwLock, broadcast::Sender};
use crate::etat::satellite::Satellite;

mod orbit;
pub(super) mod crash;
pub(crate) mod satellite;

#[derive(Clone)]
pub struct Etat {
    pub orbit: Arc<RwLock<HashMap<String, Satellite>>>,
    pub tx: Sender<String>
}