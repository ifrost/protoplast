describe('Protoplast Plugins', function() {

    var Proto, execution_chain, custom_plugin, init, Base, Foo;

    beforeEach(function() {
        custom_plugin = {
            merge_config_processor: sinon.spy(),
            pre_init_processor: sinon.spy(),
            post_init_processor: sinon.spy(),
            constructor_processor: sinon.spy(),
            proto_processor: sinon.spy()
        };

        execution_chain = [];
        init = sinon.spy();

        Proto = Protoplast.create({
            plugins: [custom_plugin]
        });

        Base = Proto.extend(function(proto, base, config){
            config.custom = ['base'];
            proto.init = init
        });

        Foo = Base.extend(function(proto, base, config){
            config.custom = ['foo'];
            proto.init = function() {
                base.init.call(this, arguments);
            };

            return 'foo-factory-result';
        });
    });

    it('Initialization Flow', function() {
        sinon.assert.called(custom_plugin.merge_config_processor);
        sinon.assert.called(custom_plugin.proto_processor);
        sinon.assert.called(custom_plugin.constructor_processor);

        sinon.assert.notCalled(custom_plugin.pre_init_processor);
        sinon.assert.notCalled(custom_plugin.post_init_processor);

        Foo();

        sinon.assert.called(custom_plugin.pre_init_processor);
        sinon.assert.called(custom_plugin.post_init_processor);
    });

    it('Merge Config Processor', function(){
        sinon.assert.calledTwice(custom_plugin.merge_config_processor);

        chai.assert.deepEqual(custom_plugin.merge_config_processor.firstCall.thisValue.config.custom, ['base']);
        chai.assert.equal(custom_plugin.merge_config_processor.firstCall.thisValue.base_config.custom, undefined);

        chai.assert.deepEqual(custom_plugin.merge_config_processor.secondCall.thisValue.config.custom, ['foo']);
        chai.assert.deepEqual(custom_plugin.merge_config_processor.secondCall.thisValue.base_config.custom, ['base']);
    });

    it('Pre/Post Init Processor', function(){
        var foo = Foo('test');
        sinon.assert.callOrder(custom_plugin.pre_init_processor,init,custom_plugin.post_init_processor);
        chai.assert.deepEqual(custom_plugin.pre_init_processor.lastCall.thisValue.args, ['test']);
        chai.assert.deepEqual(custom_plugin.pre_init_processor.lastCall.thisValue.instance, foo);
    });

    it('Proto Processor', function(){
        chai.assert.deepEqual(custom_plugin.proto_processor.lastCall.thisValue.proto, Foo.__proto);
        chai.assert.deepEqual(custom_plugin.proto_processor.lastCall.thisValue.base, Base.__proto);
        chai.assert.deepEqual(custom_plugin.proto_processor.lastCall.thisValue.factory_result, 'foo-factory-result');
    });

    it('Constructor Processor', function(){
        chai.assert.deepEqual(custom_plugin.constructor_processor.lastCall.thisValue.constructor, Foo);
    });

    it('Proto plugins', function() {

        var Base, Foo;

        Base = Proto.extend(function(proto){

        });

        Foo = Base.extend(function(proto, base, config){
            config.plugins = [custom_plugin];
        });

        Base();
        sinon.assert.calledOnce(custom_plugin.post_init_processor);

        Foo();
        sinon.assert.calledThrice(custom_plugin.post_init_processor);
    });

});

describe('Protoplast', function(){

    var Proto;

    beforeEach(function(){
        var plugins = Protoplast.plugins;
        Proto = Protoplast.create({
            plugins: [plugins.aop, plugins.di, plugins.dispatcher, plugins.mixin, plugins.pubsub]
        });
    });

    describe('Inheritance', function(){
        it('creates a simple prototype', function() {

            var Base, base;

            Base = Proto.extend(function(proto){
                proto.value = 10;
            });

            base = Base();

            chai.assert.equal(base.value, 10);
        });

        it('runs init method with passed arguments when object is created', function() {

            var Base, base;

            Base = Proto.extend(function(proto){
                proto.init = function(value) {
                    this.value = value;
                }
            });

            base = Base(10);

            chai.assert.equal(base.value, 10);
        });

        it('allows to run base methods', function() {

            var Base, Sub, base, sub;

            Base = Proto.extend(function(proto){
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

            Foo = Proto.extend(function(proto){
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

            Foo.aop('append', {
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

            Foo = Proto.extend(function(proto){
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

            Foo.aop('append', {
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

            Text = Proto.extend(function(proto){
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
            UCText.aop('init', {
                after: function() {
                    this.toUpperCase();
                }
            });
            UCText.aop('append', {
                after: function() {
                    this.toUpperCase();
                }
            });

            Text.aop('append', {
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

            Foo = Proto.extend(function(proto){
                proto.a = function() {};
                proto.b = function() {};
            });

            Foo.aop(['a','b'], {
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

            Foo = Proto.extend(function(proto, base, config){
                config.inject = {bar: 'bar'};
            });

            Bar = Proto.extend(function(proto, base, config){
                config.inject = {foo: 'foo'};
            });

            Proto.register('foo', foo = Foo());
            Proto.register('bar', bar = Bar());

            chai.assert.equal(foo.bar(), bar);
            chai.assert.equal(bar.foo(), foo);

        });

        it('inherits dependencies config from the base prototype', function(){

            var Foo, Foo2, Bar, foo, bar;

            Foo = Proto.extend(function(proto, base, config){
                config.inject = {bar: 'bar'};
            });
            Foo2 = Foo.extend(function(){});

            Bar = Proto.extend(function(){});

            Proto.register('foo', foo = Foo2());
            Proto.register('bar', bar = Bar());

            chai.assert.equal(foo.bar(), bar);

        });
    });

    describe('Pub/Sub', function() {
        it('dispatches messages between objects', function(){

            var Source, Destination, source, destination;

            Source = Proto.extend(function(proto, base, config){
                config.inject = {pub: 'pub'};
                proto.send = function(msg) {
                    this.pub('message', msg)
                }
            });

            Destination = Proto.extend(function(proto, base, config){
                config.inject = {sub: 'sub'};
                proto.init = function() {
                    this.sub('message').add(this.save_message);
                };
                proto.save_message = function(msg) {
                    this.message = msg;
                };
                proto.clear = function() {
                    this.sub('message').remove();
                };
            });

            source = Source();
            destination = Destination();

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

            Foo = Proto.extend(function(proto){
                proto.foo = 'foo';
            });

            Bar = Proto.extend(function(proto){
                proto.bar = 'bar';
            });

            FooBar = Proto.extend(function(proto, base, config){
                config.mixin = [Foo, Bar];
            });

            foobar = FooBar();

            chai.assert.equal(foobar.foo, 'foo');
            chai.assert.equal(foobar.bar, 'bar');

        });
    });

    describe('EventDispatcher', function() {
        it('allows to create event dispatchers', function() {

            var Dispatcher, dispatcher, message = '';

            Dispatcher = Proto.extend(function(proto, base, config){
                config.mixin = [Proto.Dispatcher];
                proto.hello = function() {
                    this.dispatch('message', 'hello')
                }
            });

            dispatcher = Dispatcher();

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
            RootView = Proto.extend(function(proto) {
                proto.init = function() {
                    this.view = View();
                };
                proto.data = function(data) {
                    this.view.show(data.clicks);
                };
            });

            // create a clickable component that displays number of clicks
            View = Proto.extend(function(proto, base, config){
                config.inject = {pub: 'pub'};

                proto.show = function(value) {
                    this.value = value;
                };

                proto.click = function() {
                    this.pub('myview/clicked');
                }
            });

            // action dispatcher to convert view actions to domain actions
            ActionDispatcher = Proto.extend(function(proto, base, config){
                config.inject = {sub: 'sub', pub: 'pub'};

                proto.init = function() {
                    this.sub('myview/clicked').add(this.count_click);
                };

                proto.count_click = function() {
                    this.pub('click/increment', 1);
                };
            });

            // repository to react to domain actions and pass data to the view
            Repository = Proto.extend(function(proto, base, config){
                config.inject = {sub: 'sub', view: 'view'};

                proto.init = function() {
                    this.clicks = 0;
                    this.sub('click/increment').add(this.increment);
                    this.refresh();
                };

                proto.increment = function(value) {
                    this.clicks += value;
                    this.refresh();
                };

                proto.refresh = function() {
                    this.view().data({clicks: this.clicks});
                }

            });

            // capture view for testing
            var _view = null;
            View.aop('init', {
                after: function() {
                    _view = this;
                }
            });

            Proto.register('view', RootView());
            ActionDispatcher();
            repository = Repository();

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