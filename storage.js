// storage.js - Google Sheets Sync Version

const GOOGLE_SHEET_ID = "1JucsVDKfrQypcODGGuEncPzcoPBYZZqYLqae7KO1oFU";
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_URL_HERE/exec"; // Replace with your URL

let appState = { students: [], books: [], classes: [], orders: [], history: [] };
let isSyncing = false;

function getStoragePrefix() {
    const user = getCurrentUser();
    if (!user) return 'temp';
    if (user.role === 'admin') return 'global';
    return user.school;
}

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================
function saveToLocalStorage() {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}_students`, JSON.stringify(appState.students));
    localStorage.setItem(`${prefix}_books`, JSON.stringify(appState.books));
    localStorage.setItem(`${prefix}_classes`, JSON.stringify(appState.classes));
    localStorage.setItem(`${prefix}_orders`, JSON.stringify(appState.orders));
    localStorage.setItem(`${prefix}_history`, JSON.stringify(appState.history));
    console.log('Saved to localStorage. Students:', appState.students.length);
}

function loadFromLocalStorage() {
    const prefix = getStoragePrefix();
    const savedStudents = localStorage.getItem(`${prefix}_students`);
    const savedBooks = localStorage.getItem(`${prefix}_books`);
    const savedClasses = localStorage.getItem(`${prefix}_classes`);
    const savedOrders = localStorage.getItem(`${prefix}_orders`);
    const savedHistory = localStorage.getItem(`${prefix}_history`);
    
    appState.students = savedStudents ? JSON.parse(savedStudents) : [];
    appState.books = savedBooks ? JSON.parse(savedBooks) : [];
    appState.classes = savedClasses ? JSON.parse(savedClasses) : [];
    appState.orders = savedOrders ? JSON.parse(savedOrders) : [];
    appState.history = savedHistory ? JSON.parse(savedHistory) : [];
    
    console.log('Loaded from localStorage. Students:', appState.students.length);
}

// ============================================
// GOOGLE SHEETS SYNC
// ============================================
async function saveToGoogleSheets() {
    if (isSyncing) return;
    isSyncing = true;
    
    const prefix = getStoragePrefix();
    
    try {
        const data = {
            prefix: prefix,
            students: appState.students.map(s => [s.id || '', s.name || '', s.class || '', s.phone || '', s.delivery || '', s.paid || 0, s.remaining || 0, s.remarks || '', (s.books || []).join('|')]),
            books: appState.books.map(b => [b.id || '', b.title || '', b.class || '', b.type || '', b.quantity || 0, b.available || 0, b.price || 0]),
            classes: appState.classes.map(c => [c.id || '', c.name || '', c.level || '']),
            orders: appState.orders.map(o => [o.id || '', o.bookTitle || '', o.class || '', o.quantity || 0, o.orderDate || '', o.status || 'en_attente']),
            history: appState.history.map(h => [h.id || '', h.date || '', h.bookTitle || '', h.action || '', h.quantity || 0, h.studentName || ''])
        };
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log('Data sent to Google Sheets');
        updateSyncStatus('✅ Synced');
    } catch (error) {
        console.error('Save to Sheets error:', error);
        updateSyncStatus('⚠️ Offline', true);
    } finally {
        isSyncing = false;
    }
}

function updateSyncStatus(message, isError = false) {
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.innerHTML = message;
        statusEl.style.background = isError ? '#c0392b' : '#1f4f2d';
        setTimeout(() => {
            if (statusEl && message !== '☁️ Cloud Sync') {
                statusEl.innerHTML = '☁️ Cloud Sync';
                statusEl.style.background = '#1f4f2d';
            }
        }, 3000);
    }
}

// ============================================
// MAIN DATA FUNCTIONS
// ============================================
async function loadAllData() {
    loadFromLocalStorage();
    
    // Ensure default classes exist
    if (appState.classes.length === 0) {
        const defaultClasses = getUserClasses();
        appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name: name, level: detectLevel(name) }));
        console.log('Created default classes:', appState.classes);
    }
    
    // Ensure default books exist
    if (appState.books.length === 0 && appState.classes.length > 0) {
        appState.classes.forEach((cls, idx) => {
            appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
            appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
        });
        console.log('Created default books:', appState.books.length);
    }
    
    saveToLocalStorage();
}

function saveAllData() {
    saveToLocalStorage();
    saveToGoogleSheets(); // Fire and forget
    console.log('saveAllData called. Students:', appState.students.length);
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

// ============================================
// GETTERS
// ============================================
function getStudents() { return appState.students; }
function getBooks() { return appState.books; }
function getClasses() { return appState.classes; }
function getOrders() { return appState.orders; }
function getHistory() { return appState.history; }
