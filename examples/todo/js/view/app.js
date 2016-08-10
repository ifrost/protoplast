(function(window) {
    'use strict';

    window.AppView = window.View.extend({

        html: '<section class="todoapp">' +
            '<header-view></header-view>' +
            '<main-view></main-view>' +
            '<footer-view></footer-view>' +
        '</section>'

    });

})(window);
