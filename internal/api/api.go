package api

import (
	"intern_golang/internal/middleware"
	"intern_golang/internal/models"
	"net/http"

	"github.com/gorilla/mux"
)

type Repository interface {
	CreateUser(user models.User) (int, error)
	GetUserByEmail(email string) (models.User, error)
	CreateTask(task models.Task, userID int) (int, error)
	GetAllTasks(userID int) ([]models.Task, error)
	GetTaskByID(taskID int, userID int) (models.Task, error)
	DeleteTaskByID(taskID int, userID int) error
	MarkAsDone(id int, userID int) error
	MarkTaskAsUnDone(id int, userID int) error
}

type api struct {
	router *mux.Router
	repo   Repository
}

func NewAPI(r *mux.Router, repo Repository) *api {
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
