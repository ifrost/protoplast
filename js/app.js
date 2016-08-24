var Protoplast = require('./protoplast'),
    Component = require('./component'),
    Context = require('./di');

var App = Protoplast.extend({

    config: null,

    context: null,

    default_config: null,

    $create: function() {
        this.context = Context.create();
    },

    start: function(config) {
        this.config = this.default_config || {};

        this.config.view = this.config.view || {};
        this.config.context = this.config.context || {};

        if (config && config.view && config.view.root) {
            this.config.view.root = config.view.root;
        }
        if (config && config.view && config.view.top) {
            this.config.view.top = config.view.top;
        }
        if (config && config.context) {
            for (var prop in config.context) {
                if (config.context.hasOwnProperty(prop)) {
                    this.config.context[prop] = config.context[prop];
                }
            }
        }

        for (var name in this.config.context) {
            if (this.config.context.hasOwnProperty(name)) {
                this.context.register(name, this.config.context[name]);
            }
        }

        this.context.register(this);
        this.context.build();

        if (this.config.view && this.config.view.root) {
            this.root = Component.Root(this.config.view.root, this.context);
            if (this.config.view.top) {
                var tops = this.config.view.top.constructor === Array ? this.config.view.top : [this.config.view.top];
                tops.forEach(function(view) {
                    this.root.add(view);
                }, this);
            }
        }
    }

});

module.exports = App;