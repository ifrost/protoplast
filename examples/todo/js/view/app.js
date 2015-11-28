(function(window) {
    'use strict';

    var HeaderView = window.HeaderView,
        MainView = window.MainView,
        FooterView = window.FooterView;

    window.AppView = window.View.extend({

        tag: 'section',

        init: function() {

            this.$root.classed('todoapp', true);

            this.add(HeaderView.create());
            this.add(MainView.create());
            this.add(FooterView.create());
        }

    });

})(window);
