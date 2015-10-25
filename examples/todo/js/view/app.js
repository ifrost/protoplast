(function (window) {
    'use strict';

    window.AppView = window.View.extend(function(proto){

        proto.init = function(parent) {
            this.root = parent.append('section').classed('todoapp', true)

            this.header = window.HeaderView(this.root);
            this.todos = window.MainView(this.root);
            this.footer = window.FooterView(this.root);
            this.info = window.InfoView(parent);
        }

    });

})(window);
