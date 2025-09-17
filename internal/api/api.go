package api

import (
	"intern_golang/internal/middleware"
	"intern_golang/internal/repository"
	"net/http"

	"github.com/gorilla/mux"
)

type api struct {
	router *mux.Router
	repo   repository.Repository
}

func NewAPI(r *mux.Router, repo repository.Repository) *api {
	return &api{router: r, repo: repo}
}

func (api *api) Handle() {
	api.router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	api.router.HandleFunc("/api/login", api.LoginHandler).Methods(http.MethodPost, http.MethodOptions)
	api.router.HandleFunc("/api/register", api.RegisterHandler).Methods(http.MethodPost, http.MethodOptions)
	api.router.HandleFunc("/api/task/create", middleware.AuthMiddleware(api.CreateTaskHandler)).Methods(http.MethodPost, http.MethodOptions)
	api.router.HandleFunc("/api/task/delete/{id}", middleware.AuthMiddleware(api.DeleteTaskByIdHandler)).Methods(http.MethodDelete, http.MethodOptions)
	api.router.HandleFunc("/api/task/{id}", middleware.AuthMiddleware(api.GetTaskByIdHandler)).Methods(http.MethodGet, http.MethodOptions)
	api.router.HandleFunc("/api/tasks", middleware.AuthMiddleware(api.GetAllTasksHandler)).Methods(http.MethodGet, http.MethodOptions)
	api.router.HandleFunc("/api/task/done/{id}", middleware.AuthMiddleware(api.MarkTaskAsDoneHandler)).Methods(http.MethodPost, http.MethodOptions)
	api.router.HandleFunc("/api/task/undone/{id}", middleware.AuthMiddleware(api.MarkTaskAsUnDoneHandler)).Methods(http.MethodPost, http.MethodOptions)
}

func (api *api) ListenAndServe(addr string) error {
	return http.ListenAndServe(addr, api.router)
}
