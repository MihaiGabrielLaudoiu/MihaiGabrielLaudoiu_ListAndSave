function verificarSesion() {
    var userSession = SessionManager.checkSession();
    var authButtons = document.getElementById('auth-buttons');
    var userMenu = document.getElementById('user-menu');
    var userIcon = document.querySelector('.header__user');
    var userName = document.querySelector('.header__user-name');

    if (userSession && !location.pathname.includes('login.html')) {
        if (authButtons) authButtons.style.display = 'none';
        if (userIcon) {
            userIcon.style.display = 'flex';
            userIcon.removeEventListener('click', handleUserIconClick);
            userIcon.addEventListener('click', handleUserIconClick);
        }
        if (userName) userName.textContent = userSession.email || 'Mi cuenta';
        return;
    }

    if (authButtons) authButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (userIcon) userIcon.style.display = 'none';
}

function handleUserIconClick(e) {
    e.stopPropagation();
    var userMenu = document.getElementById('user-menu');
    var userIcon = document.querySelector('.header__user');
    var userOverlay = document.querySelector('.header__user-overlay');
    var isMobileWidth = innerWidth <= 768;

    if (!userIcon) {
        return;
    }

    if (isMobileWidth) {
        userIcon.classList.toggle('active');
        if (userMenu) {
            userMenu.classList.toggle('is-visible');
            if (userOverlay) {
                userOverlay.classList.toggle('is-visible');
            }
        }
    } else if (userMenu) {
        userMenu.classList.toggle('is-visible');
        userIcon.classList.toggle('active', !userMenu.classList.contains('is-visible'));
    }
}

function closeUserMenuElements(userMenu, userIcon, userOverlay) {
    if (userMenu) {
        userMenu.classList.remove('is-visible');
    }
    if (userIcon) {
        userIcon.classList.remove('active');
    }
    if (userOverlay) {
        userOverlay.classList.remove('is-visible');
    }
}

function cerrarSesion() {
    SessionManager.logout();
}

document.addEventListener('DOMContentLoaded', function () {
    verificarSesion();
    
    var userMenu = document.getElementById('user-menu');
    var userIcon = document.querySelector('.header__user');
    var userOverlay = document.querySelector('.header__user-overlay');
    
    if (userMenu && userIcon) {
        function closeUserMenu(event) {
            if (!userMenu.contains(event.target) && !userIcon.contains(event.target)) {
                closeUserMenuElements(userMenu, userIcon, userOverlay);
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
        
        if (userOverlay) {
            userOverlay.addEventListener('click', function () {
                closeUserMenu({ target: {} });
            });
        }
    }
});

function initializeContrastButton() {
    addEventListener('DOMContentLoaded', function () {
        var contrastButton = document.getElementById('contrast-toggle');
        var contrastSaved = localStorage.getItem('highContrast');
        
        if (contrastSaved === 'true') {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        }
        
        if (contrastButton) {
            contrastButton.addEventListener('click', function () {
                var root = document.documentElement;
                var highContrastEnabled = root.getAttribute('data-high-contrast') === 'true';
                
                if (highContrastEnabled) {
                    root.removeAttribute('data-high-contrast');
                } else {
                    root.setAttribute('data-high-contrast', 'true');
                }
                localStorage.setItem('highContrast', (!highContrastEnabled).toString());
            });
        }
    });
}

initializeContrastButton();

window.handleUserIconClick = handleUserIconClick;
