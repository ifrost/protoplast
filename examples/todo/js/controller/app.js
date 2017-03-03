(function(window) {
    'use strict';

    window.AppController = window.Controller.extend({

        todos: {
            inject: 'todos'
        },

        viewState: {
            inject: 'viewstate'
        },

        appModel: {
            inject: 'appmodel'
        },
        
        init: {
            injectInit: true,
            value: function() {
                window.Protoplast.utils.bindProperty(this, 'visibleTodos', this.appModel, 'visibleTodos');
            }
        },

        visibleTodos: {
            computed: ['todos.todos', 'viewState.state'],
            value: function() {
                if (!this.todos || !this.viewState) {
                    return [];
                }
                else if (this.viewState.state === window.ViewStateModel.UNDONE) {
                    return this.todos.undone;
                }
                else if (this.viewState.state === window.ViewStateModel.DONE) {
                    return this.todos.done;
                }
                else {
                    return this.todos.all;
                }
            }
        }

    });

})(window);
