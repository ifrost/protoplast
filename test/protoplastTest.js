describe('Protoplast', function() {

    var Dispatcher = ProtoplastExt.Dispatcher,
        Context = ProtoplastExt.Context,
        Aop = ProtoplastExt.Aop;

    describe('Metadata', function() {

        it('assings metadata to the prototype', function() {
            var Base;

            Base = Protoplast.extend({
                __meta__: {
                    num: 1,
                    bool: true,
                    str: 'text',
                    obj: {test: 'test'}
                }
            });

            chai.assert.equal(Base.__meta__.num, 1);
            chai.assert.equal(Base.__meta__.bool, true);
            chai.assert.equal(Base.__meta__.str, 'text');
            chai.assert.equal(Base.__meta__.obj.test, 'test');
        });

        it('merges primitive values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                __meta__: {
                    num: 1,
                    bool: true,
                    str: 'text'
                }
            });

            Sub = Base.extend();

            chai.assert.equal(Sub.__meta__.num, 1);
            chai.assert.equal(Sub.__meta__.bool, true);
            chai.assert.equal(Sub.__meta__.str, 'text');
        });

        it('overrides primitive values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                __meta__: {
                    num: 1,
                    bool: true,
                    str: 'text'
                }
            });

            Sub = Base.extend({
                __meta__: {
                    num: 2,
                    bool: false,
                    str: 'text 2'
                }
            });

            chai.assert.equal(Sub.__meta__.num, 2);
            chai.assert.equal(Sub.__meta__.bool, false);
            chai.assert.equal(Sub.__meta__.str, 'text 2');
        });

        it('concatenates arrays in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                __meta__: {array: [1, 2, 3]}
            });
            Sub = Base.extend({
                __meta__: {array: [4]}
            });

            chai.assert.deepEqual(Sub.__meta__.array, [1, 2, 3, 4]);
        });

        it('deeply merges object values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                __meta__: {
                    obj: {
                        base: 1,
                        override: 'test',
                        array: [1, 2, 3]
                    }
                }
            });

            Sub = Base.extend({
                __meta__: {
                    obj: {
                        sub: 2,
                        override: 'test 2',
                        array: [4]
                    }
                }
            });

            chai.assert.deepEqual(Sub.__meta__.obj, {
                sub: 2,
                base: 1,
                override: 'test 2',
                array: [1, 2, 3, 4]
            });
        });

        it('assigns meta data with instances', function() {
            var Base = Protoplast.extend(), base;
            base = new Base();
            chai.assert.equal(base.__meta__, Base.__meta__);
        });

    });

    describe('Inheritance', function() {
        it('creates a simple prototype', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend({
                value: 10
            });

            Sub = Base.extend();

            base = new Base();
            sub = new Sub();

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);
        });

        it('instanceof returns true for subinstances', function() {
            var Base, Sub, SubSub, subsub, sub;
            Base = Protoplast.extend();
            Sub = Base.extend();
            SubSub = Sub.extend();

            subsub = new SubSub();
            chai.assert.isTrue(subsub instanceof SubSub);
            chai.assert.isTrue(subsub instanceof Sub);
            chai.assert.isTrue(subsub instanceof Base);
            chai.assert.isTrue(subsub instanceof Protoplast);

            sub = new Sub();
            chai.assert.isFalse(sub instanceof SubSub);
            chai.assert.isTrue(sub instanceof Sub);
            chai.assert.isTrue(sub instanceof Base);
            chai.assert.isTrue(sub instanceof Protoplast);
        });

        it('inherits all properties', function() {

            var Base, Sub, sub;

            Base = Protoplast.extend({
                __init__: function(value) {
                    this.set_value(value);
                },
                set_value: function(value) {
                    this.value = value;
                }
            });

            Sub = Base.extend({
                get_value: function() {
                    return this.value;
                }
            });

            sub = new Sub(10);
            chai.assert.equal(sub.get_value(), 10);
        });

        it('allows to run base methods', function() {

            var Base, Sub, base, sub;

            Base = Protoplast.extend({
                test: function() {
                    return 10;
                }
            });

            Sub = Base.extend({
                test: function() {
                    return Sub.base.test.call(this) * 2;
                }
            });

            base = new Base();
            sub = new Sub();

            chai.assert.equal(base.test(), 10);
            chai.assert.equal(sub.test(), 20);
        });

    });

    describe('AOP', function() {
        it('allows to add after aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend({
                __init__: function(text) {
                    this.text = text;
                },
                append: function(text) {
                    this.text += text;
                }
            });

            foo = new Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                after: function() {
                    this.text += '!';
                }
            });

            foo = new Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext!');
        });

        it('allows to add before aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend({
                __init__: function(text) {
                    this.text = text;
                },
                append: function(text) {
                    this.text += text;
                }
            });

            foo = new Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                before: function() {
                    this.text += ',';
                }
            });

            foo = new Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'text,text');
        });

        it('runs aspects on subinstances', function() {

            var Text, UCText, text;

            Text = Protoplast.extend({
                __init__: function(text) {
                    this.text = text;
                },
                append: function(text) {
                    this.text += text;
                }
            });

            UCText = Text.extend({
                toUpperCase: function() {
                    this.text = this.text.toUpperCase();
                }
            });

            var aop = Aop(UCText);

            aop.aop('append', {
                after: function() {
                    this.toUpperCase();
                }
            });

            aop.aop('append', {
                before: function() {
                    this.text += ',';
                }
            });

            text = new UCText('test');
            text.append('test');
            chai.assert.equal(text.text, 'TEST,TEST');
        });

        it('runs wraps all methods with aspects', function() {
            var Foo, foo, before = sinon.spy(), after = sinon.spy();

            Foo = Protoplast.extend({
                a: function() {
                },
                b: function() {
                }
            });

            Aop(Foo).aop(['a', 'b'], {
                after: after,
                before: before
            });

            foo = new Foo();

            sinon.assert.notCalled(after);
            sinon.assert.notCalled(before);

            foo.a();

            sinon.assert.calledOnce(after);
            sinon.assert.calledOnce(before);

            foo.b();

            sinon.assert.calledTwice(after);
            sinon.assert.calledTwice(before);
        });
    });

    describe('EventDispatcher', function() {
        it('allows to create event dispatchers', function() {

            var CustomDispatcher, dispatcher, message = '';

            CustomDispatcher = Protoplast.extend([Dispatcher], {
                hello: function() {
                    this.dispatch('message', 'hello')
                }
            });

            dispatcher = new CustomDispatcher();

            dispatcher.on('message', function(value) {
                message = value;
            });
            dispatcher.hello();

            chai.assert.equal(message, 'hello');
        });
    });

    describe('Dependency Injection', function() {
        it('inject dependencies according to config', function() {

            var Foo, Bar, foo, bar;

            Foo = Protoplast.extend({
                __meta__: {
                    inject: {bar: 'bar'}
                }
            });

            Bar = Protoplast.extend({
                __meta__: {
                    inject: {foo: 'foo'}
                }
            });

            var context = new Context();

            context.register('foo', foo = new Foo());
            context.register('bar', bar = new Bar());

            chai.assert.equal(foo.bar, bar);
            chai.assert.equal(bar.foo, foo);

        });

        it('inherits dependencies config from the base prototype', function() {

            var Foo, Foo2, Bar, foo, bar;

            Foo = Protoplast.extend({
                __meta__: {
                    inject: {bar: 'bar'}
                }
            });

            Foo2 = Foo.extend();

            Bar = Protoplast.extend();

            var context = new Context();

            context.register('foo', foo = new Foo2());
            context.register('bar', bar = new Bar());

            chai.assert.equal(foo.bar, bar);
        });

        it('passes fast inject function', function() {

            var Dep, dep, Foo, Bar, bar = null;

            Dep = Protoplast.extend({
                value: function() {
                    return 10;
                }
            });

            Bar = Protoplast.extend({
                __meta__: {
                    inject: {dep: 'dep'}
                }
            });

            Foo = Protoplast.extend({
                injected: function() {
                    bar = new Bar();
                    this.__fastinject__(bar);
                }
            });

            var context = new Context();
            context.register('foo', new Foo());
            context.register('dep', dep = new Dep());
            context.build();

            chai.assert.equal(bar.dep.value(), 10);
        });
    });

    describe('Pub/Sub', function() {
        it('dispatches messages between objects', function() {

            var Source, Destination, source, destination;

            Source = Protoplast.extend({
                __meta__: {
                    inject: {pub: 'pub'}
                },
                send: function(msg) {
                    this.pub('message', msg)
                }
            });

            Destination = Protoplast.extend({
                __meta__: {
                    inject: {sub: 'sub'}
                },
                injected: function() {
                    this.sub('message').add(this.save_message);
                },
                save_message: function(msg) {
                    this.message = msg;
                },
                clear: function() {
                    this.sub('message').remove();
                }
            });

            var context = new Context();
            context.register('source', source = new Source());
            context.register('dest', destination = new Destination());
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

    describe('Mixins', function() {
        it('allows to mixin objects', function() {

            var Foo, Bar, FooBar, foobar;

            Foo = Protoplast.extend({
                foo: 'foo'
            });

            Bar = Protoplast.extend({
                bar: 'bar'
            });

            FooBar = Protoplast.extend([Foo, Bar]);

            foobar = new FooBar();

            chai.assert.equal(foobar.foo, 'foo');
            chai.assert.equal(foobar.bar, 'bar');

        });
    });

    describe('Examples', function() {
        it('flux example', function() {

            var RootView, View, ActionDispatcher, Repository, view, repository, _view = null;

            function ViewFactory() {
                _view = new View();
                return _view;
            }

            // create root view that will be injected into repositories
            RootView = Protoplast.extend({
                __meta__: {
                    inject: {pub: 'pub'}
                },
                __init__: function() {
                    this.view = ViewFactory();
                },
                injected: function() {
                    this.view.pub = this.pub;
                },
                data: function(data) {
                    this.view.show(data.clicks);
                }
            });

            // create a clickable component that displays number of clicks
            View = Protoplast.extend({

                show: function(value) {
                    this.value = value;
                },

                click: function() {
                    this.pub('myview/clicked');
                }
            });

            // action dispatcher to convert view actions to domain actions
            ActionDispatcher = Protoplast.extend({

                __meta__: {
                    inject: {sub: 'sub', pub: 'pub'}
                },

                injected: function() {
                    this.sub('myview/clicked').add(this.count_click);
                },

                count_click: function() {
                    this.pub('click/increment', 1);
                }
            });

            // repository to react to domain actions and pass data to the view
            Repository = Protoplast.extend({

                __meta__: {
                    inject: {sub: 'sub', view: 'view'}
                },

                __init__: function() {
                    this.clicks = 0;
                },

                injected: function() {
                    this.sub('click/increment').add(this.increment);
                    this.refresh();
                },

                increment: function(value) {
                    this.clicks += value;
                    this.refresh();
                },

                refresh: function() {
                    this.view.data({clicks: this.clicks});
                }

            });

            var context = new Context();
            context.register('view', new RootView());
            context.register('ad', new ActionDispatcher());
            context.register('repo', repository = new Repository());
            context.build();

            chai.assert.equal(repository.clicks, 0);
            chai.assert.equal(_view.value, 0);

            _view.click();
            _view.click();
            _view.click();

            chai.assert.equal(repository.clicks, 3);
            chai.assert.equal(_view.value, 3);

        });
    });
});