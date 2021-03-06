var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Context = Protoplast.Context;

describe('Dependency Injection', function() {
    it('inject dependencies according to config', function() {

        var Foo, Bar, foo, bar;

        Foo = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {bar: 'bar'}
                }
            }
        });

        Bar = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {foo: 'foo'}
                }
            }
        });

        var context = Context.create();

        context.register('foo', foo = Foo.create());
        context.register('bar', bar = Bar.create());
        context.build();

        chai.assert.equal(foo.bar, bar);
        chai.assert.equal(bar.foo, foo);

    });

    it('injects dependencies by prototype', function() {
        var Foo, Bar, foo, bar;

        Foo = Protoplast.extend({});

        Bar = Protoplast.extend({
            foo: {
                inject: Foo
            }
        });

        var context = Context.create();

        context.register(foo = Foo.create());
        context.register(bar = Bar.create());
        context.build();

        chai.assert.equal(bar.foo, foo);
    });

    it('injects dependencies by any prototype in chain', function() {
        var Base, Foo, Bar, foo, bar;

        Base = Protoplast.extend({});
        Foo = Base.extend({});

        Bar = Protoplast.extend({
            foo: {
                inject: Base
            }
        });

        var context = Context.create();

        context.register(foo = Foo.create());
        context.register(bar = Bar.create());
        context.build();

        chai.assert.equal(bar.foo, foo);
    });

    it('inherits dependencies config from the base prototype', function() {

        var Foo, Foo2, Bar, foo, bar;

        Foo = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {bar: 'bar'}
                }
            }
        });

        Foo2 = Foo.extend();

        Bar = Protoplast.extend();

        var context = Context.create();

        context.register('foo', foo = Foo2.create());
        context.register('bar', bar = Bar.create());
        context.build();

        chai.assert.equal(foo.bar, bar);
    });

    it('passes fast inject function', function() {

        var Dep, dep, Foo, Bar, bar;

        Dep = Protoplast.extend({
            value: function() {
                return 10;
            }
        });

        Bar = Protoplast.extend({
            $meta: {
                properties: {
                    inject: {dep: 'dep'}
                }
            }
        });

        Foo = Protoplast.extend({
            injected: {
                injectInit: true,
                value: function() {
                    bar = Bar.create();
                    this.__fastinject__(bar);
                }
            }
        });

        var context = Context.create();
        context.register('foo', Foo.create());
        context.register('dep', dep = Dep.create());
        context.build();

        chai.assert.equal(bar.dep.value(), 10);
    });
    
    it('creates child contexts', function() {
       
        var Base = Protoplast.extend({
            child: {
                inject: 'child'
            }
        });
        
        var Child = Protoplast.extend({
            base: {
                inject: 'base'
            }
        });

        var GrandChild = Protoplast.extend({
            base: {
                inject: Base
            }
        });
        
        var baseContext = Context.create();
        var childContext = baseContext.createChildContext();
        var simple = Protoplast.create();
        var grandChildContext = childContext.createChildContext();

        var base = Base.create();
        var child = Child.create();
        var grandChild = GrandChild.create();

        baseContext.register('base', base);
        childContext.register('child', child);
        grandChildContext.register(simple);

        baseContext.build();
        childContext.build();
        grandChildContext.build();
        
        simple.__fastinject__(grandChild);

        chai.assert.isUndefined(base.child, child);
        chai.assert.strictEqual(child.base, base);
        chai.assert.strictEqual(grandChild.base, base);
    });
    
    it('destroys injected object', function() {

        var Foo = Protoplast.extend({
            destroy: {
                injectDestroy: true,
                value: sinon.stub()
            }
        });
        
        var foo = Foo.create();

        var context = Context.create();
        context.register(foo);
        context.build();
        context.destroy();
        
        sinon.assert.calledOnce(foo.destroy);
    });
});