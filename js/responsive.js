// cuando la pagina cargue
document.addEventListener("DOMContentLoaded", function () {
  // conseguir los elementos que necesitamos
  const hamburger = document.querySelector(".hamburger");
  const menuPpal = document.querySelector(".menuppal");
  const headerNav = document.querySelector(".header__nav");

  // esto es para abrir/cerrar el menu
  function toggleMenu(event) {
    hamburger.classList.toggle("is-active");
    menuPpal.classList.toggle("is_active");

    // esto hace la animacion de las lineas
    const layers = hamburger.querySelectorAll("._layer");
    layers.forEach((layer) => {
      layer.classList.toggle("active");
    });

    event.preventDefault();
  }

  // si no tiene las lineas las creamos
  if (!hamburger.querySelector("._layer")) {
    for (let i = 0; i < 3; i++) {
      const layer = document.createElement("div");
      layer.className = "_layer";
      hamburger.appendChild(layer);
    }
  }

  // Actualizar visibilidad del menú según el tamaño de pantalla
  function updateMenuVisibility() {
    const isLargeScreen = window.innerWidth >= 1474;
    
    if (isLargeScreen) {
      headerNav.style.display = "block";
      hamburger.style.display = "none";
      menuPpal.classList.remove("is_active");
      hamburger.classList.remove("is-active");
    } else {
      headerNav.style.display = "none";
      hamburger.style.display = "block";
    }
  }

  // Inicializar y actualizar cuando cambie el tamaño
  updateMenuVisibility();
  window.addEventListener("resize", updateMenuVisibility);

  // cuando haces click en el boton
  hamburger.addEventListener("click", toggleMenu);

  // para cerrar el menu
  function closeMenu() {
    hamburger.classList.remove("is-active");
    menuPpal.classList.remove("is_active");
  }

  // cerrar cuando haces click en un link
  menuPpal.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // cerrar cuando haces click fuera del menu
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !menuPpal.contains(e.target)) {
      closeMenu();
    }
  });

  // esto es para los botones de login/registro
  function moveAuthButtons() {
    const authButtons = document.getElementById("auth-buttons");
    const menuPpal = document.querySelector(".menuppal ul");
    
    if (!authButtons || !menuPpal) return;
    
    // crear los botones en el menu movil
    let mobileAuthButtons = document.querySelector(".auth-buttons-mobile");
    if (!mobileAuthButtons) {
        mobileAuthButtons = document.createElement("div");
        mobileAuthButtons.className = "auth-buttons-mobile";
        mobileAuthButtons.innerHTML = authButtons.innerHTML;
        menuPpal.parentNode.insertBefore(mobileAuthButtons, menuPpal.nextSibling);
    }
    
    // mostrar/ocultar botones segun el tamaño de pantalla
    function updateAuthButtonsVisibility() {
        const isLargeScreen = window.innerWidth >= 1474;
        const isLoggedIn = SessionManager.checkSession();

        // Si el usuario está logueado, ocultar ambos conjuntos de botones
        if (isLoggedIn) {
            authButtons.style.display = "none";
            mobileAuthButtons.style.display = "none";
            return;
        }

        // Si no está logueado, mostrar los botones según el tamaño de pantalla
        if (isLargeScreen) {
            authButtons.style.display = "flex";
            mobileAuthButtons.style.display = "none";
        } else {
            authButtons.style.display = "none";
            mobileAuthButtons.style.display = "flex";
        }
    }
    
    // actualizar cuando cambia el tamaño
    updateAuthButtonsVisibility();
    window.addEventListener("resize", updateAuthButtonsVisibility);
  }

  // ejecutar cuando carga la pagina
  moveAuthButtons();
});
