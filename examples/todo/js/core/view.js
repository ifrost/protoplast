(function (window) {
    'use strict';

    window.View = window.ProtoplastExt.Component.extend(function() {
        window.ProtoplastExt.Component.call(this);
        this.$root = d3.select(this.root);
    }).meta({
        inject: {pub: 'pub'}
    });

})(window);
