(function (window) {
    'use strict';

    window.Model = window.Proto.extend(function(proto, base, config){
        config.mixin = [window.Proto.Dispatcher];

        proto._update = function() {
            this.dispatch('updated');
        };
    });

})(window);
