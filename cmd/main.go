package main

import (
	"intern_golang/internal/api"
	"intern_golang/internal/repository"
	"log"

	"github.com/gorilla/mux"
)

func main() {
	db, err := repository.NewPGRepo("postgres://postgres:postgres@localhost:5432/intern_test")
	if err != nil {
		log.Fatal(err)
	}
	srv := api.NewAPI(mux.NewRouter(), db)
	srv.Handle()
	log.Fatal(srv.ListenAndServe("localhost:8080"))
}
