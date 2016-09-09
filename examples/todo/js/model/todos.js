(function(window) {
    'use strict';

    window.TodosModel = window.Protoplast.Model.extend([window.Storage], {

        todos: null,

        all: null,

        undone: null,

        done: null,
        
        $create: function() {
            this.initData();

            window.Protoplast.utils.bind(this, 'todos', this.store.bind(this));

            this.createViews();
        },

        initData: function() {
            this.storeId('todos');

            var stored = this.storeRead();
            var array = stored ? stored : [];
            
            array = array.map(function(item) {
                var todo = window.TodoModel.create();
                todo.text = item.text;
                todo.done = item.done;
                return todo;
            });
            this.todos = window.Protoplast.Collection.create(array);
        },

        createViews: function() {
            this.done = this.createDoneView();
            this.undone = this.createUndoneView();
            this.all = this.createAllView();
        },

        createDoneView: function() {
            var done = window.Protoplast.CollectionView.create(this.todos);
            done.addFilter({
                properties: ['done'],
                fn: function(item) {
                    return item.done
                }
            });
            done.addSort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return done;
        },

        createUndoneView: function() {
            var undone = window.Protoplast.CollectionView.create(this.todos);
            undone.addFilter({
                properties: ['done'],
                fn: function(item) {
                    return !item.done
                }
            });
            undone.addSort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return undone;
        },

        createAllView: function() {
            var all = window.Protoplast.CollectionView.create(this.todos);
            all.addSort({
                properties: ['done'],
                fn: function(a,b) {
                    return a.done == b.done ? 0 : (a.done ? 1 : -1);
                }
            });
            all.addSort({
                properties: ['text'],
                fn: function(a,b) {
                    return a.text > b.text ? 1 : -1;
                }
            });
            return all;
        },

        store: function() {
            this.storeSave(this.todos);
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

        editTodoText: function(todo, text) {
            todo.text = text;
            this.store();
        },

        toggleAll: function(value) {
            this.todos.forEach(function(todo) {
                todo.done = value;
            });
            this.store();
        },

        allDone: {
            get: function() {
                return this.all.length === this.done.length;
            }
        }
        
    });

})(window);
