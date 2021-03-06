var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Collection = Protoplast.Collection;

describe('Collection', function() {

    it('creates a collection', function() {
        var collection = Collection.create();
        chai.assert.lengthOf(collection, 0);

        collection = Collection.create([1,2]);
        chai.assert.lengthOf(collection, 2);
    });
    
    it('returns item at given index', function() {
        var collection = Collection.create([1,2]);
        
        chai.assert.strictEqual(collection.length, 2);
        chai.assert.strictEqual(collection.get(0), 1);
        chai.assert.strictEqual(collection.get(1), 2);
    });
    
    it('allows to add many items at once', function() {
        var collection = Collection.create([1]);
        
        collection.addAll([2,3]);

        chai.assert.strictEqual(collection.length, 3);
        chai.assert.strictEqual(collection.get(0), 1);
        chai.assert.strictEqual(collection.get(1), 2);
        chai.assert.strictEqual(collection.get(2), 3);
    });

    it('dispatches changed event when item is removed', function() {
        var handler = sinon.spy();

        var collection = Collection.create();
        collection.on('changed', handler);

        collection.add(1);

        sinon.assert.calledWith(handler, {added: [1], removed: []});
    });

    it('dispatches changed event when item is removed', function() {
        var handler = sinon.spy();

        var collection = Collection.create([1,2,3]);
        collection.on('changed', handler);

        collection.remove(2);

        sinon.assert.calledWith(handler, {added: [], removed: [2]});
    });

    describe('implements array methods', function() {

        var collection;

        beforeEach(function() {
            collection = Collection.create([1,2,3]);
        });

        it('indexOf', function() {
            chai.assert.strictEqual(collection.indexOf(2), 1);
        });

        it('forEach', function() {
            var forEachHandler = sinon.stub();
            collection.forEach(forEachHandler);
            sinon.assert.calledThrice(forEachHandler);
            sinon.assert.calledWith(forEachHandler, 1);
            sinon.assert.calledWith(forEachHandler, 2);
            sinon.assert.calledWith(forEachHandler, 3);
        });

        it('concat', function() {
            chai.assert.strictEqual(collection.concat().length, collection.length);
        });

        it('filter', function() {
            var filterHandler = sinon.stub().returns(false);
            var filterResult = collection.filter(filterHandler);
            sinon.assert.calledThrice(filterHandler);
            sinon.assert.calledWith(filterHandler, 1);
            sinon.assert.calledWith(filterHandler, 2);
            sinon.assert.calledWith(filterHandler, 3);
            chai.assert.lengthOf(filterResult, 0);
        });

        it('JSON.stringify returns stringified array', function() {
            chai.assert.strictEqual(JSON.stringify(collection), '[1,2,3]');
        });

    });

});

