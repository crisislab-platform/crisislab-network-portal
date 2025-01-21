use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::{params, Connection, OptionalExtension, Result};

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
            conn.execute(
                "INSERT INTO users (username, password, is_admin) VALUES (?1, ?2, ?3);",
                params!["admin", "admin", true],
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

pub fn add_user(
    conn: &Connection,
    operator_uname: &str,
    uname: &str,
    pword: &str,
    admin: &bool,
) -> Result<bool> {
    let mut can_add_stmt = conn.prepare("SELECT is_admin FROM users WHERE username = ?;");
    let can_add: bool = can_add_stmt.query_row(params![operator_uname], |row| row.get(0))?;
    if !can_add {
        Ok(false)
    }

    let mut add_user_stmt = conn.execute(
        "INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?);",
        params![uname, hash(pword, DEFAULT_COST), admin],
    )?;
    Ok(true)
}
