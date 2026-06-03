// storage.js - ULTRA SIMPLE WORKING VERSION

let appState = { students: [], books: [], classes: [], orders: [], history: [] };

function getStoragePrefix() {
    const user = getCurrentUser();
    if (!user) return 'temp';
    if (user.role === 'admin') return 'global';
    return user.school;
}

// ============================================
// SAVE - JUST ONE FUNCTION
// ============================================
function saveAllData() {
    const prefix = getStoragePrefix();
    const dataToSave = {
        students: appState.students,
        books: appState.books,
        classes: appState.classes,
        orders: appState.orders,
        history: appState.history
    };
    localStorage.setItem(`${prefix}_data`, JSON.stringify(dataToSave));
    console.log("✅ SAVED! Students count:", appState.students.length);
    console.log("Saved data:", dataToSave.students);
    
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.innerHTML = '💾 Sauvegardé';
        setTimeout(() => {
            if (statusEl) statusEl.innerHTML = '☁️ Local';
        }, 1500);
    }
}

// ============================================
// LOAD - JUST ONE FUNCTION
// ============================================
function loadAllData() {
    const prefix = getStoragePrefix();
    const savedData = localStorage.getItem(`${prefix}_data`);
    
    console.log("Loading data from:", `${prefix}_data`);
    console.log("Raw saved data:", savedData);
    
    if (savedData) {
        const parsed = JSON.parse(savedData);
        appState.students = parsed.students || [];
        appState.books = parsed.books || [];
        appState.classes = parsed.classes || [];
        appState.orders = parsed.orders || [];
        appState.history = parsed.history || [];
        console.log("✅ LOADED! Students count:", appState.students.length);
    } else {
        console.log("No data found, initializing defaults...");
        // Initialize default classes
        const defaultClasses = getUserClasses();
        appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name: name, level: detectLevel(name) }));
        
        // Initialize default books
        appState.books = [];
        appState.classes.forEach((cls, idx) => {
            appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
            appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
        });
        
        appState.students = [];
        appState.orders = [];
        appState.history = [];
        
        saveAllData();
    }
    
    console.log("Final appState:", { students: appState.students.length, books: appState.books.length, classes: appState.classes.length });
}

function addToHistory(bookTitle, action, quantity, studentName) {
    appState.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleString(),
        bookTitle: bookTitle,
        action: action,
        quantity: quantity,
        studentName: studentName
    });
    if (appState.history.length > 200) appState.history.pop();
    saveAllData();
}

// Getters
function getStudents() { return appState.students; }
function getBooks() { return appState.books; }
function getClasses() { return appState.classes; }
function getOrders() { return appState.orders; }
function getHistory() { return appState.history; }
