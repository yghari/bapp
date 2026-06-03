// students.js - Student management

let editingStudentId = null;

function openStudentModal(studentId) {
    editingStudentId = studentId;
    const student = studentId ? getStudents().find(s => s.id === studentId) : null;
    document.getElementById('modalStudentTitle').innerText = student ? '✏️ Modifier Élève' : '➕ Ajouter un Élève';
    document.getElementById('studentName').value = student?.name || '';
    document.getElementById('studentPhone').value = student?.phone || '';
    document.getElementById('studentDelivery').value = student?.delivery || '';
    document.getElementById('studentPaid').value = student?.paid || 0;
    document.getElementById('studentRemaining').value = student?.remaining || 0;
    document.getElementById('studentRemarks').value = student?.remarks || '';
    
    const classSelect = document.getElementById('studentClass');
    classSelect.innerHTML = '<option value="">-- Sélectionner --</option>' + getClasses().map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    if (student?.class) classSelect.value = student.class;
    
    const booksContainer = document.getElementById('studentBooksList');
    const studentBooks = student?.books || [];
    booksContainer.innerHTML = getBooks().map(book => `<label class="checkbox-item"><input type="checkbox" value="${escapeHtml(book.title)}" ${studentBooks.includes(book.title) ? 'checked' : ''}> ${escapeHtml(book.title)} (${book.class}) - stock: ${book.available}</label>`).join('');
    document.getElementById('studentModal').classList.add('open');
}

function closeStudentModal() { 
    document.getElementById('studentModal').classList.remove('open'); 
    editingStudentId = null; 
}

function saveStudent() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) { 
        showToast('Le nom est obligatoire', true); 
        return; 
    }
    
    const selectedBooks = [];
    document.querySelectorAll('#studentBooksList input:checked').forEach(cb => {
        selectedBooks.push(cb.value);
    });
    
    const studentData = {
        name: name,
        class: document.getElementById('studentClass').value,
        phone: document.getElementById('studentPhone').value,
        delivery: document.getElementById('studentDelivery').value,
        paid: parseFloat(document.getElementById('studentPaid').value) || 0,
        remaining: parseFloat(document.getElementById('studentRemaining').value) || 0,
        remarks: document.getElementById('studentRemarks').value,
        books: selectedBooks,
        id: Date.now()
    };
    
    if (editingStudentId) {
        // Update existing student
        const index = getStudents().findIndex(s => s.id === editingStudentId);
        if (index !== -1) {
            const oldBooks = appState.students[index].books || [];
            // Return old books to stock
            oldBooks.forEach(bookTitle => {
                const book = getBooks().find(b => b.title === bookTitle);
                if (book) { 
                    book.available++; 
                    addToHistory(bookTitle, 'retour', 1, name);
                }
            });
            // Assign new books
            selectedBooks.forEach(bookTitle => {
                const book = getBooks().find(b => b.title === bookTitle);
                if (book && !oldBooks.includes(bookTitle)) { 
                    book.available--; 
                    addToHistory(bookTitle, 'attribution', -1, name);
                }
            });
            appState.students[index] = { ...appState.students[index], ...studentData };
            showToast('Élève modifié ✅');
        }
    } else {
        // New student - decrease stock for assigned books
        selectedBooks.forEach(bookTitle => {
            const book = getBooks().find(b => b.title === bookTitle);
            if (book && book.available > 0) { 
                book.available--; 
                addToHistory(bookTitle, 'attribution', -1, name);
            }
        });
        appState.students.push(studentData);
        showToast('Élève ajouté ✅');
    }
    
    // CRITICAL: Save to localStorage AND Google Sheets
    saveAllData();
    
    // Close modal and refresh display
    closeStudentModal();
    
    // Refresh all displays
    if (typeof renderStats === 'function') renderStats();
    if (typeof renderStudents === 'function') renderStudents();
    if (typeof renderClasses === 'function') renderClasses();
    if (typeof renderDashboard === 'function') renderDashboard();
}

function deleteStudent(id) {
    const student = getStudents().find(s => s.id === id);
    if (student && confirm(`Supprimer "${student.name}" ?`)) {
        // Return books to stock
        (student.books || []).forEach(bookTitle => {
            const book = getBooks().find(b => b.title === bookTitle);
            if (book) { 
                book.available++; 
                addToHistory(bookTitle, 'retour', 1, student.name);
            }
        });
        appState.students = appState.students.filter(s => s.id !== id);
        
        // CRITICAL: Save after deletion
        saveAllData();
        
        // Refresh displays
        if (typeof renderStats === 'function') renderStats();
        if (typeof renderStudents === 'function') renderStudents();
        if (typeof renderClasses === 'function') renderClasses();
        if (typeof renderDashboard === 'function') renderDashboard();
        
        showToast('Élève supprimé');
    }
}
