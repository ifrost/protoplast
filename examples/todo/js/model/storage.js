(function(window){

    window.Storage = window.Proto.extend(function(proto){

        proto.store_id = function(id) {
            this.id = id;
        };

        proto.store_save = function(value) {
            var json = JSON.stringify(value);
            window.localStorage.setItem(this.id, json);
        };

        proto.store_read = function(value) {
            var json = window.localStorage.getItem(this.id);
            return JSON.parse(json);
        }

    });

})(window);