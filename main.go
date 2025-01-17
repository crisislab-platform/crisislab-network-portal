package main

import (
	"log"
	"net/http"
	"text/template"
)

func handleRoot(w http.ResponseWriter, r *http.Request) {
	tmpl := template.Must(template.ParseFiles("public/index.html"))
	tmpl.Execute(w, nil)
}

func main() {
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	http.HandleFunc("/", handleRoot)

	log.Fatal(http.ListenAndServe(":3000", nil))
}
