(function(window) {
    'use strict';

    window.Presenter = window.Protoplast.extend({

        $meta: {
            constructors: [Protoplast.constructors.autobind]
        },

        pub: {
            inject: 'pub'
        },

        init: {
            inject_init: true,
            value: function() {}
        }
    });

})(window);