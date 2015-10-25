(function (window) {
    'use strict';

    window.View = window.Proto.extend(function(proto, base, config){
        config.inject = {pub: 'pub'};
    });

})(window);
