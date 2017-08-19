(function(window) {
    'use strict';

    window.Presenter = window.Protoplast.Model.extend({

        $meta: {
            constructors: [Protoplast.constructors.autobind]
        },

        pub: {
            inject: 'pub'
        },

        init: {
            injectInit: true,
            value: function() {}
        }
    });

})(window);
