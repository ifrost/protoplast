(function(window) {
    'use strict';

    var url_to_state = {
        '/': window.ViewStateModel.ALL,
        '/active': window.ViewStateModel.UNDONE,
        '/completed': window.ViewStateModel.DONE
    };

    window.Router = window.Protoplast.extend({

        pub: {
            inject: 'pub'
        },

        $create: function() {
            window.addEventListener('hashchange', this.route.bind(this));
            window.addEventListener('load', this.route.bind(this));
        },

        route: function() {
            var url = location.hash.slice(1) || '/';
            if (url_to_state[url]) {
                this.pub('view/change', url_to_state[url]);
            }
        }
    });

})(window);
