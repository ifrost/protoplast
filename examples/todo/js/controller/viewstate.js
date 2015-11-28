(function(window) {
    'use strict';

    window.ViewStateController = window.Controller.extend({

        view_state: {
            inject: 'viewstate'
        },

        injected: function() {
            this.sub('view/change').add(this.change_view_state);
        },

        change_view_state: function(state) {
            this.view_state.change(state);
        }

    });

})(window);
