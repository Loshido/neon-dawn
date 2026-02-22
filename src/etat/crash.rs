use std::time::{Duration, Instant};
use crate::{etat::Etat, events::Events};

const DURATION_UNTIL_CRASHED: Duration = Duration::from_secs(60 * 4);

impl Etat {
    async fn expired_satellites(&self) -> Vec<String> {
        let satellites = self.orbit.read().await;
        let now = Instant::now();
        let mut crashed = Vec::new();
        
        for (name, satellite) in satellites.iter() {
            if now.duration_since(satellite.instant) > DURATION_UNTIL_CRASHED {
                    crashed.push(name.clone());
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
        for name in expired {
            let satellite = satellites.remove(&name);
            if let Some(satellite) = satellite {
                self.broadcast(Events::Crash { name: satellite.name });
            }
        }
    }
}

pub async fn check_for_crash(etat: Etat) {
    tokio::spawn(async move {
        loop {
            etat.remove_expired().await;

            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });
}