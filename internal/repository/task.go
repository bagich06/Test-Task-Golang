package repository

import (
	"context"
	"intern_golang/internal/models"
)

func (repo *PGRepo) CreateTask(task models.Task, userID int) (int, error) {
	err := repo.pool.QueryRow(context.Background(), `INSERT INTO tasks(user_id, description, is_done) VALUES ($1, $2, $3) RETURNING id`, userID, task.Description, task.IsDone).Scan(&task.ID)
	if err != nil {
		return 0, err
	}
	return task.ID, nil
}

func (repo *PGRepo) GetAllTasks(userID int) (tasks []models.Task, err error) {
	tasks = make([]models.Task, 0)

	rows, err := repo.pool.Query(context.Background(), `SELECT id, user_id, description, is_done FROM tasks WHERE user_id = $1`, userID)
	if err != nil {
		return tasks, err
	}
	defer rows.Close()
	for rows.Next() {
		var task models.Task
		err := rows.Scan(&task.ID, &task.UserID, &task.Description, &task.IsDone)
		if err != nil {
			return tasks, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (repo *PGRepo) GetTaskByID(taskID int, userID int) (task models.Task, err error) {
	err = repo.pool.QueryRow(context.Background(), `SELECT id, user_id, description, is_done FROM tasks WHERE id = $1 and user_id = $2`, taskID, userID).Scan(&task.ID, &task.UserID, &task.Description, &task.IsDone)
	if err != nil {
		return models.Task{}, err
	}
	return task, nil
}

func (repo *PGRepo) DeleteTaskByID(taskID int, userID int) error {
	_, err := repo.pool.Exec(context.Background(), `DELETE FROM tasks WHERE id = $1 and user_id = $2`, taskID, userID)
	return err
}

func (repo *PGRepo) MarkAsDone(id int, userID int) (err error) {
	_, err = repo.pool.Exec(context.Background(), `UPDATE tasks SET is_done = TRUE WHERE id = $1 and user_id = $2`, id, userID)
	return err
}

func (repo *PGRepo) MarkTaskAsUnDone(id int, userID int) (err error) {
	_, err = repo.pool.Exec(context.Background(), `UPDATE tasks SET is_done = false WHERE id = $1 and user_id = $2`, id, userID)
	return err
}
