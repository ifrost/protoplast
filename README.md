# Protoplast

[![Build Status](https://travis-ci.org/ifrost/protoplast.svg?branch=master)](https://travis-ci.org/ifrost/protoplast) [![codecov](https://codecov.io/gh/ifrost/protoplast/branch/master/graph/badge.svg)](https://codecov.io/gh/ifrost/protoplast)

# Overview

Protoplast = prototypal inheritance with meta-data.

# Extending objects

`Protoplast` is the base, root object for all objects (like vanilla JavaScript `Object`). To create new objects use `.extend(description)` method (vanilla equivalent of `Object.create()`. Example:

Protoplast:

    var ClarkKent = Protoplast.extend();
    var Superman = ClarkKent.extend();

Vanilla:

    var ClarkKent = Object.create(Object.prototype);
    var Superman = Object.create(ClarkKent);

Result: 

    ClarkKent.isPrototypeOf(Superman); // true

# Defining properties

Protoplast:

    var ClarkKent = Protoplast.extend({
        glasses: {
            writable: true,
            value: true
        }
    });

    var Superman = ClarkKent.extend({
        glasses: {
            writable: false,
            value: false
        }
    });

Vanilla:

    var ClarkKent = Object.create(Object.prototype, {
        glasses: {
            writable: true,
            value: true
        }
    });
    var Superman = Object.create(ClarkKent, {
        glasses: {
            writable: false,
            value: false
        }
    });

Result:

    console.log(ClarkKent.glasses); // true
    ClarkKent.glasses = false;
    console.log(ClarkKent.glasses); // false, Clark can take off his glasses

    console.log(Superman.glasses); // false
    Superman.glasses = true;
    console.log(Superman.glasses); // false, Superman cannot wear glasses

# Shortcuts for property descriptors

If a property you define is a primitive value that is writable, enumerable and configurable, i.e.:

    var ClarkKent = Protoplast.extend({
        name: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: 'Clark Kent'
        }
    });
    
It can also be set as:

    var ClarkKent = Protoplast.extend({
        name: 'Clark Kent'
    });

Functions can be set in the same way. 

Note: Complex object cannot be set with shortcuts, which means...

    // bad
    var ClarkKent = Protoplast.extend({
        address: {
            street: '344 Clinton Street',
            city: 'Metropolis'
        }
    });

...has to be written as:

    // good
    var ClarkKent = Protoplast.extend({
        address: {
            value: {
                street: '344 Clinton Street',
                city: 'Metropolis'
            }
        }
    });

# Meta-data

Apart from regular  descriptors like `writable`, `enumerable`, `get`, `set`, etc., non-standard tags are treated as meta-data for a property.

    var ClarkKent = Protoplast.extend({glasses: true});
    
    var Superman = ClarkKent.extend({
        glasses: {
            camouflage: true,
            value: false
        },
    });

All metadata for an object is saved in `.$meta`. To read all entries for a given meta-tag use: `Protoplast.utils.meta(instance, metaProperty, handler);`

    Protoplast.utils.meta(Superman, 'camouflage', function(propertyName, tagValue) {
        console.log(propertyName, tagValue); // -> glasses, true
    });

# Object-level meta-data

Object-level meta-data can be added directly to `.$meta`.

# Extending meta-data 

When an object is extended with `.extend` $meta object is created for new object and then merged meta-data from the base object. Primitive values are overridden, arrays concatenated, objects deeply merged.

# Constructors

Each object can have a constructor function:

Protoplast

    var Person = Protoplast.extend({
        name: null,
        $create: function(name) {
            this.name = name;
        },
        hello: function() {
            return 'My name is ' + this.name;
        }
    });
    var ExtendedPerson = Person.extend({
        age: null,
        $create: function(name, age) {
            this.age = age;
        },
        hello: function() {
            return Person.hello.call(this) + " and I'm " + this.age + " year old";
        }
    });

    var person = ExtendedPerson.create('John', 20);
    person.hello(); // My name is John and I'm 20 year old
    
All constructors from parent objects are automatically run before constructor for the current object is executed.

Main difference between `.create` and `.extend`:

* `.extend` creates new object from provided description (equivalent of `Object.create`).
* `.create` creates new object using chain of constructors (starting from base object, down to bottom prototype) (equivalent of `new Constructor()`)

Vanilla JS equivalent of above: 

    function Person(name) {
        this.name = name;
    }
    Person.prototype.hello = function() {
        return 'My name is ' + this.name; 
    }
    
    function ExtendedPerson(name, age) {
        Person.call(this, name);
        this.age = age;
    }
    ExtendedPerson.prototype = Object.create(Person.prototype);
    ExtendedPerson.prototype.hello = function() {
        return Person.prototype.hello.call(this) + " and I'm " + this.age + " year old";
    }

    var person = new ExtendedPerson('John', 20);
    person.hello(); // My name is John and I'm 20 year old

In both cases result is a new object based on given prototype.

# Mixins

When extending an object, optional array list of mixins may be passed as:

    var Foo = Base.extend([MixinA, MixinB], {property: ...});
    
# Other features

* Protoplast.Dispatcher - mixin allowing to observe events dispatched from an object
* Protoplast.Model - base object providing bindable and computed properties
* Protoplast.Collection - bindable Array
* Protoplast.CollectionView - "view" on a collection with sorting and filtering
* Protoplast.Context - dependecy injection context
* Protoplast.Component - base object for view-related objects, managing view lifecycle, hierarchy and for creating presenters


