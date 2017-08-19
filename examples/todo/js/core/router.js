(function(window) {
    'use strict';

    var urlToState = {
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
            if (urlToState[url]) {
                this.pub('view/change', urlToState[url]);
            }
        }
    });

})(window);
