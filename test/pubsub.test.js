var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Context = Protoplast.Context;

describe('Pub/Sub', function() {
    it('dispatches messages between objects', function() {

        var Source, Destination, source, destination;

        Source = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {pub: 'pub'}
                }
            },
            send: function(msg) {
                this.pub('message', msg);
            }
        });

        Destination = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {sub: 'sub'}
                }
            },
            injected: {
                inject_init: true,
                value: function() {
                    this.sub('message').add(this.save_message);
                }
            },
            save_message: function(msg) {
                this.message = msg;
            },
            clear: function() {
                this.sub('message').remove();
            }
        });

        var context = Context.create();
        context.register('source', source = Source.create());
        context.register('dest', destination = Destination.create());
        context.build();

        source.send('hello');
        chai.assert.equal(destination.message, 'hello');

        source.send('hi');
        chai.assert.equal(destination.message, 'hi');

        destination.clear();
        source.send('awww');
        chai.assert.equal(destination.message, 'hi');
    });
});