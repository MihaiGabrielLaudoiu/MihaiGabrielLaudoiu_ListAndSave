document.addEventListener('DOMContentLoaded', async () => {
    const session = SessionManager.checkSession();
    if (!session?.id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    const form = document.getElementById('settingsForm');

    function activateTab(tabId) {
        tabs.forEach((tab) => tab.classList.remove('active'));
        contents.forEach((content) => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(`${tabId}-tab`);
        selectedTab?.classList.add('active');
        if (selectedContent) {
            selectedContent.style.display = 'block';
            setTimeout(() => selectedContent.classList.add('active'), 30);
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault();
            activateTab(tab.getAttribute('data-tab'));
        });
    });
    activateTab(tabs[0]?.getAttribute('data-tab') || 'location');

    const languageInput = document.getElementById('language');
    const postalCodeInput = document.getElementById('postalCode');
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryDateInput = document.getElementById('expiryDate');
    const cardNameInput = document.getElementById('cardName');

    function validateSettingsForm() {
        const postalCode = postalCodeInput ? postalCodeInput.value.trim() : '';
        const cardNumber = cardNumberInput ? cardNumberInput.value.replace(/\s+/g, '') : '';

        if (postalCode && postalCode.length !== 5) {
            alert('El codigo postal no tiene el formato correcto');
            return false;
        }

        if (cardNumber && cardNumber.length < 16) {
            alert('La tarjeta debe tener 16 digitos');
            return false;
        }

        return true;
    }

    try {
        const allSettings = await ApiClient.get('/settings');
        const setting = allSettings.find((item) => item.id_usuario === session.id_usuario);
        if (setting?.tema_oscuro) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        }
    } catch (error) {
        console.error(error);
    }

    languageInput.value = SessionManager.getCurrentLanguage();

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateSettingsForm()) {
            return;
        }

        try {
            const allSettings = await ApiClient.get('/settings');
            const setting = allSettings.find((item) => item.id_usuario === session.id_usuario);
            const payload = {
                id_usuario: session.id_usuario,
                tema_oscuro: document.documentElement.getAttribute('data-high-contrast') === 'true',
                notificaciones: true
            };

            if (setting) {
                await ApiClient.put(`/settings/${setting.id_ajuste}`, payload);
            } else {
                await ApiClient.post('/settings', payload);
            }

            await SessionManager.setLanguage(languageInput.value);
            alert('Configuracion guardada correctamente');
            window.location.href = 'index.html';
        } catch (error) {
            console.error(error);
            alert(error.message || 'No se pudo guardar');
        }
    });

    document.getElementById('backToHome')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// Función para mostrar el modal de confirmación
function showLogoutConfirmation() {
    // Crear elementos del modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'flex';

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalContent = `
        <h3 class="modal-title">¿Estás seguro que deseas cerrar sesión?</h3>
        <div class="modal-buttons">
            <button class="button button--secondary" id="cancelLogout">Cancelar</button>
            <button class="button button--primary" id="confirmLogout">Cerrar sesión</button>
        </div>
    `;

    modalContainer.innerHTML = modalContent;
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // Manejadores de eventos
    document.getElementById('cancelLogout').addEventListener('click', () => {
        modalOverlay.remove();
    });

    document.getElementById('confirmLogout').addEventListener('click', () => {
        // Lógica actual de cerrar sesión
        localStorage.removeItem('userSettings');
        localStorage.removeItem('userToken'); // Si usas token de autenticación
        window.location.href = 'index.html';
    });

    // Cerrar modal al hacer clic fuera
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
} 