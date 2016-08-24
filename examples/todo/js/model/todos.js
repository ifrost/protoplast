(function(window) {
    'use strict';

    window.TodosModel = window.Protoplast.Model.extend([window.Storage], {

        todos: null,

        all: null,

        undone: null,

        done: null,
        
        $create: function() {
            this.init_data();

            window.Protoplast.utils.bind(this, 'todos', this.store.bind(this));
            this.todos.on('changed', this.store.bind(this));

            this.create_views();
        },

        init_data: function() {
            this.store_id('todos');

            var stored = this.store_read();
            var array = stored ? stored : [];
            
            array = array.map(function(item) {
                var todo = window.TodoModel.create();
                todo.text = item.text;
                todo.done = item.done;
                return todo;
            });
            this.todos = window.Protoplast.Collection.create(array);
        },

        create_views: function() {
            this.done = window.Protoplast.CollectionView.create(this.todos);
            this.done.add_filter({
                properties: ['done'],
                fn: function(item) {
                    return item.done
                }
            });
            this.undone = window.Protoplast.CollectionView.create(this.todos);
            this.undone.add_filter({
                properties: ['done'],
                fn: function(item) {
                    return !item.done
                }
            });
            this.all = window.Protoplast.CollectionView.create(this.todos);
        },

        store: function() {
            this.store_save(this.todos);
        },

        add: function(todo) {
            this.todos.add(todo);
        },

        remove: function(todo) {
            this.todos.remove(todo);
        },

        toggle: function(todo) {
            todo.done = !todo.done;
            this.store();
        },

        toggle_all: function(value) {
            this.todos.forEach(function(todo) {
                todo.done = value;
            });
            this.store();
        }
        
    });

})(window);
