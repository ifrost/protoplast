(function(window) {
    'use strict';

    window.Model = window.Protoplast.extend([window.Protoplast.Dispatcher]);
    
    window.Model.auto_update = {
        proto: function(fn) {
            return function() {
                var result = fn.apply(this, arguments);
                this.dispatch('updated');
                return result;
            }
        }
    }


})(window);
