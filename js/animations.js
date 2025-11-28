// Este código se ejecuta cuando la página termina de cargar completamente
document.addEventListener('DOMContentLoaded', () => {
    // Primero hacemos que aparezcan bonito los elementos
    animateElements();
    
    // Luego hacemos que los elementos aparezcan cuando los vemos al hacer scroll
    observeElements();
    // Iniciamos el carrusel de logos
    initSponsorsSlider();
    // Si estamos en la página "about" iniciamos sus animaciones especiales
    if (document.querySelector('.about-hero')) {
        initAboutAnimations();
        // Añadimos la inicialización del timeline
        initTimelineAnimations();
    }
});

// Esta función hace que los elementos aparezcan gradualmente uno por uno
function animateElements() {
    // Buscamos todos los elementos que queremos animar
    const elements = document.querySelectorAll('.animate-fadeIn');
    // Para cada elemento...
    elements.forEach((element, index) => {
        // Primero lo hacemos invisible
        element.style.opacity = '0';
        // Esperamos un poquito (más para cada elemento) y lo hacemos aparecer
        setTimeout(() => {
            element.style.opacity = '1'; // Lo hacemos visible
            // Le ponemos una animación bonita
            element.style.animation = 'fadeIn 0.6s ease forwards';
        }, index * 200); // Esperamos 200ms * la posición del elemento
    });
}

// Esta función detecta cuando los elementos aparecen en la pantalla al hacer scroll
function observeElements() {
    // Creamos un "observador" que vigila los elementos
    const observer = new IntersectionObserver((entries) => {
        // Para cada elemento que estamos vigilando...
        entries.forEach(entry => {
            // Si ya se puede ver en la pantalla...
            if (entry.isIntersecting) {
                // Le añadimos la clase para que se anime
                entry.target.classList.add('animate-fadeIn');
                // Dejamos de vigilarlo porque ya no hace falta
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Cuando se ve al menos un 10% del elemento
    });

    // Buscamos todos los elementos que queremos vigilar y los empezamos a observar
    document.querySelectorAll('.features__item, .stores__grid img').forEach(el => {
        observer.observe(el);
    });
}

// Esta parte maneja los botones del formulario por pasos
document.querySelectorAll('.form__tab').forEach(tab => {
    // Cuando hacemos clic en una pestaña...
    tab.addEventListener('click', (e) => {
        e.preventDefault(); // Evitamos que la página se recargue
        
        // Quitamos el estilo "activo" de todas las pestañas
        const tabs = document.querySelectorAll('.form__tab');
        tabs.forEach(t => t.classList.remove('form__tab--active'));
        
        // Ponemos como activa la pestaña en la que hicimos clic
        tab.classList.add('form__tab--active');
        
        // Calculamos cuánto debe avanzar la barra de progreso
        const progress = Array.from(tabs).indexOf(tab) / (tabs.length - 1) * 100;
        // Movemos la barra de progreso
        document.querySelector('.progress__bar').style.width = `${progress}%`;
    });
});

// Esta función hace que los logos de sponsors se muevan solos
function initSponsorsSlider() {
    // Buscamos donde están los logos
    const track = document.querySelector('.sponsors__track');
    if (!track) return; // Si no hay logos, no hacemos nada

    // Encontramos el grupo de logos original
    const sponsorsGroup = track.querySelector('.sponsors__group');
    
    // Hacemos copias de los logos para que parezca infinito
    // ¡Como cuando pones dos espejos uno frente a otro!
    for (let i = 0; i < 3; i++) {
        const clone = sponsorsGroup.cloneNode(true);
        track.appendChild(clone);
    }

    // Calculamos qué tan rápido deben moverse los logos
    const speed = sponsorsGroup.offsetWidth / 50;

    // Hacemos que los logos se muevan
    track.style.animation = `slideSponsors ${speed}s linear infinite`;

    // Esta función reinicia el movimiento para que no se note el salto
    const resetAnimation = () => {
        track.style.animation = 'none';
        track.offsetHeight; // Un truco para que el navegador reinicie la animación
        track.style.animation = `slideSponsors ${speed}s linear infinite`;
    };

    // Cuando pasamos el mouse por encima, los logos se detienen
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    // Cuando quitamos el mouse, los logos siguen moviéndose
    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });

    // Reiniciamos la animación cuando termina para que sea suave
    track.addEventListener('animationend', resetAnimation);
}

// Esta función hace las animaciones especiales de la página "about"
function initAboutAnimations() {
    // Creamos otro observador para vigilar elementos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Cuando un elemento aparece en pantalla...
            if (entry.isIntersecting) {
                // Le ponemos un pequeño retraso si lo tiene configurado
                entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
                // Iniciamos su animación
                entry.target.style.animationPlayState = 'running';
                // Dejamos de vigilarlo
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Cuando se ve al menos un 10% del elemento
    });

    // Buscamos todos los elementos que queremos animar
    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach((el, index) => {
        // Los pausamos al inicio
        el.style.animationPlayState = 'paused';
        // Les damos un retraso diferente a cada uno
        el.dataset.delay = `${index * 0.2}s`;
        // Empezamos a vigilarlos
        observer.observe(el);
    });
}

function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline__item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                
                // Aseguramos que el elemento empiece invisible
                item.style.opacity = '0';
                item.style.visibility = 'hidden';
                
                // Aplicamos la transformación inicial según la dirección
                if (item.classList.contains('timeline__item--left')) {
                    item.style.transform = 'translateX(-100px)';
                } else if (item.classList.contains('timeline__item--right')) {
                    item.style.transform = 'translateX(100px)';
                }
                
                // Añadimos la clase animate con un pequeño retraso basado en el índice
                setTimeout(() => {
                    item.classList.add('animate');
                    item.style.visibility = 'visible';
                    
                    // Aplicamos la animación según la dirección
                    if (item.classList.contains('timeline__item--left')) {
                        item.style.animation = 'fadeInLeft 0.5s ease forwards';
                    } else if (item.classList.contains('timeline__item--right')) {
                        item.style.animation = 'fadeInRight 0.5s ease forwards';
                    }
                }, Array.from(timelineItems).indexOf(item) * 200);
                
                observer.unobserve(item);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-50px'
    });

    // Inicializamos cada elemento del timeline
    timelineItems.forEach(item => {
        // Configuración inicial
        item.style.opacity = '0';
        item.style.visibility = 'hidden';
        
        // Configuramos la posición inicial según la dirección
        if (item.classList.contains('timeline__item--left')) {
            item.style.transform = 'translateX(-100px)';
        } else if (item.classList.contains('timeline__item--right')) {
            item.style.transform = 'translateX(100px)';
        }
        
        observer.observe(item);
    });
}
