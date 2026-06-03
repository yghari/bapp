// storage.js - Data persistence
let appState = { students: [], books: [], classes: [], orders: [], history: [] };

function getStoragePrefix() {
    const user = getCurrentUser();
    if (!user) return 'temp';
    if (user.role === 'admin') return 'global';
    return user.school;
}

function saveAllData() {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}_students`, JSON.stringify(appState.students));
    localStorage.setItem(`${prefix}_books`, JSON.stringify(appState.books));
    localStorage.setItem(`${prefix}_classes`, JSON.stringify(appState.classes));
    localStorage.setItem(`${prefix}_orders`, JSON.stringify(appState.orders));
    localStorage.setItem(`${prefix}_history`, JSON.stringify(appState.history));
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) { syncStatus.innerHTML = '💾 Sauvegardé'; setTimeout(() => { if (syncStatus) syncStatus.innerHTML = '☁️ Local'; }, 1500); }
}

function loadAllData() {
    const prefix = getStoragePrefix();
    appState.students = JSON.parse(localStorage.getItem(`${prefix}_students`) || '[]');
    appState.books = JSON.parse(localStorage.getItem(`${prefix}_books`) || '[]');
    appState.classes = JSON.parse(localStorage.getItem(`${prefix}_classes`) || '[]');
    appState.orders = JSON.parse(localStorage.getItem(`${prefix}_orders`) || '[]');
    appState.history = JSON.parse(localStorage.getItem(`${prefix}_history`) || '[]');
    
    if (appState.classes.length === 0) {
        const defaultClasses = getUserClasses();
        appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name, level: detectLevel(name) }));
    }
    if (appState.books.length === 0 && appState.classes.length > 0) {
        appState.classes.forEach((cls, idx) => {
            appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
            appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
        });
        saveAllData();
    }
}

function addToHistory(bookTitle, action, quantity, studentName) {
    appState.history.unshift({ id: Date.now(), date: new Date().toLocaleString(), bookTitle, action, quantity, studentName });
    if (appState.history.length > 200) appState.history.pop();
    saveAllData();
}

function getStudents() { return appState.students; }
function getBooks() { return appState.books; }
function getClasses() { return appState.classes; }
function getOrders() { return appState.orders; }
function getHistory() { return appState.history; }
