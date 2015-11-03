describe('Protoplast', function(){

    var Dispatcher = ProtoplastExt.Dispatcher,
        Context = ProtoplastExt.Context,
        Aop = ProtoplastExt.Aop;

    describe('Metadata', function(){

        it('assings metadata to the prototype', function(){
            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.num = 1;
                meta.bool = true;
                meta.str = 'text';
                meta.obj = {
                    test: 'test'
                }
            });

            chai.assert.equal(Base.__meta__.num, 1);
            chai.assert.equal(Base.__meta__.bool, true);
            chai.assert.equal(Base.__meta__.str, 'text');
            chai.assert.equal(Base.__meta__.obj.test, 'test');

        });

        it('merges primitive values in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.num = 1;
                meta.bool = true;
                meta.str = 'text';
            });

            Sub = Base.extend();

            chai.assert.equal(Sub.__meta__.num, 1);
            chai.assert.equal(Sub.__meta__.bool, true);
            chai.assert.equal(Sub.__meta__.str, 'text');
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

            chai.assert.deepEqual(Sub.__meta__, {
                num: 2,
                bool: false,
                str: 'text 2'
            });
        });

        it('concatenates arrays in metadata', function(){

            var Base, Sub;

            Base = Protoplast.extend(function(proto, base, meta){
                meta.array = [1,2,3];
            });

            Sub = Base.extend(function(proto, base, meta){
                meta.array = [4];
            });

            chai.assert.deepEqual(Sub.__meta__.array, [1,2,3,4]);
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

            chai.assert.deepEqual(Sub.__meta__.obj, {
                sub: 2,
                base: 1,
                override: 'test 2',
                array: [1,2,3,4]
            });
        });

    });

    describe('Inheritance', function(){
        it('creates a simple prototype', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend(function(proto){
                proto.value = 10;
            });

            Sub = Base.extend();

            base = Base();
            sub = Sub();

            chai.assert.equal(base.value, 10);
            chai.assert.equal(sub.value, 10);
        });

        it('runs init method with passed arguments when object is created', function() {

            var Base, base, Sub, sub;

            Base = Protoplast.extend(function(proto){
                proto.init = function(value) {
                    this.value = value;
                }
            });

            Sub = Base.extend();

            base = Base(10);
            sub = Sub(10);

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

            base = Base();
            sub = Sub();

            chai.assert.equal(base.test(), 10);
            chai.assert.equal(sub.test(), 20);
        });
    });

    describe('AOP', function() {
        it('allows to add after aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend(function(proto){
                proto.init = function(text) {
                    this.text = text;
                };
                proto.append = function(text) {
                    this.text += text;
                }
            });

            foo = Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                after: function() {
                    this.text += '!';
                }
            });

            foo = Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext!');
        });

        it('allows to add before aspect', function() {

            var Foo, foo;

            Foo = Protoplast.extend(function(proto){
                proto.init = function(text) {
                    this.text = text;
                };
                proto.append = function(text) {
                    this.text += text;
                }
            });

            foo = Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'texttext');

            Aop(Foo).aop('append', {
                before: function() {
                    this.text += ',';
                }
            });

            foo = Foo('text');
            foo.append('text');
            chai.assert.equal(foo.text, 'text,text');
        });

        it('runs aspects on subinstances', function(){

            var Text, UCText, text;

            Text = Protoplast.extend(function(proto){
                proto.init = function(text) {
                    this.text = text;
                };
                proto.append = function(text) {
                    this.text += text;
                }
            });

            UCText = Text.extend(function(proto){
                proto.toUpperCase = function() {
                    this.text = this.text.toUpperCase();
                }
            });
            var aop = Aop(UCText);

            aop.aop('init', {
                after: function() {
                    this.toUpperCase();
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

            text = UCText('test');
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

            Aop(Foo).aop(['a','b'], {
                after: after,
                before: before
            });

            foo = Foo();

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

    describe('Dependency Injection', function() {
        it('inject dependencies according to config', function() {

            var Foo, Bar, foo, bar;

            Foo = Protoplast.extend(function(proto, base, meta){
                meta.inject = {bar: 'bar'};
            });

            Bar = Protoplast.extend(function(proto, base, meta){
                meta.inject = {foo: 'foo'};
            });

            var context = Context();

            context.register('foo', foo = Foo());
            context.register('bar', bar = Bar());

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

            var context = Context();

            context.register('foo', foo = Foo2());
            context.register('bar', bar = Bar());

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
                    bar = Bar();
                    this.__fastinject__(bar);
                }
            });

            var context = Context();
            context.register('foo', Foo());
            context.register('dep', dep = Dep());
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

            var context = Context();
            context.register('source', source = Source());
            context.register('dest', destination = Destination());
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

            foobar = FooBar();

            chai.assert.equal(foobar.foo, 'foo');
            chai.assert.equal(foobar.bar, 'bar');

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

            dispatcher = CustomDispatcher();

            dispatcher.on('message', function(value){
                message = value;
            });
            dispatcher.hello();

            chai.assert.equal(message, 'hello');
        });
    });

    describe('Examples', function() {
        it('flux example', function() {

            var RootView, View, ActionDispatcher, Repository, view, repository;

            // create root view that will be injected into repositories
            RootView = Protoplast.extend(function(proto, base, meta) {

                meta.inject = {pub: 'pub'};

                proto.init = function() {
                    this.view = View();
                };
                proto.injected = function() {
                    this.view.pub = this.pub;
                };
                proto.data = function(data) {
                    this.view.show(data.clicks);
                };
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

                proto.init = function() {
                    this.clicks = 0;
                };

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

            });

            // capture view for testing
            var _view = null;
            Aop(View).aop('init', {
                after: function() {
                    _view = this;
                }
            });

            var context = Context();
            context.register('view', RootView());
            context.register('ad', ActionDispatcher());
            context.register('repo', repository = Repository());
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