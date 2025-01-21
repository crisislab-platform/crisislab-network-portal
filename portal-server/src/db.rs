use rusqlite::{params, Connection, Result};

pub fn initialize_database(db_path: &str) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    {
        conn.execute(
            "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                is_admin BOOLEAN NOT NULL
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
