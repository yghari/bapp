// config.js - Schools and constants
const SCHOOLS = {
    L1: { name: '🏫 École Primaire L1', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'] },
    L2: { name: '🏫 Collège L2', levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème'] },
    L3: { name: '🏫 Lycée L3', levels: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle'] }
};
const BOOK_TYPES = ['Manuel', 'Cahier', 'Exercice', 'Livre de lecture', 'Guide pédagogique'];

function detectLevel(className) {
    if (['CP','CE1','CE2','CM1','CM2'].includes(className)) return 'Primaire';
    if (['6ème','5ème','4ème','3ème'].includes(className)) return 'Collège';
    if (['2nde','1ère','Tle'].includes(className)) return 'Lycée';
    return 'Autre';
}
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]); }
function showToast(msg, isError) {
    const toast = document.getElementById('toastMsg');
    if (toast) {
        toast.textContent = msg;
        toast.style.background = isError ? '#c0392b' : '#2ecc71';
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 2500);
    }
}
