// Inicializar el formulario cuando cargue la pagina
document.addEventListener('DOMContentLoaded', function () {
    var loginFormElement = document.querySelector('.form--login');
    var demoLoginButtonElement = document.getElementById('demo-login-btn');
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }

    if (demoLoginButtonElement) {
        demoLoginButtonElement.addEventListener('click', handleDemoLogin);
    }
});

// Procesar el envio del formulario de login
async function handleLogin(e) {
    e.preventDefault();
    
    var inputEmailValue = document.getElementById('login-email').value;
    var inputPasswordValue = document.getElementById('login-password').value;
    var rememberSessionChecked = document.getElementById('remember').checked;

    if (!validateEmail(inputEmailValue)) {
        showError('login-email', 'Por favor, introduce un email válido');
        return;
    }

    if (!inputPasswordValue) {
        showError('login-password', 'Por favor, introduce tu contraseña');
        return;
    }

    showSpinner('login-submit-btn');

    try {
        await SessionManager.login({
            email: inputEmailValue,
            password: inputPasswordValue,
            remember: rememberSessionChecked
        });
        removeSpinner('login-submit-btn');
        window.location.href = 'index.html';
    } catch (error) {
        showError('login-password', error.message);
        removeSpinner('login-submit-btn');
    }
}

async function handleDemoLogin() {
    showSpinner('demo-login-btn');
    try {
        const demoCredentials = await ApiClient.get('/auth/demo-credentials');
        await SessionManager.login({
            email: demoCredentials.email,
            password: demoCredentials.password,
            remember: true
        });
        removeSpinner('demo-login-btn');
        window.location.href = 'index.html';
    } catch (error) {
        removeSpinner('demo-login-btn');
        showError('login-password', error.message || 'No se pudo iniciar sesion demo');
    }
}

// Validar formato de email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Mostrar mensaje de error bajo un campo del formulario
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = field.nextElementSibling;
    
    field.classList.add('form__input--error');
    errorSpan.textContent = message;
    errorSpan.classList.add('form__error');
}

// Mostrar indicador de carga en el boton
function showSpinner(buttonId) {
    var button = document.getElementById(buttonId);
    if (!button) return;
    button.disabled = true;
    
    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    button.appendChild(spinner);
}

// Quitar indicador de carga del boton
function removeSpinner(buttonId) {
    var button = document.getElementById(buttonId);
    if (!button) return;
    button.disabled = false;
    var spinner = button.querySelector('.spinner');
    if (spinner) {
        spinner.remove();
    }
} 