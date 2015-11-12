(function (window) {
    'use strict';

    var HeaderView = window.HeaderView,
        MainView = window.MainView,
        FooterView = window.FooterView;

    window.AppView = window.View.extend().define({

        create:function() {

            this.$root.classed('todoapp', true)

            this.add(new HeaderView());
            this.add(new MainView());
            this.add(new FooterView());
        }

    }).meta({tag: 'section'});

})(window);
