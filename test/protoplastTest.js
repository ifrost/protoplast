var chai = require('chai'),
    sinon = require('sinon'),
    Protoplast = require('./../main'),
    Dispatcher = Protoplast.Dispatcher,
    Aop = Protoplast.Aop,
    Context = Protoplast.Context;

describe('Protoplast', function() {

    describe('Metadata', function() {

        it('assings metadata to the prototype', function() {
            var Base;

            Base = Protoplast.extend({
                $meta: {
                    num: 1,
                    bool: true,
                    str: 'text',
                    obj: {test: 'test'}
                }
            });

            chai.assert.equal(Base.$meta.num, 1);
            chai.assert.equal(Base.$meta.bool, true);
            chai.assert.equal(Base.$meta.str, 'text');
            chai.assert.equal(Base.$meta.obj.test, 'test');
        });

        it('merges primitive values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                $meta: {
                    num: 1,
                    bool: true,
                    str: 'text'
                }
            });

            Sub = Base.extend();

            chai.assert.equal(Sub.$meta.num, 1);
            chai.assert.equal(Sub.$meta.bool, true);
            chai.assert.equal(Sub.$meta.str, 'text');
        });

        it('overrides primitive values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                $meta: {
                    num: 1,
                    bool: true,
                    str: 'text'
                }
            });

            Sub = Base.extend({
                $meta: {
                    num: 2,
                    bool: false,
                    str: 'text 2'
                }
            });

            chai.assert.equal(Sub.$meta.num, 2);
            chai.assert.equal(Sub.$meta.bool, false);
            chai.assert.equal(Sub.$meta.str, 'text 2');
        });

        it('concatenates arrays in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                $meta: {array: [1, 2, 3]}
            });
            Sub = Base.extend({
                $meta: {array: [4]}
            });

            chai.assert.deepEqual(Sub.$meta.array, [1, 2, 3, 4]);
        });

        it('deeply merges object values in metadata', function() {

            var Base, Sub;

            Base = Protoplast.extend({
                $meta: {
                    obj: {
                        base: 1,
                        override: 'test',
                        array: [1, 2, 3]
                    }
                }
            });

            Sub = Base.extend({
                $meta: {
                    obj: {
                        sub: 2,
                        override: 'test 2',
                        array: [4]
                    }
                }
            });

            chai.assert.deepEqual(Sub.$meta.obj, {
                sub: 2,
                base: 1,
                override: 'test 2',
                array: [1, 2, 3, 4]
            });
        });

        it('assigns meta data with instances', function() {
            var Base = Protoplast.extend(), base;
            base = Base.create();
            chai.assert.equal(base.$meta, Base.$meta);
        });

        it('assigns meta data with properties', function() {
            var Base = Protoplast.extend({
                foo: {
                    inject: "dependency",
                    content: {list: ['foo', 'bar']}
                }
            });

            var Sub = Base.extend({
                foo: {
                    inject: "dependency2",
                    content: {list: ['foobar']}
                }
            });

            chai.assert.deepEqual(Sub.$meta.inject, {
                foo: "dependency2"
            });

            chai.assert.deepEqual(Sub.$meta.content, {
                foo: {
                    list: ['foo','bar','foobar']
                }
            });
        });

    });

    describe('Constructors', function() {

        it('constructors are run starting from the base prototype', function() {

            var Base = Protoplast.extend({
                $create: function() {
                    this.value = '1'
                }
            });
            var Sub = Base.extend({
                $meta: {
                    $constructors: [function(){
                        this.value += '2';
                    },
                    function(){
                        this.value += '3'
                    }]
                }
            });
            var SubSub = Sub.extend({
                $create: function() {
                    this.value += '4';
                }
            });
            var subSub = SubSub.create();
            chai.assert.strictEqual(subSub.value, '1234');
        });

        describe('UniqueId', function() {

            it('adds unique id to created instances', function() {
                var Base = Protoplast.extend({
                    $meta: {
                        $constructors: [Protoplast.constructors.uniqueId]
                    }
                });
                chai.assert.isUndefined(Base.$id);

                var instance = Base.create();
                chai.assert.isDefined(instance.$id);
            });

        });

        describe('Autobinding', function() {

            it('autobinds methods', function() {

                var Base = Protoplast.extend({

                    $meta: {
                        name: 'Base'
                    },

                    $create: function(value) {
                        this._value = value;
                    },

                    get_value: function() {
                        return this._value;
                    }

                });

                var Sub = Base.extend({
                    $meta: {
                        $constructors: [Protoplast.constructors.autobind]
                    }
                });

                var base = Base.create(2);
                var sub = Sub.create(3);

                var base_get = base.get_value;
                var sub_get = sub.get_value;

                chai.assert.strictEqual(base.get_value(), 2);
                chai.assert.strictEqual(sub.get_value(), 3);

                chai.assert.isUndefined(base_get());
                chai.assert.strictEqual(sub_get(), 3);

            });

        });

    });

    describe('Inheritance', function() {
        it('creates a simple prototype', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend({
                value: 10
            });

            Sub = Base.extend();

            base = Base.create();
            sub = Sub.create();

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);
        });

        it('inherits all properties', function() {

            var Base, Sub, sub;

            Base = Protoplast.extend({
                $create: function(value) {
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

            sub = Sub.create(10);
            chai.assert.equal(sub.get_value(), 10);
        });

        it('allows to create getters and setters', function(){

            var Base = Protoplast.extend({
                value: {
                    get: function() {
                        return 10;
                    }
                },
                setter: {
                    set: function(value) {
                        this.setter_value = value;
                    }
                }
            });

            var b = Base.create();
            chai.assert.equal(b.value, 10);

            b.setter = 11;
            chai.assert.equal(b.setter_value, 11);
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
                    return Base.test.call(this) * 2;
                }
            });

            base = Base.create();
            sub = Sub.create();

            chai.assert.equal(base.test(), 10);
            chai.assert.equal(sub.test(), 20);
        });

    });

    describe('AOP', function() {
        it('allows to add after aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend({
                $create: function(text) {
                    this.text = text;
                },
                append: function(text) {
                    this.text += text;
                }
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                after: function() {
                    this.text += '!';
                }
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext!');
        });

        it('allows to add before aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend({
                $create: function(text) {
                    this.text = text;
                },
                append: function(text) {
                    this.text += text;
                }
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                before: function() {
                    this.text += ',';
                }
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'text,text');
        });

        it('runs aspects on subinstances', function() {

            var Text, UCText, text;

            Text = Protoplast.extend({
                $create: function(text) {
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

            text = UCText.create('test');
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

            foo = Foo.create();

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
                    this.dispatch('message', 'hello');
                }
            });

            dispatcher = CustomDispatcher.create();

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
                $meta: {
                    inject: {bar: 'bar'}
                }
            });

            Bar = Protoplast.extend({
                $meta: {
                    inject: {foo: 'foo'}
                }
            });

            var context = Context.create();

            context.register('foo', foo = Foo.create());
            context.register('bar', bar = Bar.create());

            chai.assert.equal(foo.bar, bar);
            chai.assert.equal(bar.foo, foo);

        });

        it('inherits dependencies config from the base prototype', function() {

            var Foo, Foo2, Bar, foo, bar;

            Foo = Protoplast.extend({
                $meta: {
                    inject: {bar: 'bar'}
                }
            });

            Foo2 = Foo.extend();

            Bar = Protoplast.extend();

            var context = Context.create();

            context.register('foo', foo = Foo2.create());
            context.register('bar', bar = Bar.create());

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
                    inject: {dep: 'dep'}
                }
            });

            Foo = Protoplast.extend({
                injected: {
                    inject_init: true,
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
    });

    describe('Pub/Sub', function() {
        it('dispatches messages between objects', function() {

            var Source, Destination, source, destination;

            Source = Protoplast.extend({
                $meta: {
                    inject: {pub: 'pub'}
                },
                send: function(msg) {
                    this.pub('message', msg);
                }
            });

            Destination = Protoplast.extend({
                $meta: {
                    inject: {sub: 'sub'}
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
    });

    describe('Processors', function() {

        it('inherits and runs processors', function() {

            var Base, Sub, base_processor = sinon.spy(), sub_processor = sinon.spy();

            Base = Protoplast.extend({$meta: {$processors: [base_processor]}});
            Sub = Base.extend({$meta: {$processors: [sub_processor]}});

            sinon.assert.calledOnce(sub_processor);
            sinon.assert.calledWith(sub_processor, Sub);

            sinon.assert.calledTwice(base_processor);
            sinon.assert.calledWith(base_processor, Base);
            sinon.assert.calledWith(base_processor, Sub);
        });

    });

    describe('Examples', function() {
        it('flux example', function() {

            var RootView, View, ActionDispatcher, Repository, view, repository, _view;

            function ViewFactory() {
                _view = View.create();
                return _view;
            }

            // create root view that will be injected into repositories
            RootView = Protoplast.extend({

                pub: {
                    inject: 'pub'
                },                

                $create: function() {
                    this.view = ViewFactory();
                },

                initialize: {
                    inject_init: true,
                    value: function() {
                        this.view.pub = this.pub;
                    }
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

                pub: {
                    inject: 'pub'
                },

                count_click: {
                    sub: 'myview/clicked',
                    value: function() {
                        this.pub('click/increment', 1);
                    }
                }
            });

            // repository to react to domain actions and pass data to the view
            Repository = Protoplast.extend({

                view: {
                    inject: 'view'
                },

                $create: function() {
                    this.clicks = 0;
                },

                increment: {
                    sub: 'click/increment',
                    value: function(value) {
                        this.clicks += value;
                        this.refresh();
                    }
                },

                refresh: {
                    inject_init: true,
                    value: function() {
                        this.view.data({clicks: this.clicks});
                    }
                }

            });

            var context = Context.create();
            context.register('view', RootView.create());
            context.register('ad', ActionDispatcher.create());
            context.register('repo', repository = Repository.create());
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
