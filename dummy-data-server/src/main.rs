use rocket::{get, routes, tokio::time::{self, Duration}, State};
use rocket::serde::json::Json;
use rocket_ws::{Message, WebSocket};
use std::sync::{Arc, Mutex};
use rand::Rng;
use serde::Serialize;
use futures_util::SinkExt;
use std::pin::Pin;
use std::future::Future;

#[macro_use] extern crate rocket;

// Structs mirroring the Protobuf definitions
#[derive(Serialize)]
struct User {
    id: String,
    long_name: String,
    short_name: String,
    hw_model: String,
    is_licensed: bool,
    role: String,
    public_key: String,
}

#[derive(Serialize)]
struct Position {
    latitude_i: f64,
    longitude_i: f64,
    altitude: i32,
    time: u32,
    fix_quality: u32,
    fix_type: u32,
    sats_in_view: u32,
}

#[derive(Serialize)]
struct DeviceMetrics {
    battery_level: u32,
    voltage: f32,
    uptime_seconds: u32,
}

#[derive(Serialize)]
struct NodeInfo {
    num: u32,
    user: User,
    position: Position,
    snr: f32,
    last_heard: u32,
    device_metrics: DeviceMetrics,
    channel: u32,
    via_mqtt: bool,
    hops_away: Option<u32>,
    is_favorite: bool,
}

fn generate_dummy_node() -> NodeInfo {
    let mut rng = rand::thread_rng();
    NodeInfo {
        num: rng.gen_range(1..1000),
        user: User {
            id: format!("node_{}", rng.gen_range(1000..9999)),
            long_name: "Test Node".to_string(),
            short_name: "TN".to_string(),
            hw_model: "TBEAM".to_string(),
            is_licensed: rng.gen_bool(0.5),
            role: "ROUTER".to_string(),
            public_key: "dummy_public_key".to_string(),
        },
        position: Position {
            latitude_i: rng.gen_range(-90.0..90.0),
            longitude_i: rng.gen_range(-180.0..180.0),
            altitude: rng.gen_range(0..10000),
            time: rng.gen_range(1600000000..1700000000),
            fix_quality: rng.gen_range(0..10),
            fix_type: rng.gen_range(0..5),
            sats_in_view: rng.gen_range(0..30),
        },
        snr: rng.gen_range(-20.0..30.0),
        last_heard: rng.gen_range(1600000000..1700000000),
        device_metrics: DeviceMetrics {
            battery_level: rng.gen_range(0..100),
            voltage: rng.gen_range(3.0..4.2),
            uptime_seconds: rng.gen_range(100..1000000),
        },
        channel: rng.gen_range(0..5),
        via_mqtt: rng.gen_bool(0.5),
        hops_away: Some(rng.gen_range(0..5)),
        is_favorite: rng.gen_bool(0.5),
    }
}

#[get("/ws")]
fn ws_handler(ws: WebSocket, data: &State<Arc<Mutex<Vec<NodeInfo>>>>) -> rocket_ws::ChannelStream {
    ws.channel(move |stream| async move {
        let mut interval = time::interval(Duration::from_secs(5));
        loop {
            interval.tick().await;
            let node_data = generate_dummy_node();
            let json_data = serde_json::to_string(&node_data).unwrap();
            if let Err(e) = stream.send(Message::Text(json_data)).await {
                eprintln!("WebSocket send error: {}", e);
                break;
            }
        }
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .manage(Arc::new(Mutex::new(Vec::new())))
        .mount("/", routes![ws_handler])
}
