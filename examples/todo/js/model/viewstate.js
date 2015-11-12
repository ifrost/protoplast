(function(window) {
    'use strict';

    window.ViewStateModel = window.Model.extend({

        __meta__: {
            update_after: ['change']
        },

        __init__: function() {
            this._state = window.ViewStateModel.ALL;
        },

        change: function(state) {
            this._state = state;
        },

        get_state: function() {
            return this._state;
        }
    });

    window.ViewStateModel.ALL = 'all';
    window.ViewStateModel.DONE = 'done';
    window.ViewStateModel.UNDONE = 'undone';

    window.Model.auto_update(window.ViewStateModel);

})(window);
