use std::time::Instant;
use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct Satellite {
    pub name: String,
    pub color: [u8; 3],

    pub position: (f32, f32, f32),
    pub rotation: Option<(f32, f32, f32)>,

    #[serde(skip)]
    pub instant: Instant
}

impl Satellite {
    pub fn launch(name: &String, color: [u8; 3]) -> Self {
        Self {
            name: name.to_string(),
            color,
            position: (0.0, 10.0, 0.0),
            rotation: None,

            instant: Instant::now()
        }
    }

    pub fn update_position(&mut self, position: (f32, f32, f32), rotation: Option<(f32, f32, f32)>) {
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