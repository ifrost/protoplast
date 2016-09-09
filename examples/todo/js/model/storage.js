(function(window) {

    window.Storage = window.Protoplast.extend({

        storeId: function(id) {
            this.id = id;
        },

        storeSave: function(value) {
            var json = JSON.stringify(value);
            window.localStorage.setItem(this.id, json);
        },

        storeRead: function() {
            var json = window.localStorage.getItem(this.id);
            return JSON.parse(json);
        }

    });

})(window);