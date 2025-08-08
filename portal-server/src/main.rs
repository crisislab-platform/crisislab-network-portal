#[macro_use]
extern crate rocket;
use rocket::fairing::AdHoc;
use rocket::fs::NamedFile;
use rocket::fs::{relative, FileServer};
use rocket::response::Redirect;
use rocket_cors::{AllowedHeaders, AllowedMethods, AllowedOrigins, CorsOptions};
use std::path::Path;
use std::path::PathBuf;

#[get("/<path..>", rank = 100)]
fn fallback(path: PathBuf) -> Redirect {
    // Optionally, you could inspect the path or log it.
    Redirect::to(uri!(index))
}

#[get("/")]
async fn index() -> Option<NamedFile> {
    NamedFile::open(Path::new("public/index.html")).await.ok() // Serve `index.html` directly
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index, fallback]) // Route for `/`
        .mount("/public", FileServer::from(relative!("public"))) // Serve other static files
}
