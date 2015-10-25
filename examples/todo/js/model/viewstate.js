(function (window) {
    'use strict';

    window.ViewStateModel = window.Model.extend(function(proto, base, config){

        config.update_after = ['change'];

        proto.init = function() {
            this._state = window.ViewStateModel.ALL;
        };

        proto.change = function(state) {
            this._state = state;
        };

        proto.get_state = function() {
            return this._state;
        }
    });

    window.ViewStateModel.ALL = 'all';
    window.ViewStateModel.DONE = 'done';
    window.ViewStateModel.UNDONE = 'undone';

})(window);
