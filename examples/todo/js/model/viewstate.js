(function (window) {
    'use strict';

    window.ViewStateModel = window.Model.extend(function() {
        this._state = window.ViewStateModel.ALL;
    }).define({

        change: function(state) {
            this._state = state;
        },

        get_state: function() {
            return this._state;
        }
    }).meta({
        update_after: ['change']
    });

    window.ViewStateModel.ALL = 'all';
    window.ViewStateModel.DONE = 'done';
    window.ViewStateModel.UNDONE = 'undone';

    window.Model.auto_update(window.ViewStateModel);

})(window);
