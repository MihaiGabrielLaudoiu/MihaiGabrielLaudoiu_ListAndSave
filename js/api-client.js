(function initApiClient(globalScope) {
    var isHttpProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    var API_BASE_URL = isHttpProtocol ? window.location.origin + '/api' : 'http://localhost:3000/api';

    async function request(path, options) {
        var requestOptions = options || {};
        var extraHeaders = requestOptions.headers || {};
        var mergedHeaders = {
            'Content-Type': 'application/json'
        };
        var headerName;
        var finalRequestOptions = {};
        var requestOptionName;
        for (headerName in extraHeaders) {
            mergedHeaders[headerName] = extraHeaders[headerName];
        }
        for (requestOptionName in requestOptions) {
            finalRequestOptions[requestOptionName] = requestOptions[requestOptionName];
        }
        finalRequestOptions.headers = mergedHeaders;
        var response = await fetch(API_BASE_URL + path, finalRequestOptions);

        if (response.status === 204) {
            return null;
        }

        var rawTextFromServer = await response.text();
        var parsedResponseData = null;
        try {
            parsedResponseData = rawTextFromServer ? JSON.parse(rawTextFromServer) : null;
        } catch (_error) {
            if (!response.ok) {
                throw new Error('Respuesta invalida del servidor (' + response.status + ')');
            }
            throw new Error('El servidor devolvio un formato no JSON');
        }

        if (!response.ok) {
            throw new Error((parsedResponseData && parsedResponseData.message) || 'Error en la peticion');
        }
        return parsedResponseData;
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
