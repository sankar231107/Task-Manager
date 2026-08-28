/* ==========================================================================
   Task Manager - Persistent To-Do Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage Keys
    const STORAGE_KEY = 'taskpro_tasks_data';
    const THEME_KEY = 'taskpro_theme';

    // State Variables
    let tasks = loadTasks();
    let currentFilter = 'all';
    let currentCategory = 'all';
    let currentSort = 'newest';
    let searchQuery = '';
    let editingTaskId = null;

    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInputTitle = document.getElementById('task-input-title');
    const taskCategory = document.getElementById('task-category');
    const taskPriority = document.getElementById('task-priority');
    const taskDueDate = document.getElementById('task-duedate');

    const taskListEl = document.getElementById('task-list');
    const searchInput = document.getElementById('search-input');
    const filterCategorySelect = document.getElementById('filter-category');
    const sortSelect = document.getElementById('sort-select');
    const filterTabs = document.querySelectorAll('.tab-btn');

    const statTotal = document.getElementById('stat-total');
    const statPending = document.getElementById('stat-pending');
    const statCompleted = document.getElementById('stat-completed');
    const progressFill = document.getElementById('progress-fill');
    const progressPercentText = document.getElementById('progress-percent-text');

    const btnClearCompleted = document.getElementById('btn-clear-completed');
    const btnClearAll = document.getElementById('btn-clear-all');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');

    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editTitle = document.getElementById('edit-title');
    const editCategory = document.getElementById('edit-category');
    const editPriority = document.getElementById('edit-priority');
    const editDueDate = document.getElementById('edit-duedate');
    const btnModalClose = document.getElementById('btn-modal-close');
    const btnEditCancel = document.getElementById('btn-edit-cancel');

    // =========================================================================
    // 1. THEME CONTROLLER
    // =========================================================================
    let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
    
    function applyTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);

        if (btnThemeToggle) {
            const sunIcon = btnThemeToggle.querySelector('.sun-icon');
            const moonIcon = btnThemeToggle.querySelector('.moon-icon');
            if (theme === 'light') {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
                btnThemeToggle.title = "Switch to Dark Mode";
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                btnThemeToggle.title = "Switch to Light Mode";
            }
        }
    }

    applyTheme(currentTheme);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // =========================================================================
    // 2. LOCALSTORAGE STORAGE CONTROLLER
    // =========================================================================
    function loadTasks() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            // Seed initial demonstration tasks
            return [
                {
                    id: Date.now() - 300000,
                    title: 'Complete Web Technology Project Proposal',
                    category: 'Work',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    completed: false,
                    createdAt: Date.now() - 300000
                },
                {
                    id: Date.now() - 200000,
                    title: 'Review HTML, CSS, and JS LocalStorage Concepts',
                    category: 'Study',
                    priority: 'medium',
                    dueDate: new Date().toISOString().split('T')[0],
                    completed: false,
                    createdAt: Date.now() - 200000
                },
                {
                    id: Date.now() - 100000,
                    title: 'Buy groceries & fruits',
                    category: 'Shopping',
                    priority: 'low',
                    dueDate: '',
                    completed: true,
                    createdAt: Date.now() - 100000
                }
            ];
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse tasks from localStorage:', e);
            return [];
        }
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        render();
    }

    // =========================================================================
    // 3. TASK CRUD OPERATIONS
    // =========================================================================
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = taskInputTitle.value.trim();
            if (!title) return;

            const newTask = {
                id: Date.now(),
                title: title,
                category: taskCategory.value,
                priority: taskPriority.value,
                dueDate: taskDueDate.value,
                completed: false,
                createdAt: Date.now()
            };

            tasks.unshift(newTask);
            saveTasks();

            // Reset inputs
            taskInputTitle.value = '';
            taskDueDate.value = '';
            taskInputTitle.focus();
        });
    }

    function toggleComplete(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
    }

    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        editingTaskId = id;
        editTitle.value = task.title;
        editCategory.value = task.category;
        editPriority.value = task.priority;
        editDueDate.value = task.dueDate || '';
        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        editModal.classList.add('hidden');
        editingTaskId = null;
    }

    if (btnModalClose) btnModalClose.addEventListener('click', closeEditModal);
    if (btnEditCancel) btnEditCancel.addEventListener('click', closeEditModal);
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!editingTaskId) return;

            tasks = tasks.map(t => {
                if (t.id === editingTaskId) {
                    return {
                        ...t,
                        title: editTitle.value.trim(),
                        category: editCategory.value,
                        priority: editPriority.value,
                        dueDate: editDueDate.value
                    };
                }
                return t;
            });

            closeEditModal();
            saveTasks();
        });
    }

    if (btnClearCompleted) {
        btnClearCompleted.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                tasks = tasks.filter(t => !t.completed);
                saveTasks();
            }
        });
    }

    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL tasks?')) {
                tasks = [];
                saveTasks();
            }
        });
    }

    // =========================================================================
    // 4. FILTERING & SEARCH EVENT HANDLERS
    // =========================================================================
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            render();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            render();
        });
    }

    if (filterCategorySelect) {
        filterCategorySelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            render();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            render();
        });
    }

    // =========================================================================
    // 5. RENDER ENGINE
    // =========================================================================
    function getFilteredAndSortedTasks() {
        return tasks.filter(task => {
            // Status Filter
            if (currentFilter === 'active' && task.completed) return false;
            if (currentFilter === 'completed' && !task.completed) return false;

            // Category Filter
            if (currentCategory !== 'all' && task.category !== currentCategory) return false;

            // Search Query
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;

            return true;
        }).sort((a, b) => {
            if (currentSort === 'newest') return b.createdAt - a.createdAt;
            if (currentSort === 'oldest') return a.createdAt - b.createdAt;
            if (currentSort === 'priority') {
                const map = { high: 3, medium: 2, low: 1 };
                return map[b.priority] - map[a.priority];
            }
            if (currentSort === 'duedate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            }
            return 0;
        });
    }

    function isOverdue(dueDateStr, isCompleted) {
        if (!dueDateStr || isCompleted) return false;
        const today = new Date().toISOString().split('T')[0];
        return dueDateStr < today;
    }

    function render() {
        const filteredTasks = getFilteredAndSortedTasks();

        // Update Statistics
        const totalCount = tasks.length;
        const completedCount = tasks.filter(t => t.completed).length;
        const pendingCount = totalCount - completedCount;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        if (statTotal) statTotal.textContent = totalCount;
        if (statPending) statPending.textContent = pendingCount;
        if (statCompleted) statCompleted.textContent = completedCount;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressPercentText) progressPercentText.textContent = `${percent}%`;

        if (btnClearCompleted) btnClearCompleted.disabled = completedCount === 0;
        if (btnClearAll) btnClearAll.disabled = totalCount === 0;

        // Render Task Items
        if (!taskListEl) return;
        if (filteredTasks.length === 0) {
            taskListEl.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    <p>No tasks found.</p>
                </div>
            `;
            return;
        }

        const categoryIcons = {
            Work: '💼',
            Personal: '👤',
            Study: '📚',
            Shopping: '🛒',
            Health: '🩺'
        };

        const priorityBadges = {
            high: '<span class="badge badge-priority-high">🔴 High</span>',
            medium: '<span class="badge badge-priority-medium">🟡 Medium</span>',
            low: '<span class="badge badge-priority-low">🟢 Low</span>'
        };

        taskListEl.innerHTML = filteredTasks.map(task => {
            const overdue = isOverdue(task.dueDate, task.completed);
            const dateBadge = task.dueDate ? `
                <span class="badge ${overdue ? 'badge-overdue' : 'badge-date'}">
                    📅 ${task.dueDate}${overdue ? ' (Overdue!)' : ''}
                </span>
            ` : '';

            return `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle task completion">
                    
                    <div class="task-content">
                        <span class="task-title">${escapeHtml(task.title)}</span>
                        <div class="task-meta">
                            <span class="badge badge-category">${categoryIcons[task.category] || ''} ${task.category}</span>
                            ${priorityBadges[task.priority] || ''}
                            ${dateBadge}
                        </div>
                    </div>

                    <div class="task-actions">
                        <button class="btn-icon-action btn-icon-edit" title="Edit Task" aria-label="Edit Task">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon-action btn-icon-delete" title="Delete Task" aria-label="Delete Task">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        // Attach Event Listeners to Task Items
        taskListEl.querySelectorAll('.task-item').forEach(item => {
            const id = Number(item.dataset.id);
            const checkbox = item.querySelector('.task-checkbox');
            const btnEdit = item.querySelector('.btn-icon-edit');
            const btnDelete = item.querySelector('.btn-icon-delete');

            if (checkbox) {
                checkbox.addEventListener('change', () => toggleComplete(id));
            }
            if (btnEdit) {
                btnEdit.addEventListener('click', () => openEditModal(id));
            }
            if (btnDelete) {
                btnDelete.addEventListener('click', () => deleteTask(id));
            }
        });
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    // Initial Render
    render();
});
