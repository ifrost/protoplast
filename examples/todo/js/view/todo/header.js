(function (window) {
    'use strict';

    window.HeaderView = window.View.extend({
        
        $meta: {
            presenter: window.HeaderPresenter
        },

        html: '<header class="header">' +
            '<h1>todos</h1>' +
            '<input data-prop="input" class="new-todo" placeholder="What needs to be done?" autofocus></input>' +
        '</header>',

        init: function () {

            this.input = d3.select(this.input.node());
            this.input.on('keypress', function () {
                if (d3.event.keyCode === 13) {
                    this.submitTodo();
                }
            }.bind(this));
        },

        submitTodo: function () {
            var text = this.input.property('value').trim();
            if (text.length) {
                this.dispatch('submit', text);
                this.input.property('value', '');
            }
        }

    });

})(window);
