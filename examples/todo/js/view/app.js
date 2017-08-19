(function(window) {
    'use strict';

    window.AppView = window.View.extend({

        html: '<section class="todoapp">' +
            '<div data-comp="header"></div>' +
            '<div data-comp="main"></div>' +
            '<div data-comp="footer"></div>' +
        '</section>',

        header: {
            component: window.HeaderView
        },

        main: {
            component: window.MainView
        },

        footer: {
            component: window.FooterView
        }

    });

})(window);
