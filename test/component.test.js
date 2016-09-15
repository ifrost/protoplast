var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Component = Protoplast.Component,
    Collection = Protoplast.Collection,
    Context = Protoplast.Context;


describe('Component', function() {

    beforeEach(function(done) {
        jsdom.env('<html><body></body></html>', function(err, window) {
            global.document = window.document;
            done();
        })
    });

    it('creates a component with default DIV tag', function() {

        var component = Component.create();
        chai.assert.isNotNull(component.root);
        chai.assert.strictEqual(component.root.tagName, 'DIV');
    });

    it.skip('creates a table row properly', function() {

        var Table = Component.extend({
            html: '<table></table>'
        });

        var Row = Component.extend({
            html: '<tr><td id="row">1</td></tr>'
        });

        var table = Table.create();
        var row = Row.create();

        table.add(row);
        chai.assert.ok(global.document.getElementById('row').innerHTML, '1');

    });

    it('adds a child to a component', function() {
        var Root = Component.extend({tag: 'div'});
        var Child = Component.extend({tag: 'span'});

        var root = Root.create();
        var child = Child.create();

        root.add(child);

        chai.assert.lengthOf(root.root.children, 1);
    });

    it('returns list of children', function() {
        var root = Component.create(),
            childA = Component.create(),
            childB = Component.create();

        root.add(childA);
        root.add(childB);

        chai.assert.deepEqual(root.children, [childA, childB]);
    });

    it('removes children', function() {
        var root = Component.create(),
            childA = Component.create(),
            childB = Component.create();

        root.add(childA);
        root.add(childB);

        root.remove(childA);

        chai.assert.strictEqual(root.root, childB.root.parentNode);
        chai.assert.isNull(childA.root.parentNode);
    });

    it('destroys all children when removing', function() {
        var destroy = sinon.stub(),
            Child = Component.extend({destroy: destroy});

        var root = Component.create(),
            childA = Child.create(),
            childB = Child.create();

        root.add(childA);
        root.add(childB);

        root.remove(childA);

        sinon.assert.calledOnce(destroy);
    });

    it('destroys all children when parent is destroyed', function() {
        var destroy = sinon.stub(),
            Child = Component.extend({destroy: destroy});

        var root = Component.create(),
            childA = Child.create(),
            childB = Child.create();

        root.add(childA);
        root.add(childB);

        root.destroy();

        sinon.assert.calledTwice(destroy);
    });

    it('root component attached element and register object in context', function() {
        var element = document.createElement('div'),
            context = {register: sinon.stub()},
            component;

        component = Component.Root(element, context);
        chai.assert.strictEqual(element, component.root);
        sinon.assert.calledWith(context.register, component);
    });

    it('throws an exception when adding non-child component', function() {

        var component = Component.create();

        chai.assert.throws(component.add.bind(component, null));
        chai.assert.throws(component.add.bind(component, {}));

    });

    it('initialises children when root is added to context', function() {
        var context,
            init = sinon.stub(),
            Child = Component.extend({init: init});

        var root = Component.create(),
            childA = Child.create(),
            childB = Child.create(),
            childC = Child.create();

        root.add(childA);
        root.add(childB);

        context = Context.create();
        context.register(root);

        root.add(childC);

        sinon.assert.calledThrice(init);

    });

});

describe('Components Dependency Injection', function() {

    beforeEach(function(done) {
        jsdom.env('<html><body></body></html>', function(err, window) {
            global.document = window.document;
            done();
        })
    });

    it('injects all dependencies to children element with __fastinject__', function() {

        var element = document.createElement('div'), main,
            context = Context.create();

        context.register('foo', 'foo');
        main = Component.Root(element, context);

        var Root = Component.extend({
            tag: 'div',
            foo: {inject: 'foo'}
        });
        var Child = Component.extend({
            tag: 'span',
            init: function() {
                this.bar = this.foo
            },
            foo: {inject: 'foo'}
        });
        var GrandChild = Component.extend({
            tag: 'p',
            foo: {inject: 'foo'}
        });

        var root = Root.create();
        var child = Child.create();
        var grand = GrandChild.create();

        root.add(child);
        child.add(grand);

        main.add(root);

        chai.assert.strictEqual(root.foo, 'foo');
        chai.assert.strictEqual(child.foo, 'foo');
        chai.assert.strictEqual(grand.foo, 'foo');
        chai.assert.strictEqual(child.bar, 'foo');
    });


    it('initialises component trees after attaching to the parent', function() {

        var context = Context.create();

        context.register('foo', 'foo');

        var Root = Component.extend({
            tag: 'div',
            foo: {inject: 'foo'}
        });
        var Child = Component.extend({
            tag: 'span',
            foo: {inject: 'foo'}
        });
        var GrandChild = Component.extend({
            tag: 'p',
            foo: {inject: 'foo'}
        });

        var root = Root.create();
        var child = Child.create();
        var grand = GrandChild.create();

        root.add(child);
        child.add(grand);

        context.register(root);
        context.build();

        chai.assert.strictEqual(root.foo, 'foo');
        chai.assert.strictEqual(child.foo, 'foo');
        chai.assert.strictEqual(grand.foo, 'foo');
    });

    it('injects all dependencies to children element', function() {

        var context = Context.create();
        context.register('foo', 'foo');

        var Root = Component.extend({
            tag: 'div',
            foo: {inject: 'foo'}
        });
        var Child = Component.extend({
            tag: 'span',
            init: function() {
                this.bar = this.foo
            },
            foo: {inject: 'foo'}
        });

        var root = Root.create();

        context.register(root);
        context.build();

        var child = Child.create();
        root.add(child);

        chai.assert.strictEqual(root.foo, 'foo');
        chai.assert.strictEqual(child.foo, 'foo');
        chai.assert.strictEqual(child.bar, 'foo');
    });

    it('processes template processors', function() {

        var processor = {
            attribute: 'data-test',
            process: sinon.spy()
        };

        var Root = Component.extend({
            $meta: {
                domProcessors: [processor]
            },
            html: '<div><span data-test="foo"></span></div>'
        });

        var root = Root.create();

        sinon.assert.calledOnce(processor.process);
        sinon.assert.calledWith(processor.process, root, sinon.match.any, 'foo')

    });

    it('does not process the root', function() {

        var processor = {
            attribute: 'data-test',
            process: sinon.spy()
        };

        var Root = Component.extend({
            $meta: {
                domProcessors: [processor]
            },
            html: '<span data-test="foo"></span>'
        });

        var root = Root.create();

        sinon.assert.notCalled(processor.process);

    });

    describe('Component features', function() {

        describe('Presenter', function() {

            var Presenter, init, destroy, root;

            beforeEach(function() {
                init = sinon.stub();
                destroy = sinon.stub();

                Presenter = Protoplast.extend({
                    init: {
                        injectInit: true,
                        value: init
                    },
                    foo: {
                        inject: 'foo'
                    },
                    destroy: destroy
                });

                var context = Context.create();

                context.register('foo', 'foo');

                var Root = Component.extend({
                    $meta: {
                        presenter: Presenter
                    },
                    tag: 'div',
                    foo: {inject: 'foo'}
                });

                sinon.spy(Presenter, 'create');

                root = Root.create();
                context.register(root);
                context.build();

            });

            it('creates presenter', function() {
                sinon.assert.calledOnce(Presenter.create);

                var presenter = Presenter.create.returnValues[0];

                chai.assert.strictEqual(presenter.view, root);
                chai.assert.strictEqual(presenter.foo, 'foo');
            });

            it('destroys the presenter when the component is destroyed', function() {
                var presenter = Presenter.create.returnValues[0];

                sinon.assert.notCalled(presenter.destroy);
                root.destroy();
                sinon.assert.calledOnce(presenter.destroy);
            });

        });

        it('injects elements marked with data-prop', function() {

            var Root = Component.extend({
                html: '<div><span data-prop="foo">test</span></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.innerHTML, 'test');
        });

        it('creates components and replaces elements marked with data-comp', function() {

            var Child = Component.extend({
                foo: 'foo'
            });

            var Root = Component.extend({
                foo: {component: Child},
                html: '<div><span data-comp="foo"></span></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.foo, 'foo');

        });

        it('creates components and replaces elements marked with data-comp nested in DOM', function() {

            var Child = Component.extend({
                foo: 'foo'
            });

            var Root = Component.extend({
                foo: {component: Child},
                html: '<div><p><span data-comp="foo"></span></p></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.foo, 'foo');

            root.remove(root.foo);
        });

    });

});

describe('utils', function() {

    describe('render list', function() {

        var create, update, remove, host, TestRenderer, renderList;

        beforeEach(function() {
            create = sinon.stub();
            update = sinon.stub();
            remove = sinon.stub();
            TestRenderer = Protoplast.extend();
            host = {};

            renderList = Protoplast.utils.createRendererFunction(host, {
                create: create,
                update: update,
                remove: remove,
                renderer: TestRenderer,
                rendererDataProperty: 'testProperty'
            });
        });

        it('creates new renderers', function() {
            host.children = [];
            renderList(Collection.create([1,2,3]));
            sinon.assert.calledThrice(create);
            sinon.assert.notCalled(update);
            sinon.assert.notCalled(remove);

            sinon.assert.calledWith(create, host, 1, TestRenderer, 'testProperty');
            sinon.assert.calledWith(create, host, 2, TestRenderer, 'testProperty');
            sinon.assert.calledWith(create, host, 3, TestRenderer, 'testProperty');
        });

        it('updates existing renderers', function() {
            host.children = ['A','B','C'];
            renderList(Collection.create([3,2,1]));
            sinon.assert.notCalled(create);
            sinon.assert.calledThrice(update);
            sinon.assert.notCalled(remove);

            sinon.assert.calledWith(update, 'A', 3, 'testProperty');
            sinon.assert.calledWith(update, 'B', 2, 'testProperty');
            sinon.assert.calledWith(update, 'C', 1, 'testProperty');
        });

        it('removes obsolete renderers', function() {
            host.children = ['A','B','C'];
            renderList(Collection.create([3,2]));
            sinon.assert.notCalled(create);
            sinon.assert.calledTwice(update);
            sinon.assert.calledOnce(remove);

            sinon.assert.calledWith(remove, host, 'C');
        });
    });


});