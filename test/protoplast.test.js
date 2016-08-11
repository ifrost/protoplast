var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Dispatcher = Protoplast.Dispatcher,
    Component = Protoplast.Component,
    Model = Protoplast.Model,
    TagComponent = Protoplast.TagComponent,
    Context = Protoplast.Context;

describe('Protoplast', function() {

    describe('Metadata', function() {

        it('assings metadata to the prototype', function() {
            var Base, fn = sinon.stub();

            Base = Protoplast.extend({
                $meta: {
                    num: 1,
                    bool: true,
                    str: 'text',
                    fn: fn,
                    obj: {test: 'test'}
                }
            });

            chai.assert.equal(Base.$meta.num, 1);
            chai.assert.equal(Base.$meta.bool, true);
            chai.assert.equal(Base.$meta.str, 'text');
            chai.assert.equal(Base.$meta.fn, fn);
            chai.assert.equal(Base.$meta.obj.test, 'test');
        });

        it('merges primitive values in metadata', function() {

            var Base, Sub, fn = sinon.stub();

            Base = Protoplast.extend({
                $meta: {
                    num: 1,
                    bool: true,
                    str: 'text',
                    fn: fn
                }
            });

            Sub = Base.extend();

            chai.assert.equal(Sub.$meta.num, 1);
            chai.assert.equal(Sub.$meta.bool, true);
            chai.assert.equal(Sub.$meta.str, 'text');
            chai.assert.equal(Sub.$meta.fn, fn);
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

            chai.assert.deepEqual(Sub.$meta.properties.inject, {
                foo: "dependency2"
            });

            chai.assert.deepEqual(Sub.$meta.properties.content, {
                foo: {
                    list: ['foo', 'bar', 'foobar']
                }
            });
        });

    });

    describe('Hooks', function() {

        describe('Prototype hooks', function() {

            it('hooks to prototype descriptions', function() {

                var Base, description, hook;

                hook = {
                    desc: sinon.spy()
                };

                description = {
                    $meta: {
                        hooks: [hook]
                    }
                };

                Base = Protoplast.extend(description);

                sinon.assert.calledOnce(hook.desc);
                sinon.assert.calledWith(hook.desc, description);

            });

            it('hooks to prototype definitions', function() {

                var Base, hook;

                hook = {
                    proto: sinon.spy()
                };

                Base = Protoplast.extend({
                    $meta: {
                        hooks: [hook]
                    }
                });

                sinon.assert.calledOnce(hook.proto);
                sinon.assert.calledWith(hook.proto, Base);
            });

            it('inherits prototype hooks', function() {

                var Base, Sub;

                var base_hook = {
                    proto: sinon.spy()
                };

                var sub_hook = {
                    proto: sinon.spy()
                };

                Base = Protoplast.extend({$meta: {hooks: [base_hook]}});
                Sub = Base.extend({$meta: {hooks: [sub_hook]}});

                sinon.assert.calledOnce(sub_hook.proto);
                sinon.assert.calledWith(sub_hook.proto, Sub);

                sinon.assert.calledTwice(base_hook.proto);
                sinon.assert.calledWith(base_hook.proto, Base);
                sinon.assert.calledWith(base_hook.proto, Sub);
            });

        });

        describe('Properties hooks', function() {

            it('hooks to descriptors definitions', function() {

                var decorator = {
                    desc: function(proto, name, desc) {
                        desc.value = function() {
                            return 2;
                        }
                    }
                };

                var Base = Protoplast.extend({
                    foo: {
                        hooks: [decorator],
                        value: function() {
                            return 1;
                        }
                    }
                });

                var base = Base.create();

                chai.assert.strictEqual(2, Base.foo());
                chai.assert.strictEqual(2, base.foo());
            });

            it('hooks to prototype functions', function() {

                var decorator = {
                    proto: function(fn) {
                        return function() {
                            return fn() + 1;
                        }
                    }
                };

                var Base = Protoplast.extend({

                    foo: {
                        hooks: [decorator],
                        value: function() {
                            return 1;
                        }
                    }
                });

                var base = Base.create();

                chai.assert.strictEqual(2, Base.foo());
                chai.assert.strictEqual(2, base.foo());
            });

            it('hooks to instance functions', function() {

                var decorator = {
                    instance: function(fn) {
                        return function() {
                            return fn() + 1;
                        }
                    }
                };

                var Base = Protoplast.extend({
                    foo: {
                        hooks: [decorator],
                        value: function() {
                            return 1;
                        }
                    }
                });

                var base = Base.create();

                chai.assert.strictEqual(1, Base.foo());
                chai.assert.strictEqual(2, base.foo());
            });

            it('inherits instance hooks', function() {

                var add = function(value) {
                    return {
                        instance: function(fn) {
                            return function() {
                                return fn.apply(this, arguments) + value;
                            }
                        }
                    }
                };

                var multiply = function(value) {
                    return {
                        instance: function(fn) {
                            return function() {
                                return fn.apply(this, arguments) * value;
                            }
                        }
                    }
                };

                var Base = Protoplast.extend({
                    foo: {
                        hooks: [add(1)],
                        value: function() {
                            return 1;
                        }
                    }
                });

                var Sub = Base.extend({
                    foo: {
                        hooks: [multiply(2)]
                    }
                });

                var base = Base.create();
                var sub = Sub.create();

                chai.assert.strictEqual(1, Base.foo());
                chai.assert.strictEqual(2, base.foo());
                chai.assert.strictEqual(1, Sub.foo());
                chai.assert.strictEqual(4, sub.foo());

            });

            it('does not inherit proto hooks', function() {

                var add = function(value) {
                    return {
                        proto: function(fn) {
                            return function() {
                                return fn.apply(this, arguments) + value;
                            }
                        }
                    }
                };

                var multiply = function(value) {
                    return {
                        proto: function(fn) {
                            return function() {
                                return fn.apply(this, arguments) * value;
                            }
                        }
                    }
                };

                var Base = Protoplast.extend({
                    foo: {
                        hooks: [add(1)],
                        value: function() {
                            return 1;
                        }
                    }
                });

                var Sub = Base.extend({
                    foo: {
                        hooks: [multiply(2)]
                    }
                });

                var base = Base.create();
                var sub = Sub.create();

                chai.assert.strictEqual(2, Base.foo());
                chai.assert.strictEqual(2, base.foo());
                chai.assert.strictEqual(4, Sub.foo());
                chai.assert.strictEqual(4, sub.foo());

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
                    constructors: [function() {
                        this.value += '2';
                    },
                        function() {
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
                        constructors: [Protoplast.constructors.uniqueId]
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
                        constructors: [Protoplast.constructors.autobind]
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

        it('allows to create getters and setters', function() {

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

        it('removes handlers', function() {
            var CustomDispatcher, dispatcher, message = '';

            CustomDispatcher = Protoplast.extend([Dispatcher], {
                hello: function() {
                    this.dispatch('message', 'hello');
                }
            });

            dispatcher = CustomDispatcher.create();

            var removed_handler = sinon.spy();
            var active_handler = sinon.spy();

            dispatcher.on('message', removed_handler);
            dispatcher.on('message', active_handler);
            dispatcher.off('message', removed_handler);

            dispatcher.hello();

            sinon.assert.called(active_handler);
            sinon.assert.notCalled(removed_handler);

        });
    });

    describe('Component', function() {

        beforeEach(function(done) {
            jsdom.env('<html><body></body></html>', function(err, window) {
                global.document = window.document;
                done();
            })
        });

        it('creates a component with default DIV tag', function() {

            var component = Component.create();
            chai.assert.isNotNull(component.root);
            chai.assert.strictEqual(component.root.tagName, 'DIV');
        });

        it('adds a child to a component', function() {
            var Root = Component.extend({tag: 'div'});
            var Child = Component.extend({tag: 'span'});

            var root = Root.create();
            var child = Child.create();

            root.add(child);

            chai.assert.lengthOf(root.root.children, 1);
        });

        it('removes children', function() {
            var root = Component.create(),
                childA = Component.create(),
                childB = Component.create();

            root.add(childA);
            root.add(childB);

            root.remove(childA);

            chai.assert.strictEqual(root.root, childB.root.parentNode);
            chai.assert.isNull(childA.root.parentNode);
        });

        it('destroys all children when removing', function() {
            var destroy = sinon.stub(),
                Child = Component.extend({destroy: destroy});

            var root = Component.create(),
                childA = Child.create(),
                childB = Child.create();

            root.add(childA);
            root.add(childB);

            root.remove(childA);

            sinon.assert.calledOnce(destroy);
        });

        it('destroys all children when parent is destroyed', function() {
            var destroy = sinon.stub(),
                Child = Component.extend({destroy: destroy});

            var root = Component.create(),
                childA = Child.create(),
                childB = Child.create();

            root.add(childA);
            root.add(childB);

            root.destroy();

            sinon.assert.calledTwice(destroy);
        });

        it('root component attached element and register object in context', function() {
            var element = document.createElement('div'),
                context = {register: sinon.stub()},
                component;

            component = Component.Root(element, context);
            chai.assert.strictEqual(element, component.root);
            sinon.assert.calledWith(context.register, component);
        });

        it('throws an exception when adding non-child component', function() {

            var component = Component.create();

            chai.assert.throws(component.add.bind(component, null));
            chai.assert.throws(component.add.bind(component, {}));

        });

        it('initialises children when root is added to context', function() {
            var context,
                init = sinon.stub(),
                Child = Component.extend({init: init});

            var root = Component.create(),
                childA = Child.create(),
                childB = Child.create(),
                childC = Child.create();

            root.add(childA);
            root.add(childB);

            context = Context.create();
            context.register(root);

            root.add(childC);

            sinon.assert.calledThrice(init);

        });

    });

    describe('Components Dependency Injection', function() {

        beforeEach(function(done) {
            jsdom.env('<html><body></body></html>', function(err, window) {
                global.document = window.document;
                done();
            })
        });

        it('injects all dependencies to children element with __fastinject__', function() {

            var element = document.createElement('div'), main,
                context = Context.create();

            context.register('foo', 'foo');
            main = Component.Root(element, context);

            var Root = Component.extend({
                tag: 'div',
                foo: {inject: 'foo'}
            });
            var Child = Component.extend({
                tag: 'span',
                init: function() {
                    this.bar = this.foo
                },
                foo: {inject: 'foo'}
            });
            var GrandChild = Component.extend({
                tag: 'p',
                foo: {inject: 'foo'}
            });

            var root = Root.create();
            var child = Child.create();
            var grand = GrandChild.create();

            root.add(child);
            child.add(grand);

            main.add(root);

            chai.assert.strictEqual(root.foo, 'foo');
            chai.assert.strictEqual(child.foo, 'foo');
            chai.assert.strictEqual(grand.foo, 'foo');
            chai.assert.strictEqual(child.bar, 'foo');
        });


        it('initialises component trees after attaching to the parent', function() {

            var context = Context.create();

            context.register('foo', 'foo');

            var Root = Component.extend({
                tag: 'div',
                foo: {inject: 'foo'}
            });
            var Child = Component.extend({
                tag: 'span',
                foo: {inject: 'foo'}
            });
            var GrandChild = Component.extend({
                tag: 'p',
                foo: {inject: 'foo'}
            });

            var root = Root.create();
            var child = Child.create();
            var grand = GrandChild.create();

            root.add(child);
            child.add(grand);

            context.register(root);

            chai.assert.strictEqual(root.foo, 'foo');
            chai.assert.strictEqual(child.foo, 'foo');
            chai.assert.strictEqual(grand.foo, 'foo');
        });

        it('injects all dependencies to children element', function() {

            var context = Context.create();
            context.register('foo', 'foo');

            var Root = Component.extend({
                tag: 'div',
                foo: {inject: 'foo'}
            });
            var Child = Component.extend({
                tag: 'span',
                init: function() {
                    this.bar = this.foo
                },
                foo: {inject: 'foo'}
            });

            var root = Root.create();
            var child = Child.create();

            root.add(child);

            chai.assert.strictEqual(child.bar, undefined);

            context.register(root);
            chai.assert.strictEqual(root.foo, 'foo');
            chai.assert.strictEqual(child.foo, 'foo');
            chai.assert.strictEqual(child.bar, 'foo');
        });

        it('processes template processors', function() {

            var processor = {
                attribute: 'data-test',
                process: sinon.spy()
            };

            var Root = Component.extend({
                $meta: {
                    dom_processors: [processor]
                },
                html: '<div><span data-test="foo"></span></div>'
            });

            var root = Root.create();

            sinon.assert.calledOnce(processor.process);
            sinon.assert.calledWith(processor.process, root, sinon.match.any, 'foo')

        });

        it('does not process the root', function() {

            var processor = {
                attribute: 'data-test',
                process: sinon.spy()
            };

            var Root = Component.extend({
                $meta: {
                    dom_processors: [processor]
                },
                html: '<span data-test="foo"></span>'
            });

            var root = Root.create();

            sinon.assert.notCalled(processor.process);

        });

        describe('TagComponent', function() {

            it('creates presenter', function() {

                var init = sinon.stub();

                var Presenter = Protoplast.extend({
                    init: {
                        inject_init: true,
                        value: init
                    },
                    foo: {
                        inject: 'foo'
                    }
                });

                var context = Context.create();

                context.register('foo', 'foo');

                var Root = TagComponent.extend({
                    $meta: {
                        presenter: Presenter
                    },
                    tag: 'div',
                    foo: {inject: 'foo'}
                });

                sinon.spy(Presenter, 'create');

                var root = Root.create();
                context.register(root);
                context.build();

                sinon.assert.calledOnce(Presenter.create);

                var presenter = Presenter.create.returnValues[0];

                chai.assert.strictEqual(presenter.view, root);
                chai.assert.strictEqual(presenter.foo, 'foo');
            });

            it('injects elements by query selector', function() {

                var Root = TagComponent.extend({
                    html: '<div><span class="foo">test</span></div>',
                    foo: {
                        $: '.foo'
                    }
                });

                var root = Root.create();

                chai.assert.isNotNull(root.foo);
                chai.assert.equal(root.foo.innerHTML, 'test');
            });

            it('injects elements marked with data-prop', function() {

                var Root = TagComponent.extend({
                    html: '<div><span data-prop="foo">test</span></div>'
                });

                var root = Root.create();

                chai.assert.isNotNull(root.foo);
                chai.assert.equal(root.foo.innerHTML, 'test');
            });

            it('creates components and replaces elements marked with data-comp', function() {

                var Child = TagComponent.extend({
                    foo: 'foo'
                });

                var Root = TagComponent.extend({
                    foo: {component: Child},
                    html: '<div><span data-comp="foo"></span></div>'
                });

                var root = Root.create();

                chai.assert.isNotNull(root.foo);
                chai.assert.equal(root.foo.foo, 'foo');

            });

            it('creates components and replaces elements marked with custom tags', function() {

                var Child = TagComponent.extend({
                    $meta: {
                        tag: 'test-child'
                    },
                    foo: 'foo'
                });

                var Root = TagComponent.extend({
                    html: '<div><test-child data-id="foo"/></span></div>'
                });

                var root = Root.create();

                chai.assert.isNotNull(root.foo);
                chai.assert.equal(root.foo.foo, 'foo');

            });

        });

    });

    describe.only('Model', function() {

        var foo = sinon.stub(),
            bar = sinon.stub();

        it('creates observable setters', function() {

            var TestModel = Model.extend({
                foo: null,
                bar: 1
            });

            var model = TestModel.create();

            chai.assert.strictEqual(model.foo, null);
            chai.assert.strictEqual(model.bar, 1);

            model.on('foo_changed', foo);
            model.on('bar_changed', bar);

            model.foo = null;
            model.bar = 1;

            sinon.assert.notCalled(foo);
            sinon.assert.notCalled(bar);

            model.foo = 1;
            model.bar = 2;

            sinon.assert.calledOnce(foo);
            sinon.assert.calledWith(foo, 1);
            sinon.assert.calledOnce(bar);
            sinon.assert.calledWith(bar, 2);

            chai.assert.strictEqual(model.foo, 1);
            chai.assert.strictEqual(model.bar, 2);
        });

        it('simple binding', function() {

            var foo = sinon.stub();

            var TestModel = Model.extend({
                foo: null,
                bar: 1
            });

            var model = TestModel.create();

            Protoplast.utils.bind(model, 'foo', foo);

            sinon.assert.calledOnce(foo);

            model.foo = 2;

            sinon.assert.calledTwice(foo);
        });

        it('resolves property chain', function() {

            var valid = sinon.stub(),
                valid_nested = sinon.stub(),
                invalid = sinon.stub();

            var object = {foobar: {foo: {bar: 'test'}}};

            Protoplast.utils.resolve_property(object, 'foobar.foo.bar', valid);
            Protoplast.utils.resolve_property(object, 'foobar.foo', valid_nested);
            Protoplast.utils.resolve_property(object, 'foobar.invalid.bar', invalid);

            sinon.assert.calledOnce(valid);
            sinon.assert.calledWith(valid, 'test');
            sinon.assert.calledOnce(valid_nested);
            sinon.assert.calledWith(valid_nested, object.foobar.foo);
            sinon.assert.notCalled(invalid)
        });

        it('nested binding', function() {

            var Address = Model.extend({
                street: '',
                city: '',
                $create: function(street, city) {
                    this.street = street;
                    this.city = city;
                }
            });

            var Person = Model.extend({
                name: '',
                address: null,
                $create: function(name, street, city) {
                    this.name = name;
                    if (street && city) {
                        this.address = Address.create(street, city);
                    }
                }
            });

            var john = Person.create('John', 'Baker', 'London');
            var hector = Person.create('Hector');

            var john_city = sinon.stub();
            var hector_city = sinon.stub();

            Protoplast.utils.bind(john, 'address.city', john_city);
            Protoplast.utils.bind(hector, 'address.city', hector_city);

            sinon.assert.calledOnce(john_city); // city already defined
            sinon.assert.calledWith(john_city, 'London');
            sinon.assert.notCalled(hector_city); // address not defined

            // setting address
            hector.address = Address.create('East', 'Manchester');
            sinon.assert.calledOnce(hector_city);
            sinon.assert.calledWith(hector_city, 'Manchester');

            // changing address
            john.address = Address.create('West', 'Liverpool');
            sinon.assert.calledTwice(john_city);
            sinon.assert.calledWith(john_city, 'Liverpool');

            // changing city directly
            hector.address.city = 'Southampton';
            sinon.assert.calledTwice(hector_city);
            sinon.assert.calledWith(hector_city, 'Southampton');
        });

    });

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

            chai.assert.equal(foo.bar, bar);
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

    describe('Examples', function() {

        describe('README.md', function() {
            it('Quick ride', function() {

                var Person = Protoplast.extend({
                    $create: function(name, age) {
                        this.name = name;
                        this.age = age;
                    },
                    hello: function() {
                        return 'My name is ' + this.name + '. I am ' + this.age + ' years old.';
                    }
                });

                var louie = Person.create("Louie", 30);
                chai.assert.equal(louie.hello(), "My name is Louie. I am 30 years old.");

                var Liar = Person.extend({
                    $create: function(name, age) {
                        this.name = "Barbara"; // no need to call Person.$create
                    },
                    hello: function() {
                        this.age--;
                        return Person.hello.call(this) + " I am not lying!"
                    }
                });
                var anne = Liar.create("Anne", 30);
                chai.assert.equal(anne.name, "Barbara");
                chai.assert.equal(anne.age, 30);
                chai.assert.equal(anne.hello(), "My name is Barbara. I am 29 years old. I am not lying!");
                chai.assert.equal(anne.hello(), "My name is Barbara. I am 28 years old. I am not lying!");
                chai.assert.equal(anne.age, 28);

                var cant_lie = {
                    instance: function(value, name, proto, instance) {
                        Object.defineProperty(instance, name, {writable: false});
                        return value;
                    }
                };

                var LiarLiar = Liar.extend({
                    $create: function(name, age) {
                        this.name = name;
                    },
                    age: {
                        hooks: [cant_lie]
                    }
                });
                var fletcher = LiarLiar.create("Fletcher", 35);
                chai.assert.equal(fletcher.hello(), "My name is Fletcher. I am 35 years old. I am not lying!");
                chai.assert.equal(fletcher.hello(), "My name is Fletcher. I am 35 years old. I am not lying!");
            });

            it('constructors order', function() {
                var foo = sinon.spy(), bar = sinon.spy(), create = sinon.spy();
                var Foo = Protoplast.extend({
                    $meta: {
                        constructors: [foo, bar]
                    },
                    $create: create
                });
                Foo.create();
                sinon.assert.callOrder(foo, bar, create);
            });

            it('merging meta-data', function() {
                var Foo = Protoplast.extend({
                    $meta: {
                        list: [1, 2]
                    }
                });

                var Bar = Foo.extend({
                    $meta: {
                        list: [3, 4]
                    }
                });

                chai.assert.deepEqual(Bar.$meta.list, [1, 2, 3, 4]);

            });

        });

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
