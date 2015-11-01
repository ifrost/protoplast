(function (window) {
    'use strict';

    window.ViewStateController = window.Controller.extend(function(proto, base, meta){

        meta.inject = {view_state: 'viewstate'};

        proto.injected = function() {
            this.sub('view/change').add(this.change_view_state);
        };

        proto.change_view_state = function(state){
            this.view_state.change(state);
        };

    });

})(window);
