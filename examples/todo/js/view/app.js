(function(window) {
    'use strict';

    var HeaderView = window.HeaderView,
        MainView = window.MainView,
        FooterView = window.FooterView;

    window.AppView = window.View.extend({

        html: '<section class="todoapp">' +
            '<div data-comp="header"></div>' +
            '<div data-comp="main"></div>' +
            '<div data-comp="footer"></div>' +
        '</section>',

        header: {
            component: HeaderView
        },

        main: {
            component: MainView
        },

        footer: {
            component: FooterView
        }

    });

})(window);
