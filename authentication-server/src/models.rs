use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,   // Username
    pub is_admin: bool,
    pub exp: usize,    // Expiry timestamp
}

pub const SECRET_KEY: &[u8] = b"yowzabazinga";

pub struct VerifiedTokenData {
    pub username: String,
    pub is_admin: bool,
}