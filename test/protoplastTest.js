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

});