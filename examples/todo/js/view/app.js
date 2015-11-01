(function (window) {
    'use strict';

    var HeaderView = window.HeaderView,
        MainView = window.MainView,
        FooterView = window.FooterView;

    window.AppView = window.View.extend(function(proto, base, meta){

        meta.tag = 'section';

        proto.create = function() {

            this.$root.classed('todoapp', true)

            this.add(HeaderView());
            this.add(MainView());
            this.add(FooterView());
        }

    });

})(window);
