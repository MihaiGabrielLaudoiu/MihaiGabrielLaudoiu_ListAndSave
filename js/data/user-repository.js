(function initUserRepository(globalScope) {
    var UserRepository = {
        getAll: async function () {
            return globalScope.ApiClient.get('/users');
        },

        findByEmail: async function (email) {
            var usersFromDatabase = await this.getAll();
            for (var userIndex = 0; userIndex < usersFromDatabase.length; userIndex++) {
                if (usersFromDatabase[userIndex].email === email) {
                    return usersFromDatabase[userIndex];
                }
            }
            return null;
        },

        add: async function (userData) {
            return globalScope.ApiClient.post('/users', userData);
        },

        updateById: async function (idUsuario, partialData) {
            return globalScope.ApiClient.put('/users/' + idUsuario, partialData);
        }
    };

    globalScope.UserRepository = UserRepository;
})(window);
