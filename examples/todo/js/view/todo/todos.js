(function (window) {
    'use strict';

    window.TodosView = window.View.extend({

        $meta: {
            presenter: window.TodosPresenter
        },

        tag: 'ul',

        visibleTodos: null,
        
        init: function () {

            this.$root.classed('todo-list', true);
            
            window.Protoplast.utils.renderList(this, 'visibleTodos', {
                renderer: window.TodoView,
                rendererDataProperty: 'data',
                remove: function(parent, child) {
                    child.fadeOut(function() {
                        parent.remove(child);
                    });
                }
            });
            
            d3.select(window)
                .on('click', function () {
                    this._children.forEach(function(child) {
                       child.exitEditMode();
                    }, this);
                }.bind(this))
                .on('keyup', function () {
                    if (d3.event.keyCode === 27) {
                        this._children.forEach(function(child) {
                            child.exitEditMode();
                        }, this);
                    }
                }.bind(this));
        }
    });

})(window);
