package main

import (
	"github.com/gorilla/mux"
	"intern_golang/internal/api"
	"intern_golang/internal/repository"
	"log"
)

func main() {
	db, err := repository.NewPGRepo("postgres://postgres:postgres@localhost:5432/intern_test")
	if err != nil {
		log.Fatal(err)
	}
	api := api.NewAPI(mux.NewRouter(), db)
	api.Handle()
	log.Fatal(api.ListenAndServe("localhost:8080"))
}
