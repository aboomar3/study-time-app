# 📖 دليل المطور - Developer Guide

## 🏗️ بنية المشروع

```
study-timer-app/
│
├── index.html           # الهيكل الأساسي (HTML Markup)
│   ├── Header          # رأس التطبيق
│   ├── Timer Section   # قسم المؤقت
│   └── Tasks Section   # قسم المهام
│
├── styles.css           # التصميم والنمط
│   ├── Color Variables  # متغيرات الألوان
│   ├── Layout           # تخطيط العناصر
│   ├── Components       # أنماط المكونات
│   ├── Animations       # الحركات والانتقالات
│   └── Responsive       # التصميم المتجاوب
│
├── script.js            # المنطق والتفاعل
│   ├── State Management # إدارة الحالة
│   ├── Timer Logic      # منطق المؤقت
│   ├── Tasks Logic      # منطق المهام
│   ├── Storage          # التخزين المحلي
│   └── Event Handlers   # معالجات الأحداث
│
├── README.md            # معلومات عامة عن المشروع
├── LICENSE              # رخصة MIT
├── .gitignore          # ملف تجاهل Git
└── package.json        # بيانات المشروع
```

## 🔧 التعديلات الشائعة

### تغيير مدة الجلسات

في ملف `script.js`، عدّل الكائن `TIMER_MODES`:

```javascript
const TIMER_MODES = {
    study: { name: 'دراسة', minutes: 25 },        // غيّر 25 إلى قيمة أخرى
    'break-short': { name: 'راحة قصيرة', minutes: 5 },
    'break-long': { name: 'راحة طويلة', minutes: 15 }
};
```

### تغيير الألوان

في ملف `styles.css`، عدّل متغيرات الألوان في `:root`:

```css
:root {
    --primary-color: #6366f1;      /* اللون الأساسي */
    --secondary-color: #ec4899;    /* اللون الثانوي */
    --success-color: #10b981;      /* لون النجاح */
    --warning-color: #f59e0b;      /* لون التحذير */
    --danger-color: #ef4444;       /* لون الخطر */
}
```

### تغيير الخط

في ملف `styles.css`، عدّل خاصية `font-family` في `body`:

```css
body {
    font-family: 'اسم الخط', Arial, sans-serif;
}
```

## 🚀 الميزات الجاهزة للإضافة

### 1. الوضع الليلي (Dark Mode)
```javascript
// أضف متغير في script.js
let isDarkMode = false;

// أضف دالة للتبديل
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}
```

### 2. إحصائيات متقدمة
```javascript
// في script.js، أضف:
let statistics = {
    totalStudyTime: 0,
    totalBreakTime: 0,
    todayFocusTime: 0,
    weekStats: []
};
```

### 3. الموسيقى الخلفية
```javascript
// أضف عنصر audio في HTML
const backgroundMusic = new Audio('music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
```

### 4. رسائل تحفيزية عشوائية
```javascript
const motivationalMessages = [
    'أنت قادر على هذا! 💪',
    'ركز على الحاضر 🎯',
    'كل خطوة تقربك من هدفك 🚀'
];

function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}
```

## 📊 إدارة البيانات

### LocalStorage Structure
```javascript
{
    "timerAppData": {
        "sessionsCompleted": 10,
        "tasksCompleted": 25,
        "tasks": [
            {
                "id": 1622000000000,
                "text": "مراجعة الرياضيات",
                "completed": false,
                "createdAt": "17/5/2026"
            }
        ]
    }
}
```

## 🎨 إضافة موضوع جديد

```css
/* في styles.css، أضف في النهاية: */
body.ocean-theme {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
}

body.ocean-theme {
    --primary-color: #0284c7;
    --secondary-color: #0369a1;
}
```

## 🧪 اختبار التطبيق

### على الجوال
1. استخدم أدوات المطور (F12)
2. اختر "Toggle device toolbar"
3. اختبر على أحجام مختلفة

### في محرر بدون اتصال
```bash
# إذا كان لديك Python
python -m http.server 8000

# أو استخدم Live Server في VS Code
```

## 📈 أداء التطبيق

- حجم الملفات: ~15 KB (محسوبة)
- وقت التحميل: < 1 ثانية
- استهلاك الذاكرة: ~ 5 MB
- لا توجد مكتبات خارجية = تحميل أسرع

## 🔐 الأمان

- لا يتم إرسال البيانات إلى الخادم
- جميع البيانات محفوظة محلياً
- حماية من XSS بواسطة دالة `escapeHtml()`
- بدون قواعد بيانات خارجية

## 📝 ملاحظات مهمة

1. **LocalStorage Limit**: ~5-10 MB لكل موقع
2. **Browser Compatibility**: جميع المتصفحات الحديثة تدعم ES6
3. **Mobile Performance**: تم تحسين الأداء للجوالات
4. **Offline Support**: التطبيق يعمل بدون اتصال انترنت

## 🐛 استكشاف الأخطاء

### المؤقت لا يبدأ
- تحقق من أن JavaScript مفعل
- جرب إعادة تحميل الصفحة

### المهام لا تحفظ
- تحقق من LocalStorage في أدوات المطور
- امسح Cache وحاول مجدداً

### الأصوات لا تعمل
- تحقق من صوت المتصفح
- جرب متصفح آخر

## 🎓 مراجع تعليمية

- [Pomodoro Technique](https://pomodorotechnique.com/)
- [MDN Web Docs - LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
- [JavaScript ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)

## 💝 شكر خاص

شكراً لاستخدامك هذا التطبيق!
إذا أحببت المشروع، شارك النجاح مع الآخرين! 🌟

---

**آخر تحديث**: مايو 2026