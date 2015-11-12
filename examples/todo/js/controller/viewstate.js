(function (window) {
    'use strict';

    window.ViewStateController = window.Controller.extend({

        __meta__: {
            inject: {view_state: 'viewstate'}
        },

       injected: function() {
            this.sub('view/change').add(this.change_view_state);
        },

       change_view_state: function(state){
            this.view_state.change(state);
        }

    });

})(window);
