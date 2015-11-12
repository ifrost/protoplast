(function (window) {
    'use strict';

    window.View = window.ProtoplastExt.Component.extend({
        __meta__: {
            inject: {pub: 'pub'}
        },

        __init__: function() {
            window.ProtoplastExt.Component.call(this);
            this.$root = d3.select(this.root);
        }
    });

})(window);
