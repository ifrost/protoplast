(function(window) {
    'use strict';

    window.TodosModel = window.Protoplast.Model.extend([window.Storage], {

        todos: null,

        all: null,

        undone: null,

        done: null,
        
        $create: function() {
            this.init_data();

            window.Protoplast.utils.bind_collection(this, 'todos', this.store.bind(this));

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
            this.done = this.create_done_view();
            this.undone = this.create_undone_view();
            this.all = this.create_all_view();
        },

        create_done_view: function() {
            var done = window.Protoplast.CollectionView.create(this.todos);
            done.add_filter({
                properties: ['done'],
                fn: function(item) {
                    return item.done
                }
            });
            done.add_sort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return done;
        },

        create_undone_view: function() {
            var undone = window.Protoplast.CollectionView.create(this.todos);
            undone.add_filter({
                properties: ['done'],
                fn: function(item) {
                    return !item.done
                }
            });
            undone.add_sort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return undone;
        },

        create_all_view: function() {
            var all = window.Protoplast.CollectionView.create(this.todos);
            all.add_sort({
                properties: ['done'],
                fn: function(a,b) {
                    return a.done == b.done ? 0  : (a.done ? 1 : -1);
                }
            });
            all.add_sort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return all;
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

        edit_todo_text: function(todo, text) {
            todo.text = text;
            this.store();
        },

        toggle_all: function(value) {
            this.todos.forEach(function(todo) {
                todo.done = value;
            });
            this.store();
        },

        all_done: {
            get: function() {
                return this.all.length === this.done.length;
            }
        }
        
    });

})(window);
