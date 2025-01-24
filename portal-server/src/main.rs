#[macro_use]
extern crate rocket;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use db::{delete_user, get_all_users, initialize_database, new_user, verify_password, User};
use jsonwebtoken::{encode, EncodingKey, Header};
use rocket::fs::NamedFile;
use rocket::fs::{relative, FileServer};
use rocket::response::status;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::State;
use std::path::Path;
use std::sync::Mutex;

mod db;

/// JWT Claims structure
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // Subject (username)
    exp: usize,  // Expiration time (as a UNIX timestamp)
}

/// Login payload
#[derive(Deserialize)]
struct LoginData {
    username: String,
    password: String,
}

/// Login response
#[derive(Serialize)]
struct LoginResponse {
    token: String,
}

#[derive(Deserialize)]
struct NewUserdata {
    creator: String,
    username: String,
    password: String,
    isAdmin: bool,
}

#[derive(Serialize)]
struct NewUserResponse {
    username: String,
}

#[derive(Deserialize)]
struct RemoveUserData {
    remover: String,
    username: String,
}

#[derive(Serialize)]
struct RemoveUserResponse {
    removed_user: String,
}

/// Secret key for JWT
const SECRET_KEY: &[u8] = b"yowzabazinga";

/// Login endpoint
#[post("/login", data = "<login_data>")]
async fn login(
    login_data: Json<LoginData>,
    conn: &State<Mutex<rusqlite::Connection>>,
) -> Result<Json<LoginResponse>, status::Unauthorized<String>> {
    // Extract login data
    let login_data = login_data.into_inner();
    let conn = conn.lock().unwrap();

    let verify_result = verify_password(&conn, &login_data.username, &login_data.password)
        .map_err(|_| status::Unauthorized("Database query failed".to_string()))?;

    if verify_result {
        // Create JWT claims
        let claims = Claims {
            sub: login_data.username,
            exp: chrono::Utc::now().timestamp() as usize + 3600,
        };

        // Generate the token
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(SECRET_KEY),
        )
        .map_err(|_| status::Unauthorized("Token generation failed".into()))?;

        // Return the token as JSON
        Ok(Json(LoginResponse { token }))
    } else {
        // Handle invalid credentials
        Err(status::Unauthorized(
            "Invalid username or password".to_string(),
        ))
    }
}

/// Add User endpoint
#[post("/add_user", data = "<user_data>")]
async fn add_user(
    user_data: Json<NewUserdata>,
    conn: &State<Mutex<rusqlite::Connection>>,
) -> Result<Json<NewUserResponse>, status::Unauthorized<String>> {
    // Extract login data
    let add_user_data = user_data.into_inner();
    let conn = conn.lock().unwrap();

    let passed = new_user(
        &conn,
        &add_user_data.creator,
        &add_user_data.username,
        &add_user_data.password,
        &add_user_data.isAdmin,
    )
    .map_err(|_| status::Unauthorized("Failed to write user to database".into()))?;
    let username: String = add_user_data.username;
    if passed {
        Ok(Json(NewUserResponse { username }))
    } else {
        Err(status::Unauthorized(
            "invalid input data or incorrect permissions".to_string(),
        ))
    }
}

#[delete("/remove_user", data = "<user_data>")]
async fn remove_user(
    user_data: Json<RemoveUserData>,
    conn: &State<Mutex<rusqlite::Connection>>,
) -> Result<Json<RemoveUserResponse>, status::Unauthorized<String>> {
    let remove_user_data = user_data.into_inner();
    let conn = conn.lock().unwrap();

    let passed: bool = delete_user(&conn, &remove_user_data.remover, &remove_user_data.username)
        .map_err(|_| status::Unauthorized("database delete failed".to_string()))?;

    let removed_user: String = remove_user_data.username;

    if passed {
        Ok(Json(RemoveUserResponse { removed_user }))
    } else {
        Err(status::Unauthorized(
            "invalid permissons or user doesn't exist".to_string(),
        ))
    }
}

#[get("/users")]
async fn all_users(conn: &State<Mutex<rusqlite::Connection>>) -> Json<Vec<User>> {
    let conn = conn.lock().unwrap();
    match get_all_users(&conn) {
        Ok(users) => Json(users),
        Err(_) => Json(vec![]),
    }
}

#[get("/")]
async fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("public/index.html")).await.ok() // Serve `index.html` directly
}

#[launch]
fn rocket() -> _ {
    let conn = initialize_database("users.db").expect("Failed to initialize database");
    rocket::build()
        .manage(Mutex::new(conn))
        .mount("/", routes![index, login,]) // Route for `/`
        .mount("/public", FileServer::from(relative!("public"))) // Serve other static files
}
