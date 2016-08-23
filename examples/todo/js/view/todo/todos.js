(function (window) {
    'use strict';

    window.TodosView = window.View.extend({

        $meta: {
            tag: 'todos-view'
        },

        tag: 'ul',

        todos: {
            inject: 'todos'
        },

        app_model: {
            inject: 'appmodel'
        },

        // TODO: unused?
        item_renderer: function() {
            return window.TodoView.create();
        },
        
        init: function () {

            this.$root.classed('todo-list', true);
            
            window.Protoplast.utils.render_list(this, 'app_model.visible_todos', window.TodoView, 'data');
            
            d3.select(window)
                .on('click', function () {
                    this._children.forEach(function(child) {
                       child.exit_edit_mode();
                    }, this);
                }.bind(this))
                .on('keyup', function () {
                    if (d3.event.keyCode === 27) {
                        this._children.forEach(function(child) {
                            child.exit_edit_mode();
                        }, this);
                    }
                }.bind(this));
        }
    });

})(window);
