// classes.js - Class management
let editingClassId = null;
function openClassModal(classId) {
    editingClassId = classId;
    const cls = classId ? getClasses().find(c => c.id === classId) : null;
    document.getElementById('modalClassTitle').innerText = cls ? '✏️ Modifier Classe' : '➕ Ajouter une Classe';
    document.getElementById('className').value = cls?.name || '';
    document.getElementById('classLevel').value = cls?.level || 'Primaire';
    document.getElementById('classModal').classList.add('open');
}
function closeClassModal() { document.getElementById('classModal').classList.remove('open'); editingClassId = null; }
function saveClass() {
    const name = document.getElementById('className').value.trim();
    if (!name) { showToast('Le nom est obligatoire', true); return; }
    const classData = { name, level: document.getElementById('classLevel').value };
    if (editingClassId) {
        const index = getClasses().findIndex(c => c.id === editingClassId);
        if (index !== -1) { appState.classes[index] = { ...appState.classes[index], ...classData }; showToast('Classe modifiée ✅'); }
    } else {
        if (getClasses().find(c => c.name === name)) { showToast('Cette classe existe déjà', true); return; }
        classData.id = Date.now(); appState.classes.push(classData); showToast('Classe ajoutée ✅');
    }
    saveAllData(); closeClassModal(); if (typeof renderDashboard === 'function') renderDashboard();
}
function deleteClass(id) {
    const cls = getClasses().find(c => c.id === id);
    const hasStudents = getStudents().some(s => s.class === cls.name);
    if (hasStudents) { showToast(`Impossible: ${cls.name} contient des élèves`, true); return; }
    if (cls && confirm(`Supprimer "${cls.name}" ?`)) { appState.classes = appState.classes.filter(c => c.id !== id); saveAllData(); if (typeof renderDashboard === 'function') renderDashboard(); showToast('Classe supprimée'); }
}
