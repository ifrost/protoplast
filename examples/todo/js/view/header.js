(function (window) {
    'use strict';

    window.HeaderView = window.View.extend(function(proto){

        proto.init = function(parent) {
            this.root = parent.append('header').classed('header', true);

            this.header = this.root.append('h1').text('todos');
            this.input = this.root.append('input')
                .classed('new-todo', true)
                .attr('placeholder', 'What needs to be done?')
                .property('autofocus', true)
                .on('keypress', function(event){
                    if (d3.event.keyCode === 13) {
                        this.submit_todo();
                    }
                }.bind(this));
        };

        proto.submit_todo = function() {
            var text = this.input.property('value');
            if (text.length) {
                this.pub('todos/add', text);
                this.input.property('value', '');
            }
        }

    });

})(window);
