#[macro_use]
extern crate rocket;
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use db::{
    is_admin, delete_user, get_all_users, initialize_database,new_user, set_token, update_password, verify_password, User
};
use models::{
    Claims,
    SECRET_KEY
};
use jsonwebtoken::{encode, EncodingKey, Header};
use rocket::fs::NamedFile;
use rocket::fs::{relative, FileServer};
use rocket::http::Status;
use rocket::response::status;
use rocket::serde::{json::Json, Deserialize, Serialize};
use rocket::State;
use std::arch::asm;
use std::path::Path;
use std::sync::Mutex;
use rocket_cors::{
    AllowedHeaders, AllowedMethods, AllowedOrigins, CorsOptions
};
use rocket::fairing::AdHoc;


mod db;
mod models;

/// JWT Claims structure

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
    token: String,
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
    token: String,
    username: String,
}

#[derive(Serialize)]
struct RemoveUserResponse {
    removed_user: String,
}

#[derive(Deserialize)]
struct LogoutData {
    username: String,
}

#[derive(Deserialize, Serialize)]
struct AdminCheckResponse {
    is_admin: bool,
}

#[derive(Deserialize)]
struct PasswordResetdata {
    token: String,
    username: String,
    oldPassword: String,
    newPassword: String,
}



/// Secret key for JWT
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

        let admin_perms = is_admin(&conn, &login_data.username).unwrap_or(false);

        // Create JWT claims
        let claims = Claims {
            sub: login_data.username.clone(),
            is_admin: admin_perms,
            exp: chrono::Utc::now().timestamp() as usize + 3600,
        };

        // Generate the token
        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(SECRET_KEY),
        )
        .map_err(|_| status::Unauthorized("Token generation failed".into()))?;

        set_token(&conn, &login_data.username, &token)
            .map_err(|_| status::Unauthorized("Adding token to database failed".to_string()))?;

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
        &add_user_data.token,
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

    let passed: bool = delete_user(&conn, &remove_user_data.token, &remove_user_data.username)
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

#[post("/logout", data = "<user_data>")]
async fn logout(
    conn: &State<Mutex<rusqlite::Connection>>,
    user_data: Json<LogoutData>,
) -> Result<Status, Status> {
    let logout_user_data = user_data.into_inner();
    let conn = conn.lock().map_err(|_| Status::InternalServerError)?;
    let empty_string = "";
    let result = set_token(&conn, &logout_user_data.username, &empty_string);
    match result {
        Ok(_) => Ok(Status::NoContent),
        Err(_) => Err(Status::InternalServerError),
    }
}



#[post("/resetpassword", data = "<user_data>")]
async fn reset_password(
    user_data: Json<PasswordResetdata>,
    conn: &State<Mutex<rusqlite::Connection>>,
) -> Status {
    let reset_password_data = user_data.into_inner();
    let conn = conn.lock().unwrap();

    match update_password(&conn, &reset_password_data.token, &reset_password_data.username, &reset_password_data.oldPassword, &reset_password_data.newPassword){
        Ok(success) => {
            if success {
                Status::Ok
            } else {
                Status::Unauthorized
            }
        }
        Err(_) => Status::InternalServerError,
    }
}



#[launch]
fn rocket() -> _ {
    let allowed_origins = AllowedOrigins::all();

    let allowed_methods = vec!["GET", "POST", "DELETE", "OPTIONS"]
        .into_iter()
        .map(|s| s.parse().unwrap())
        .collect::<AllowedMethods>();

    let cors_options = CorsOptions {
        allowed_origins,
        allowed_methods,
        allowed_headers: AllowedHeaders::some(&[
            "Authorization",
            "Accept",
            "Content-Type",
        ]),
        allow_credentials: true,
        ..Default::default()
    };

    let cors = cors_options.to_cors().expect("Could not build CORS fairing");


    let conn = initialize_database("users.db").expect("Failed to initialize database");
    rocket::build()
        .attach(cors)
        .manage(Mutex::new(conn))
        .configure(rocket::Config::figment().merge(("port", 8001)))
        .mount("/", routes![login, logout, all_users, reset_password, add_user, remove_user]) // Route for `/`
}
