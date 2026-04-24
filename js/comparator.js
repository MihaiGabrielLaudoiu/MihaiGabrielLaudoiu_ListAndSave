document.addEventListener('DOMContentLoaded', async () => {
    const select1 = document.getElementById('product1');
    const select2 = document.getElementById('product2');
    const details1 = document.getElementById('details1');
    const details2 = document.getElementById('details2');

    let productStoreRows = [];

    try {
        const [products, supermarkets, productStores, prices] = await Promise.all([
            ApiClient.get('/products'),
            ApiClient.get('/supermarkets'),
            ApiClient.get('/product-stores'),
            ApiClient.get('/prices')
        ]);

        const productsById = new Map(products.map((p) => [p.id_producto, p]));
        const supermarketsById = new Map(supermarkets.map((s) => [s.id_supermercado, s]));
        const lastPriceByStore = new Map();

        prices.forEach((price) => {
            const previous = lastPriceByStore.get(price.id_producto_tienda);
            if (!previous || new Date(price.fecha_extraccion) > new Date(previous.fecha_extraccion)) {
                lastPriceByStore.set(price.id_producto_tienda, price);
            }
        });

        productStoreRows = productStores
            .map((row) => {
                const product = productsById.get(row.id_producto);
                const supermarket = supermarketsById.get(row.id_supermercado);
                const currentPrice = lastPriceByStore.get(row.id_producto_tienda);
                if (!product || !supermarket) return null;
                return { ...row, product, supermarket, currentPrice };
            })
            .filter(Boolean);

        productStoreRows.forEach((row) => {
            const option1 = document.createElement('option');
            option1.value = row.id_producto_tienda;
            option1.textContent = `${row.product.nombre} - ${row.supermarket.nombre_supermercado}`;
            select1.appendChild(option1);

            const option2 = option1.cloneNode(true);
            select2.appendChild(option2);
        });
    } catch (error) {
        console.error(error);
    }

    function renderDetails(targetElement, productStoreId) {
        if (!productStoreId) {
            targetElement.innerHTML = '';
            return;
        }
        const selected = productStoreRows.find((item) => item.id_producto_tienda === Number(productStoreId));
        if (!selected) {
            targetElement.innerHTML = '';
            return;
        }

        targetElement.innerHTML = `
            <div class="comparator__detail-item">
                <span class="comparator__detail-label">Producto:</span>
                <span class="comparator__detail-value">${selected.product.nombre}</span>
            </div>
            <div class="comparator__detail-item">
                <span class="comparator__detail-label">Marca:</span>
                <span class="comparator__detail-value">${selected.product.marca || '-'}</span>
            </div>
            <div class="comparator__detail-item">
                <span class="comparator__detail-label">Supermercado:</span>
                <span class="comparator__detail-value">${selected.supermarket.nombre_supermercado}</span>
            </div>
            <div class="comparator__detail-item">
                <span class="comparator__detail-label">Precio:</span>
                <span class="comparator__detail-value comparator__detail-value--highlight">${selected.currentPrice ? `${selected.currentPrice.precio_actual} EUR` : 'Sin precio'}</span>
            </div>
        `;
    }

    select1?.addEventListener('change', (event) => renderDetails(details1, event.target.value));
    select2?.addEventListener('change', (event) => renderDetails(details2, event.target.value));
});