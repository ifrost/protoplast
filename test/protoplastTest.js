describe('Protoplast', function(){

    var Dispatcher = ProtoplastExt.Dispatcher,
        Context = ProtoplastExt.Context,
        Aop = ProtoplastExt.Aop;

    describe('Metadata', function(){

        it('assings metadata to the prototype', function(){
            var Base;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.num = 1;
                meta.bool = true;
                meta.str = 'text';
                meta.obj = {
                    test: 'test'
                }
            });

            chai.assert.equal(Base.meta.num, 1);
            chai.assert.equal(Base.meta.bool, true);
            chai.assert.equal(Base.meta.str, 'text');
            chai.assert.equal(Base.meta.obj.test, 'test');

        });

        it('merges primitive values in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.num = 1;
                meta.bool = true;
                meta.str = 'text';
            });

            Sub = Base.extend();

            chai.assert.equal(Sub.meta.num, 1);
            chai.assert.equal(Sub.meta.bool, true);
            chai.assert.equal(Sub.meta.str, 'text');
        });

        it('overrides primitive values in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.num = 1;
                meta.bool = true;
                meta.str = 'text';
            });

            Sub = Base.extend(function(proto, base, meta){
                meta.num = 2;
                meta.bool = false;
                meta.str = 'text 2';
            });

            chai.assert.equal(Sub.meta.num, 2);
            chai.assert.equal(Sub.meta.bool, false);
            chai.assert.equal(Sub.meta.str, 'text 2');
        });

        it('concatenates arrays in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.array = [1,2,3];
            });

            Sub = Base.extend(function(proto, base, meta){
                meta.array = [4];
            });

            chai.assert.deepEqual(Sub.meta.array, [1,2,3,4]);
        });

        it('deeply merges object values in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.obj = {
                    base: 1,
                    override: 'test',
                    array: [1,2,3]
                }
            });

            Sub = Base.extend(function(proto, base, meta){
                meta.obj = {
                    sub: 2,
                    override: 'test 2',
                    array: [4]
                }
            });

            chai.assert.deepEqual(Sub.meta.obj, {
                sub: 2,
                base: 1,
                override: 'test 2',
                array: [1,2,3,4]
            });
        });

        it('assigns meta data with instances', function() {
            var Base = Protoplast.extend(), base;
            base = Base.create();
            chai.assert.equal(base.__meta__, Base.meta);
        });

    });

    describe('Inheritance', function(){
        it('creates a simple prototype', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend(function(proto){
                proto.value = 10;
            });

            Sub = Base.extend();

            base = Base.create();
            sub = Sub.create();

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);
        });

        it('runs factory method with passed arguments when object is created', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend().factory( function(value) {
                var base = Protoplast.create.bind(this)();
                base.value = value;
                return base;
            });

            Sub = Base.extend();

            base = Base.create(10);
            sub = Sub.create(10);

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);
        });

        it('inherits all properties using factories', function() {

            var Base, Sub, sub;

            Base = Protoplast.extend(function(proto){
                proto.set_value = function(value) {
                    this.value = value;
                }
            }).factory(function(value){
                var instance = Protoplast.create.bind(this)();
                instance.set_value(value);
                return instance;
            });

            Sub = Base.extend(function(proto){
                proto.get_value = function() {
                    return this.value;
                }
            }).factory(function(value){
                var instance = Base.create.bind(this)(value);
                return instance;
            });

            sub = Sub.create(10);
            chai.assert.equal(sub.get_value(), 10);
        });

        it('inherits all properties', function() {

            var Base, Sub, sub;

            Base = Protoplast.extend(function(proto){
                proto.set_value = function(value) {
                    this.value = value;
                }
            }).initializer(function(value){
                this.set_value(value);
            });

            Sub = Base.extend(function(proto){
                proto.get_value = function() {
                    return this.value;
                }
            });

            sub = Sub.create(10);
            chai.assert.equal(sub.get_value(), 10);
        });

        it('runs factory when using simplified version', function() {
            var Base, base, Sub, sub;

            Base = Protoplast.extend().initializer( function(value) {
                this.value = value;
            });

            Sub = Base.extend();

            base = Base.create(10);
            sub = Sub.create(10);

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);

        });

        it('allows to run base methods', function() {

            var Base, Sub, base, sub;

            Base = Protoplast.extend(function(proto){
                proto.test = function() {
                    return 10;
                }
            });

            Sub = Base.extend(function(proto, base){
                proto.test = function() {
                    return base.test.call(this) * 2;
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

            Foo = Protoplast.extend(function(proto){
                proto.append = function(text) {
                    this.text += text;
                };
            }).initializer(function(text) {
                this.text = text;
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop.create(Foo).aop('append', {
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

            Foo = Protoplast.extend(function(proto){
                proto.append = function(text) {
                    this.text += text;
                }
            }).initializer(function(text) {
                this.text = text;
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop.create(Foo).aop('append', {
                before: function() {
                    this.text += ',';
                }
            });

            foo = Foo.create('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'text,text');
        });

        it('runs aspects on subinstances', function(){

            var Text, UCText, text;

            Text = Protoplast.extend(function(proto,base,meta){
                meta.name = "Text";
                proto.append = function(text) {
                    this.text += text;
                }
            }).initializer(function(text) {
                this.text = text;
            });

            UCText = Text.extend(function(proto,base,meta){
                meta.name = "UCText";
                proto.toUpperCase = function() {
                    this.text = this.text.toUpperCase();
                }
            });
            var aop = Aop.create(UCText);

            aop.aop({
                after: function(instance) {
                    instance.toUpperCase();
                    return instance;
                }
            });
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

            chai.assert.equal(text.text, 'TEST');
            text.append('test');
            chai.assert.equal(text.text, 'TEST,TEST');
        });

        it('runs wraps all methods with aspects', function() {
            var Foo, foo, before = sinon.spy(), after = sinon.spy();

            Foo = Protoplast.extend(function(proto){
                proto.a = function() {};
                proto.b = function() {};
            });

            Aop.create(Foo).aop(['a','b'], {
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

            CustomDispatcher = Protoplast.extend([Dispatcher], function(proto){
                proto.hello = function() {
                    this.dispatch('message', 'hello')
                }
            });

            dispatcher = CustomDispatcher.create();

            dispatcher.on('message', function(value){
                message = value;
            });
            dispatcher.hello();

            chai.assert.equal(message, 'hello');
        });
    });

    describe('Dependency Injection', function() {
        it('inject dependencies according to config', function() {

            var Foo, Bar, foo, bar;

            Foo = Protoplast.extend(function(proto, base, meta){
                meta.inject = {bar: 'bar'};
            });

            Bar = Protoplast.extend(function(proto, base, meta){
                meta.inject = {foo: 'foo'};
            });

            var context = Context.create();

            context.register('foo', foo = Foo.create());
            context.register('bar', bar = Bar.create());

            chai.assert.equal(foo.bar, bar);
            chai.assert.equal(bar.foo, foo);

        });

        it('inherits dependencies config from the base prototype', function(){

            var Foo, Foo2, Bar, foo, bar;

            Foo = Protoplast.extend(function(proto, base, meta){
                meta.inject = {bar: 'bar'};
            });
            Foo2 = Foo.extend(function(){});

            Bar = Protoplast.extend(function(){});

            var context = Context.create();

            context.register('foo', foo = Foo2.create());
            context.register('bar', bar = Bar.create());

            chai.assert.equal(foo.bar, bar);

        });

        it('passes fast inject function', function() {

            var Dep, dep, Foo, Bar, bar;

            Dep = Protoplast.extend(function(proto){
                proto.value = function() {
                    return 10;
                }
            });

            Bar = Protoplast.extend(function(proto, base, meta){
                meta.inject = {dep: 'dep'}
            });

            Foo = Protoplast.extend(function(proto){
                proto.injected = function() {
                    bar = Bar.create();
                    this.__fastinject__(bar);
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
        it('dispatches messages between objects', function(){

            var Source, Destination, source, destination;

            Source = Protoplast.extend(function(proto, base, config){
                config.inject = {pub: 'pub'};
                proto.send = function(msg) {
                    this.pub('message', msg)
                }
            });

            Destination = Protoplast.extend(function(proto, base, config){
                config.inject = {sub: 'sub'};
                proto.injected = function() {
                    this.sub('message').add(this.save_message);
                };
                proto.save_message = function(msg) {
                    this.message = msg;
                };
                proto.clear = function() {
                    this.sub('message').remove();
                };
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

            var Foo, Bar, FooBar, foobar;

            Foo = Protoplast.extend(function(proto){
                proto.foo = 'foo';
            });

            Bar = Protoplast.extend(function(proto){
                proto.bar = 'bar';
            });

            FooBar = Protoplast.extend([Foo, Bar]);

            foobar = FooBar.create();

            chai.assert.equal(foobar.foo, 'foo');
            chai.assert.equal(foobar.bar, 'bar');

        });
    });

    describe('Interfaces', function(){
        it('verifies if prototype implements passed interfaces', function(){

            var Interface = Protoplast.extend(function(proto){
                proto.foo = function(alpha, beta) {}
            });

            var CorrectBase = Protoplast.extend(function(proto){
                proto.foo = function(alpha, beta) {};
            });

            var IncorrectBase = Protoplast.extend(function(proto){
                proto.foo = function(gamma) {};
            });

            function correctSub() {
                CorrectBase.extend(function(proto, base, meta){
                    meta.impl = [Interface];
                })
            }

            function incorrectSub() {
                IncorrectBase.extend(function(proto, base, meta){
                    meta.impl = [Interface];
                })
            }

            correctSub();
            chai.assert.throw(incorrectSub);
        });
    });

    describe('Examples', function() {
        it('flux example', function() {

            var RootView, View, ActionDispatcher, Repository, view, repository;

            // create root view that will be injected into repositories
            RootView = Protoplast.extend(function(proto, base, meta) {

                meta.inject = {pub: 'pub'};

                proto.injected = function() {
                    this.view.pub = this.pub;
                };
                proto.data = function(data) {
                    this.view.show(data.clicks);
                };
            }).initializer(function() {
                this.view = View.create();
            });

            // create a clickable component that displays number of clicks
            View = Protoplast.extend(function(proto){

                proto.show = function(value) {
                    this.value = value;
                };

                proto.click = function() {
                    this.pub('myview/clicked');
                }
            });

            // action dispatcher to convert view actions to domain actions
            ActionDispatcher = Protoplast.extend(function(proto, base, meta){
                meta.inject = {sub: 'sub', pub: 'pub'};

                proto.injected = function() {
                    this.sub('myview/clicked').add(this.count_click);
                };

                proto.count_click = function() {
                    this.pub('click/increment', 1);
                };
            });

            // repository to react to domain actions and pass data to the view
            Repository = Protoplast.extend(function(proto, base, meta){
                meta.inject = {sub: 'sub', view: 'view'};

                proto.injected = function() {
                    this.sub('click/increment').add(this.increment);
                    this.refresh();
                };

                proto.increment = function(value) {
                    this.clicks += value;
                    this.refresh();
                };

                proto.refresh = function() {
                    this.view.data({clicks: this.clicks});
                }

            }).initializer(function() {
                this.clicks = 0;
            });

            // capture view for testing
            var _view = null;
            Aop.create(View).aop({
                after: function(obj) {
                    _view = obj;
                    return obj;
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