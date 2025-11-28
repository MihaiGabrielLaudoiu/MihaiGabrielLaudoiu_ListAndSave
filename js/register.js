// Cuando la página web termina de cargar, hacemos todo esto
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos el formulario y los elementos importantes
    const form = document.querySelector('.form'); // El formulario completo
    const steps = document.querySelectorAll('.form__step'); // Los pasos del formulario
    const progressSteps = document.querySelectorAll('.progress__step'); // Los círculos de progreso
    const prevBtn = document.getElementById('prevBtn'); // Botón de "Anterior" 
    const nextBtn = document.getElementById('nextBtn'); // Botón de "Siguiente"
    const submitBtn = document.getElementById('submitBtn'); // Botón de "Enviar"

    // Esta variable guarda en qué paso estamos (empezamos en el 1)
    let currentStep = 1;

    // Aquí guardamos las reglas para revisar cada campo
    // ¡No te asustes! Son solo reglas para asegurarnos que los datos estén bien
    const validations = {
        username: {
            // Esta cosa rara es para asegurarnos que el usuario solo use letras, números y _
            regex: /^[a-zA-Z0-9_]{4,16}$/,
            error: 'El nombre de usuario debe tener entre 4 y 16 caracteres y solo puede contener letras, números y guiones bajos'
        },
        email: {
            // Esta regla revisa que el correo tenga @ y un punto
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            error: 'Por favor, introduce un correo electrónico válido'
        },
        password: {
            // La contraseña debe tener letras y números
            regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            error: 'La contraseña debe tener al menos 8 caracteres, una letra y un número'
        },
        confirmPassword: {
            // Aquí solo revisamos que sea igual a la contraseña
            validate: (value, formData) => value === formData.get('password'),
            error: 'Las contraseñas no coinciden'
        },
        fullname: {
            // El nombre solo puede tener letras y espacios
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            error: 'El nombre debe contener solo letras y espacios (2-50 caracteres)'
        },
        age: {
            // Revisamos que la edad sea un número entre 18 y 120
            validate: (value) => {
                const age = parseInt(value); // Convertimos el texto a número
                return age >= 18 && age <= 120;
            },
            error: 'Debes ser mayor de 18 años'
        },
        categories: {
            // Revisamos que haya marcado al menos una categoría
            validate: (value, formData) => {
                const categories = formData.getAll('categories');
                return categories.length > 0;
            },
            error: 'Selecciona al menos una categoría'
        }
    };

    // Esta función revisa si un campo está bien llenado
    const validateField = (input) => {
        const fieldName = input.getAttribute('name'); // El nombre del campo
        const value = input.value.trim(); // Lo que escribió el usuario (sin espacios al inicio o final)
        
        // Primero quitamos cualquier error que hubiera antes
        clearFieldError(input);

        // Si es una casilla de verificación (checkbox), la revisamos diferente
        if (input.type === 'checkbox') {
            // Buscamos todas las casillas con el mismo nombre
            const checkboxes = form.querySelectorAll(`input[name="${fieldName}"]`);
            // Revisamos si al menos una está marcada
            const checked = Array.from(checkboxes).some(cb => cb.checked);
            
            if (!checked) {
                // Si ninguna está marcada, mostramos error
                const checkboxGroup = input.closest('.form__checkbox-group');
                showGroupError(checkboxGroup, validations[fieldName].error);
                return false;
            }
            return true;
        }

        // Si el campo está vacío
        if (!value) {
            showFieldError(input, 'Este campo es obligatorio');
            return false;
        }

        // Buscamos las reglas para este campo
        const validation = validations[fieldName];
        if (validation) {
            // Si tiene una regla de formato (regex)
            if (validation.regex) {
                if (!validation.regex.test(value)) {
                    showFieldError(input, validation.error);
                    return false;
                }
            } 
            // Si tiene una función especial de validación
            else if (validation.validate) {
                const formData = new FormData(form);
                if (!validation.validate(value, formData)) {
                    showFieldError(input, validation.error);
                    return false;
                }
            }
        }

        return true; // Si llegamos aquí, todo está bien
    };

    // Esta función muestra un mensaje de error debajo de un campo
    const showFieldError = (input, message) => {
        // Ponemos el campo en rojo
        input.classList.add('form__input--error');
        
        // Buscamos si ya hay un mensaje de error
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('form__error-message')) {
            // Si no hay, creamos uno nuevo
            errorElement = document.createElement('span');
            errorElement.className = 'form__error-message';
            const hint = input.nextElementSibling;
            input.parentNode.insertBefore(errorElement, hint);
        }
        
        // Ponemos el mensaje y lo hacemos visible
        errorElement.textContent = message;
        errorElement.classList.add('form__error-message--visible');

        // Escondemos el texto de ayuda si hay
        const hint = input.parentNode.querySelector('.form__hint');
        if (hint) hint.style.display = 'none';
    };

    // Esta función quita los mensajes de error de un campo
    const clearFieldError = (input) => {
        // Quitamos el color rojo del campo
        input.classList.remove('form__input--error');
        
        // Buscamos y quitamos el mensaje de error
        const errorElement = input.parentNode.querySelector('.form__error-message');
        if (errorElement) {
            errorElement.classList.remove('form__error-message--visible');
        }

        // Volvemos a mostrar el texto de ayuda
        const hint = input.parentNode.querySelector('.form__hint');
        if (hint) hint.style.display = 'block';
    };

    // Esta función muestra error en un grupo de casillas
    const showGroupError = (container, message) => {
        clearGroupError(container);
        
        // Creamos y mostramos el mensaje de error
        const errorElement = document.createElement('span');
        errorElement.className = 'form__error-message form__error-message--visible';
        errorElement.textContent = message;
        container.appendChild(errorElement);
        
        // Ponemos el grupo en rojo
        container.classList.add('form__checkbox-group--error');
    };

    // Esta función quita el error de un grupo de casillas
    const clearGroupError = (container) => {
        container.classList.remove('form__checkbox-group--error');
        const errorElement = container.querySelector('.form__error-message');
        if (errorElement) {
            errorElement.remove();
        }
    };

    // Esta función revisa si todos los campos de un paso están bien
    const validateStep = (step) => {
        // Buscamos el paso actual
        const currentStepElement = document.querySelector(`.form__step[data-step="${step}"]`);
        // Buscamos todos sus campos
        const inputs = currentStepElement.querySelectorAll('.form__input');
        let isValid = true;

        // Revisamos cada campo
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    };

    // Esta función actualiza los círculos de progreso
    const updateProgress = (step) => {
        // Para cada círculo...
        progressSteps.forEach((progressStep, idx) => {
            // Si ya pasamos por él, lo marcamos como completado
            if (idx < step) {
                progressStep.classList.add('progress__step--completed');
            } else {
                progressStep.classList.remove('progress__step--completed');
            }
        });

        // Calculamos cuánto debe llenarse la línea de progreso
        const percent = ((step - 1) / (progressSteps.length - 1)) * 100;
        document.querySelector('.progress__line-fill').style.width = `${percent}%`;
    };

    // Esta función muestra el paso que queremos ver
    function showStep(step) {
        // Escondemos todos los pasos
        steps.forEach(s => s.classList.remove('form__step--active'));
        progressSteps.forEach(p => p.classList.remove('progress__step--active'));
        
        // Mostramos el paso que queremos
        document.querySelector(`.form__step[data-step="${step}"]`).classList.add('form__step--active');
        document.querySelector(`.progress__step[data-step="${step}"]`).classList.add('progress__step--active');

        // Mostramos u ocultamos los botones según el paso
        prevBtn.style.display = step === 1 ? 'none' : 'block';
        nextBtn.style.display = step === 3 ? 'none' : 'block';
        submitBtn.style.display = step === 3 ? 'block' : 'none';

        updateProgress(step);
    }

    // Cuando hacemos clic en "Siguiente"
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    // Cuando hacemos clic en "Anterior"
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    // Revisamos los campos mientras el usuario escribe
    form.querySelectorAll('.form__input, input[type="checkbox"]').forEach(input => {
        if (input.type === 'checkbox') {
            // Para las casillas, cuando las marcamos o desmarcamos
            input.addEventListener('change', () => {
                const checkboxGroup = input.closest('.form__checkbox-group');
                clearGroupError(checkboxGroup);
                validateField(input);
                updateProgressLine(currentStep);
            });
        } else {
            // Para los demás campos, mientras escribimos
            input.addEventListener('input', () => {
                validateField(input);
                updateProgressLine(currentStep);
            });
            // Y cuando terminamos de escribir
            input.addEventListener('blur', () => {
                validateField(input);
                updateProgressLine(currentStep);
            });
        }
    });

    // Esta función actualiza la línea de progreso de cada paso
    const updateProgressLine = (step) => {
        // Buscamos el paso actual y sus campos
        const currentStepElement = document.querySelector(`.form__step[data-step="${step}"]`);
        const inputs = currentStepElement.querySelectorAll('.form__input');
        const totalInputs = inputs.length;
        let validInputs = 0;

        // Contamos cuántos campos están bien
        inputs.forEach(input => {
            if (validateField(input)) {
                validInputs++;
            }
        });

        // Calculamos el progreso
        const progress = (validInputs / totalInputs) * 100;
        const progressLine = document.querySelector(`.progress__step[data-step="${step}"] .progress__line-fill`);
        if (progressLine) {
            progressLine.style.width = `${progress}%`;
        }

        // Si todos los campos están bien, marcamos el círculo como completado
        if (validInputs === totalInputs) {
            document.querySelector(`.progress__step[data-step="${step}"]`).classList.add('progress__step--completed');
        } else {
            document.querySelector(`.progress__step[data-step="${step}"]`).classList.remove('progress__step--completed');
        }
    };

    // Esta función muestra un mensaje bonito cuando todo sale bien
    const showSuccessMessage = () => {
        // Creamos una caja para el mensaje
        const messageContainer = document.createElement('div');
        messageContainer.className = 'success-message animate-fadeIn';
        messageContainer.innerHTML = `
            <div class="success-message__content">
                <svg class="success-message__icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <p>Usuario registrado correctamente</p>
            </div>
        `;

        // Le ponemos estilo a la caja
        messageContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--color-white);
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            z-index: 1000;
        `;

        // La ponemos en la página
        document.body.appendChild(messageContainer);

        // Ponemos un fondo oscuro detrás
        const overlay = document.createElement('div');
        overlay.className = 'overlay animate-fadeIn';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        document.body.appendChild(overlay);

        // Después de 2 segundos, vamos a la página de login
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    };

    // Agregar el evento submit al formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            showConfirmModal();
        }
    });

    // Hacemos las funciones disponibles globalmente
    window.hideConfirmModal = () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.style.display = 'none';
        window.location.reload(); // Recargamos la página al cancelar
    };

    window.confirmRegistration = async () => {
        const form = document.querySelector('.form');
        const formData = new FormData(form);
        
        // Crear objeto con los datos del usuario
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            fullname: formData.get('fullname'),
            age: formData.get('age'),
            categories: formData.getAll('categories'),
            isLoggedIn: true
        };

        try {
            await SessionManager.registerUser(userData);
            await SessionManager.login({
                email: userData.email,
                password: userData.password
            });

            // Ocultar modal y redirigir
            hideConfirmModal();
            window.location.href = './login.html';
        } catch (error) {
            alert(error.message || 'No se pudo completar el registro');
        }
    };

    // La función showConfirmModal puede permanecer local ya que se llama desde el código
    const showConfirmModal = () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.style.display = 'flex';
    };

    // Manejar el selector de idioma
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        // Establecer el idioma actual
        const currentLang = TranslationManager.getCurrentLanguage();
        languageSelect.value = currentLang;

        // Escuchar cambios en el selector de idioma
        languageSelect.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            try {
                await TranslationManager.setLanguage(newLang);
                // Actualizar los placeholders y textos del formulario
                updateFormTranslations();
            } catch (error) {
                console.error('Error al cambiar el idioma:', error);
                alert('Error al cambiar el idioma. Por favor, inténtalo de nuevo.');
                languageSelect.value = currentLang;
            }
        });
    }

    // Función para actualizar las traducciones específicas del formulario
    function updateFormTranslations() {
        // Actualizar los mensajes de error personalizados
        const errorMessages = {
            username: document.querySelector('.form__hint[data-i18n="register.form.username.hint"]'),
            email: document.querySelector('.form__hint[data-i18n="register.form.email.hint"]'),
            password: document.querySelector('.form__hint[data-i18n="register.form.password.hint"]'),
            confirmPassword: document.querySelector('.form__hint[data-i18n="register.form.confirm_password.hint"]'),
            fullname: document.querySelector('.form__hint[data-i18n="register.form.fullname.hint"]'),
            age: document.querySelector('.form__hint[data-i18n="register.form.age.hint"]'),
            categories: document.querySelector('.form__hint[data-i18n="register.form.categories.hint"]')
        };

        // Re-validar campos si es necesario
        const activeInputs = document.querySelectorAll('.form__input:not([type="hidden"])');
        activeInputs.forEach(input => {
            if (input.value) {
                validateField(input);
            }
        });
    }

    // Empezamos mostrando el primer paso
    showStep(1);
});