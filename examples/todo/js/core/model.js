(function (window) {
    'use strict';

    window.Model = window.Protoplast.extend([window.Dispatcher]);

    window.Model.auto_update = function(constructor) {
        window.Aop(constructor).aop(constructor.__meta__.update_after, {
            after: function() {
                this.dispatch('updated');
            }
        })
    };


})(window);
