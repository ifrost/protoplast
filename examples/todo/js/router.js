(function (window) {
    'use strict';

    window.Router = window.Proto.extend(function(proto, base, config){
        config.inject.pub = 'pub';
        config.inject.get_view_state = 'viewstate';

        proto.init = function() {
            window.addEventListener('hashchange', this.route.bind(this));
            window.addEventListener('load', this.route.bind(this));
        };

        proto.route = function() {
            var url = location.hash.slice(1) || '/';
            if (url === '/') {
                this.pub('view/change', window.ViewStateModel.ALL);
            }
            else if (url === '/active') {
                this.pub('view/change', window.ViewStateModel.UNDONE);
            }
            else if (url === '/completed') {
                this.pub('view/change', window.ViewStateModel.DONE);
            }
        }

    });

})(window);
