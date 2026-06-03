// storage.js - Google Sheets Sync Version

// Your Google Sheet ID
const GOOGLE_SHEET_ID = "1nb2dBVD-FSf7AMurmnQp_2GCbxCBQtPManWxqFB1GKc";

// Google Apps Script URL (replace with your deployed URL)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx4XYiXrYCvweiIj10xX3mKPAQruA-Sbxn5DAI1LTvtHRJjPGz00nccJ4k_rKHaEEth/exec";

let appState = { students: [], books: [], classes: [], orders: [], history: [] };
let isSyncing = false;

function getStoragePrefix() {
    const user = getCurrentUser();
    if (!user) return 'temp';
    if (user.role === 'admin') return 'global';
    return user.school;
}

// ============================================
// GOOGLE SHEETS LOAD
// ============================================
async function loadFromGoogleSheets() {
    const prefix = getStoragePrefix();
    const statusEl = document.getElementById('syncStatus');
    if (statusEl) {
        statusEl.innerHTML = '🔄 Syncing...';
        statusEl.style.background = '#f5a623';
    }
    
    try {
        // Fetch data from Google Sheets
        const studentsData = await fetchSheetData(`${prefix}_Students`);
        const booksData = await fetchSheetData(`${prefix}_Books`);
        const classesData = await fetchSheetData(`${prefix}_Classes`);
        const ordersData = await fetchSheetData(`${prefix}_Orders`);
        const historyData = await fetchSheetData(`${prefix}_History`);
        
        if (studentsData.length > 1) {
            appState.students = studentsData.slice(1).map(row => ({
                id: parseInt(row[0]) || Date.now(),
                name: row[1] || '',
                class: row[2] || '',
                phone: row[3] || '',
                delivery: row[4] || '',
                paid: parseFloat(row[5]) || 0,
                remaining: parseFloat(row[6]) || 0,
                remarks: row[7] || '',
                books: row[8] ? row[8].split('|') : []
            }));
        }
        
        if (booksData.length > 1) {
            appState.books = booksData.slice(1).map(row => ({
                id: parseInt(row[0]) || Date.now(),
                title: row[1] || '',
                class: row[2] || '',
                type: row[3] || 'Manuel',
                quantity: parseInt(row[4]) || 0,
                available: parseInt(row[5]) || 0,
                price: parseFloat(row[6]) || 0
            }));
        }
        
        if (classesData.length > 1) {
            appState.classes = classesData.slice(1).map(row => ({
                id: parseInt(row[0]) || Date.now(),
                name: row[1] || '',
                level: row[2] || 'Primaire'
            }));
        }
        
        if (ordersData.length > 1) {
            appState.orders = ordersData.slice(1).map(row => ({
                id: parseInt(row[0]) || Date.now(),
                bookTitle: row[1] || '',
                class: row[2] || '',
                quantity: parseInt(row[3]) || 0,
                orderDate: row[4] || '',
                status: row[5] || 'en_attente'
            }));
        }
        
        if (historyData.length > 1) {
            appState.history = historyData.slice(1).map(row => ({
                id: parseInt(row[0]) || Date.now(),
                date: row[1] || '',
                bookTitle: row[2] || '',
                action: row[3] || '',
                quantity: parseInt(row[4]) || 0,
                studentName: row[5] || null
            }));
        }
        
        // If no classes exist, create defaults
        if (appState.classes.length === 0) {
            const defaultClasses = getUserClasses();
            appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name, level: detectLevel(name) }));
        }
        
        // If no books exist, create defaults
        if (appState.books.length === 0 && appState.classes.length > 0) {
            appState.classes.forEach((cls, idx) => {
                appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
                appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
            });
        }
        
        saveToLocalStorage();
        
        if (statusEl) {
            statusEl.innerHTML = '✅ Synced';
            statusEl.style.background = '#1f4f2d';
            setTimeout(() => {
                if (statusEl) statusEl.innerHTML = '☁️ Cloud Sync';
            }, 2000);
        }
        return true;
    } catch (error) {
        console.error('Sync error:', error);
        if (statusEl) {
            statusEl.innerHTML = '⚠️ Offline';
            statusEl.style.background = '#c0392b';
        }
        loadFromLocalStorage();
        return false;
    }
}

async function fetchSheetData(sheetName) {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        return [];
    }
}

function parseCSV(csvText) {
    const rows = [];
    const lines = csvText.split(/\r?\n/);
    for (const line of lines) {
        if (line.trim() === '') continue;
        const row = [];
        let inQuotes = false;
        let currentCell = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        row.push(currentCell.trim());
        if (row.length > 0 && row.some(cell => cell !== '')) {
            rows.push(row);
        }
    }
    return rows;
}

// ============================================
// SAVE TO GOOGLE SHEETS
// ============================================
async function saveToGoogleSheets() {
    if (isSyncing) return;
    isSyncing = true;
    
    const prefix = getStoragePrefix();
    
    try {
        const data = {
            prefix: prefix,
            students: appState.students.map(s => [s.id, s.name, s.class, s.phone || '', s.delivery || '', s.paid || 0, s.remaining || 0, s.remarks || '', (s.books || []).join('|')]),
            books: appState.books.map(b => [b.id, b.title, b.class, b.type, b.quantity || 0, b.available || 0, b.price || 0]),
            classes: appState.classes.map(c => [c.id, c.name, c.level]),
            orders: appState.orders.map(o => [o.id, o.bookTitle, o.class, o.quantity, o.orderDate || '', o.status]),
            history: appState.history.map(h => [h.id, h.date, h.bookTitle, h.action, h.quantity || 0, h.studentName || ''])
        };
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        console.log('Data saved to Google Sheets');
    } catch (error) {
        console.error('Save to Sheets error:', error);
    } finally {
        isSyncing = false;
    }
    
    saveToLocalStorage();
}

function saveToLocalStorage() {
    const prefix = getStoragePrefix();
    localStorage.setItem(`${prefix}_students`, JSON.stringify(appState.students));
    localStorage.setItem(`${prefix}_books`, JSON.stringify(appState.books));
    localStorage.setItem(`${prefix}_classes`, JSON.stringify(appState.classes));
    localStorage.setItem(`${prefix}_orders`, JSON.stringify(appState.orders));
    localStorage.setItem(`${prefix}_history`, JSON.stringify(appState.history));
}

function loadFromLocalStorage() {
    const prefix = getStoragePrefix();
    appState.students = JSON.parse(localStorage.getItem(`${prefix}_students`) || '[]');
    appState.books = JSON.parse(localStorage.getItem(`${prefix}_books`) || '[]');
    appState.classes = JSON.parse(localStorage.getItem(`${prefix}_classes`) || '[]');
    appState.orders = JSON.parse(localStorage.getItem(`${prefix}_orders`) || '[]');
    appState.history = JSON.parse(localStorage.getItem(`${prefix}_history`) || '[]');
}

// Main load function
async function loadAllData() {
    await loadFromGoogleSheets();
    // Also ensure default data exists
    if (appState.classes.length === 0) {
        const defaultClasses = getUserClasses();
        appState.classes = defaultClasses.map((name, idx) => ({ id: idx + 1, name, level: detectLevel(name) }));
    }
    if (appState.books.length === 0 && appState.classes.length > 0) {
        appState.classes.forEach((cls, idx) => {
            appState.books.push({ id: idx * 100 + 1, title: `Manuel ${cls.name}`, class: cls.name, type: 'Manuel', quantity: 30, available: 30, price: 150 });
            appState.books.push({ id: idx * 100 + 2, title: `Cahier ${cls.name}`, class: cls.name, type: 'Cahier', quantity: 30, available: 30, price: 50 });
        });
    }
    saveToLocalStorage();
}

function saveAllData() {
    saveToLocalStorage();
    saveToGoogleSheets(); // Fire and forget
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
