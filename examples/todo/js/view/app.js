(function(window) {
    'use strict';

    var HeaderView = window.HeaderView,
        MainView = window.MainView,
        FooterView = window.FooterView;

    window.AppView = window.View.extend({

        tag: 'section',

        create: function() {

            this.$root.classed('todoapp', true);

            this.add(new HeaderView());
            this.add(new MainView());
            this.add(new FooterView());
        }

    });

})(window);
