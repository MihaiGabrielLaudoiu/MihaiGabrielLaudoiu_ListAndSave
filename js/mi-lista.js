document.addEventListener('DOMContentLoaded', function () {
    var tableBody = document.querySelector('.shopping-table tbody');
    var addInput = document.querySelector('.add-item input');
    var addButton = document.querySelector('.add-item .button--primary');
    var session = SessionManager.checkSession();
    var products = [];

    if (!session || !session.id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    async function getUserRows() {
        var savedRows = await ApiClient.get('/saved-lists');
        var productRows = await ApiClient.get('/products');
        var userRows = [];
        var i;

        products = productRows;

        for (i = 0; i < savedRows.length; i++) {
            if (savedRows[i].id_usuario === session.id_usuario) {
                userRows.push(savedRows[i]);
            }
        }

        return userRows;
    }

    function getProductById(productId) {
        var i;
        for (i = 0; i < products.length; i++) {
            if (products[i].id_producto === productId) {
                return products[i];
            }
        }
        return null;
    }

    function normalizeText(text) {
        if (!text) {
            return '';
        }
        return text.trim().toLowerCase();
    }

    function renderRows(rows) {
        var htmlRows = '';
        var i;

        if (!tableBody) {
            return;
        }

        for (i = 0; i < rows.length; i++) {
            var row = rows[i];
            var product = getProductById(row.id_producto);
            var productName = product ? product.nombre : 'Producto #' + row.id_producto;

            htmlRows += '<tr data-id="' + row.id_lista + '">';
            htmlRows += '<td>' + productName + '</td>';
            htmlRows += '<td>' + row.cantidad + '</td>';
            htmlRows += '<td class="best-price">-</td>';
            htmlRows += '<td><div class="actions">';
            htmlRows += '<button class="button button--secondary" data-action="delete" data-id="' + row.id_lista + '">Eliminar</button>';
            htmlRows += '</div></td>';
            htmlRows += '</tr>';
        }

        tableBody.innerHTML = htmlRows;
    }

    async function refreshList() {
        try {
            var userRows = await getUserRows();
            renderRows(userRows);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleAddClick() {
        var searchText = addInput ? normalizeText(addInput.value) : '';
        var i;
        var foundProduct = null;

        if (!searchText) {
            return;
        }

        for (i = 0; i < products.length; i++) {
            var productName = normalizeText(products[i].nombre);
            if (productName.indexOf(searchText) !== -1) {
                foundProduct = products[i];
                break;
            }
        }

        if (!foundProduct) {
            alert('No se encontro un producto con ese nombre');
            return;
        }

        await ApiClient.post('/saved-lists', {
            id_usuario: session.id_usuario,
            id_producto: foundProduct.id_producto,
            cantidad: 1
        });

        if (addInput) {
            addInput.value = '';
        }

        await refreshList();
    }

    async function handleDeleteClick(event) {
        var clickedElement = event.target;
        var actionName = clickedElement.getAttribute('data-action');
        if (actionName === 'delete') {
            var rowId = clickedElement.getAttribute('data-id');
            await ApiClient.delete('/saved-lists/' + rowId);
            await refreshList();
        }
    }

    if (addButton) {
        addButton.addEventListener('click', handleAddClick);
    }

    if (tableBody) {
        tableBody.addEventListener('click', function (event) {
            handleDeleteClick(event);
        });
    }

    refreshList();
});
