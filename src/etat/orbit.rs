use std::time::{Duration, Instant};

use crate::{etat::satellite::Satellite, events::Events, net::sse::broadcast};

use super::Etat;

const DURATION_UNTIL_CRASHED: Duration = Duration::from_secs(60);

impl Etat {
    pub async fn launch(&self, ip: &String, name: String, color: [u8; 3], citation: String) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;

        if orbit.contains_key(ip) {
            return Err(())
        }

        let satellite = Satellite::launch(&name, color);
        orbit.insert(ip.clone(), satellite);
        // Broadcast to everyone that a new satellite launched (with citation)
        let event = Events::Launch {
            name: name, 
            color, 
            payload: citation
        };

        Ok(event)
    }

    pub async fn update(&self, ip: &String, name: Option<String>, color: Option<[u8; 3]>) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;
        if let Some(satellite) =  orbit.get_mut(ip) {
            if let Some(name) = name.clone() {
                satellite.update_name(&name);
            }
            if let Some(color) = color {
                satellite.update_color(color);
            }
            let event = Events::Update { 
                name: satellite.name.clone(), 
                color,
                new_name: name
            };

            Ok(event)
        } else {
            Err(())
        }
    }

    // incoming signal for a satellite
    pub async fn signal(&self, ip: &String, position: (f32, f32, f32), rotation: Option<(f32, f32, f32)>) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;

        if let Some(satellite) = orbit.get_mut(ip) {
            satellite.update_position(position, rotation);
    
            // Broadcast to everyone, the satellite' signal
            let event = Events::Position { 
                name: satellite.name.clone(), 
                position: position,
                rotation: rotation
            };
    
            Ok(event)
        } else {
            Err(())
        }
    }

    async fn expired_satellites(&self) -> Vec<String> {
        let satellites = self.orbit.read().await;
        let now = Instant::now();
        let mut crashed = Vec::new();
        
        for (ip, satellite) in satellites.iter() {
            if now.duration_since(satellite.instant) > DURATION_UNTIL_CRASHED {
                    crashed.push(ip.clone());
            }
        }

        crashed
    }

    pub async fn remove_expired(&self) {
        let expired = self.expired_satellites().await;
        if expired.len() == 0 {
            return
        }
        
        let mut satellites = self.orbit.write().await;
        for ip in expired {
            let satellite = satellites.remove(&ip);
            if let Some(satellite) = satellite {
                broadcast(&self.tx, Events::Crash { name: satellite.name }).await;
            }
        }
    }
}