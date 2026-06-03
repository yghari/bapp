// auth.js - Authentication
let currentUser = null;
function initAuth() {
    let users = localStorage.getItem('app_users');
    if (!users) {
        const defaultUsers = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', school: null, name: 'Administrateur' },
            { id: 2, username: 'l1_admin', password: 'l1pass', role: 'school_admin', school: 'L1', name: 'Admin L1' },
            { id: 3, username: 'l2_admin', password: 'l2pass', role: 'school_admin', school: 'L2', name: 'Admin L2' },
            { id: 4, username: 'l3_admin', password: 'l3pass', role: 'school_admin', school: 'L3', name: 'Admin L3' },
            { id: 5, username: 'l1_teacher', password: 'teacher', role: 'teacher', school: 'L1', name: 'Professeur L1' }
        ];
        localStorage.setItem('app_users', JSON.stringify(defaultUsers));
    }
    const savedSession = sessionStorage.getItem('app_session');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            const usersList = JSON.parse(localStorage.getItem('app_users'));
            const user = usersList.find(u => u.username === session.username);
            if (user && session.expires > Date.now()) currentUser = user;
        } catch(e) {}
    }
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
