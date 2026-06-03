// storage.js - Simple Working Version (localStorage only)

let appState = { students: [], books: [], classes: [], orders: [], history: [] };

function getStoragePrefix() {
    const user = getCurrentUser();
    if (!user) return 'temp';
    if (user.role === 'admin') return 'global';
    return user.school;
}

// ============================================
// SAVE TO LOCALSTORAGE
// ============================================
function saveToLocalStorage() {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}_students`, JSON.stringify(appState.students));
    localStorage.setItem(`${prefix}_books`, JSON.stringify(appState.books));
    localStorage.setItem(`${prefix}_classes`, JSON.stringify(appState.classes));
    localStorage.setItem(`${prefix}_orders`, JSON.stringify(appState.orders));
    localStorage.setItem(`${prefix}_history`, JSON.stringify(appState.history));
    
    console.log(`💾 SAVED: Students: ${appState.students.length}, Prefix: ${prefix}`);
    
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.innerHTML = '💾 Sauvegardé';
        setTimeout(() => {
            if (statusEl) statusEl.innerHTML = '☁️ Local';
        }, 1500);
    }
}

// ============================================
// LOAD FROM LOCALSTORAGE
// ============================================
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
    
    console.log(`📂 LOADED: Students: ${appState.students.length}, Prefix: ${prefix}`);
    return appState.students.length > 0;
}

// ============================================
// INITIALIZE DEFAULT DATA
// ============================================
function initializeDefaultData() {
    console.log("Creating default data...");
    
    // Default classes based on user's school
    const defaultClasses = getUserClasses();
    appState.classes = defaultClasses.map((name, idx) => ({ 
        id: idx + 1, 
        name: name, 
        level: detectLevel(name) 
    }));
    
    // Default books
    appState.books = [];
    appState.classes.forEach((cls, idx) => {
        appState.books.push({ 
            id: idx * 100 + 1, 
            title: `Manuel ${cls.name}`, 
            class: cls.name, 
            type: 'Manuel', 
            quantity: 30, 
            available: 30, 
            price: 150 
        });
        appState.books.push({ 
            id: idx * 100 + 2, 
            title: `Cahier ${cls.name}`, 
            class: cls.name, 
            type: 'Cahier', 
            quantity: 30, 
            available: 30, 
            price: 50 
        });
    });
    
    // Sample student for testing
    appState.students = [
        { id: 1, name: "Élève Test", class: "CP", phone: "0612345678", delivery: "2024-01-15", paid: 200, remaining: 0, remarks: "Élève test", books: [] }
    ];
    
    appState.orders = [];
    appState.history = [];
    
    saveToLocalStorage();
    console.log("Default data created!");
}

// ============================================
// MAIN LOAD FUNCTION
// ============================================
function loadAllData() {
    console.log("loadAllData called");
    const hasData = loadFromLocalStorage();
    
    if (!hasData || appState.students.length === 0) {
        console.log("No data found, initializing defaults...");
        initializeDefaultData();
    }
    
    // Ensure classes exist
    if (appState.classes.length === 0) {
        const defaultClasses = getUserClasses();
        appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name, level: detectLevel(name) }));
        saveToLocalStorage();
    }
    
    // Ensure books exist
    if (appState.books.length === 0 && appState.classes.length > 0) {
        appState.classes.forEach((cls, idx) => {
            appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
            appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
        });
        saveToLocalStorage();
    }
    
    console.log("Final state:", { students: appState.students.length, books: appState.books.length, classes: appState.classes.length });
}

// ============================================
// SAVE ALL DATA (CALL THIS AFTER CHANGES)
// ============================================
function saveAllData() {
    console.log("saveAllData called - Saving", appState.students.length, "students");
    saveToLocalStorage();
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
