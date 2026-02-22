use crate::{etat::satellite::Satellite, events::Events};

use super::Etat;


impl Etat {
    pub async fn launch(&self, ip: &String, name: String, color: [u8; 3], citation: String) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;

        if orbit.contains_key(&name) {
            return Err(())
        }

        let satellite = Satellite::launch(&name, color, ip);
        orbit.insert(name.clone(), satellite);
        // Broadcast to everyone that a new satellite launched (with citation)
        let event = Events::Launch {
            name, 
            color, 
            payload: citation
        };

        Ok(event)
    }

    pub async fn update(&self, ip: &String, satellite_name: &String, name: Option<String>, color: Option<[u8; 3]>) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;

        // Check existence and ownership
        let satellite = orbit.get(satellite_name).ok_or(())?;
        if satellite.ip != *ip {
            return Err(())
        }

        // Check for name conflicts before mutating
        if let Some(ref new_name) = name {
            if new_name != satellite_name && orbit.contains_key(new_name) {
                return Err(())
            }
        }

        let satellite = orbit.get_mut(satellite_name).ok_or(())?;
        if let Some(color) = color {
            satellite.update_color(color);
        }
        let event = Events::Update { 
            name: satellite.name.clone(), 
            color,
            new_name: name.clone()
        };

        if let Some(ref new_name) = name {
            if new_name != satellite_name {
                let mut sat = orbit.remove(satellite_name).ok_or(())?;
                sat.update_name(new_name);
                orbit.insert(new_name.clone(), sat);
            }
        }

        Ok(event)
    }

    // incoming signal for a satellite
    pub async fn signal(&self, ip: &String, satellite_name: &String, position: (f32, f32, f32), rotation: Option<(f32, f32, f32)>) -> Result<Events, ()> {
        let mut orbit = self.orbit.write().await;

        if let Some(satellite) = orbit.get_mut(satellite_name) {
            if satellite.ip != *ip {
                return Err(())
            }
            satellite.update_position(position, rotation);
    
            // Broadcast to everyone, the satellite' signal
            let event = Events::Position { 
                name: satellite.name.clone(), 
                position,
                rotation
            };
    
            Ok(event)
        } else {
            Err(())
        }
    }
}