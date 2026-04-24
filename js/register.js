document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const steps = document.querySelectorAll('.form__step');
    const progressSteps = document.querySelectorAll('.progress__step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    let currentStep = 1;

    const validations = {
        username: {
            regex: /^[a-zA-Z0-9_]{4,16}$/,
            error: 'El nombre de usuario debe tener entre 4 y 16 caracteres y solo puede contener letras, números y guiones bajos'
        },
        email: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            error: 'Por favor, introduce un correo electrónico válido'
        },
        password: {
            regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            error: 'La contraseña debe tener al menos 8 caracteres, una letra y un número'
        },
        confirmPassword: {
            validate: (value, formData) => value === formData.get('password'),
            error: 'Las contraseñas no coinciden'
        },
        fullname: {
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            error: 'El nombre debe contener solo letras y espacios (2-50 caracteres)'
        },
        age: {
            validate: (value) => {
                const age = parseInt(value);
                return age >= 18 && age <= 120;
            },
            error: 'Debes ser mayor de 18 años'
        },
        categories: {
            validate: (value, formData) => {
                const categories = formData.getAll('categories');
                return categories.length > 0;
            },
            error: 'Selecciona al menos una categoría'
        }
    };

    const validateField = (input) => {
        const fieldName = input.getAttribute('name');
        const value = input.value.trim();
        
        clearFieldError(input);

        if (input.type === 'checkbox') {
            const checkboxes = form.querySelectorAll(`input[name="${fieldName}"]`);
            const checked = Array.from(checkboxes).some(cb => cb.checked);
            
            if (!checked) {
                const checkboxGroup = input.closest('.form__checkbox-group');
                showGroupError(checkboxGroup, validations[fieldName].error);
                return false;
            }
            return true;
        }

        if (!value) {
            showFieldError(input, 'Este campo es obligatorio');
            return false;
        }

        const validation = validations[fieldName];
        if (validation) {
            if (validation.regex) {
                if (!validation.regex.test(value)) {
                    showFieldError(input, validation.error);
                    return false;
                }
            } else if (validation.validate) {
                const formData = new FormData(form);
                if (!validation.validate(value, formData)) {
                    showFieldError(input, validation.error);
                    return false;
                }
            }
        }

        return true;
    };

    const showFieldError = (input, message) => {
        input.classList.add('form__input--error');
        
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('form__error-message')) {
            errorElement = document.createElement('span');
            errorElement.className = 'form__error-message';
            const hint = input.nextElementSibling;
            input.parentNode.insertBefore(errorElement, hint);
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('form__error-message--visible');

        const hint = input.parentNode.querySelector('.form__hint');
        if (hint) hint.style.display = 'none';
    };

    const clearFieldError = (input) => {
        input.classList.remove('form__input--error');
        
        const errorElement = input.parentNode.querySelector('.form__error-message');
        if (errorElement) {
            errorElement.classList.remove('form__error-message--visible');
        }

        const hint = input.parentNode.querySelector('.form__hint');
        if (hint) hint.style.display = 'block';
    };

    const showGroupError = (container, message) => {
        clearGroupError(container);
        
        const errorElement = document.createElement('span');
        errorElement.className = 'form__error-message form__error-message--visible';
        errorElement.textContent = message;
        container.appendChild(errorElement);
        
        container.classList.add('form__checkbox-group--error');
    };

    const clearGroupError = (container) => {
        container.classList.remove('form__checkbox-group--error');
        const errorElement = container.querySelector('.form__error-message');
        if (errorElement) {
            errorElement.remove();
        }
    };

    const validateStep = (step) => {
        const currentStepElement = document.querySelector(`.form__step[data-step="${step}"]`);
        const inputs = currentStepElement.querySelectorAll('.form__input');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    };

    const updateProgress = (step) => {
        progressSteps.forEach((progressStep, idx) => {
            if (idx < step) {
                progressStep.classList.add('progress__step--completed');
            } else {
                progressStep.classList.remove('progress__step--completed');
            }
        });

        const percent = ((step - 1) / (progressSteps.length - 1)) * 100;
        document.querySelector('.progress__line-fill').style.width = `${percent}%`;
    };

    function showStep(step) {
        steps.forEach(s => s.classList.remove('form__step--active'));
        progressSteps.forEach(p => p.classList.remove('progress__step--active'));
        
        document.querySelector(`.form__step[data-step="${step}"]`).classList.add('form__step--active');
        document.querySelector(`.progress__step[data-step="${step}"]`).classList.add('progress__step--active');

        prevBtn.style.display = step === 1 ? 'none' : 'block';
        nextBtn.style.display = step === 3 ? 'none' : 'block';
        submitBtn.style.display = step === 3 ? 'block' : 'none';

        updateProgress(step);
    }

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                currentStep++;
                showStep(currentStep);
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    form.querySelectorAll('.form__input, input[type="checkbox"]').forEach(input => {
        if (input.type === 'checkbox') {
            input.addEventListener('change', () => {
                const checkboxGroup = input.closest('.form__checkbox-group');
                clearGroupError(checkboxGroup);
                validateField(input);
                updateProgressLine(currentStep);
            });
        } else {
            input.addEventListener('input', () => {
                validateField(input);
                updateProgressLine(currentStep);
            });
            input.addEventListener('blur', () => {
                validateField(input);
                updateProgressLine(currentStep);
            });
        }
    });

    const updateProgressLine = (step) => {
        const currentStepElement = document.querySelector(`.form__step[data-step="${step}"]`);
        const inputs = currentStepElement.querySelectorAll('.form__input');
        const totalInputs = inputs.length;
        let validInputs = 0;

        inputs.forEach(input => {
            if (validateField(input)) {
                validInputs++;
            }
        });

        const progress = (validInputs / totalInputs) * 100;
        const progressLine = document.querySelector(`.progress__step[data-step="${step}"] .progress__line-fill`);
        if (progressLine) {
            progressLine.style.width = `${progress}%`;
        }

        if (validInputs === totalInputs) {
            document.querySelector(`.progress__step[data-step="${step}"]`).classList.add('progress__step--completed');
        } else {
            document.querySelector(`.progress__step[data-step="${step}"]`).classList.remove('progress__step--completed');
        }
    };

    const showSuccessMessage = () => {
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

        document.body.appendChild(messageContainer);

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

        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            showConfirmModal();
        }
    });

    window.hideConfirmModal = () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.style.display = 'none';
        window.location.reload();
    };

    window.confirmRegistration = async () => {
        const form = document.querySelector('.form');
        const formData = new FormData(form);
        
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

            hideConfirmModal();
            window.location.href = './login.html';
        } catch (error) {
            alert(error.message || 'No se pudo completar el registro');
        }
    };

    const showConfirmModal = () => {
        const modalOverlay = document.querySelector('.modal-overlay');
        modalOverlay.style.display = 'flex';
    };

    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        const currentLang = TranslationManager.getCurrentLanguage();
        languageSelect.value = currentLang;

        languageSelect.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            try {
                await TranslationManager.setLanguage(newLang);
                updateFormTranslations();
            } catch (error) {
                console.error('Error al cambiar el idioma:', error);
                alert('Error al cambiar el idioma. Por favor, inténtalo de nuevo.');
                languageSelect.value = currentLang;
            }
        });
    }

    function updateFormTranslations() {
        const errorMessages = {
            username: document.querySelector('.form__hint[data-i18n="register.form.username.hint"]'),
            email: document.querySelector('.form__hint[data-i18n="register.form.email.hint"]'),
            password: document.querySelector('.form__hint[data-i18n="register.form.password.hint"]'),
            confirmPassword: document.querySelector('.form__hint[data-i18n="register.form.confirm_password.hint"]'),
            fullname: document.querySelector('.form__hint[data-i18n="register.form.fullname.hint"]'),
            age: document.querySelector('.form__hint[data-i18n="register.form.age.hint"]'),
            categories: document.querySelector('.form__hint[data-i18n="register.form.categories.hint"]')
        };

        const activeInputs = document.querySelectorAll('.form__input:not([type="hidden"])');
        activeInputs.forEach(input => {
            if (input.value) {
                validateField(input);
            }
        });
    }

    showStep(1);
});