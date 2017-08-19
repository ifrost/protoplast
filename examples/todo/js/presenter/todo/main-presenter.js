(function (window) {
    'use strict';

    window.MainPresenter = window.Presenter.extend({

        todos: {
            inject: 'todos'
        },

        controller: {
            inject: 'todocontroller'
        },
        
        init: function () {
            window.Protoplast.utils.bind(this, {
                'todos.all': [this.updateToggle, this.updateToggleVisibility],
                'todos.done': this.updateToggle
            });
            
            this.view.on('toggleAll', this.controller.toggleAll.bind(this.controller));
        },

        updateToggleVisibility: function() {
            this.view.showToggle = this.todos.all.length;
        },

        updateToggle: function() {
            this.view.allChecked = this.todos.all.length === this.todos.done.length;
        }

    });

})(window);
