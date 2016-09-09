var chai = require('chai'),
    sinon = require('sinon'),
    jsdom = require('jsdom'),
    Protoplast = require('./../main'),
    Context = Protoplast.Context;

describe('Examples', function() {
    
    it('flux example', function() {

        var RootView, View, ActionDispatcher, Repository, view, repository, _view;

        function ViewFactory() {
            _view = View.create();
            return _view;
        }

        // create root view that will be injected into repositories
        RootView = Protoplast.extend({

            pub: {
                inject: 'pub'
            },

            $create: function() {
                this.view = ViewFactory();
            },

            initialize: {
                injectInit: true,
                value: function() {
                    this.view.pub = this.pub;
                }
            },

            data: function(data) {
                this.view.show(data.clicks);
            }
        });

        // create a clickable component that displays number of clicks
        View = Protoplast.extend({
            
            value: null,

            show: function(value) {
                this.value = value;
            },

            click: function() {
                this.pub('myview/clicked');
            }

        });

        // action dispatcher to convert view actions to domain actions
        ActionDispatcher = Protoplast.extend({

            pub: {
                inject: 'pub'
            },

            countClick: {
                sub: 'myview/clicked',
                value: function() {
                    this.pub('click/increment', 1);
                }
            }
        });

        // repository to react to domain actions and pass data to the view
        Repository = Protoplast.extend({

            view: {
                inject: 'view'
            },

            $create: function() {
                this.clicks = 0;
            },

            increment: {
                sub: 'click/increment',
                value: function(value) {
                    this.clicks += value;
                    this.refresh();
                }
            },

            refresh: {
                injectInit: true,
                value: function() {
                    this.view.data({clicks: this.clicks});
                }
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
