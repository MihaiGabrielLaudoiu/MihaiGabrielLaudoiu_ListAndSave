document.addEventListener('DOMContentLoaded', async function () {
    var featuredGrid = document.querySelector('.featured-products__grid');
    var allProductsGrid = document.querySelector('.all-products__grid');
    var searchInput = document.querySelector('.products-search__input');
    var categorySelect = document.querySelector('.products-search__category');
    var paginationContainer = document.querySelector('.all-products__pagination');

    var products = [];
    var categories = {};
    var filteredProducts = [];
    var currentPage = 1;
    var pageSize = 8;

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
        var startIndex = (currentPage - 1) * pageSize;
        var endIndex = startIndex + pageSize;
        var pagedProducts = filteredProducts.slice(startIndex, endIndex);
        for (i = 0; i < pagedProducts.length; i++) {
            html += renderProductCard(pagedProducts[i]);
        }
        if (featuredGrid) featuredGrid.innerHTML = html;
        if (allProductsGrid) allProductsGrid.innerHTML = html;
    }

    function renderPagination(totalItems) {
        if (!paginationContainer) {
            return;
        }
        var totalPages = Math.ceil(totalItems / pageSize);
        var html = '';
        var pageNumber;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        for (pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            if (pageNumber === currentPage) {
                html += '<button class="button button--primary" data-page="' + pageNumber + '">' + pageNumber + '</button> ';
            } else {
                html += '<button class="button button--secondary" data-page="' + pageNumber + '">' + pageNumber + '</button> ';
            }
        }
        paginationContainer.innerHTML = html;
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

        filteredProducts = filtered;
        currentPage = 1;
        renderProducts(filteredProducts);
        renderPagination(filteredProducts.length);
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
        filteredProducts = products;
        renderProducts(filteredProducts);
        renderPagination(filteredProducts.length);
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

    if (paginationContainer) {
        paginationContainer.addEventListener('click', function (event) {
            var pageValue = event.target.getAttribute('data-page');
            if (!pageValue) {
                return;
            }
            currentPage = Number(pageValue);
            renderProducts(filteredProducts);
            renderPagination(filteredProducts.length);
        });
    }
});
