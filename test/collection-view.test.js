var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Model = Protoplast.Model,
    Collection = Protoplast.Array,
    CollectionView = Protoplast.CollectionView;

describe('CollectionView', function() {

    var collection, view;

    beforeEach(function() {
        collection = Collection.create([1, 2]);
        view = CollectionView.create(collection);
    });

    it('contains all the items by default', function() {
        chai.assert.strictEqual(view.length, 2);
        chai.assert.strictEqual(view.get(0), 1);
        chai.assert.strictEqual(view.get(1), 2);
    });

    it('updates the view when collection changes', function() {
        collection.add(3);
        chai.assert.strictEqual(view.length, 3);
        chai.assert.strictEqual(view.get(2), 3);

        collection.remove(2);
        chai.assert.strictEqual(view.length, 2);
        chai.assert.strictEqual(view.get(0), 1);
        chai.assert.strictEqual(view.get(1), 3);
    });

    it('filters item when the filter is set', function() {

        view.add_filter({
            fn: function(item) {
                return item % 2 == 0;
            }
        });

        chai.assert.strictEqual(view.length, 1);
        chai.assert.strictEqual(view.get(0), 2);

    });

    it('updates the view when property of the item change', function() {

        var Todo = Model.extend({
            name: null,
            done: null,
            $create: function(name, done) {
                this.name = name;
                this.done = done;
            }
        });

        var foo = Todo.create('foo', true),
            bar = Todo.create('bar', false),
            xyzzy = Todo.create('xyzzy', false);

        var todos = Collection.create();

        todos.add(foo);
        todos.add(bar);
        todos.add(xyzzy);

        var done = CollectionView.create(todos);
        done.add_filter({
            properties: ['done'],
            fn: function(todo) {
                return todo.done;
            }
        });

        chai.assert.strictEqual(todos.length, 3);
        chai.assert.strictEqual(done.length, 1);

        xyzzy.done = true;
        chai.assert.strictEqual(done.length, 2);

    });

});

