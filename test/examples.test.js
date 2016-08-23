var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Context = Protoplast.Context;

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
