package models

type Task struct {
	ID          int    `json:"id"`
	UserID      int    `json:"user_id"`
	Description string `json:"description"`
	IsDone      bool   `json:"is_done"`
}
