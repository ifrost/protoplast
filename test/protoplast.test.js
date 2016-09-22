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

        it('overrides non-literal objects', function() {
            var Base, Sub;

            var baseMetaObj = Protoplast.extend({base: 'base', common: 'baseCommon'}).create(),
                subMetaObj = Protoplast.extend({sub: 'sub', common: 'subCommon'}).create();

            Base = Protoplast.extend({
                $meta: {
                    obj: baseMetaObj
                }
            });

            Sub = Base.extend({
                $meta: {
                    obj: subMetaObj
                }
            });

            chai.assert.strictEqual(Sub.$meta.obj.sub, 'sub');
            chai.assert.strictEqual(Sub.$meta.obj.common, 'subCommon');
            chai.assert.isUndefined(Sub.$meta.obj.base);
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

        it('defines properties', function() {

            var Base = Protoplast.extend({
                foo: {
                    test: 1
                }
            });
            var Sub = Base.extend({
                foo: {
                    foobar: 2
                }
            });
            var base = Base.create();
            var sub = Sub.create();

            chai.assert.ok('foo' in Base);
            chai.assert.ok('foo' in base);
            chai.assert.ok('foo' in Sub);
            chai.assert.ok('foo' in sub);

            Base.foo = 1;
            base.foo = 2;
            Sub.foo = 3;
            sub.foo = 4;

            chai.assert.strictEqual(Base.foo, 1);
            chai.assert.strictEqual(base.foo, 2);
            chai.assert.strictEqual(Sub.foo, 3);
            chai.assert.strictEqual(sub.foo, 4);
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
        
        describe('Autobinding', function() {

            it('autobinds methods', function() {

                var Base = Protoplast.extend({

                    $meta: {
                        name: 'Base'
                    },

                    $create: function(value) {
                        this._value = value;
                    },

                    getValue: function() {
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

                var baseGet = base.getValue;
                var subGet = sub.getValue;

                chai.assert.strictEqual(base.getValue(), 2);
                chai.assert.strictEqual(sub.getValue(), 3);

                chai.assert.isUndefined(baseGet());
                chai.assert.strictEqual(subGet(), 3);

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
                    this.setValue(value);
                },
                setValue: function(value) {
                    this.value = value;
                }
            });

            Sub = Base.extend({
                getValue: function() {
                    return this.value;
                }
            });

            sub = Sub.create(10);
            chai.assert.equal(sub.getValue(), 10);
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
                        this.setterValue = value;
                    }
                }
            });

            var b = Base.create();
            chai.assert.equal(b.value, 10);

            b.setter = 11;
            chai.assert.equal(b.setterValue, 11);
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