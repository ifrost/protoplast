var chai = require('chai'),
    sinon = require('sinon'),
    Protoplast = require('./../main');

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

});

require('./dispatcher.test');
require('./di.test');
require('./pubsub.test');
require('./mixins.test');
require('./model.test');
require('./collection.test');
require('./collection-view.test');
require('./component.test');
require('./examples.test');