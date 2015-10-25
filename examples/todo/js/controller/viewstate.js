(function (window) {
    'use strict';

    window.ViewStateController = window.Controller.extend(function(proto, base, config){

        config.inject = {get_view_state: 'viewstate'};

        proto.init = function() {
            this.sub('view/change').add(this.change_view_state);
        };

        proto.change_view_state = function(state){
            this.get_view_state().change(state);
        };

    });

})(window);
