describe('Protoplast', function(){

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

        Sub = Base.extend(function(proto, $super){
            proto.test = function() {
                return $super.test.call(this) * 2;
            }
        });

        base = Base();
        sub = Sub();

        chai.assert.equal(base.test(), 10);
        chai.assert.equal(sub.test(), 20);
    });

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

    it('runs aspects on subintances', function(){

        var Text, UCText, text;

        Text = Proto.extend(function(proto){
            proto.init = function(text) {
                this.text = text;
            };
            proto.append = function(text) {
                this.text += text;
            }
        });

        UCText = Text.extend(function(proto, base){
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

    it('inject dependencies according to config', function() {

        var Foo, Bar, foo, bar;

        Foo = Proto.extend(function(proto, $super, config){
            config.bar = 'bar';
        });

        Bar = Proto.extend(function(proto, $super, config){
            config.foo = 'foo';
        });

        Proto.register('foo', foo = Foo());
        Proto.register('bar', bar = Bar());

        chai.assert.equal(foo.bar(), bar);
        chai.assert.equal(bar.foo(), foo);

    });

    it('inherits dependencies config from the base prototype', function(){

        var Foo, Foo2, Bar, foo, bar;

        Foo = Proto.extend(function(proto, $super, config){
            config.bar = 'bar';
        });
        Foo2 = Foo.extend(function(){});

        Bar = Proto.extend(function(){});

        Proto.register('foo', foo = Foo2());
        Proto.register('bar', bar = Bar());

        chai.assert.equal(foo.bar(), bar);

    });

    it.only('dispatches messages between objects', function(){

        var Source, Destination, source, destination;

        Source = Proto.extend(function(proto, $super, config){
            config.pub = 'pub';
            proto.send = function(msg) {
                this.pub('message', msg)
            }
        });

        Destination = Proto.extend(function(proto, $super, config){
            config.sub = 'sub';
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