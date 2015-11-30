(function(window) {
    'use strict';

    window.Model = window.Protoplast.extend([window.Protoplast.Dispatcher]);

    window.Model.auto_update = function(proto) {
        window.Protoplast.Aop(proto).aop(proto.$meta.update_after, {
            after: function() {
                this.dispatch('updated');
            }
        });
    };


})(window);
