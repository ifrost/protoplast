(function (window) {
    'use strict';

    window.Router = window.Protoplast.extend(function(proto, base, config){

        config.inject = {
            pub: 'pub'
        };

        var url_to_state = {
            '/': window.ViewStateModel.ALL,
            '/active': window.ViewStateModel.UNDONE,
            '/completed': window.ViewStateModel.DONE
        };

        proto.init = function() {
            window.addEventListener('hashchange', this.route.bind(this));
            window.addEventListener('load', this.route.bind(this));
        };

        proto.route = function() {
            var url = location.hash.slice(1) || '/';
            if (url_to_state[url]) {
                this.pub('view/change', url_to_state[url]);
            }
        }

    });

})(window);
