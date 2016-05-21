(function(window) {
    'use strict';

    var auto_update = window.Model.auto_update;

    window.ViewStateModel = window.Model.extend({

        $meta: {
            update_after: ['change']
        },

        $create: function() {
            this._state = window.ViewStateModel.ALL;
        },

        change: {
            hooks: [auto_update],
            value: function(state) {
                this._state = state;
            }
        },

        get_state: function() {
            return this._state;
        }
    });

    window.ViewStateModel.ALL = 'all';
    window.ViewStateModel.DONE = 'done';
    window.ViewStateModel.UNDONE = 'undone';
    
})(window);
