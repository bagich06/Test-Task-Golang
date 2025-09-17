import React, { useState, useEffect } from "react";
import {
  Login,
  Register,
  CreateTask,
  GetTasks,
  MarkAsDone,
  MarkAsUndone,
  DeleteTask,
} from "../wailsjs/go/main/App";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("login");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [currentFilter, setCurrentFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [message, setMessage] = useState({ text: "", type: "", show: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Auth form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    checkAuth();
    applyTheme();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadTasks();
    }
  }, [isLoggedIn]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    if (token && userData.id) {
      setUser(userData);
      setIsLoggedIn(true);
    }
  };

  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type, show: true });
    setTimeout(() => {
      setMessage({ text: "", type: "", show: false });
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Login(loginData.email, loginData.password);
      setUser(response.user);
      setIsLoggedIn(true);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      showMessage("Успешный вход в систему!", "success");
    } catch (error) {
      showMessage("Ошибка входа: " + error.message, "error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await Register(
        registerData.username,
        registerData.email,
        registerData.password
      );
      setUser(response.user);
      setIsLoggedIn(true);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      showMessage("Регистрация успешна!", "success");
    } catch (error) {
      showMessage("Ошибка регистрации: " + error.message, "error");
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setTasks([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showMessage("Вы вышли из системы", "info");
  };

  const loadTasks = async () => {
    try {
      const tasksData = await GetTasks();
      setTasks(tasksData || []);
    } catch (error) {
      showMessage("Ошибка загрузки задач", "error");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskDescription.trim()) return;

    try {
      const newTask = await CreateTask(newTaskDescription, user.id);
      setTasks((prev) => [...prev, newTask]);
      setNewTaskDescription("");
      showMessage("Задача добавлена!", "success");
    } catch (error) {
      showMessage("Ошибка добавления задачи", "error");
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      if (currentStatus) {
        await MarkAsUndone(taskId);
      } else {
        await MarkAsDone(taskId);
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, is_done: !currentStatus } : task
        )
      );

      showMessage(
        currentStatus ? "Задача отменена" : "Задача выполнена!",
        "success"
      );
    } catch (error) {
      showMessage("Ошибка обновления задачи", "error");
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await DeleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
      showMessage("Задача удалена!", "success");
    } catch (error) {
      showMessage("Ошибка удаления задачи", "error");
    }
  };

  const getFilteredTasks = () => {
    switch (currentFilter) {
      case "pending":
        return tasks.filter((task) => !task.is_done);
      case "completed":
        return tasks.filter((task) => task.is_done);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  if (!isLoggedIn) {
    return (
      <div className="container">
        <header>
          <h1>Task Manager</h1>
          <div className="header-controls">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Переключить тему"
            >
              <span>{theme === "light" ? "🌙" : "☀️"}</span>
            </button>
          </div>
        </header>

        <div className="auth-section">
          <div className="auth-container">
            <div className="auth-tabs">
              <button
                className={`tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Вход
              </button>
              <button
                className={`tab ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Регистрация
              </button>
            </div>

            {activeTab === "login" ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <h2>Вход в систему</h2>
                <div className="form-group">
                  <label htmlFor="login-email">Email:</label>
                  <input
                    type="email"
                    id="login-email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Пароль:</label>
                  <input
                    type="password"
                    id="login-password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit">Войти</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <h2>Регистрация</h2>
                <div className="form-group">
                  <label htmlFor="register-username">Имя пользователя:</label>
                  <input
                    type="text"
                    id="register-username"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="register-email">Email:</label>
                  <input
                    type="email"
                    id="register-email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="register-password">Пароль:</label>
                  <input
                    type="password"
                    id="register-password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <button type="submit">Зарегистрироваться</button>
              </form>
            )}
          </div>
        </div>

        {message.show && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Task Manager</h1>
        <div className="header-controls">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Переключить тему"
          >
            <span>{theme === "light" ? "🌙" : "☀️"}</span>
          </button>
          <div className="user-info">
            <span>{user?.username}</span>
            <button onClick={logout}>Выйти</button>
          </div>
        </div>
      </header>

      <div className="app-section">
        <div className="add-task-section">
          <h2>Добавить новую задачу</h2>
          <form onSubmit={handleAddTask}>
            <div className="form-group">
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Описание задачи..."
                required
              />
            </div>
            <button type="submit">Добавить задачу</button>
          </form>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Мои задачи</h2>
            <div className="task-filters">
              <button
                className={`filter-btn ${
                  currentFilter === "all" ? "active" : ""
                }`}
                onClick={() => setCurrentFilter("all")}
              >
                Все
              </button>
              <button
                className={`filter-btn ${
                  currentFilter === "pending" ? "active" : ""
                }`}
                onClick={() => setCurrentFilter("pending")}
              >
                Не выполненные
              </button>
              <button
                className={`filter-btn ${
                  currentFilter === "completed" ? "active" : ""
                }`}
                onClick={() => setCurrentFilter("completed")}
              >
                Выполненные
              </button>
            </div>
          </div>
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <h3>
                  {currentFilter === "all"
                    ? "Нет задач"
                    : currentFilter === "pending"
                    ? "Нет невыполненных задач"
                    : "Нет выполненных задач"}
                </h3>
                <p>
                  {currentFilter === "all"
                    ? "Добавьте свою первую задачу!"
                    : "Попробуйте другой фильтр"}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.is_done ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.is_done}
                    onChange={() => toggleTaskStatus(task.id, task.is_done)}
                  />
                  <span className="task-description">{task.description}</span>
                  <div className="task-actions">
                    <button
                      className="task-btn delete"
                      onClick={() => handleDeleteTask(task)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {message.show && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Подтверждение удаления</h3>
            </div>
            <div className="modal-body">
              <p>Вы уверены, что хотите удалить эту задачу?</p>
              <p className="task-preview">"{taskToDelete?.description}"</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Отмена
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


