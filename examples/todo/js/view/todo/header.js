(function (window) {
    'use strict';

    window.HeaderView = window.View.extend({

        tag: 'header',

        init: function () {

            this.$root.classed('header', true);

            this.header = this.$root.append('h1').text('todos');
            this.input = this.$root.append('input')
                .classed('new-todo', true)
                .attr('placeholder', 'What needs to be done?')
                .property('autofocus', true)
                .on('keypress', function () {
                    if (d3.event.keyCode === 13) {
                        this.submit_todo();
                    }
                }.bind(this));
        },

        submit_todo: function () {
            var text = this.input.property('value').trim();
            if (text.length) {
                this.pub('todos/add', text);
                this.input.property('value', '');
            }
        }

    });

})(window);
