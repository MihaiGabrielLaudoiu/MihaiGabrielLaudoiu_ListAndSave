document.addEventListener('DOMContentLoaded', async function () {
    var featuredGrid = document.querySelector('.featured-products__grid');
    var allProductsGrid = document.querySelector('.all-products__grid');
    var searchInput = document.querySelector('.products-search__input');
    var categorySelect = document.querySelector('.products-search__category');

    var products = [];
    var categories = {};

    function renderProductCard(product) {
        return '<article class="product-card">' +
            '<h3>' + product.nombre + '</h3>' +
            '<p>' + (product.marca || 'Sin marca') + '</p>' +
            '<small>EAN: ' + (product.codigo_barras_ean || 'N/A') + '</small>' +
            '</article>';
    }

    function renderProducts(filteredProducts) {
        var html = '';
        var i;
        for (i = 0; i < filteredProducts.length; i++) {
            html += renderProductCard(filteredProducts[i]);
        }
        if (featuredGrid) featuredGrid.innerHTML = html;
        if (allProductsGrid) allProductsGrid.innerHTML = html;
    }

    function renderCategories() {
        var categoryName;
        if (!categorySelect) {
            return;
        }
        for (categoryName in categories) {
            categorySelect.innerHTML += '<option value="' + categoryName + '">' + categoryName + '</option>';
        }
    }

    function applyFilters() {
        var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selectedCategory = categorySelect ? categorySelect.value : '';
        var filtered = [];
        var i;

        for (i = 0; i < products.length; i++) {
            var currentProduct = products[i];
            var productName = (currentProduct.nombre || '').toLowerCase();
            var productBrand = (currentProduct.marca || '').toLowerCase();
            var categoryName = currentProduct.categoria || '';
            var matchTerm = !term || productName.indexOf(term) !== -1 || productBrand.indexOf(term) !== -1;
            var matchCategory = !selectedCategory || selectedCategory === categoryName;
            if (matchTerm && matchCategory) {
                filtered.push(currentProduct);
            }
        }

        renderProducts(filtered);
    }

    try {
        products = await ApiClient.get('/products');
        var i;
        for (i = 0; i < products.length; i++) {
            var categoryName = products[i].categoria || '';
            if (categoryName) {
                categories[categoryName] = true;
            }
        }
        renderCategories();
        renderProducts(products);
    } catch (error) {
        console.error(error);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            applyFilters();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', function () {
            applyFilters();
        });
    }
});
