(function(window) {
    'use strict';

    window.ViewStateController = window.Controller.extend({

        view_state: {
            inject: 'viewstate'
        },

        change_view_state: {
            sub: 'view/change',
            value: function(state) {
                this.view_state.state = state;
            }
        }

    });

})(window);
