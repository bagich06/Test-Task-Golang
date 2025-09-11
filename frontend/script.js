class TaskManager {
  constructor() {
    this.apiBase = "http://localhost:8080/api";
    this.token = localStorage.getItem("token");
    this.user = JSON.parse(localStorage.getItem("user") || "{}");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuth();
  }

  setupEventListeners() {
    document
      .getElementById("login-tab")
      .addEventListener("click", () => this.switchTab("login"));
    document
      .getElementById("register-tab")
      .addEventListener("click", () => this.switchTab("register"));

    document
      .getElementById("login-form")
      .addEventListener("submit", (e) => this.handleLogin(e));
    document
      .getElementById("register-form")
      .addEventListener("submit", (e) => this.handleRegister(e));

    document
      .getElementById("logout-btn")
      .addEventListener("click", () => this.logout());

    document
      .getElementById("add-task-form")
      .addEventListener("submit", (e) => this.handleAddTask(e));
  }

  checkAuth() {
    if (this.token && this.user.id) {
      this.showApp();
      this.loadTasks();
    } else {
      this.showAuth();
    }
  }

  switchTab(tab) {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (tab === "login") {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    } else {
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(`${this.apiBase}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        this.showApp();
        // Небольшая задержка перед загрузкой задач, чтобы токен успел сохраниться
        setTimeout(() => {
          this.loadTasks();
        }, 100);
        this.showMessage("Успешный вход в систему!", "success");
      } else {
        this.showMessage(data.message || "Ошибка входа", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const response = await fetch(`${this.apiBase}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        this.showApp();
        // Небольшая задержка перед загрузкой задач, чтобы токен успел сохраниться
        setTimeout(() => {
          this.loadTasks();
        }, 100);
        this.showMessage("Регистрация успешна!", "success");
      } else {
        this.showMessage(data.message || "Ошибка регистрации", "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  logout() {
    this.token = null;
    this.user = {};
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.showAuth();
    this.showMessage("Вы вышли из системы", "info");
  }

  showAuth() {
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("app-section").classList.add("hidden");
    document.getElementById("user-info").classList.add("hidden");
  }

  showApp() {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("app-section").classList.remove("hidden");
    document.getElementById("user-info").classList.remove("hidden");
    document.getElementById("username").textContent = this.user.username;
  }

  async handleAddTask(e) {
    e.preventDefault();

    const description = document.getElementById("task-description").value;
    if (!description.trim()) return;

    try {
      const response = await fetch(`${this.apiBase}/task/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ description, is_done: false }),
      });

      if (response.ok) {
        document.getElementById("task-description").value = "";
        this.loadTasks();
        this.showMessage("Задача добавлена!", "success");
      } else {
        this.showMessage("Ошибка добавления задачи", "error");
      }
    } catch (error) {
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  async loadTasks() {
    if (!this.token) {
      console.log("No token available for loading tasks");
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/tasks`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const tasks = await response.json();
        this.renderTasks(tasks);
      } else if (response.status === 401) {
        // Токен недействителен, выходим из системы
        this.logout();
        this.showMessage("Сессия истекла, войдите заново", "error");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        this.showMessage("Ошибка загрузки задач", "error");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  renderTasks(tasks) {
    const tasksList = document.getElementById("tasks-list");

    // Проверяем, что tasks не null и является массивом
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      tasksList.innerHTML = `
                <div class="empty-state">
                    <h3>Нет задач</h3>
                    <p>Добавьте свою первую задачу!</p>
                </div>
            `;
      return;
    }

    tasksList.innerHTML = tasks
      .map(
        (task) => `
            <div class="task-item ${
              task.is_done ? "completed" : ""
            }" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${
                  task.is_done ? "checked" : ""
                } 
                       onchange="taskManager.toggleTaskStatus(${task.id}, ${
          task.is_done
        })">
                <span class="task-description">${this.escapeHtml(
                  task.description
                )}</span>
                 <div class="task-actions">
                     <button class="task-btn delete" onclick="taskManager.deleteTask(${
                       task.id
                     })">Удалить</button>
                 </div>
            </div>
        `
      )
      .join("");
  }

  async toggleTaskStatus(taskId, currentStatus) {
    try {
      let response;
      if (currentStatus) {
        // Если задача выполнена, отменяем выполнение
        response = await fetch(`${this.apiBase}/task/undone/${taskId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      } else {
        // Если задача не выполнена, отмечаем как выполненную
        response = await fetch(`${this.apiBase}/task/done/${taskId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
      }

      if (response.ok) {
        this.loadTasks();
        this.showMessage(
          currentStatus ? "Задача отменена" : "Задача выполнена!",
          "success"
        );
      } else {
        this.showMessage("Ошибка обновления задачи", "error");
      }
    } catch (error) {
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  async toggleTask(taskId, currentStatus) {
    try {
      const response = await fetch(`${this.apiBase}/task/done/${taskId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.loadTasks();
        this.showMessage("Задача выполнена!", "success");
      } else {
        this.showMessage("Ошибка обновления задачи", "error");
      }
    } catch (error) {
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  async markAsUndone(taskId) {
    try {
      const response = await fetch(`${this.apiBase}/task/undone/${taskId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.loadTasks();
        this.showMessage("Задача отменена", "success");
      } else {
        this.showMessage("Ошибка обновления задачи", "error");
      }
    } catch (error) {
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  async deleteTask(taskId) {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/task/delete/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.loadTasks();
        this.showMessage("Задача удалена!", "success");
      } else {
        this.showMessage("Ошибка удаления задачи", "error");
      }
    } catch (error) {
      this.showMessage("Ошибка соединения с сервером", "error");
    }
  }

  showMessage(text, type) {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.classList.remove("hidden");

    setTimeout(() => {
      messageEl.classList.add("hidden");
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Инициализация приложения
const taskManager = new TaskManager();
