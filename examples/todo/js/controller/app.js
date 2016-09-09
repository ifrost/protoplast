(function(window) {
    'use strict';

    window.AppController = window.Controller.extend({

        todos: {
            inject: 'todos'
        },

        view_state: {
            inject: 'viewstate'
        },

        app_model: {
            inject: 'appmodel'
        },
        
        init: {
            inject_init: true,
            value: function() {
                window.Protoplast.utils.bind_property(this, 'visible_todos', this.app_model, 'visible_todos');
            }
        },

        visible_todos: {
            computed: ['todos.todos', 'view_state.state'],
            value: function() {
                if (this.view_state.state === window.ViewStateModel.UNDONE) {
                    return this.todos.undone;
                }
                else if (this.view_state.state === window.ViewStateModel.DONE) {
                    return this.todos.done;
                }
                else {
                    return this.todos.all;
                }
            }
        }

    });

})(window);
