package repository

import "intern_golang/internal/models"

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
