# Protoplast

Fed up with "classes" in JavaScript? Want to use prototypical inheritance? `Protoplast` will help you to create prototypes, inheritance hierarchy, instantiate objects, annotate prototypes and properties with metadata, wrap methods with decorators and use mixins!

## Basic usage - a quick ride

``` javascript
// create base prototype
var Person = Protoplast.extend({
   // initialisation function
   $create: function(name, age) {
      this.name = name;
      this.age = age;
   },
   hello: function() {
      return 'My name is ' + this.name + '. I am ' + this.age + ' years old.';
   }
});

// create an instance an initialise it
var louie = Person.create("Louie", 30); // Person.$create called
console.log(louie.hello()); // "My name is Louie. I am 30 years old."

// extend base prototype
var Liar = Person.extend({
   $create: function(name, age) {
      this.name = "Barbara"; // no need to call Person.$create to set the age
   },
   hello: function() {
      this.age--; // lying ;)
      // modify base method
      return Person.hello.call(this) + " I am not lying!"
   }
});
var anne = Liar.create("Anne", 30); // Person.$create called automatically to set the age
console.log(anne.name); // "Barbara"
console.log(anne.age); // 30; not modified yet
console.log(anne.hello()); // "My name is Anne. I am 29 years old. I am not lying!"
console.log(anne.hello()); // "My name is Anne. I am 28 years old. I am not lying!"
console.log(anne.age); // 28

// create a hook, hook.instance method called when object is instantiated with .create() (other hooks available)
var cant_lie = {
   instance: function(value, name, proto, instance) {
      Object.defineProperty(instance, name, {writable: false}); // don't allow overrides
      return value;
   }
};

// annotate properties
var LiarLiar = Liar.extend({
   $create: function(name, age) {
      this.name = name; // restore the name overridden by Liar
   },
   age: {
      hooks: [cant_lie]
   }
});
var fletcher = LiarLiar.create("Fletcher", 35);
console.log(fletcher.hello()); // "My name is Fletcher. I am 35 years old. I am not lying!"; hoo modified writable property
console.log(fletcher.hello()); // "My name is Fletcher. I am 35 years old. I am not lying!"; hoo modified writable property
```

## Usage - a long ride

### Intro

Creating an object in JavaScript is easy-peasy. Let's say you are writing a bot that can answer questions. Let's give him a name and make sure he knows it.

``` javascript
var simple_bot = {
    ask: function(question) {
        if (question === "What is your name?") {
            return this.name;
        }
        else {
            return "I don't know";
        }
    }
};

var charlie = Object.create(simple_bot);
charlie.name = "Charlie";
console.log(charlie.name + ": " + charlie.ask("What is your name?"));
```

We may move settings the name to `init` method:

``` javascript
var simple_bot = {
    init: function(name) {
        this.name = name;
    },
    ask: function(question) {
        if (question === "What is your name?") {
            return this.name;
        }
        else {
            return "I don't know";
        }
    }
};

var charlie = Object.create(simple_bot);
charlie.init("Charlie");
console.log(charlie.name + ": " + charlie.ask("What is your name?"));
```

Now let's extend `simple_bot` and create a `smart_bot` that can be taught!

``` javascript
var smart_bot = Object.create(simple_bot); // extend simple_bot
// add new methods and modify
smart_bot.teach = function(question, answer) {
    this.knowledge[question] = answer;
}
smart_bot.ask = function(question) {
    return this.knowledge[question] || simple_bot.ask.call(this, question);
}
smart_bot.init = function(name) {
    simple_bot.init.call(this, name);
    this.knowledge = {};
}

var smart_charlie = Object.create(smart_bot);
smart_charlie.init("Smart Charlie");
smart_charlie.teach("Where in Europe is Carmen Sandiego?", "In Italy");

console.log(smart_charlie.name + ": " + smart_charlie.ask("What is your name?"));
console.log(smart_charlie.name + ": " + smart_charlie.ask("Where in Europe is Carmen Sandiego?"));
```

OK, it's working fine but the definition is not so nice anymore as we can't use {} to define all the properties and we have to specify them one by one. What is more we have to remember to call the init method of the prototype to make sure it's instantiated properly (`knowledge` property has to be cleared so it's not shared between instances). 

With `Protoplast` it can be simpler:

``` javascript
var SimpleBot = Protoplast.extend({
    $create: function(name) {
        this.name = name;
    },
    ask: function(question) {
        if (question === "What is your name?") {
            return this.name;
        }
        else {
            return "I don't know";
        }
    }
}

var charlie = SimpleBot.create("Charlie");
console.log(charlie.name + ": " + charlie.ask("What is your name?"));

```

Looks very similar to our vanilla JS example but:

* init method is called `$create`
* object is created by calling `SimpleBot.create("Charlie")`

When you call `SimpleBot.create()` then internally a new object is created using `Object.create()` and then `$create` method is called to initialise object's properties. What is more all `$create` methods from the prototype chain are called so creating SmartBot is as simple as:

``` javascript
var SmartBot = SimpleBot.extend({
   $create: function() {
      this.knowledge = {}; // no need to call the base
   },
   teach: function(question, answer) {
      this.knowledge[question] = answer;
   },
   ask: function(question) {
      return this.knowledge[question] || SimpleBot.ask.call(this, question);
   }
});

var smart_charlie = SmartBot.create("Charlie");
console.log(smart_charlie.name + ": " + smart_charlie.ask("What is your name?"));
console.log(smart_charlie.name + ": " + smart_charlie.ask("Where in Europe is Carmen Sandiego?"));

```

This behaves exactly the same way as the vanilla-JS example, but is a bit cleaner:

* Base prototype and sub prototype are defined in a similar manner - by defining properties in {}
* The `name` property is set up properly because `$create` method from parent prototype is called automatically (in rare occasions you may not want it but it's possible to suppress it with hooks)

Let's have a closer look at `.extend()` and `.create()`

### .extend()

Each object created by Protoplast has `foo.extend(description)` method. It creates a new object by calling `Object.create(foo)` to create a new object from `foo` and then uses `description` to define new properties.

### .create()

`foo.create()` uses `Object.create(foo)` to create a new instance with `foo` as a prototype and then calls all "constructors"  on the newly created object (collected from the full prototype chain). 

Constructors are defined with `$create` method. All arguments passed to `foo.create()` method are passed to `$create` methods.

An object can have multiple constructors:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      constructors: [foo, bar]
   }
}
```

where `foo` and `bar` are functions. When `Foo.create()` is called `foo`, then `bar` is called. In practise `$create` is just a shortcut:

``` javascript
var Foo = Protoplast.extend({
   $create: function() {
      this.foobar = "foobar";
   }
});
```

is the same as:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      constructors: [function() {
         this.foobar = "foobar";
      }]
   }
}
```

In practice `$create` method is automatically added at the end of the list of constructors. If you had:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      constructors: [foo, bar]
   },
   $create: function() {
      // ...
   }
});
```

then `foo`, `bar` and `$create` methods would be called after calling `Foo.create()`;

### $meta

When you call `Protoplast.extend(description)` the `description` contains definitions for the properties but it also may contain additional information stored in `$meta` property. `$meta` is used to save any meta-data related to the prototype, e.g.:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      foo: 'bar',
   }
}
```

You can access meta-data on any object by calling `object.$meta`;

You may use any keys but `constructors`, `hooks` and `properties` which are internally used by Protoplast. The most important feature of meta-data is that it's merged when prototype is extended, e.g.:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      list: [1,2]
   }
});

var Bar = Foo.extend({
   $meta: {
      list: [3, 4]
   }
});

console.log(Bar.$meta.list); // -> [1,2,3,4]
```

Arrays are concatenated, objects are deeply-merged and primitive values are overridden. This allows the constructors to be merged and ensure the object is instantiated properly.

### Object.defineProperty

Object description passed to `.extend(description)` may contain simple key-value pairs but also allows to pass more information, e.g.:

``` javascript
var Foo = Protoplast.extend({
   foo: {
      value: 'foo',
      writable: false
   }
}
```

This is similar to calling `Object.defineProperty()`. It's an important to remember:

* If value passed in `description` is an Object it's treated as a description of the property, otherwise it's considered as its value.

In other words, you can always use Object-like descriptions but in most cases you don't need them:

``` javascript
var Foo = Protoplast.extend({
   foo: function() {
      // ...
   }
});
```

is the same as:

``` javascript
var Foo = Protoplast.extend({
   foo: {
      value: function() {
         // ...
      }
   }
});
```

What is important to remember is that if you want pass an Object as a value of your property it's necessary to use `{value: {}}`:

``` javascript
var Foo = Protoplast.extend({
   foo: {
      value: {
         foo: 1,
         bar: 2
      }
   }
});
```

### properties meta-data

Along with `Object.defineProperty` options (writable, configurable, enumerable, get, set) you may pass additional annotations to add meta-data to your properties:

``` javascript
var Foo = Protoplast.extend({
   property: {
      foo: 1,
      bar: 2
   }
}
```

internally it's converted into:

``` javascript
var Foo = Protoplast.extend({
   $meta: {
      properties: {
         foo: {
            property: 1
         },
         bar: {
            property: 2
         }
      }
   }
});
```

which means that keys in `object.$meta.properties` are all annotations used in the object. For each annotation is describes as `{property_name: annotation_value}`

That allows you to quickly get all properties annotated with a certain annotation to perform your custom operations on it.

### hooks

Annotations are used to add meta-data. They don't change the behaviour. It's possible to modify the behaviour with `hooks`. You may also use them to add meta-data.

There are two types of hooks - prototype hooks and property hooks.

#### Prototype hook

A prototype hook can be attached to prototype lifecycle. It's an object that looks like this:

``` javascript
var prototype_hook = {
   desc: function(description) {
      // ...
   },
   proto: function(proto) {
      // ...
   }
}
```

`hook.desc(description)` function is called straight before processing the description object passed to `.extend()` method. You may use it to modify the description before it's processed. Description passed to `.extend()` method is passed as the argument.

`hook.proto(proto)` function is called after all processing is done. You may use it to modify the prototype just before it's returned. The prototype is passed as the argument.

Hooks are part of the `$meta` property which means all hooks are called for any new prototype in the chain created with `.extend()` method. 

#### Property hook

A property hook allows to modify a property. It looks like this:

``` javascript
var hook = {
   desc: function(proto, name, desc) {
      // ...
   },
   proto: function(value, name, prototype) {
      // ...
   },
   instance: function(value, name, prototype, instance) {
      // ...
   }
```

* `hook.desc` called before property's description is processed; receives prototype, name and description of the property. You can modify the description, returned result is ignored
* `hook.proto` called after processing the prototype, before prototype hooks are called; receives the value (e.g. function) of the property, name of the property, and the prototype. The result is used to override the property
* `hook.instance` creates a constructor, so the hook is called for each instance; receives the value, name of the property, the prototype and the instance (`this` is binded to the hook). The result is used to override the property. 

You may use `hook.instance` for stuff like caching or throttling where you want to keep the behaviour separate between the instances.

### Mixins

It's also possible to add mixins to `.extend()`:

``` javascript
var FooBar = Foo.extend([Bar], {
   foo: 1
});
```

This will mix Bar properties and meta-data to FooBar prototype.