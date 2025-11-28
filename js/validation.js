// Esta clase se encarga de validar los formularios
// La hice para que sea mas facil validar cualquier formulario
class FormValidator {
    // Cuando creamos un nuevo validador le pasamos el formulario que queremos validar
    constructor(formElement) {
        this.form = formElement;
        // Esto es para la barra de progreso que muestra cuanto hemos completado
        this.progressBar = document.querySelector('.progress__bar');
        
        // Aqui guardamos las reglas para cada campo
        // regex son patrones que debe cumplir el texto
        this.fields = {
            username: {
                regex: /^[a-zA-Z0-9_]{4,16}$/,
                message: 'El nombre de usuario debe tener entre 4 y 16 caracteres'
            },
            email: {
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Introduce un correo electrónico válido'  
            },
            password: {
                regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                message: 'La contraseña debe tener al menos 8 caracteres, una letra y un número'
            }
        };

        // Iniciamos todo
        this.init();
    }

    // Esta funcion configura el formulario cuando empezamos
    init() {
        // Desactivamos la validacion por defecto del navegador
        this.form.noValidate = true;
        // Escuchamos cuando se envia el formulario
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        // Y cuando escribimos en algun campo
        this.form.addEventListener('input', this.handleInput.bind(this));
    }

    // Esta funcion se ejecuta cuando intentamos enviar el formulario
    handleSubmit(e) {
        e.preventDefault(); // Evitamos que se envie automaticamente
        if (this.validateAll()) {
            console.log('Formulario válido, enviando...');
            this.showSpinner();
        }
    }

    // Cuando escribimos en un campo, lo validamos
    handleInput(e) {
        const field = e.target;
        this.validateField(field);
        this.updateProgress();
    }

    // Revisa si un campo cumple con las reglas
    validateField(field) {
        // Si no hay reglas para este campo, lo dejamos pasar
        if (!this.fields[field.name]) return true;

        const regex = this.fields[field.name].regex;
        // Probamos si el texto cumple con el patron
        const isValid = regex.test(field.value);
        
        // Mostramos o quitamos el error
        this.toggleError(field, isValid);
        return isValid;
    }

    // Esta funcion muestra o quita los mensajes de error
    toggleError(field, isValid) {
        // El mensaje de error esta justo despues del campo
        const errorElement = field.nextElementSibling;
        // Ponemos o quitamos la clase de error
        field.classList.toggle('form__input--error', !isValid);
        
        if (!isValid) {
            // Si hay error, mostramos el mensaje
            errorElement.textContent = this.fields[field.name].message;
            errorElement.classList.add('form__error');
        } else {
            // Si no hay error, quitamos el mensaje
            errorElement.textContent = '';
            errorElement.classList.remove('form__error');
        }
    }

    // Revisa todos los campos del formulario
    validateAll() {
        let isValid = true;
        // Revisamos campo por campo
        for (const field of this.form.elements) {
            if (field.type !== 'submit' && this.fields[field.name]) {
                isValid = this.validateField(field) && isValid;
            }
        }
        return isValid;
    }

    // Actualiza la barra de progreso segun cuantos campos estan bien
    updateProgress() {
        // Contamos cuantos campos hay (sin contar el boton de enviar)
        const fields = [...this.form.elements].filter(el => el.type !== 'submit');
        // Contamos cuantos campos estan bien
        const validFields = fields.filter(field => this.validateField(field));
        // Calculamos el porcentaje
        const progress = (validFields.length / fields.length) * 100;
        
        // Movemos la barra
        this.progressBar.style.width = `${progress}%`;
    }

    // Muestra un circulo que da vueltas mientras se envia el formulario
    showSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        this.form.appendChild(spinner);
        
        // Despues de 2 segundos quitamos el circulo
        setTimeout(() => {
            spinner.remove();
        }, 2000);
    }
}

// Cuando la pagina termina de cargar, buscamos el formulario y creamos el validador
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.form--register');
    if (registerForm) {
        new FormValidator(registerForm);
    }
});