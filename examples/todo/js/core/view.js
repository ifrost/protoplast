(function (window) {
    'use strict';

    window.View = window.Component.extend(function(proto, base, meta){

        meta.inject = {pub: 'pub'};

        proto.init = function() {
            base.init.call(this);
            this.$root = d3.select(this.root);
        }
    });

})(window);
