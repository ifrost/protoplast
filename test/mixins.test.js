var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main');

describe('Mixins', function() {

    it('allows to mixin objects', function() {

        var BaseFoo, Foo, Bar, FooBar, foobar;

        BaseFoo = Protoplast.extend({
            basefoo: 'basefoo'
        });

        Foo = BaseFoo.extend({
            foo: 'foo'
        });

        Bar = Protoplast.extend({
            bar: 'bar'
        });

        FooBar = Protoplast.extend([Foo, Bar]);

        foobar = FooBar.create();

        chai.assert.equal(foobar.basefoo, 'basefoo');
        chai.assert.equal(foobar.foo, 'foo');
        chai.assert.equal(foobar.bar, 'bar');

    });

    it('does not override existing properties', function() {
        var Foo, Bar, FooBar, foobar;

        Foo = Protoplast.extend({
            foo: 'foo'
        });

        Bar = Protoplast.extend({
            foo: 'ignored foo',
            bar: 'ignored bar'
        });

        FooBar = Protoplast.extend([Foo, Bar], {
            bar: 'bar'
        });

        foobar = FooBar.create();

        chai.assert.equal(foobar.foo, 'foo');
        chai.assert.equal(foobar.bar, 'bar');
    });
});