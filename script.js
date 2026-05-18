// ========== متغيرات عامة ==========
const TIMER_MODES = {
    study: { name: 'دراسة', minutes: 25 },
    'break-short': { name: 'راحة قصيرة', minutes: 5 },
    'break-long': { name: 'راحة طويلة', minutes: 15 }
};

let timerState = {
    mode: 'study',
    isRunning: false,
    isPaused: false,
    timeLeft: TIMER_MODES.study.minutes * 60,
    sessionsCompleted: 0,
    tasksCompleted: 0
};

let timerInterval = null;
const tasksList = [];

// ========== عناصر DOM ==========
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksListEl = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const sessionsCompletedEl = document.getElementById('sessionsCompleted');
const tasksCompletedEl = document.getElementById('tasksCompleted');
const modeBtns = document.querySelectorAll('.mode-btn');
const focusReminder = document.getElementById('focusReminder');
const completeSound = document.getElementById('completeSound');

// ========== تحميل البيانات ==========
function loadData() {
    const savedData = localStorage.getItem('timerAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        timerState.sessionsCompleted = data.sessionsCompleted || 0;
        timerState.tasksCompleted = data.tasksCompleted || 0;
        tasksList.length = 0;
        tasksList.push(...(data.tasks || []));
    }
    updateDisplay();
}

// ========== حفظ البيانات ==========
function saveData() {
    const data = {
        sessionsCompleted: timerState.sessionsCompleted,
        tasksCompleted: timerState.tasksCompleted,
        tasks: tasksList
    };
    localStorage.setItem('timerAppData', JSON.stringify(data));
}

// ========== تحديث العرض ==========
function updateDisplay() {
    updateTimerDisplay();
    renderTasks();
    sessionsCompletedEl.textContent = timerState.sessionsCompleted;
    tasksCompletedEl.textContent = timerState.tasksCompleted;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    timerDisplay.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // تحديث عنوان الصفحة
    document.title = `${timerDisplay.textContent} - مؤقت الدراسة`;
}

// ========== وظائف المؤقت ==========
function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    timerState.isPaused = false;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'block';
    focusReminder.style.display = 'block';
    modeBtns.forEach(btn => btn.disabled = true);
    document.querySelector('.timer-card').classList.add('active');

    timerInterval = setInterval(() => {
        if (timerState.timeLeft > 0) {
            timerState.timeLeft--;
            updateTimerDisplay();
        } else {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    timerState.isRunning = false;
    timerState.isPaused = true;
    clearInterval(timerInterval);
    startBtn.textContent = '▶ متابعة';
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
    document.querySelector('.timer-card').classList.remove('active');
}

function resetTimer() {
    clearInterval(timerInterval);
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.timeLeft = TIMER_MODES[timerState.mode].minutes * 60;
    startBtn.textContent = '▶ ابدأ';
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
    focusReminder.style.display = 'none';
    modeBtns.forEach(btn => btn.disabled = false);
    document.querySelector('.timer-card').classList.remove('active');
    updateTimerDisplay();
}

function completeTimer() {
    clearInterval(timerInterval);
    playSound();
    
    if (timerState.mode === 'study') {
        timerState.sessionsCompleted++;
        showNotification('🎉 تم إكمال جلسة دراسة! خذ راحة قصيرة.');
        changeMode('break-short');
    } else {
        showNotification('✨ انتهت فترة الراحة! استعد للدراسة مجدداً.');
        changeMode('study');
    }
    
    resetTimer();
    saveData();
}

// ========== تغيير النمط ==========
function changeMode(mode) {
    timerState.mode = mode;
    timerState.timeLeft = TIMER_MODES[mode].minutes * 60;
    
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    resetTimer();
}

// ========== إشعارات ==========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
        backdrop-filter: blur(10px);
        max-width: 300px;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== تشغيل صوت ==========
function playSound() {
    // محاولة تشغيل صوت نبضة
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ========== وظائف المهام ==========
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        showNotification('⚠️ أدخل نص المهمة أولاً');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleDateString('ar-SA')
    };

    tasksList.push(task);
    taskInput.value = '';
    saveData();
    renderTasks();
    showNotification('✅ تمت إضافة المهمة');
}

function deleteTask(id) {
    const index = tasksList.findIndex(t => t.id === id);
    if (index !== -1) {
        tasksList.splice(index, 1);
        saveData();
        renderTasks();
        showNotification('🗑️ تم حذف المهمة');
    }
}

function toggleTask(id) {
    const task = tasksList.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            timerState.tasksCompleted++;
            showNotification('🎯 تم إكمال المهمة!');
        } else {
            timerState.tasksCompleted--;
        }
        saveData();
        renderTasks();
    }
}

function renderTasks() {
    tasksListEl.innerHTML = '';
    
    if (tasksList.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';

    tasksList.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})">✕</button>
        `;
        tasksListEl.appendChild(li);
    });

    sessionsCompletedEl.textContent = timerState.sessionsCompleted;
    tasksCompletedEl.textContent = timerState.tasksCompleted;
}

// ========== دالة مساعدة لتجنب XSS ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== معالجات الأحداث ==========
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!timerState.isRunning) {
            changeMode(e.target.dataset.mode);
        }
    });
});

// ========== إخفاء زر الإيقاف المؤقت في البداية ==========
pauseBtn.style.display = 'none';

// ========== تحميل البيانات عند بدء التطبيق ==========
loadData();

// ========== حفظ البيانات قبل الإغلاق ==========
window.addEventListener('beforeunload', saveData);

// ========== تحديث الوقت كل ثانية (للدقة) ==========
setInterval(() => {
    if (!timerState.isRunning) {
        updateTimerDisplay();
    }
}, 1000);