var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Model = Protoplast.Model;

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

        var change_handler = sinon.spy();

        test.on('foo_changed', change_handler);

        sinon.assert.notCalled(change_handler);
        test.bar = 1;
        sinon.assert.calledOnce(change_handler);
        sinon.assert.calledWith(change_handler, undefined, undefined); // old value is undefined because property was not computed

        test.foo; // calculate property, result -> 1*2=2
        test.bar = 2; // new value is not calculated automatically

        sinon.assert.calledTwice(change_handler);
        sinon.assert.calledWith(change_handler, undefined, 2);
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

        it('binding between models', function() {

            var agent = Person.create('Agent', 'Baker', 'London');
            var spy = Person.create('Spy', 'Secret', '?');

            Protoplast.utils.bind_property(agent, 'address.city', spy, 'address.city');

            chai.assert.strictEqual(spy.address.city, 'London');

            agent.address.city = 'Manchester';
            chai.assert.strictEqual(spy.address.city, 'Manchester');

            agent.address = Address.create('East', 'Liverpool');
            chai.assert.strictEqual(spy.address.city, 'Liverpool');
        });

        it('computed property', function() {

            var calc_counter = 0;

            var ExtPerson = Person.extend({

                info: {
                    computed: ['address.city', 'address.street'],
                    value: function() {
                        calc_counter++;
                        return this.name + ' address: ' + this.address.street + ', ' + this.address.city;
                    }
                }

            });

            var john = ExtPerson.create('John', 'Baker', 'London');

            chai.assert.strictEqual(calc_counter, 0);
            chai.assert.strictEqual(john.info, 'John address: Baker, London');
            chai.assert.strictEqual(calc_counter, 1);

            john.address.street = 'West';
            chai.assert.strictEqual(calc_counter, 1);
            john.info; // getter
            chai.assert.strictEqual(calc_counter, 2);

            chai.assert.strictEqual(john.info, 'John address: West, London');

            john.address = Address.create('East', 'Liverpool');
            chai.assert.strictEqual(john.info, 'John address: East, Liverpool');

        });

        it('binding to computed properties', function() {

            var calc_counter = 0;

            var ExtPerson = Person.extend({

                info: {
                    computed: ['address.city', 'address.street'],
                    value: function() {
                        calc_counter++;
                        return this.name + ' address: ' + this.address.street + ', ' + this.address.city;
                    }
                }

            });

            var Container = Model.extend({
                person: null
            });

            var Destination = Model.extend({
                john_info: null
            });

            var john = ExtPerson.create('John', 'Baker', 'London');
            var container = Container.create();
            var destination = Destination.create();
            var handler = sinon.stub();

            Protoplast.utils.bind(container, 'person.info', handler);
            chai.assert.strictEqual(calc_counter, 0);
            Protoplast.utils.bind_property(container, 'person.info', destination, 'john_info');
            chai.assert.strictEqual(calc_counter, 0);

            container.person = john;
            chai.assert.strictEqual(calc_counter, 1);
            sinon.assert.calledOnce(handler);
            sinon.assert.calledWith(handler, 'John address: Baker, London');
            chai.assert.strictEqual(destination.john_info, 'John address: Baker, London');
            chai.assert.strictEqual(calc_counter, 1);
        });

        it('invalidates bindings when context is built', function() {

            var TestModel = Model.extend({
                dep: {
                    inject: 'dep'
                }
            });

            var test = TestModel.create();

            var changed_handler = sinon.spy();
            test.on('dep_changed', changed_handler);

            test.invalidated_injected_bindings();
            sinon.assert.calledOnce(changed_handler);
        });
    });

});