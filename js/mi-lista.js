document.addEventListener('DOMContentLoaded', function () {
    var tableBody = document.querySelector('.shopping-table tbody');
    var addInput = document.querySelector('.add-item input');
    var addButton = document.querySelector('.add-item .button--primary');
    var exportButton = document.getElementById('export-list-button');
    var session = SessionManager.checkSession();
    var products = [];
    var currentRows = [];

    if (!session || !session.id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    async function getUserRows() {
        var userRows = await ApiClient.get('/saved-lists/user/' + session.id_usuario);
        var productRows = await ApiClient.get('/products');
        products = productRows;
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
            var productName = row.nombre_producto || (product ? product.nombre : 'Producto #' + row.id_producto);

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
            currentRows = userRows;
            renderRows(userRows);
        } catch (error) {
            console.error(error);
        }
    }

    function exportListAsJson() {
        var dataToExport = {
            generated_at: new Date().toISOString(),
            user_id: session.id_usuario,
            rows: currentRows
        };
        var dataString = JSON.stringify(dataToExport, null, 2);
        var fileBlob = new Blob([dataString], { type: 'application/json' });
        var temporaryUrl = URL.createObjectURL(fileBlob);
        var downloadLink = document.createElement('a');
        downloadLink.href = temporaryUrl;
        downloadLink.download = 'mi-lista-' + session.id_usuario + '.json';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(temporaryUrl);
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

    if (exportButton) {
        exportButton.addEventListener('click', function () {
            exportListAsJson();
        });
    }

    refreshList();
});
