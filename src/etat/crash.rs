use std::time::Duration;
use crate::etat::Etat;

pub async fn check_for_crash(etat: Etat) {
    tokio::spawn(async move {
        loop {
            etat.remove_expired().await;

            tokio::time::sleep(Duration::from_secs(60)).await;
        }
    });
}