(function(window) {
    'use strict';

    window.ViewStateController = window.Controller.extend({

        viewState: {
            inject: 'viewstate'
        },

        changeViewState: {
            sub: 'view/change',
            value: function(state) {
                this.viewState.state = state;
            }
        }

    });

})(window);
