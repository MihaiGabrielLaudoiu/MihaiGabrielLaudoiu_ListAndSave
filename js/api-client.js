(function initApiClient(globalScope) {
    var isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    var API_BASE_URL = isHttp ? window.location.origin + '/api' : 'http://localhost:3000/api';

    async function request(path, options) {
        var requestOptions = options || {};
        var customHeaders = requestOptions.headers || {};
        var mergedHeaders = {
            'Content-Type': 'application/json'
        };
        var headerName;
        var finalRequestOptions = {};
        var optionName;
        for (headerName in customHeaders) {
            mergedHeaders[headerName] = customHeaders[headerName];
        }
        for (optionName in requestOptions) {
            finalRequestOptions[optionName] = requestOptions[optionName];
        }
        finalRequestOptions.headers = mergedHeaders;
        var response = await fetch(API_BASE_URL + path, finalRequestOptions);

        if (response.status === 204) {
            return null;
        }

        var rawResponse = await response.text();
        var responseData = null;
        try {
            responseData = rawResponse ? JSON.parse(rawResponse) : null;
        } catch (_error) {
            if (!response.ok) {
                throw new Error('Respuesta invalida del servidor (' + response.status + ')');
            }
            throw new Error('El servidor devolvio un formato no JSON');
        }

        if (!response.ok) {
            throw new Error((responseData && responseData.message) || 'Error en la peticion');
        }
        return responseData;
    }

    globalScope.ApiClient = {
        get: function (path) {
            return request(path);
        },
        post: function (path, body) {
            return request(path, { method: 'POST', body: JSON.stringify(body) });
        },
        put: function (path, body) {
            return request(path, { method: 'PUT', body: JSON.stringify(body) });
        },
        delete: function (path) {
            return request(path, { method: 'DELETE' });
        }
    };
})(window);
