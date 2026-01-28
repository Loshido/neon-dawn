use std::{collections::HashMap, sync::Arc, time::{Duration, Instant}};
use serde::Serialize;
use tokio::sync::RwLock;
use crate::{Etat, events::Events, net::sse::broadcast};

#[derive(Clone, Serialize)]
pub struct Satellite {
    pub name: String,
    pub color: [u8; 3],

    pub position: (i32, i32, i32),
    pub rotation: Option<(i32, i32, i32)>,

    #[serde(skip)]
    instant: Instant
}

pub type Orbit = Arc<RwLock<HashMap<String, Satellite>>>;

impl Satellite {
    pub fn launch(name: &String, color: [u8; 3]) -> Self {
        Self {
            name: name.to_string(),
            color,
            position: (0, 10, 0),
            rotation: None,

            instant: Instant::now()
        }
    }

    pub fn update_position(&mut self, position: (i32, i32, i32), rotation: Option<(i32, i32, i32)>) {
        self.position = position;
        if rotation.is_some() {
            self.rotation = rotation;
        }

        self.instant = Instant::now()
    }

    pub fn update_name(&mut self, name: &String) {
        self.name = name.to_string();
        self.instant = Instant::now()
    }

    pub fn update_color(&mut self, color: [u8; 3]) {
        self.color = color;
    }
}

const HAS_CRASHED: Duration = Duration::from_secs(60);

// ps: Etat can be cloned anywhere since, it is only composed of Arc
pub async fn check_for_crash(etat: Etat) {
    tokio::spawn(async move {
        loop {
            // we use a block in order to satellites to drop before tokio sleep
            // if satellites don't drop, the rest of the program can't write
            let crashed = {
                let satellites = etat.orbit.read().await;
                let now = Instant::now();
                let mut crashed = Vec::new();
    
                for (ip, satellite) in satellites.iter() {
                    if now.duration_since(satellite.instant) > HAS_CRASHED {
                        crashed.push((ip.clone(), satellite.name.clone()));
                    }
                }

                crashed
            };

            // idem, we need satellites to drop
            // otherwise none of the other write or read will be allowed to orbit.
            if crashed.len() > 0 {
                let mut satellites = etat.orbit.write().await;

                for (ip, name) in crashed {
                    satellites.remove(&ip);
                    broadcast(&etat.tx, Events::Crash { name: name }).await;
                }
            }

            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });
}