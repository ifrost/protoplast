(function(window) {
    'use strict';

    window.InfoView = window.View.extend({
        
        $meta: {
            tag: 'info-view'
        },

        html: '<footer class="info">' +
            '<p>Double-click to edit a todo</p>' +
            '<p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>' +
            '<p>Created by <a href="http://todomvc.com">Piotr Jamroz</a>' +
            '<p>Part of <a href="http://todomvc.com">TodoMVC</a>' +
            '</footer>'

    });

})(window);
