var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Component = Protoplast.Component,
    Collection = Protoplast.Collection,
    TagComponent = Protoplast.TagComponent,
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

    it('adds a child to a component', function() {
        var Root = Component.extend({tag: 'div'});
        var Child = Component.extend({tag: 'span'});

        var root = Root.create();
        var child = Child.create();

        root.add(child);

        chai.assert.lengthOf(root.root.children, 1);
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
        var child = Child.create();

        root.add(child);

        chai.assert.strictEqual(child.bar, undefined);

        context.register(root);
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
                dom_processors: [processor]
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
                dom_processors: [processor]
            },
            html: '<span data-test="foo"></span>'
        });

        var root = Root.create();

        sinon.assert.notCalled(processor.process);

    });

    describe('TagComponent', function() {

        it('creates presenter', function() {

            var init = sinon.stub();

            var Presenter = Protoplast.extend({
                init: {
                    inject_init: true,
                    value: init
                },
                foo: {
                    inject: 'foo'
                }
            });

            var context = Context.create();

            context.register('foo', 'foo');

            var Root = TagComponent.extend({
                $meta: {
                    presenter: Presenter
                },
                tag: 'div',
                foo: {inject: 'foo'}
            });

            sinon.spy(Presenter, 'create');

            var root = Root.create();
            context.register(root);
            context.build();

            sinon.assert.calledOnce(Presenter.create);

            var presenter = Presenter.create.returnValues[0];

            chai.assert.strictEqual(presenter.view, root);
            chai.assert.strictEqual(presenter.foo, 'foo');
        });

        it('injects elements by query selector', function() {

            var Root = TagComponent.extend({
                html: '<div><span class="foo">test</span></div>',
                foo: {
                    $: '.foo'
                }
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.innerHTML, 'test');
        });

        it('injects elements marked with data-prop', function() {

            var Root = TagComponent.extend({
                html: '<div><span data-prop="foo">test</span></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.innerHTML, 'test');
        });

        it('creates components and replaces elements marked with data-comp', function() {

            var Child = TagComponent.extend({
                foo: 'foo'
            });

            var Root = TagComponent.extend({
                foo: {component: Child},
                html: '<div><span data-comp="foo"></span></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.foo, 'foo');

        });

        it('creates components and replaces elements marked with custom tags', function() {

            var Child = TagComponent.extend({
                $meta: {
                    tag: 'test-child'
                },
                foo: 'foo'
            });

            var Root = TagComponent.extend({
                html: '<div><test-child data-id="foo"/></span></div>'
            });

            var root = Root.create();

            chai.assert.isNotNull(root.foo);
            chai.assert.equal(root.foo.foo, 'foo');

        });

    });

});

describe('utils', function() {

    describe('render list', function() {

        var create, update, remove, host, TestRenderer, render_list;

        beforeEach(function() {
            create = sinon.stub();
            update = sinon.stub();
            remove = sinon.stub();
            TestRenderer = Protoplast.extend();
            host = {};

            render_list = Protoplast.utils.create_renderer_function(host, {
                create: create,
                update: update,
                remove: remove,
                renderer: TestRenderer,
                renderer_data_property: 'test_property'
            });
        });

        it('creates new renderers', function() {
            host._children = [];
            render_list(Collection.create([1,2,3]));
            sinon.assert.calledThrice(create);
            sinon.assert.notCalled(update);
            sinon.assert.notCalled(remove);

            sinon.assert.calledWith(create, host, 1, TestRenderer, 'test_property');
            sinon.assert.calledWith(create, host, 2, TestRenderer, 'test_property');
            sinon.assert.calledWith(create, host, 3, TestRenderer, 'test_property');
        });

        it('updates existing renderers', function() {
            host._children = ['A','B','C'];
            render_list(Collection.create([3,2,1]));
            sinon.assert.notCalled(create);
            sinon.assert.calledThrice(update);
            sinon.assert.notCalled(remove);

            sinon.assert.calledWith(update, 'A', 3, 'test_property');
            sinon.assert.calledWith(update, 'B', 2, 'test_property');
            sinon.assert.calledWith(update, 'C', 1, 'test_property');
        });

        it('removes obsolete renderers', function() {
            host._children = ['A','B','C'];
            render_list(Collection.create([3,2]));
            sinon.assert.notCalled(create);
            sinon.assert.calledTwice(update);
            sinon.assert.calledOnce(remove);

            sinon.assert.calledWith(remove, host, 'C');
        });
    });


});