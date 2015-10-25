(function (window) {
    'use strict';

    window.InfoView = window.View.extend(function(proto){

        proto.init = function(parent) {
            this.root = parent.append('footer').classed('info', true);

            this.root.append('p').html('Double-click to edit a todo');
            this.root.append('p').html('Template by <a href="http://sindresorhus.com">Sindre Sorhus</a>');
            this.root.append('p').html('Created by <a href="http://todomvc.com">you</a>');
            this.root.append('p').html('Part of <a href="http://todomvc.com">TodoMVC</a>')
        }

    });

})(window);
