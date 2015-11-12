(function(window){

    window.Storage = window.Protoplast.extend().define({

        store_id: function(id) {
            this.id = id;
        },

        store_save: function(value) {
            var json = JSON.stringify(value);
            window.localStorage.setItem(this.id, json);
        },

        store_read: function() {
            var json = window.localStorage.getItem(this.id);
            return JSON.parse(json);
        }

    });

})(window);