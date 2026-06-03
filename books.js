// books.js - Book management
let editingBookId = null;
function openBookModal(bookId) {
    editingBookId = bookId;
    const book = bookId ? getBooks().find(b => b.id === bookId) : null;
    document.getElementById('modalBookTitle').innerText = book ? '✏️ Modifier Livre' : '➕ Ajouter un Livre';
    document.getElementById('bookTitle').value = book?.title || '';
    document.getElementById('bookType').value = book?.type || 'Manuel';
    document.getElementById('bookQuantity').value = book?.quantity || 0;
    document.getElementById('bookAvailable').value = book?.available || 0;
    document.getElementById('bookPrice').value = book?.price || 0;
    const classSelect = document.getElementById('bookClass');
    classSelect.innerHTML = '<option value="">-- Sélectionner --</option>' + getClasses().map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    if (book?.class) classSelect.value = book.class;
    document.getElementById('bookModal').classList.add('open');
}
function closeBookModal() { document.getElementById('bookModal').classList.remove('open'); editingBookId = null; }
function saveBook() {
    const title = document.getElementById('bookTitle').value.trim();
    if (!title) { showToast('Le titre est obligatoire', true); return; }
    const bookData = {
        title, class: document.getElementById('bookClass').value, type: document.getElementById('bookType').value,
        quantity: parseInt(document.getElementById('bookQuantity').value) || 0,
        available: parseInt(document.getElementById('bookAvailable').value) || 0,
        price: parseFloat(document.getElementById('bookPrice').value) || 0
    };
    if (editingBookId) {
        const index = getBooks().findIndex(b => b.id === editingBookId);
        if (index !== -1) { appState.books[index] = { ...appState.books[index], ...bookData }; showToast('Livre modifié ✅'); }
    } else {
        bookData.id = Date.now(); appState.books.push(bookData); addToHistory(bookData.title, 'ajout', bookData.quantity, null); showToast('Livre ajouté ✅');
    }
    saveAllData(); closeBookModal(); if (typeof renderDashboard === 'function') renderDashboard();
}
function deleteBook(id) {
    const book = getBooks().find(b => b.id === id);
    if (book && confirm(`Supprimer "${book.title}" ?`)) { appState.books = appState.books.filter(b => b.id !== id); saveAllData(); if (typeof renderDashboard === 'function') renderDashboard(); showToast('Livre supprimé'); }
}
