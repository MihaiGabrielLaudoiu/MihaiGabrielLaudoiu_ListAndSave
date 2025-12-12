document.addEventListener('DOMContentLoaded', function () {
    var shoppingTableBodyElement = document.querySelector('.shopping-table tbody');
    var addProductInputElement = document.querySelector('.add-item input');
    var addProductButtonElement = document.querySelector('.add-item .button--primary');
    var activeSessionData = SessionManager.checkSession();
    var allProductsFromDatabase = [];

    if (!activeSessionData || !activeSessionData.id_usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Esta funcion carga la lista del usuario activo y todos los productos.
    async function getRowsForCurrentUserList() {
        var savedListRows = await ApiClient.get('/saved-lists');
        var allProductsRows = await ApiClient.get('/products');
        var filteredRowsForUser = [];
        var rowIndex;

        allProductsFromDatabase = allProductsRows;

        for (rowIndex = 0; rowIndex < savedListRows.length; rowIndex++) {
            if (savedListRows[rowIndex].id_usuario === activeSessionData.id_usuario) {
                filteredRowsForUser.push(savedListRows[rowIndex]);
            }
        }

        return filteredRowsForUser;
    }

    function getProductByIdentifier(productIdentifier) {
        var productIndex;
        for (productIndex = 0; productIndex < allProductsFromDatabase.length; productIndex++) {
            if (allProductsFromDatabase[productIndex].id_producto === productIdentifier) {
                return allProductsFromDatabase[productIndex];
            }
        }
        return null;
    }

    // Esta funcion normaliza el texto para comparar sin errores por espacios o mayusculas.
    function normalizeTextForSearch(rawTextValue) {
        if (!rawTextValue) {
            return '';
        }
        return rawTextValue.trim().toLowerCase();
    }

    function renderRowsInShoppingTable(rowsToRender) {
        var htmlRows = '';
        var rowIndex;

        if (!shoppingTableBodyElement) {
            return;
        }

        for (rowIndex = 0; rowIndex < rowsToRender.length; rowIndex++) {
            var currentRowData = rowsToRender[rowIndex];
            var productDataForRow = getProductByIdentifier(currentRowData.id_producto);
            var productNameToShow = productDataForRow ? productDataForRow.nombre : 'Producto #' + currentRowData.id_producto;

            htmlRows += '<tr data-id="' + currentRowData.id_lista + '">';
            htmlRows += '<td>' + productNameToShow + '</td>';
            htmlRows += '<td>' + currentRowData.cantidad + '</td>';
            htmlRows += '<td class="best-price">-</td>';
            htmlRows += '<td><div class="actions">';
            htmlRows += '<button class="button button--secondary" data-action="delete" data-id="' + currentRowData.id_lista + '">Eliminar</button>';
            htmlRows += '</div></td>';
            htmlRows += '</tr>';
        }

        shoppingTableBodyElement.innerHTML = htmlRows;
    }

    async function refreshCurrentUserList() {
        try {
            var rowsForCurrentUser = await getRowsForCurrentUserList();
            renderRowsInShoppingTable(rowsForCurrentUser);
        } catch (error) {
            console.error(error);
        }
    }

    // Esta funcion intenta guardar un producto nuevo en la lista del usuario.
    async function handleAddProductButtonClick() {
        var searchTermFromInput = addProductInputElement ? normalizeTextForSearch(addProductInputElement.value) : '';
        var productIndex;
        var productFoundByName = null;

        if (!searchTermFromInput) {
            return;
        }

        for (productIndex = 0; productIndex < allProductsFromDatabase.length; productIndex++) {
            var currentProductName = normalizeTextForSearch(allProductsFromDatabase[productIndex].nombre);
            if (currentProductName.indexOf(searchTermFromInput) !== -1) {
                productFoundByName = allProductsFromDatabase[productIndex];
                break;
            }
        }

        if (!productFoundByName) {
            alert('No se encontro un producto con ese nombre');
            return;
        }

        await ApiClient.post('/saved-lists', {
            id_usuario: activeSessionData.id_usuario,
            id_producto: productFoundByName.id_producto,
            cantidad: 1
        });

        if (addProductInputElement) {
            addProductInputElement.value = '';
        }

        await refreshCurrentUserList();
    }

    async function handleDeleteActionInTable(event) {
        var clickedElement = event.target;
        var actionName = clickedElement.getAttribute('data-action');
        if (actionName === 'delete') {
            var rowIdentifierToDelete = clickedElement.getAttribute('data-id');
            await ApiClient.delete('/saved-lists/' + rowIdentifierToDelete);
            await refreshCurrentUserList();
        }
    }

    if (addProductButtonElement) {
        addProductButtonElement.addEventListener('click', handleAddProductButtonClick);
    }

    if (shoppingTableBodyElement) {
        shoppingTableBodyElement.addEventListener('click', function (event) {
            handleDeleteActionInTable(event);
        });
    }

    refreshCurrentUserList();
});
