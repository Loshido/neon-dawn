use std::{collections::HashMap, sync::{Arc, RwLock}, time::Instant};

pub struct Satellite {
    pub name: String,
    pub color: [u8; 3],

    pub position: (i32, i32, i32),
    pub rotation: Option<(i32, i32, i32)>,

    instant: Instant
}

pub type Orbit = Arc<RwLock<HashMap<String, Satellite>>>;

impl Satellite {
    pub fn launch(name: &String, color: [u8; 3]) -> Self {
        println!("{} launched", name);

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

        println!("{}'s position updated", self.name);
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