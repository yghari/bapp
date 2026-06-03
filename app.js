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
    else { ordersTbody.innerHTML = getOrders().map((o, idx) => `<tr><td style
