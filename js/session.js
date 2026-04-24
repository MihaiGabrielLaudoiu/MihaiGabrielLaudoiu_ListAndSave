var SessionManager = {
    login: async function (credentials) {
        var session = await AuthService.login(credentials);
        updateUIForLoggedUser();
        return session;
    },

    registerUser: async function (userData) {
        return AuthService.register(userData);
    },

    logout: function () {
        AuthService.logout(true);
    },

    checkSession: function () {
        return AuthService.getSession() || false;
    },

    updateUserData: async function (newData) {
        var updatedUserData = await AuthService.updateCurrentUserData(newData);
        if (newData && newData.language && typeof translatePage === 'function') {
            await translatePage(newData.language);
        }
        return updatedUserData;
    },

    getCurrentLanguage: function () {
        return AuthService.getCurrentLanguage();
    },

    setLanguage: async function (languageCode) {
        if (!languageCode) {
            return;
        }
        localStorage.setItem('language', languageCode);
        if (typeof translatePage === 'function') {
            await translatePage(languageCode);
        }
    }
};

// Función para actualizar la UI según el estado de la sesión
function updateUIForLoggedUser() {
    var userData = SessionManager.checkSession();
    var authButtonsDesktop = document.getElementById('auth-buttons');
    var authButtonsMobile = document.querySelector('.auth-buttons-mobile');
    var userMenu = document.getElementById('user-menu');
    var userIcon = document.querySelector('.header__user');
    
    if (userData) {
        if (authButtonsDesktop) authButtonsDesktop.style.display = 'none';
        if (authButtonsMobile) authButtonsMobile.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userIcon) userIcon.style.display = 'block';
    } else {
        if (authButtonsDesktop) authButtonsDesktop.style.display = 'block';
        if (authButtonsMobile) authButtonsMobile.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (userIcon) userIcon.style.display = 'none';
    }
}

function ensureDefaultLanguage() {
    if (!localStorage.getItem('language')) {
        localStorage.setItem('language', 'es');
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    ensureDefaultLanguage();
    
    updateUIForLoggedUser();
    
    var languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.value = SessionManager.getCurrentLanguage();
        languageSelect.addEventListener('change', function (event) {
            SessionManager.setLanguage(event.target.value);
        });
    }
});