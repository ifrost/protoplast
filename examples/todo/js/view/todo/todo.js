(function (window) {
    'use strict';

    window.TodoView = window.View.extend({
        
        $meta: {
            presenter: window.TodoPresenter
        },

        data: null,

        html: '<li><div class="view" data-prop="view"><input class="toggle" type="checkbox" data-prop="toggle" /><label data-prop="label"></label><button class="destroy" data-prop="removeButton"></button></div><input class="edit" data-prop="editInput"></li>',
        
        init: function () {

            window.Protoplast.utils.bind(this, {
                'data.text': this.render,
                'data.done': this.render
            });

            this.view.style({opacity: 0, height: '0px'})
                .transition().duration(200)
                .style({opacity: 1, height: '58px'});

            this.toggle.on('click', function(){
                this.dispatch('toggle', this.data);
            }.bind(this));

            this.removeButton.on('click', function() {
                this.dispatch('remove', this.data);
            }.bind(this));

            this.label.on('dblclick', function() {
                this.enterEditMode();
            }.bind(this));

            this.editInput.on('keypress', function() {
                var text = this.editInput.property('value').trim();
                if (d3.event.keyCode === 13) {
                    this.exitEditMode();
                    if (text.length) {
                        this.dispatch('edit', {todo: this.data, text: text});
                    }
                    else {
                        this.dispatch('remove', this.data);
                    }
                }
            }.bind(this));

            this.editInput.on('click', function() {
                d3.event.stopPropagation();
            });
        },

        fadeOut: function(callback) {
            this.view.style({opacity: 1, height: '58px'})
                .transition().duration(200)
                .style({opacity: 0, height: '0px'})
                .each('end', callback);
        },

        render: function() {
            this.label.text(this.data.text);
            this.$root.classed('completed', this.data.done);
            this.toggle.property('checked', this.data.done);
        },

        enterEditMode: function () {
            this.$root.classed('editing', true);
            this.editInput.property('value', this.data.text).node().focus();
        },

        exitEditMode: function () {
            this.$root.classed('editing', false);
        }

    });

})(window);
