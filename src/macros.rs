#[macro_export]
macro_rules! headers {
    ($($key:expr => $value:expr),* $(,)?) => {
        {
            let mut map = HeaderMap::new();
            $(map.insert($key, $value.parse().unwrap());)*

            map
        }
    };
}