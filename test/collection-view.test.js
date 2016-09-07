var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Model = Protoplast.Model,
    Collection = Protoplast.Collection,
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

    it('filters item when the filter is set', function() {

        view.add_filter({
            fn: function(item) {
                return item % 2 == 0;
            }
        });

        chai.assert.lengthOf(view, 1);
        chai.assert.strictEqual(view.get(0), 2);

    });

    it('sorts items when the sort function is set', function() {

        view.add_sort({
            fn: function(a, b) {
                return b - a;
            }
        });

        chai.assert.lengthOf(view, 2);
        chai.assert.strictEqual(view.get(0), 2);
        chai.assert.strictEqual(view.get(1), 1);

    });

    it('sorts items using multiple sorts', function() {

        // undone first, then done, each sorted by name
        var Todo = Model.extend({
            text:null,
            done:false,
            $create: function(text, done) {
                this.text = text;
                this.done = done;
            }
        });

        var todos = Collection.create([
            Todo.create('DDD', true),   // 4
            Todo.create('CCC', false),  // 2
            Todo.create('AAA', true),   // 3
            Todo.create('BBB', false)   // 1
        ]);

        var view = CollectionView.create(todos);

        view.add_sort({
            fn: function(a, b) {
                if (a.done === b.done) {
                    return 0;
                }
                else {
                    return a.done ? 1 : -1;
                }
            }
        });
        view.add_sort({
            fn: function(a, b) {
                return a.text > b.text ? 1 : -1;
            }
        });

        chai.assert.strictEqual(view.get(0).text, 'BBB');
        chai.assert.strictEqual(view.get(0).done, false);

        chai.assert.strictEqual(view.get(1).text, 'CCC');
        chai.assert.strictEqual(view.get(1).done, false);

        chai.assert.strictEqual(view.get(2).text, 'AAA');
        chai.assert.strictEqual(view.get(2).done, true);

        chai.assert.strictEqual(view.get(3).text, 'DDD');
        chai.assert.strictEqual(view.get(3).done, true);
    });

    it('removes sorts and restores the view', function() {

        var sort = {
            fn: function(a, b) {
                return b - a;
            }
        };

        view.add_sort(sort);
        collection.add(3);

        chai.assert.lengthOf(view, 3);
        chai.assert.strictEqual(view.get(0), 3); // 3 added at the beginning because the collection is sorted
        chai.assert.strictEqual(view.get(1), 2);
        chai.assert.strictEqual(view.get(2), 1);

        view.remove_sort(sort);

        chai.assert.strictEqual(view.get(0), 1);
        chai.assert.strictEqual(view.get(1), 2);
        chai.assert.strictEqual(view.get(2), 3);

    });

    it('clears the selected property if the selected item is removed', function() {

        view.selected = 2;
        collection.remove(2);

        chai.assert.isNull(view.selected);
    });

    it('restores the selected property if the selected item is switched by filtering', function() {

        var filter = {
            fn: function(item) {
                return item !== 2;
            }
        };

        view.selected = 2;
        chai.assert.strictEqual(view.selected, 2);

        view.add_filter(filter);
        chai.assert.isNull(view.selected);

        view.remove_filter(filter);
        chai.assert.strictEqual(view.selected, 2);

    });

    it('toArray returns array from the current view', function() {
        chai.assert.deepEqual(view.toArray(), [1,2]);
    });

    it('forEach is run only on the current items', function() {

        var filter = {
            fn: function(item) {
                return item !== 2;
            }
        };

        view.add_filter(filter);
        collection.add(3);

        var handler = sinon.stub();
        view.forEach(handler);

        sinon.assert.calledTwice(handler);
        sinon.assert.calledWith(handler, 1);
        sinon.assert.calledWith(handler, 3);
    });

});

