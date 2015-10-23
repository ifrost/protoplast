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
    })

});