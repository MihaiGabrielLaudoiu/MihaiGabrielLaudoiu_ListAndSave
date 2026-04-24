document.addEventListener('DOMContentLoaded', async () => {
    const featuredGrid = document.querySelector('.featured-products__grid');
    const allProductsGrid = document.querySelector('.all-products__grid');
    const searchInput = document.querySelector('.products-search__input');

    let products = [];

    function renderProductCard(product) {
        return `
            <article class="product-card">
                <h3>${product.nombre}</h3>
                <p>${product.marca || 'Sin marca'}</p>
                <small>EAN: ${product.codigo_barras_ean || 'N/A'}</small>
            </article>
        `;
    }

    function renderProducts(filteredProducts) {
        const html = filteredProducts.map(renderProductCard).join('');
        if (featuredGrid) featuredGrid.innerHTML = html;
        if (allProductsGrid) allProductsGrid.innerHTML = html;
    }

    try {
        products = await ApiClient.get('/products');
        renderProducts(products);
    } catch (error) {
        console.error(error);
    }

    searchInput?.addEventListener('input', (event) => {
        const term = event.target.value.trim().toLowerCase();
        const filtered = products.filter((product) => {
            return (
                product.nombre.toLowerCase().includes(term) ||
                (product.marca || '').toLowerCase().includes(term)
            );
        });
        renderProducts(filtered);
    });
});
