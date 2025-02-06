use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::errors::Error;
use rusqlite::Error as RusqliteError;
use rusqlite::{params, Connection, OptionalExtension, Result};
use serde::Serialize;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation}; 
use crate::models::{Claims, VerifiedTokenData, SECRET_KEY}; // Import the structs
#[derive(Serialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub is_admin: bool,
}



pub fn initialize_database(db_path: &str) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    {
        conn.execute(
            "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN NOT NULL,
                token TEXT DEFAULT ''
            );
            ",
            [],
        )?;

        let mut stmt = conn.prepare("SELECT COUNT(*) FROM users WHERE username = 'admin';")?;
        let admin_exists: i64 = stmt.query_row([], |row| row.get(0))?;

        if admin_exists == 0 {
            let pword = "admin";
            conn.execute(
                "INSERT INTO users (username, password, is_admin) VALUES (?1, ?2, ?3);",
                params!["admin", hash(pword, DEFAULT_COST).ok( ), true],
            )?;
            println!("Admin user created with username: admin and password: admin");
        } else {
            println!("Admin user already exists");
        }
    }
    Ok(conn)
}

pub fn verify_password(conn: &Connection, username: &str, password: &str) -> Result<bool> {
    let mut stmt = conn.prepare("SELECT password FROM users WHERE username = ?1")?;
    let hashed_password: Option<String> = stmt
        .query_row(params![username], |row| row.get(0))
        .optional()?;

    if let Some(hashed_password) = hashed_password {
        let is_valid = verify(password, &hashed_password).unwrap_or(false);
        Ok(is_valid)
    } else {
        Ok(false)
    }
}

pub fn verify_token(conn: &Connection, token: &str) -> Result<VerifiedTokenData> {
    let (db_username, db_is_admin) = conn.prepare("SELECT username, is_admin FROM users WHERE token = ?1")?.query_row(params![token], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, bool>(1)?))
    })?;

    let decoding_key = DecodingKey::from_secret(SECRET_KEY);
    let validation = Validation::default();
    let token_data = decode::<Claims>(token, &decoding_key, &validation).map_err(|_| rusqlite::Error::InvalidQuery)?;

    if token_data.claims.sub == db_username && token_data.claims.is_admin == db_is_admin {
        Ok(VerifiedTokenData {
            username: db_username,
            is_admin: db_is_admin,
        })
    }else{
        Err(rusqlite::Error::QueryReturnedNoRows.into())
    }

    
}

pub fn new_user(
    conn: &Connection,
    operator_token: &str,
    uname: &str,
    pword: &str,
    admin: &bool,
) -> Result<bool> {
    let operator_data = verify_token(conn, operator_token)?;
    if !operator_data.is_admin {
        Ok(false)
    } else {
        conn.execute(
            "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?);",
            params![uname, hash(pword, DEFAULT_COST).ok(), admin],
        )?;
        Ok(true)
    }
}

pub fn set_token(conn: &Connection, uname: &str, token: &str) -> Result<()> {
    conn.execute(
        "UPDATE users SET token = ?1 WHERE username = ?2;",
        params![token, uname],
    )?;
    Ok(())
}

pub fn get_token(conn: &Connection, uname: &str) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT token FROM users WHERE username = ?1")?;

    let token: Option<String> = stmt
        .query_row(params![uname], |row| row.get(0))
        .optional()?;

    Ok(token)
}

pub fn delete_user(conn: &Connection, operator_token: &str, uname: &str) -> Result<bool> {
    let op_data = verify_token(conn, operator_token)?;
    if !op_data.is_admin {
        Ok(false)
    } else {
        conn.execute("DELETE FROM users WHERE username = ?1", params![uname])?;
        Ok(true)
    }
}

pub fn update_password(
    conn: &Connection,
    operator_token: &str,
    uname: &str,
    old_password: &str,
    new_password: &str,
) -> Result<bool> {
    let mut auth: bool = false;

    let op_data = verify_token(conn, operator_token)?;

    if op_data.is_admin {
        auth = true;
    } else {
        if op_data.username == uname {
            auth = true;
        }
        let old_password_check: bool = verify_password(conn, uname, old_password)?;
        auth = old_password_check;
    }     

    if auth {
        let new_p = hash(new_password, DEFAULT_COST).ok();
        conn.execute(
            "UPDATE users SET password = ?1 WHERE username = ?2;",
            params![new_p, uname],
        )?;
        Ok(true)
    } else {
        Ok(false)
    }
}

pub fn get_all_users(conn: &Connection) -> rusqlite::Result<Vec<User>> {
    let mut stmt = conn.prepare("SELECT id, username, is_admin FROM users")?;
    let user_iter = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            is_admin: row.get(2)?,
        })
    })?;

    let mut users = Vec::new();
    for user in user_iter {
        users.push(user?);
    }

    Ok(users)
}


pub fn is_admin(conn: &Connection, uname: &str) -> rusqlite::Result<bool> {
    let res: Option<bool> = conn.prepare("SELECT is_admin FROM users WHERE username = ?1")?.query_row(params![uname], |row| row.get(0)).optional()?;
    Ok(res.unwrap_or(false))
}