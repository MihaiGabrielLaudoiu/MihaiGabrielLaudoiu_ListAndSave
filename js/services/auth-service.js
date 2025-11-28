(function initAuthService(globalScope) {
    var SESSION_KEY = 'userSession';

    var AuthService = {
        login: async function (credentials) {
            var sessionDataFromServer = await globalScope.ApiClient.post('/auth/login', credentials);
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionDataFromServer));
            return sessionDataFromServer;
        },

        register: async function (userData) {
            return globalScope.ApiClient.post('/auth/register', {
                email: userData.email,
                password: userData.password
            });
        },

        getSession: function () {
            try {
                return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
            } catch (error) {
                return null;
            }
        },

        updateCurrentUserData: async function (partialData) {
            var activeUserSession = this.getSession();
            if (!activeUserSession || !activeUserSession.id_usuario) {
                throw new Error('Sesion no valida');
            }
            var updatedUserData = await globalScope.UserRepository.updateById(activeUserSession.id_usuario, partialData);
            var mergedSessionData = {};
            var activeSessionFieldName;
            var updatedDataFieldName;
            for (activeSessionFieldName in activeUserSession) {
                mergedSessionData[activeSessionFieldName] = activeUserSession[activeSessionFieldName];
            }
            for (updatedDataFieldName in updatedUserData) {
                mergedSessionData[updatedDataFieldName] = updatedUserData[updatedDataFieldName];
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(mergedSessionData));
            return mergedSessionData;
        },

        logout: function (redirect) {
            var shouldRedirectAfterLogout = redirect;
            if (typeof shouldRedirectAfterLogout === 'undefined') {
                shouldRedirectAfterLogout = true;
            }
            localStorage.removeItem(SESSION_KEY);
            if (shouldRedirectAfterLogout) {
                window.location.href = 'login.html';
            }
        },

        getCurrentLanguage: function () {
            return localStorage.getItem('language') || 'es';
        }
    };

    globalScope.AuthService = AuthService;
})(window);
