#[macro_use]
extern crate rocket;
use rocket::fs::NamedFile;
use rocket::fs::{relative, FileServer};
use std::path::Path;

#[get("/")]
async fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("public/index.html")).await.ok() // Serve `index.html` directly
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index]) // Route for `/`
        .mount("/public", FileServer::from(relative!("public"))) // Serve other static files
}
