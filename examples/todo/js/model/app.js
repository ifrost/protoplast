(function(window) {
    'use strict';

    window.AppModel = window.Protoplast.Model.extend({

        todos: {
            inject: 'todos'
        },
        
        view_state: {
            inject: 'viewstate'
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
