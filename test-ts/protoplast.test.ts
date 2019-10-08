import chai from "chai";
import sinon from "sinon";
import { Protoplast, meta } from "../index"
import utils from "../js/utils"

describe("Protoplast", () => {

    it("assings metadata to the prototype", () => {
    
        const fn = sinon.stub();

        @meta({
            num: 1,
            bool: true,
            str: 'text',
            fn: fn,
            obj: {test: 'test'},
            deep: {prop1: 1, over: 1},
            array: [1, 2, 3]
        })
        class Base {
            static b = 'base';
        };
        
        @meta({
            num: 2,
            deep: {prop2: 2, over: 2},
            array: [4]
        })
        class Sub extends Base {
            static s = 'sub';
        };

        chai.assert.equal(Base.prototype.$meta.num, 1);
        chai.assert.equal(Base.prototype.$meta.bool, true);
        chai.assert.equal(Base.prototype.$meta.str, 'text');
        chai.assert.equal(Base.prototype.$meta.fn, fn);
        chai.assert.equal(Base.prototype.$meta.obj.test, 'test');
        chai.assert.equal(Base.prototype.$meta.deep.prop1, 1);
        chai.assert.equal(Base.prototype.$meta.deep.over, 1);
        chai.assert.deepEqual(Base.prototype.$meta.array, [1, 2, 3]);

        chai.assert.equal(Sub.prototype.$meta.num, 2);
        chai.assert.equal(Sub.prototype.$meta.bool, true);
        chai.assert.equal(Sub.prototype.$meta.str, 'text');
        chai.assert.equal(Sub.prototype.$meta.fn, fn);
        chai.assert.equal(Sub.prototype.$meta.obj.test, 'test');
        chai.assert.equal(Sub.prototype.$meta.deep.prop1, 1);
        chai.assert.equal(Sub.prototype.$meta.deep.prop2, 2);
        chai.assert.equal(Sub.prototype.$meta.deep.over, 2);
        chai.assert.deepEqual(Sub.prototype.$meta.array, [1, 2, 3, 4]);
    });

    it('extracts meta data', function() {
            
        var handler = sinon.spy();

        function customTag(value: any) {
            return meta({ customTag: value });
        }
        
        class Base {

            @customTag('customTagValue')
            @meta({
                commonTag: 'valueFoo',
                fooTag: 'foo'
            })
            foo: any;
            
            @meta({
                commonTag: 'valueBar',
                barTag: 'valueBar',
            })
            @customTag('customTagValue')
            bar: any;

            @customTag('customTagValue')
            test: any;
            
        };

        var base = new Base();
        
        utils.meta(base, 'fooTag', handler);
        sinon.assert.calledOnce(handler);
        sinon.assert.calledWith(handler, 'foo', 'foo');
        
        handler.resetHistory();

        utils.meta(base, 'commonTag', handler);
        sinon.assert.calledTwice(handler);
        sinon.assert.calledWith(handler, 'foo', 'valueFoo');
        sinon.assert.calledWith(handler, 'bar', 'valueBar');

        handler.resetHistory();
        utils.meta(base, 'customTag', handler);
        sinon.assert.calledThrice(handler);
        sinon.assert.calledWith(handler, 'foo', 'customTagValue');
        sinon.assert.calledWith(handler, 'bar', 'customTagValue');
        sinon.assert.calledWith(handler, 'test', 'customTagValue');
    });

});
