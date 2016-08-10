(function(window) {
    'use strict';

    window.View = window.Protoplast.TagComponent.extend([window.Protoplast.Dispatcher], {

        $meta: {
            constructors: [Protoplast.constructors.autobind],
            element_wrapper: d3.select.bind(d3)
        },

        pub: {
            inject: 'pub'
        },

        $create: function() {
            this.$root = d3.select(this.root);
        }
    });

})(window);
