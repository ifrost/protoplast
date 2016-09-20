var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    helper = require('./helper'),
    Protoplast = require('./../main'),
    Model = Protoplast.Model,
    Collection = Protoplast.Collection;

describe('Model', function() {

    var foo = sinon.stub(),
        bar = sinon.stub();

    it('creates observable setters', function() {

        var TestModel = Model.extend({
            foo: null,
            bar: 1,
            fn: function() {
                return 'test';
            }
        });

        var model = TestModel.create();

        chai.assert.strictEqual(model.foo, null);
        chai.assert.strictEqual(model.bar, 1);

        model.on('foo_changed', foo);
        model.on('bar_changed', bar);

        chai.assert.strictEqual(model.fn(), 'test');

        model.foo = null;
        model.bar = 1;

        sinon.assert.notCalled(foo);
        sinon.assert.notCalled(bar);

        model.foo = 1;
        model.bar = 2;

        sinon.assert.calledOnce(foo);
        sinon.assert.calledWith(foo, 1, null);
        sinon.assert.calledOnce(bar);
        sinon.assert.calledWith(bar, 2, 1);

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
            validNested = sinon.stub(),
            invalid = sinon.stub();

        var object = {foobar: {foo: {bar: 'test'}}};

        Protoplast.utils.resolveProperty(object, 'foobar.foo.bar', valid);
        Protoplast.utils.resolveProperty(object, 'foobar.foo', validNested);
        Protoplast.utils.resolveProperty(object, 'foobar.invalid.bar', invalid);

        sinon.assert.calledOnce(valid);
        sinon.assert.calledWith(valid, 'test');
        sinon.assert.calledOnce(validNested);
        sinon.assert.calledWith(validNested, object.foobar.foo);
        sinon.assert.notCalled(invalid)
    });

    it('dispatches changed event when computed property value is cleared (new value = undefined)', function() {


        var TestModel = Model.extend({

            bar: null,

            foo: {
                computed: ['bar'],
                value: function() {
                    return this.bar * 2;
                }
            }
        });

        var test = TestModel.create();

        var changeHandler = sinon.spy();

        test.on('foo_changed', changeHandler);

        sinon.assert.notCalled(changeHandler);
        test.bar = 1;
        sinon.assert.calledOnce(changeHandler);
        sinon.assert.calledWith(changeHandler, undefined, undefined); // old value is undefined because property was not computed

        test.foo; // calculate property, result -> 1*2=2
        test.bar = 2; // new value is not calculated automatically

        sinon.assert.calledTwice(changeHandler);
        sinon.assert.calledWith(changeHandler, undefined, 2);
    });

    it('clears binding handlers', function() {

        var Node = Model.extend({
            child: null
        });

        var level1 = Node.create(),
            level2 = Node.create(),
            level3 = Node.create(),
            level2Replace = Node.create(),
            handler = sinon.stub();

        Protoplast.utils.bind(level1, 'child.child', handler);
        chai.assert.lengthOf(helper.handlers(level1, 'child_changed'), 1);

        level1.child = level2;
        level2.child = level3;

        chai.assert.lengthOf(helper.handlers(level2, 'child_changed'), 1);

        level2Replace.child = level3;
        level1.child = level2Replace;

        chai.assert.lengthOf(helper.handlers(level2Replace, 'child_changed'), 1);
        chai.assert.lengthOf(helper.handlers(level2, 'child_changed'), 0);
    });

    describe('complex binding', function() {

        var Address, Person;

        beforeEach(function() {

            Address = Model.extend({
                street: '',
                city: '',
                $create: function(street, city) {
                    this.street = street;
                    this.city = city;
                }
            });

            Person = Model.extend({
                name: '',
                address: null,
                $create: function(name, street, city) {
                    this.name = name;
                    if (street && city) {
                        this.address = Address.create(street, city);
                    }
                }
            });

        });

        it('nested binding', function() {

            var john = Person.create('John', 'Baker', 'London');
            var hector = Person.create('Hector');

            var johnCity = sinon.stub();
            var hectorCity = sinon.stub();

            Protoplast.utils.bind(john, 'address.city', johnCity);
            Protoplast.utils.bind(hector, 'address.city', hectorCity);

            sinon.assert.calledOnce(johnCity); // city already defined
            sinon.assert.calledWith(johnCity, 'London');
            sinon.assert.notCalled(hectorCity); // address not defined

            // setting address
            hector.address = Address.create('East', 'Manchester');
            sinon.assert.calledOnce(hectorCity);
            sinon.assert.calledWith(hectorCity, 'Manchester');

            // changing address
            john.address = Address.create('West', 'Liverpool');
            sinon.assert.calledTwice(johnCity);
            sinon.assert.calledWith(johnCity, 'Liverpool');

            // changing city directly
            hector.address.city = 'Southampton';
            sinon.assert.calledTwice(hectorCity);
            sinon.assert.calledWith(hectorCity, 'Southampton');
        });

        it('binding between models', function() {

            var agent = Person.create('Agent', 'Baker', 'London');
            var spy = Person.create('Spy', 'Secret', '?');

            Protoplast.utils.bindProperty(agent, 'address.city', spy, 'address.city');

            chai.assert.strictEqual(spy.address.city, 'London');

            agent.address.city = 'Manchester';
            chai.assert.strictEqual(spy.address.city, 'Manchester');

            agent.address = Address.create('East', 'Liverpool');
            chai.assert.strictEqual(spy.address.city, 'Liverpool');
        });

        it('computed property', function() {

            var calcCounter = 0;

            var ExtPerson = Person.extend({

                info: {
                    computed: ['address.city', 'address.street'],
                    value: function() {
                        calcCounter++;
                        return this.name + ' address: ' + this.address.street + ', ' + this.address.city;
                    }
                }

            });

            var john = ExtPerson.create('John', 'Baker', 'London');

            chai.assert.strictEqual(calcCounter, 0);
            chai.assert.strictEqual(john.info, 'John address: Baker, London');
            chai.assert.strictEqual(calcCounter, 1);

            john.address.street = 'West';
            chai.assert.strictEqual(calcCounter, 1);
            john.info; // getter
            chai.assert.strictEqual(calcCounter, 2);

            chai.assert.strictEqual(john.info, 'John address: West, London');

            john.address = Address.create('East', 'Liverpool');
            chai.assert.strictEqual(john.info, 'John address: East, Liverpool');

        });

        it('binding to computed properties', function() {

            var calcCounter = 0;

            var ExtPerson = Person.extend({

                info: {
                    computed: ['address.city', 'address.street'],
                    value: function() {
                        calcCounter++;
                        return this.name + ' address: ' + this.address.street + ', ' + this.address.city;
                    }
                }

            });

            var Container = Model.extend({
                person: null
            });

            var Destination = Model.extend({
                johnInfo: null
            });

            var john = ExtPerson.create('John', 'Baker', 'London');
            var container = Container.create();
            var destination = Destination.create();
            var handler = sinon.stub();

            Protoplast.utils.bind(container, 'person.info', handler);
            chai.assert.strictEqual(calcCounter, 0);
            Protoplast.utils.bindProperty(container, 'person.info', destination, 'johnInfo');
            chai.assert.strictEqual(calcCounter, 0);

            container.person = john;
            chai.assert.strictEqual(calcCounter, 1);
            sinon.assert.calledOnce(handler);
            sinon.assert.calledWith(handler, 'John address: Baker, London');
            chai.assert.strictEqual(destination.johnInfo, 'John address: Baker, London');
            chai.assert.strictEqual(calcCounter, 1);
        });

        describe('collection binding', function() {

            var test, handler;

            beforeEach(function() {
                var TestModel = Model.extend({
                    list: null,
                    createList: function() {
                        this.list = Collection.create([1, 2]);
                    },
                    modifyList: function() {
                        this.list.add(3);
                    }
                });

                test = TestModel.create();
                handler = sinon.stub();

                Protoplast.utils.bindCollection(test, 'list', handler);
            });

            it('binding a collection changes', function() {

                sinon.assert.calledOnce(handler);

                test.createList();
                sinon.assert.calledTwice(handler);
                chai.assert.deepEqual(handler.lastCall.args[0].toArray(), [1, 2]);

                handler.reset();
                test.modifyList();
                sinon.assert.calledOnce(handler);
                chai.assert.deepEqual(handler.lastCall.args[0].toArray(), [1, 2, 3]);

            });

            it('clear collection bindings', function() {

                test.createList();
                var oldList = test.list;

                test.createList();

                chai.assert.lengthOf(helper.handlers(oldList, 'changed'), 0);
                chai.assert.lengthOf(helper.handlers(test.list, 'changed'), 1);
            });

            it('binding shortcut', function() {

                var handler = sinon.stub();

                var Test = Model.extend({
                    person: null,

                    $create: function() {
                        Protoplast.utils.bind(this, {
                            'person.address.city': this.cityChanged
                        });
                    },

                    cityChanged: handler
                });

                var bostonJohn = Person.create('John', 'Wall Street', 'Boston');
                var movingJane = Person.create('Jane', 'Baker Street', 'London');

                var test = Test.create();

                sinon.assert.notCalled(handler);
                test.person = movingJane;
                sinon.assert.calledOnce(handler);

                movingJane.address.city = 'Liverpool';
                sinon.assert.calledTwice(handler);

                movingJane.address.street = 'High Street';
                sinon.assert.calledTwice(handler);

                test.person = bostonJohn;
                sinon.assert.calledThrice(handler);

                bostonJohn.address.street = 'Newman Street';
                sinon.assert.calledThrice(handler);
            });

        });

    });

});