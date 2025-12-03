var SessionManager = {
    login: async function (credentials) {
        var activeSessionFromServer = await AuthService.login(credentials);
        updateUIForLoggedUser();
        return activeSessionFromServer;
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
    var activeUserData = SessionManager.checkSession();
    var authButtonsDesktopElement = document.getElementById('auth-buttons');
    var authButtonsMobileElement = document.querySelector('.auth-buttons-mobile');
    var userMenuElement = document.getElementById('user-menu');
    var userIconElement = document.querySelector('.header__user');
    
    if (activeUserData) {
        // Usuario con sesión iniciada
        if (authButtonsDesktopElement) authButtonsDesktopElement.style.display = 'none';
        if (authButtonsMobileElement) authButtonsMobileElement.style.display = 'none';
        if (userMenuElement) userMenuElement.style.display = 'block';
        if (userIconElement) userIconElement.style.display = 'block';
    } else {
        // Usuario sin sesión
        if (authButtonsDesktopElement) authButtonsDesktopElement.style.display = 'block';
        if (authButtonsMobileElement) authButtonsMobileElement.style.display = 'flex';
        if (userMenuElement) userMenuElement.style.display = 'none';
        if (userIconElement) userIconElement.style.display = 'none';
    }
}

// Esta funcion centraliza la inicializacion de idioma para no repetir pasos.
function initializeLanguageForCurrentSession() {
    if (!localStorage.getItem('language')) {
        localStorage.setItem('language', 'es');
    }
}

// Verificar sesión al cargar cualquier página
document.addEventListener('DOMContentLoaded', async function () {
    // Asegurar que haya un idioma por defecto
    initializeLanguageForCurrentSession();
    
    updateUIForLoggedUser();
    
    // Configurar el selector de idioma en ajustes
    var languageSelectElement = document.getElementById('language');
    if (languageSelectElement) {
        languageSelectElement.value = SessionManager.getCurrentLanguage();
        languageSelectElement.addEventListener('change', function (event) {
            SessionManager.setLanguage(event.target.value);
        });
    }
});