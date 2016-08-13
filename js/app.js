var Protoplast = require('./protoplast'),
    Component = require('./component'),
    Context = require('./di');

var App = Protoplast.extend({

    config: null,

    context: null,

    $create: function() {
        this.context = Context.create();
    },

    start: function(config) {
        this.config = config;

        for (var name in this.config.context) {
            this.context.register(name, this.config.context[name]);
        }

        this.context.build();

        if (config.view && config.view.root) {
            this.root = Component.Root(config.view.root, this.context);
            if (config.view.top) {
                var tops = config.view.top.constructor === Array ? config.view.top : [config.view.top];
                tops.forEach(function(view) {
                    this.root.add(view);
                }, this);
            }
        }
    }

});

module.exports = App;