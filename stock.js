// stock.js - Stock and orders
function openOrderModal() {
    const bookSelect = document.getElementById('orderBook');
    bookSelect.innerHTML = '<option value="">-- Sélectionner --</option>' + getBooks().map(b => `<option value="${escapeHtml(b.title)}">${escapeHtml(b.title)} (${b.class})</option>`).join('');
    document.getElementById('orderQuantity').value = 0;
    document.getElementById('orderDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('orderModal').classList.add('open');
}

function closeOrderModal() { document.getElementById('orderModal').classList.remove('open'); }

function saveOrder() {
    const bookTitle = document.getElementById('orderBook').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
    const orderDate = document.getElementById('orderDate').value;
    if (!bookTitle || quantity <= 0) { showToast('Veuillez remplir tous les champs', true); return; }
    const book = getBooks().find(b => b.title === bookTitle);
    const newOrder = { id: Date.now(), bookTitle, class: book?.class || '', quantity, orderDate, status: 'en_attente' };
    appState.orders.push(newOrder);
    addToHistory(bookTitle, 'commande passée', quantity, null);
    saveAllData(); closeOrderModal(); if (typeof renderDashboard === 'function') renderDashboard();
    showToast(`Commande de ${quantity} ${bookTitle} enregistrée`);
}

function markOrderReceived(orderId) {
    const order = getOrders().find(o => o.id === orderId);
    if (order && order.status === 'en_attente') {
        const book = getBooks().find(b => b.title === order.bookTitle);
        if (book) { book.quantity += order.quantity; book.available += order.quantity; order.status = 'livré'; addToHistory(book.title, 'livraison reçue', order.quantity, null); saveAllData(); if (typeof renderDashboard === 'function') renderDashboard(); showToast(`Stock mis à jour: +${order.quantity} ${book.title}`); }
    }
}

function deleteOrder(id) {
    if (confirm('Supprimer cette commande ?')) { appState.orders = appState.orders.filter(o => o.id !== id); saveAllData(); if (typeof renderDashboard === 'function') renderDashboard(); showToast('Commande supprimée'); }
}
