(function (window) {
    'use strict';

    window.HeaderView = window.View.extend({
        
        $meta: {
            presenter: window.HeaderPresenter
        },

        html: '<header class="header">' +
            '<h1 data-prop="header">todos</h1>' +
            '<input data-prop="input" class="new-todo" placeholder="What needs to be done?" autofocus></input>' +
        '</header>',

        init: function () {

            this.$root.classed('header', true);

            this.input = d3.select(this.input.node());
            this.input.on('keypress', function () {
                if (d3.event.keyCode === 13) {
                    this.submit_todo();
                }
            }.bind(this));
        },

        submit_todo: function () {
            var text = this.input.property('value').trim();
            if (text.length) {
                this.dispatch('submit', text);
                this.input.property('value', '');
            }
        }

    });

})(window);
