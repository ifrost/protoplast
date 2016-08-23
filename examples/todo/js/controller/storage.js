(function(window) {
    'use strict';

    window.StorageController = window.StorageController.extend({

        view_state: {
            inject: 'viewstate'
        },

        todos: {
            inject: 'todos'
        },

        storage: {
            inject: 'storage'
        },

        change_view_state: {
            sub: 'view/change',
            value: function(state) {
                this.view_state.state = state;
            }
        }

    });

})(window);
