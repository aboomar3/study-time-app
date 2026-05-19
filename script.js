// ========== متغيرات عامة ==========
const TIMER_MODES = {
    study: { name: 'دراسة', nameEn: 'Study', minutes: 25 },
    'break-short': { name: 'راحة قصيرة', nameEn: 'Short Break', minutes: 5 },
    'break-long': { name: 'راحة طويلة', nameEn: 'Long Break', minutes: 15 }
};

let timerState = {
    mode: 'study',
    isRunning: false,
    isPaused: false,
    timeLeft: TIMER_MODES.study.minutes * 60,
    sessionsCompleted: 0,
    tasksCompleted: 0,
    language: 'ar',
    isCustomMode: false,
    customTimes: []
};

let timerInterval = null;
let examCountdownInterval = null;
const tasksList = [];

const translations = {
    ar: {
        startBtn: '▶ ابدأ',
        continueBtn: '▶ متابعة',
        pauseBtn: '⏸ إيقاف مؤقت',
        resetBtn: '↻ إعادة تعيين',
        addTaskBtn: '➕ أضف',
        sessionsLabel: 'الجلسات المكتملة',
        tasksLabel: 'المهام المكتملة',
        taskPlaceholder: 'أضف مهمة جديدة...',
        emptyTask: '⚠️ أدخل نص المهمة أولاً',
        taskAdded: '✅ تمت إضافة المهمة',
        taskDeleted: '🗑️ تم حذف المهمة',
        taskCompleted: '🎯 تم إكمال المهمة!',
        sessionComplete: '🎉 تم إكمال جلسة دراسة! خذ راحة قصيرة.',
        breakComplete: '✨ انتهت فترة الراحة! استعد للدراسة مجدداً.',
        focusReminder: '💡 تذكر: غير هاتفك أو ركن جهازك الثاني',
        examDate: 'تاريخ الامتحان: 6 يونيو 2026',
        daysLabel: 'أيام',
        hoursLabel: 'ساعات',
        minutesLabel: 'دقائق',
        secondsLabel: 'ثواني',
        examMessage: '🎓 يا فريت يا بنت! حان وقت الامتحان! 🎓',
        customTimeAdded: '⏱️ تم إضافة الوقت المخصص',
        emptyCustomTime: '⚠️ الرجاء إدخال وقت صحيح'
    },
    en: {
        startBtn: '▶ Start',
        continueBtn: '▶ Continue',
        pauseBtn: '⏸ Pause',
        resetBtn: '↻ Reset',
        addTaskBtn: '➕ Add',
        sessionsLabel: 'Sessions Completed',
        tasksLabel: 'Tasks Completed',
        taskPlaceholder: 'Add a new task...',
        emptyTask: '⚠️ Please enter a task first',
        taskAdded: '✅ Task added',
        taskDeleted: '🗑️ Task deleted',
        taskCompleted: '🎯 Task completed!',
        sessionComplete: '🎉 Study session completed! Take a short break.',
        breakComplete: '✨ Break time over! Ready to study again.',
        focusReminder: '💡 Remember: Turn off your phone or put away your second device',
        examDate: 'Exam Date: June 6, 2026',
        daysLabel: 'Days',
        hoursLabel: 'Hours',
        minutesLabel: 'Minutes',
        secondsLabel: 'Seconds',
        examMessage: '🎓 Good luck! It\'s exam time! 🎓',
        customTimeAdded: '⏱️ Custom time added',
        emptyCustomTime: '⚠️ Please enter a valid time'
    }
};

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
const languageToggle = document.getElementById('languageToggle');

// عناصر الوقت المخصص
const customMinutesInput = document.getElementById('customMinutes');
const customSecondsInput = document.getElementById('customSeconds');
const customPreview = document.getElementById('customPreview');
const setCustomBtn = document.getElementById('setCustomBtn');
const startCustomBtn = document.getElementById('startCustomBtn');
const savedTimesList = document.getElementById('savedTimesList');

// عناصر التنقل
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section-content');

// ========== تحميل البيانات ==========
function loadData() {
    const savedData = localStorage.getItem('timerAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        timerState.sessionsCompleted = data.sessionsCompleted || 0;
        timerState.tasksCompleted = data.tasksCompleted || 0;
        timerState.language = data.language || 'ar';
        timerState.customTimes = data.customTimes || [];
        tasksList.length = 0;
        tasksList.push(...(data.tasks || []));
    }
    
    // تطبيق اللغة المحفوظة
    if (timerState.language === 'en') {
        switchToEnglish();
    } else {
        switchToArabic();
    }
    
    updateDisplay();
    renderSavedTimes();
}

// ========== حفظ البيانات ==========
function saveData() {
    const data = {
        sessionsCompleted: timerState.sessionsCompleted,
        tasksCompleted: timerState.tasksCompleted,
        tasks: tasksList,
        language: timerState.language,
        customTimes: timerState.customTimes
    };
    localStorage.setItem('timerAppData', JSON.stringify(data));
}

// ========== تبديل اللغة ==========
function switchToArabic() {
    timerState.language = 'ar';
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    updateLanguageContent('ar');
    languageToggle.textContent = 'English';
    saveData();
}

function switchToEnglish() {
    timerState.language = 'en';
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    updateLanguageContent('en');
    languageToggle.textContent = 'العربية';
    saveData();
}

function updateLanguageContent(lang) {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        if (lang === 'en') {
            const enText = el.getAttribute('data-en');
            if (enText) {
                el.textContent = enText;
            }
        } else {
            const arSpan = el.querySelector('[data-ar]');
            if (arSpan) {
                el.innerHTML = arSpan.getAttribute('data-ar');
            }
        }
    });

    // تحديث labels مع data attributes
    const labelElements = document.querySelectorAll('[data-en]');
    labelElements.forEach(el => {
        if (el.getAttribute('data-en')) {
            el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.innerHTML;
        }
    });

    // تحديث الـ placeholder
    const input = document.getElementById('taskInput');
    if (input) {
        input.placeholder = lang === 'en' ? 'Add a new task...' : 'أضف مهمة جديدة...';
    }

    // تحديث الأزرار
    startBtn.textContent = timerState.isPaused ? 
        (lang === 'en' ? translations.en.continueBtn : translations.ar.continueBtn) :
        (lang === 'en' ? translations.en.startBtn : translations.ar.startBtn);
    pauseBtn.textContent = lang === 'en' ? translations.en.pauseBtn : translations.ar.pauseBtn;
    resetBtn.textContent = lang === 'en' ? translations.en.resetBtn : translations.ar.resetBtn;
    addTaskBtn.textContent = lang === 'en' ? translations.en.addTaskBtn : translations.ar.addTaskBtn;

    // تحديث الـ labels
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels.forEach((label, index) => {
        if (index === 0) {
            label.textContent = lang === 'en' ? translations.en.sessionsLabel : translations.ar.sessionsLabel;
        } else if (index === 1) {
            label.textContent = lang === 'en' ? translations.en.tasksLabel : translations.ar.tasksLabel;
        }
    });

    // تحديث الرسائل الفارغة
    const emptyMessages = document.querySelectorAll('#emptyState p');
    if (emptyMessages.length >= 2) {
        emptyMessages[0].textContent = lang === 'en' ? '✨ No tasks yet' : '✨ لا توجد مهام حالياً';
        emptyMessages[1].textContent = lang === 'en' ? 'Start by adding a new task' : 'ابدأ بإضافة مهمة جديدة';
    }

    // تحديث تذكير التركيز
    focusReminder.textContent = lang === 'en' ? translations.en.focusReminder : translations.ar.focusReminder;

    // تحديث تاريخ الامتحان
    const examDate = document.querySelector('.exam-date');
    if (examDate) {
        examDate.textContent = lang === 'en' ? translations.en.examDate : translations.ar.examDate;
    }

    // تحديث تسميات العد التنازلي
    const countdownLabels = document.querySelectorAll('.countdown-label');
    const labelTexts = lang === 'en' 
        ? [translations.en.daysLabel, translations.en.hoursLabel, translations.en.minutesLabel, translations.en.secondsLabel]
        : [translations.ar.daysLabel, translations.ar.hoursLabel, translations.ar.minutesLabel, translations.ar.secondsLabel];
    
    countdownLabels.forEach((label, index) => {
        if (index < labelTexts.length) {
            label.textContent = labelTexts[index];
        }
    });

    // تحديث أزرار الأنماط
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        const mode = btn.getAttribute('data-mode');
        const enText = btn.getAttribute('data-en');
        if (mode === 'study') {
            btn.textContent = lang === 'en' ? enText : 'دراسة 25 دقيقة';
        } else if (mode === 'break-short') {
            btn.textContent = lang === 'en' ? enText : 'راحة 5 دقائق';
        } else if (mode === 'break-long') {
            btn.textContent = lang === 'en' ? enText : 'راحة 15 دقيقة';
        }
    });

    // تحديث تسميات الإدخال المخصص
    const inputLabels = document.querySelectorAll('.input-field label');
    inputLabels.forEach(label => {
        if (label.textContent.includes('الدقائق') || label.getAttribute('data-en') === 'Minutes') {
            label.textContent = lang === 'en' ? 'Minutes' : 'الدقائق';
        } else if (label.textContent.includes('الثواني') || label.getAttribute('data-en') === 'Seconds') {
            label.textContent = lang === 'en' ? 'Seconds' : 'الثواني';
        }
    });
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
    const pageTitle = timerState.language === 'en' 
        ? `${timerDisplay.textContent} - Study Timer`
        : `${timerDisplay.textContent} - مؤقت الدراسة`;
    document.title = pageTitle;
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
    const btnText = timerState.language === 'en' 
        ? translations.en.continueBtn 
        : translations.ar.continueBtn;
    startBtn.textContent = btnText;
    startBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
    document.querySelector('.timer-card').classList.remove('active');
}

function resetTimer() {
    clearInterval(timerInterval);
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.timeLeft = TIMER_MODES[timerState.mode].minutes * 60;
    const btnText = timerState.language === 'en' 
        ? translations.en.startBtn 
        : translations.ar.startBtn;
    startBtn.textContent = btnText;
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
        const message = timerState.language === 'en' 
            ? translations.en.sessionComplete 
            : translations.ar.sessionComplete;
        showNotification(message);
        changeMode('break-short');
    } else {
        const message = timerState.language === 'en' 
            ? translations.en.breakComplete 
            : translations.ar.breakComplete;
        showNotification(message);
        changeMode('study');
    }
    
    resetTimer();
    saveData();
}

// ========== تغيير النمط ==========
function changeMode(mode) {
    timerState.mode = mode;
    timerState.isCustomMode = false;
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
    const position = timerState.language === 'en' ? 'left' : 'right';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        ${position}: 20px;
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
    try {
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
    } catch (e) {
        console.log('Audio context not available');
    }
}

// ========== وظائف المهام ==========
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        const message = timerState.language === 'en' 
            ? translations.en.emptyTask 
            : translations.ar.emptyTask;
        showNotification(message);
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleDateString(timerState.language === 'en' ? 'en-US' : 'ar-SA')
    };

    tasksList.push(task);
    taskInput.value = '';
    saveData();
    renderTasks();
    const message = timerState.language === 'en' 
        ? translations.en.taskAdded 
        : translations.ar.taskAdded;
    showNotification(message);
}

function deleteTask(id) {
    const index = tasksList.findIndex(t => t.id === id);
    if (index !== -1) {
        tasksList.splice(index, 1);
        saveData();
        renderTasks();
        const message = timerState.language === 'en' 
            ? translations.en.taskDeleted 
            : translations.ar.taskDeleted;
        showNotification(message);
    }
}

function toggleTask(id) {
    const task = tasksList.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            timerState.tasksCompleted++;
            const message = timerState.language === 'en' 
                ? translations.en.taskCompleted 
                : translations.ar.taskCompleted;
            showNotification(message);
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

// ========== مؤقت الامتحان ==========
function updateExamCountdown() {
    const examDate = new Date('2026-06-06T00:00:00').getTime();
    const now = new Date().getTime();
    const difference = examDate - now;

    if (difference <= 0) {
        // الامتحان قد بدأ
        document.getElementById('examDays').textContent = '0';
        document.getElementById('examHours').textContent = '0';
        document.getElementById('examMinutes').textContent = '0';
        document.getElementById('examSeconds').textContent = '0';
        
        const message = timerState.language === 'en' 
            ? translations.en.examMessage 
            : translations.ar.examMessage;
        const examMessage = document.getElementById('examMessage');
        examMessage.textContent = message;
        examMessage.classList.add('show');
        
        clearInterval(examCountdownInterval);
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('examDays').textContent = days;
    document.getElementById('examHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('examMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('examSeconds').textContent = String(seconds).padStart(2, '0');
}

// ========== وظائف الوقت المخصص ==========
function updateCustomPreview() {
    const minutes = parseInt(customMinutesInput.value) || 0;
    const seconds = parseInt(customSecondsInput.value) || 0;
    
    customPreview.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setCustomTime() {
    const minutes = parseInt(customMinutesInput.value) || 0;
    const seconds = parseInt(customSecondsInput.value) || 0;
    
    if (minutes === 0 && seconds === 0) {
        const message = timerState.language === 'en' 
            ? translations.en.emptyCustomTime 
            : translations.ar.emptyCustomTime;
        showNotification(message);
        return;
    }

    timerState.mode = 'custom';
    timerState.isCustomMode = true;
    timerState.timeLeft = minutes * 60 + seconds;
    
    // إزالة الحالة النشطة من جميع الأزرار
    modeBtns.forEach(btn => btn.classList.remove('active'));
    
    updateTimerDisplay();
    resetTimer();
    
    // حفظ الوقت المخصص إذا لم يكن موجوداً
    const timeKey = `${minutes}:${seconds}`;
    if (!timerState.customTimes.some(t => t.key === timeKey)) {
        timerState.customTimes.push({
            key: timeKey,
            minutes,
            seconds,
            display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        });
        saveData();
        renderSavedTimes();
    }
    
    const message = timerState.language === 'en' 
        ? translations.en.customTimeAdded 
        : translations.ar.customTimeAdded;
    showNotification(message);
}

function startCustomTimer() {
    setCustomTime();
    startTimer();
}

function loadSavedTime(minutes, seconds) {
    customMinutesInput.value = minutes;
    customSecondsInput.value = seconds;
    updateCustomPreview();
    setCustomTime();
}

function renderSavedTimes() {
    savedTimesList.innerHTML = '';
    
    if (timerState.customTimes.length === 0) {
        savedTimesList.innerHTML = '<div class="saved-times-empty">' + 
            (timerState.language === 'en' ? 'No saved times yet' : 'لا توجد أوقات محفوظة') + 
            '</div>';
        return;
    }

    timerState.customTimes.forEach(time => {
        const div = document.createElement('div');
        div.className = 'saved-time-item';
        div.innerHTML = `
            <span class="saved-time-value">${time.display}</span>
            <button class="saved-time-btn" onclick="loadSavedTime(${time.minutes}, ${time.seconds})">▶</button>
        `;
        savedTimesList.appendChild(div);
    });
}

// ========== وظائف التنقل ==========
function switchSection(sectionName) {
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
        }
    });
}

// ========== معالجات الأحداث ==========
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskBtn.addEventListener('click', addTask);

languageToggle.addEventListener('click', () => {
    if (timerState.language === 'ar') {
        switchToEnglish();
    } else {
        switchToArabic();
    }
});

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

// معالجات الوقت المخصص
customMinutesInput.addEventListener('change', updateCustomPreview);
customSecondsInput.addEventListener('change', updateCustomPreview);
customMinutesInput.addEventListener('input', updateCustomPreview);
customSecondsInput.addEventListener('input', updateCustomPreview);

setCustomBtn.addEventListener('click', setCustomTime);
startCustomBtn.addEventListener('click', startCustomTimer);

// معالجات التنقل
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        switchSection(section);
    });
});

// ========== إخفاء زر الإيقاف المؤقت في البداية ==========
pauseBtn.style.display = 'none';

// ========== تحميل البيانات عند بدء التطبيق ==========
loadData();

// ========== بدء مؤقت الامتحان ==========
updateExamCountdown();
examCountdownInterval = setInterval(updateExamCountdown, 1000);

// ========== حفظ البيانات قبل الإغلاق ==========
window.addEventListener('beforeunload', saveData);

// ========== تحديث الوقت كل ثانية (للدقة) ==========
setInterval(() => {
    if (!timerState.isRunning) {
        updateTimerDisplay();
    }
}, 1000);

// ========== تهيئة المعاينة المخصصة ==========
updateCustomPreview();
