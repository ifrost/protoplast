var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Dispatcher = Protoplast.Dispatcher;

describe('Dispatcher', function() {
    it('allows to create event dispatchers', function() {

        var CustomDispatcher, dispatcher, message = '';

        CustomDispatcher = Protoplast.extend([Dispatcher], {
            hello: function() {
                this.dispatch('message', 'hello', 'test');
            }
        });

        dispatcher = CustomDispatcher.create();

        dispatcher.on('message', function(value1, value2) {
            message = value1 + value2;
        });
        dispatcher.hello();

        chai.assert.equal(message, 'hellotest');
    });

    it('throws and exception if handler is not provided', function() {
        var CustomDispatcher, dispatcher, message = '';

        CustomDispatcher = Protoplast.extend([Dispatcher], {
            hello: function() {
                this.dispatch('message', 'hello');
            }
        });

        dispatcher = CustomDispatcher.create();

        chai.assert.throws(dispatcher.on.bind('test'));

    });

    describe('removing handlers', function() {

        var CustomDispatcher, dispatcher, message = '';

        beforeEach(function() {
            CustomDispatcher = Protoplast.extend([Dispatcher], {
                hello: function() {
                    this.dispatch('message', 'hello');
                }
            });

            dispatcher = CustomDispatcher.create();
        });

        it('removes handlers', function() {

            var removedHandler = sinon.spy();
            var activeHandler = sinon.spy();

            dispatcher.on('message', removedHandler);
            dispatcher.on('message', activeHandler);
            dispatcher.off('message', removedHandler);

            dispatcher.hello();

            sinon.assert.called(activeHandler);
            sinon.assert.notCalled(removedHandler);
        });

        it('noops removing non-exisitng handlers', function() {

            var handler = sinon.spy();

            chai.assert.doesNotThrow(function() {
                dispatcher.off('message', handler);
            });
        });

    });

});
