var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    App = Protoplast.App,
    Component = Protoplast.Component;

describe('App', function() {

    var Foo, Bar, app;

    beforeEach(function(done) {
        Foo = Protoplast.extend();
        Bar = Protoplast.extend();

        app = App.create();

        jsdom.env('<html><body></body></html>', function(err, window) {
            global.document = window.document;
            done();
        });
    });

    it('registers context elements', function() {

        sinon.spy(app.context, 'register');
        sinon.spy(app.context, 'build');

        var foo = Foo.create();
        var bar = Bar.create();

        var config = {
            context: {
                foo: foo,
                bar: bar
            }
        };

        app.start(config);

        sinon.assert.calledThrice(app.context.register);
        sinon.assert.calledWith(app.context.register, 'foo', foo);
        sinon.assert.calledWith(app.context.register, 'bar', bar);
        sinon.assert.calledWith(app.context.register, app);
        sinon.assert.called(app.context.build);
    });

    it('creates root element', function() {

        var element = document.createElement('div');

        app.start({
            view: {
                root: element
            }
        });

        chai.assert.strictEqual(app.root.root, element);
    });

    it('appends main view', function() {

        var element = document.createElement('div');
        var MainView = Component.extend();
        var mainView = MainView.create();

        var stubRoot = {
            add: sinon.stub()
        };

        sinon.stub(Component, 'Root').returns(stubRoot);

        app.start({
            view: {
                root: element,
                top: mainView
            }
        });

        sinon.assert.calledOnce(stubRoot.add);
        sinon.assert.calledWith(stubRoot.add, mainView);

        Component.Root.restore();
    });

    it('appends main views', function() {
        var element = document.createElement('div');
        var MainView = Component.extend();
        var mainView = MainView.create();
        var mainView2 = MainView.create();

        var stubRoot = {
            add: sinon.stub()
        };

        sinon.stub(Component, 'Root').returns(stubRoot);

        app.start({
            view: {
                root: element,
                top: [mainView, mainView2]
            }
        });

        sinon.assert.calledTwice(stubRoot.add);
        sinon.assert.calledWith(stubRoot.add, mainView);
        sinon.assert.calledWith(stubRoot.add, mainView2);

        Component.Root.restore();
    });

});