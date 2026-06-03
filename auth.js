// auth.js - Authentication
let currentUser = null;

function initAuth() {
    const savedSession = sessionStorage.getItem('app_session');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            if (session.expires > Date.now()) {
                currentUser = session.user;
                return true;
            }
        } catch(e) {}
    }
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

function isLoggedIn() { return currentUser !== null; }
function getCurrentUser() { return currentUser; }
function getUserSchool() { return currentUser?.school; }
function getUserSchoolName() {
    if (!currentUser) return '';
    if (currentUser.role === 'admin') return '🌍 Toutes les écoles';
    return SCHOOLS[currentUser.school]?.name || currentUser.school;
}
function getUserClasses() {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') {
        return [...SCHOOLS.L1.levels, ...SCHOOLS.L2.levels, ...SCHOOLS.L3.levels].filter((v,i,a)=>a.indexOf(v)===i);
    }
    return SCHOOLS[currentUser.school]?.levels || [];
}

// Initialize on load
initAuth();
