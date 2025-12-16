function verificarSesion() {
    var activeSessionData = SessionManager.checkSession();
    var authButtonsElement = document.getElementById('auth-buttons');
    var userMenuElement = document.getElementById('user-menu');
    var userIconElement = document.querySelector('.header__user');
    var userNameElement = document.querySelector('.header__user-name');

    if (activeSessionData && !location.pathname.includes('login.html')) {
        if (authButtonsElement) authButtonsElement.style.display = 'none';
        if (userIconElement) {
            userIconElement.style.display = 'flex';
            userIconElement.removeEventListener('click', handleUserIconClick);
            userIconElement.addEventListener('click', handleUserIconClick);
        }
        if (userNameElement) userNameElement.textContent = activeSessionData.email || 'Mi cuenta';
        return;
    }

    if (authButtonsElement) authButtonsElement.style.display = 'flex';
    if (userMenuElement) userMenuElement.style.display = 'none';
    if (userIconElement) userIconElement.style.display = 'none';
}

// Función para manejar el clic en el icono de usuario
function handleUserIconClick(e) {
    e.stopPropagation();
    var userMenuElement = document.getElementById('user-menu');
    var userIconElement = document.querySelector('.header__user');
    var userMenuOverlayElement = document.querySelector('.header__user-overlay');
    var isMobileWidth = innerWidth <= 768;

    if (!userIconElement) {
        return;
    }

    if (isMobileWidth) {
        userIconElement.classList.toggle('active');
        if (userMenuElement) {
            userMenuElement.classList.toggle('is-visible');
            if (userMenuOverlayElement) {
                userMenuOverlayElement.classList.toggle('is-visible');
            }
        }
    } else if (userMenuElement) {
        userMenuElement.classList.toggle('is-visible');
        userIconElement.classList.toggle('active', !userMenuElement.classList.contains('is-visible'));
    }
}

// Esta funcion cierra el menu de usuario para evitar duplicar codigo.
function closeUserMenuElements(userMenuElement, userIconElement, userMenuOverlayElement) {
    if (userMenuElement) {
        userMenuElement.classList.remove('is-visible');
    }
    if (userIconElement) {
        userIconElement.classList.remove('active');
    }
    if (userMenuOverlayElement) {
        userMenuOverlayElement.classList.remove('is-visible');
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    SessionManager.logout();
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    verificarSesion();
    
    var userMenuElement = document.getElementById('user-menu');
    var userIconElement = document.querySelector('.header__user');
    var userMenuOverlayElement = document.querySelector('.header__user-overlay');
    
    if (userMenuElement && userIconElement) {
        function closeUserMenu(userClickEvent) {
            if (!userMenuElement.contains(userClickEvent.target) && !userIconElement.contains(userClickEvent.target)) {
                closeUserMenuElements(userMenuElement, userIconElement, userMenuOverlayElement);
            }
        }
        
        addEventListener('click', closeUserMenu);
        
        var lastWindowWidth = innerWidth;
        addEventListener('resize', function () {
            var currentWindowWidth = innerWidth;
            if ((lastWindowWidth > 768 && currentWindowWidth <= 768) || (lastWindowWidth <= 768 && currentWindowWidth > 768)) {
                closeUserMenu({ target: {} });
            }
            lastWindowWidth = currentWindowWidth;
        });
        
        if (userMenuOverlayElement) {
            userMenuOverlayElement.addEventListener('click', function () {
                closeUserMenu({ target: {} });
            });
        }
    }
});

function initializeContrastButton() {
    addEventListener('DOMContentLoaded', function () {
        var contrastToggleButtonElement = document.getElementById('contrast-toggle');
        var persistedContrastPreference = localStorage.getItem('highContrast');
        
        if (persistedContrastPreference === 'true') {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        }
        
        if (contrastToggleButtonElement) {
            contrastToggleButtonElement.addEventListener('click', function () {
                var rootHtmlElement = document.documentElement;
                var isHighContrastEnabled = rootHtmlElement.getAttribute('data-high-contrast') === 'true';
                
                if (isHighContrastEnabled) {
                    rootHtmlElement.removeAttribute('data-high-contrast');
                } else {
                    rootHtmlElement.setAttribute('data-high-contrast', 'true');
                }
                localStorage.setItem('highContrast', (!isHighContrastEnabled).toString());
            });
        }
    });
}

initializeContrastButton();

window.handleUserIconClick = handleUserIconClick;
