(function (window) {
    'use strict';

    window.MainView = window.View.extend({
        
        $meta: {
            presenter: window.MainPresenter
        },

        html: '<section class="main">' +
            '<input class="toggle-all" data-prop="toggleAll" type="checkbox" />' +
            '<label for="toggle-all">Mark all as complete</label>' +
            '<div data-comp="todosView"></div>' +
        '</section>',
        
        todosView: {
            component: window.TodosView
        },

        todos: null,

        allChecked: null,

        showToggle: null,
        
        init: function () {

            this.toggleAll.on('change', this.toggle.bind(this));

            window.Protoplast.utils.bind(this, {
                'allChecked': this.updateToggle,
                'showToggle': this.updateToggleVisibility
            });
            // window.Protoplast.utils.bind(this.todos, 'done', this.updateToggle);
            // window.Protoplast.utils.bind(this.todos, 'all', this.updateToggleVisibility);
            // window.Protoplast.utils.bind(this.todos, 'all', this.updateToggle);
        },
        
        toggle: function () {
            this.dispatch('toggleAll', this.toggleAll.property('checked'));
        },

        updateToggle: function () {
            this.toggleAll.property('checked', this.allChecked);
        },

        updateToggleVisibility: function() {
            // this.toggleAll.style('display', this.todos.all.length ? 'block' : 'none');
            this.toggleAll.style('display', this.showToggle ? 'block' : 'none');
        }

    });

})(window);
