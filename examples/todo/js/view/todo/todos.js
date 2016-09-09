(function (window) {
    'use strict';

    window.TodosView = window.View.extend({

        $meta: {
            presenter: window.TodosPresenter
        },

        tag: 'ul',

        visible_todos: null,
        
        init: function () {

            this.$root.classed('todo-list', true);
            
            window.Protoplast.utils.render_list(this, 'visible_todos', {
                renderer: window.TodoView,
                renderer_data_property: 'data',
                remove: function(parent, child) {
                    child.fade_out(function() {
                        parent.remove(child);
                    });
                }
            });
            
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
