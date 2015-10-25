(function (window) {
    'use strict';

    window.AppView = window.View.extend(function(proto){

        proto.init = function(parent) {
            this.root = parent.append('section').classed('todoapp', true)

            window.HeaderView(this.root);
            window.MainView(this.root);
            window.FooterView(this.root);
            window.InfoView(parent);
        }

    });

})(window);
