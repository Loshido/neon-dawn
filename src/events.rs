use serde::Serialize;

use crate::satellite::Satellite;

#[derive(Clone, Serialize)]
#[serde(tag = "type")]
pub enum Events {
    Position { name: String, position: (i32, i32, i32), rotation: Option<(i32, i32, i32)> },
    Launch { name: String, color: [u8; 3], payload: String },
    Update { name: String, color: Option<[u8; 3]>, new_name: Option<String> },
    Crash { name: String },
    Sync { satellites: Vec<Satellite> }
}

impl Events {
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap_or_else(|_| "{}".to_string())
    }
}