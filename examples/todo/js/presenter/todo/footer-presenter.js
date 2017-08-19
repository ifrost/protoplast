(function (window) {
    'use strict';

    window.FooterPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        controller: {
            inject: 'todocontroller'
        },

        viewState: {
            inject: 'viewstate'
        },

        init: function () {
            
            window.Protoplast.utils.bind(this.todos, {
                'undone': this.updateCounter,
                'done': this.updateCounter
            });
            window.Protoplast.utils.bindProperty(this.viewState, 'state', this.view, 'state');

            this.view.on('clearAll', this.controller.clearDone.bind(this.controller));
        },
        
        updateCounter: function () {
            this.view.done = this.todos.done.length;
            this.view.undone = this.todos.undone.length;
        }

    });

})(window);
