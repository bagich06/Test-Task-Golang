package api

import (
	"encoding/json"
	"intern_golang/internal/jwt"
	"intern_golang/internal/models"
	"net/http"
)

func (api *api) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := api.repo.GetUserByEmail(req.Email)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	if user.Password != req.Password {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	token, err := jwt.GenerateToken(user.ID, user.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	user.Password = ""

	response := models.AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   response.Token,
		"user":    response.User,
		"message": "Вы успешно вошли в систему",
		"user_id": user.ID,
	})
}

func (api *api) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: req.Password,
	}

	userID, err := api.repo.CreateUser(user)
	if err != nil {
		http.Error(w, "User already exists or database error", http.StatusConflict)
		return
	}

	token, err := jwt.GenerateToken(userID, user.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	user.ID = userID
	user.Password = ""

	response := models.AuthResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":   response.Token,
		"user":    response.User,
		"message": "Пользователь успешно зарегистрирован",
		"user_id": userID,
	})
}
