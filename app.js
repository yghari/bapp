// app.js - Main renderer
function renderStats() {
    const students = getStudents();
    document.getElementById('statTotal').innerHTML = students.length;
    document.getElementById('statPaid').innerHTML = students.reduce((s, a) => s + (a.paid || 0), 0) + ' DH';
    document.getElementById('statRemaining').innerHTML = students.reduce((s, a) => s + (a.remaining || 0), 0) + ' DH';
    document.getElementById('statFullPaid').innerHTML = students.filter(s => s.remaining === 0 && s.paid > 0).length;
    document.getElementById('statBooks').innerHTML = getBooks().reduce((s, b) => s + (b.quantity || 0), 0);
    document.getElementById('statLowStock').innerHTML = getBooks().filter(b => (b.available || 0) < 5).length;
}

function renderStudents() {
    const search = (document.getElementById('studentSearch')?.value || '').toLowerCase();
    const classFilter = document.getElementById('classFilterSelect')?.value || 'all';
    let filtered = getStudents().filter(s => s.name.toLowerCase().includes(search) && (classFilter === 'all' || s.class === classFilter));
    document.getElementById('studentCounter').innerText = `${filtered.length} élève(s)`;
    const tbody = document.getElementById('studentsTbody');
    if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="10" class="empty-state">Aucun élève</div></td></tr>'; return; }
    tbody.innerHTML = filtered.map((s, idx) => `<tr>
        <td style="color:#6c757d">${idx+1}</div><td><strong>${escapeHtml(s.name)}</strong></div><td><span class="class-chip">${escapeHtml(s.class)}</span></div>
        <td>${s.books?.length||0}</div><td style="color:#a3e9b4">${s.paid||0} DH</div><td style="color:${s.remaining>0?'#ffb3b3':'#6c757d'}">${s.remaining||0} DH</div>
        <td>${s.delivery||'—'}</div><td>${s.phone||'—'}</div><td>${(s.remaining===0&&s.paid>0)?'<span class="badge-paid">Payé</span>':'<span class="badge-unpaid">En attente</span>'}</div>
        <td class="action-btns"><button class="btn-icon" onclick="openStudentModal(${s.id})">✏️</button><button class="btn-icon" onclick="deleteStudent(${s.id})">🗑️</button></div>
    </tr>`).join('');
    const uniqueClasses = [...new Set(getStudents().map(s => s.class))];
    const filterSelect = document.getElementById('classFilterSelect');
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">📚 Toutes les classes</option>' + uniqueClasses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (uniqueClasses.includes(currentVal)) filterSelect.value = currentVal;
}

function renderBooks() {
    const search = (document.getElementById('bookSearch')?.value || '').toLowerCase();
    let filtered = getBooks().filter(b => b.title.toLowerCase().includes(search));
    const tbody = document.getElementById('booksTbody');
    if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Aucun livre</div></td></table>'; return; }
    tbody.innerHTML = filtered.map((b, idx) => `<tr><td style="color:#6c757d">${idx+1}</div><td><strong>${escapeHtml(b.title)}</strong></div><td><span class="class-chip">${escapeHtml(b.class)}</span></div>
        <td>${escapeHtml(b.type)}</div><td>${b.quantity||0}</div><td class="${(b.available||0)<5?'lowstock':''}">${b.available||0}</div><td>${b.price||0} DH</div>
        <td class="action-btns"><button class="btn-icon" onclick="openBookModal(${b.id})">✏️</button><button class="btn-icon" onclick="deleteBook(${b.id})">🗑️</button></div></tr>`).join('');
}

function renderClasses() {
    const tbody = document.getElementById('classesTbody');
    if (getClasses().length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucune classe</div></td></table>'; return; }
    tbody.innerHTML = getClasses().map((c, idx) => `<tr><td style="color:#6c757d">${idx+1}</div><td><strong>${escapeHtml(c.name)}</strong></div><td>${escapeHtml(c.level)}</div>
        <td>${getStudents().filter(s=>s.class===c.name).length}</div><td>${getBooks().filter(b=>b.class===c.name).length}</div>
        <td class="action-btns"><button class="btn-icon" onclick="openClassModal(${c.id})">✏️</button><button class="btn-icon" onclick="deleteClass(${c.id})">🗑️</button></div></tr>`).join('');
}

function renderStock() {
    const ordersTbody = document.getElementById('ordersTbody');
    if (getOrders().length === 0) { ordersTbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucune commande</div></td></table>'; }
    else { ordersTbody.innerHTML = getOrders().map((o, idx) => `<tr><td style="color:#6c757d">${idx+1}</div><td>${escapeHtml(o.bookTitle)}</div><td><span class="class-chip">${escapeHtml(o.class)}</span></div>
        <td>${o.quantity}</div><td>${o.orderDate||'—'}</div><td class="${o.status==='en_attente'?'status-warning':'status-success'}">${o.status==='en_attente'?'⏳ En attente':'✅ Livré'}</div>
        <td class="action-btns">${o.status==='en_attente'?`<button class="btn-icon success" onclick="markOrderReceived(${o.id})">📦 Recevoir</button>`:''}<button class="btn-icon" onclick="deleteOrder(${o.id})">🗑️</button></div></td>`).join(''); }
    const historyTbody = document.getElementById('historyTbody');
    const recent = getHistory().slice(0,50);
    if (recent.length === 0) { historyTbody.innerHTML = '<tr><td colspan="6" class="empty-state">Aucun mouvement</div></td></tr>'; }
    else { historyTbody.innerHTML = recent.map((h, idx) => `<tr><td style="color:#6c757d">${idx+1}</div><td>${h.date}</div><td>${escapeHtml(h.bookTitle)}</div><td>${h.action}</div>
        <td class="${h.quantity<0?'lowstock':''}">${h.quantity>0?'+':''}${h.quantity}</div><td>${h.studentName||'—'}</div></tr>`).join(''); }
    const lowStock = getBooks().filter(b => (b.available||0)<5);
    document.getElementById('lowStockAlert').innerHTML = lowStock.length ? `<div style="background:#631d1d;padding:0.5rem 1rem;border-radius:2rem;">⚠️ Stock faible: ${lowStock.map(b=>`${b.title} (${b.available})`).join(', ')}</div>` : '<div style="background:#1f4f2d;padding:0.5rem 1rem;border-radius:2rem;">✅ Stocks suffisants</div>';
}

function renderDashboard() {
    const user = getCurrentUser();
    const container = document.getElementById('appContainer');
    container.innerHTML = `
        <div class="app-header"><div class="logo-area"><h2>🎓 Centre d'Apprentissage</h2><p>${escapeHtml(getUserSchoolName())} | ${user?.role==='admin'?'Admin':user?.role==='school_admin'?'Admin École':'Enseignant'}</p></div>
        <div class="user-panel"><span class="badge">👤 ${escapeHtml(user?.name)}</span><span id="syncStatus" class="sync-status">☁️ Local</span>
        <button id="logoutBtn" class="outline">🚪 Déconnexion</button><button id="exportBtn" class="primary">📥 Exporter CSV</button></div></div>
        <div class="stats-grid"><div class="stat-card"><div class="stat-number" id="statTotal">0</div><div>📚 Élèves</div></div>
        <div class="stat-card"><div class="stat-number green" id="statPaid">0</div><div>💰 Reçu</div></div><div class="stat-card"><div class="stat-number red" id="statRemaining">0</div><div>⏳ Reste</div></div>
        <div class="stat-card"><div class="stat-number" id="statFullPaid">0</div><div>✅ Payé</div></div><div class="stat-card"><div class="stat-number" id="statBooks">0</div><div>📖 Livres</div></div>
        <div class="stat-card"><div class="stat-number" id="statLowStock">0</div><div>⚠️ Stock faible</div></div></div>
        <div class="tabs"><button class="tab-btn active" data-tab="students">📚 Élèves</button><button class="tab-btn" data-tab="books">📖 Livres</button><button class="tab-btn" data-tab="classes">🏫 Classes</button><button class="tab-btn" data-tab="stock">📦 Stock</button></div>
        <div id="panel-students" class="panel active"><div class="toolbar"><input id="studentSearch" class="search-input" placeholder="🔍 Rechercher..."><select id="classFilterSelect" class="filter-select"></select><button id="addStudentBtn" class="primary">+ Ajouter Élève</button><span id="studentCounter" class="count-label"></span></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Nom</th><th>Classe</th><th>Livres</th><th>Payé</th><th>Reste</th><th>Date</th><th>Tél</th><th>Statut</th><th>Actions</th></tr></thead><tbody id="studentsTbody"></tbody></table></div></div>
        <div id="panel-books" class="panel"><div class="toolbar"><input id="bookSearch" class="search-input" placeholder="🔍 Rechercher..."><button id="addBookBtn" class="primary">+ Ajouter Livre</button></div><div class="table-wrap"><table><thead><tr><th>#</th><th>Titre</th><th>Classe</th><th>Type</th><th>Qté</th><th>Dispo</th><th>Prix</th><th>Actions</th></tr></thead><tbody id="booksTbody"></tbody></table></div></div>
        <div id="panel-classes" class="panel"><div class="toolbar"><button id="addClassBtn" class="primary">+ Ajouter Classe</button></div><div class="table-wrap"></td><thead><tr><th>#</th><th>Classe</th><th>Niveau</th><th>Élèves</th><th>Livres</th><th>Actions</th></tr></thead><tbody id="classesTbody"></tbody></table></div></div>
        <div id="panel-stock" class="panel"><div id="lowStockAlert"></div><div class="toolbar"><button id="addOrderBtn" class="primary">+ Nouvelle Commande</button><button id="refreshStockBtn" class="outline">🔄 Actualiser</button></div>
        <h4 style="margin-top:1rem">📋 Commandes</h4><div class="table-wrap"><table><thead><tr><th>#</th><th>Livre</th><th>Classe</th><th>Qté</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody id="ordersTbody"></tbody></table></div>
        <h4 style="margin-top:1rem">📜 Historique</h4><div class="table-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Livre</th><th>Action</th><th>Qté</th><th>Élève</th></tr></thead><tbody id="historyTbody"></tbody></table></div></div>`;
    
    document.getElementById('logoutBtn').onclick = () => { sessionStorage.clear(); window.location.href = 'index.html'; };
    document.getElementById('exportBtn').onclick = () => {
        const headers = ['Nom','Classe','Téléphone','Date Livraison','Payé (DH)','Reste (DH)','Livres reçus','Remarques'];
        const rows = getStudents().map(s => [s.name, s.class, s.phone||'', s.delivery||'', s.paid||0, s.remaining||0, (s.books||[]).join(', '), s.remarks||'']);
        const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF"+csv], {type:'text/csv'});
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `export_${getStoragePrefix()}.csv`; link.click();
        showToast('Export CSV réussi');
    };
    document.getElementById('addStudentBtn').onclick = () => openStudentModal();
    document.getElementById('addBookBtn').onclick = () => openBookModal();
    document.getElementById('addClassBtn').onclick = () => openClassModal();
    document.getElementById('addOrderBtn').onclick = () => openOrderModal();
    document.getElementById('refreshStockBtn').onclick = () => { loadAllData(); renderDashboard(); showToast('Actualisé'); };
    document.getElementById('studentSearch').oninput = () => renderStudents();
    document.getElementById('bookSearch').oninput = () => renderBooks();
    document.querySelectorAll('.tab-btn').forEach(btn => { btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
        if (btn.dataset.tab === 'students') renderStudents();
        if (btn.dataset.tab === 'books') renderBooks();
        if (btn.dataset.tab === 'classes') renderClasses();
        if (btn.dataset.tab === 'stock') renderStock();
    }; });
    renderStats(); renderStudents(); renderBooks(); renderClasses(); renderStock();
}
