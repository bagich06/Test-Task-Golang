package api

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"intern_golang/internal/middleware"
	"intern_golang/internal/models"
	"net/http"
	"strconv"
)

func (api *api) CreateTaskHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	var task models.Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	taskID, err := api.db.CreateTask(task, userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskID)
}

func (api *api) GetTaskByIdHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	taskID, ok := vars["id"]
	if !ok {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	intTaskID, err := strconv.Atoi(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	task, err := api.db.GetTaskByID(intTaskID, userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func (api *api) DeleteTaskByIdHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	taskID, ok := vars["id"]
	if !ok {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	intTaskID, err := strconv.Atoi(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	err = api.db.DeleteTaskByID(intTaskID, userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(intTaskID)
}

func (api *api) GetAllTasksHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	tasks, err := api.db.GetAllTasks(userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func (api *api) MarkTaskAsDoneHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	taskID, ok := vars["id"]
	if !ok {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	intTaskID, err := strconv.Atoi(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	err = api.db.MarkAsDone(intTaskID, userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(intTaskID)
}

func (api *api) MarkTaskAsUnDoneHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "User ID not found", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	taskID, ok := vars["id"]
	if !ok {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	intTaskID, err := strconv.Atoi(taskID)
	if err != nil {
		http.Error(w, "Invalid task ID", http.StatusBadRequest)
		return
	}

	err = api.db.MarkTaskAsUnDone(intTaskID, userID)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(intTaskID)
}
