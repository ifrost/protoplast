var Component = require('./component'),
    utils = require('./utils');

/**
 * Component with additional DOM processing
 */
var TagComponent = Component.extend({

    $meta: {
        dom_processors: [utils.dom_processors.create_component, utils.dom_processors.inject_element]
    },

    $create: function() {
        var init_func = this.init.bind(this);
        this.init = function() {
            init_func();
            if (this.$meta.presenter) {
                var presenter = this.$meta.presenter.create();
                var presenter_type = this.$meta.presenter_type || 'both';
                var presenter_property = this.$meta.presenter_property || 'presenter';
                var view_property = this.$meta.view_property || 'view';

                if (presenter_type === 'active' || presenter_type === 'both') {
                    presenter[view_property] = this;
                }
                if (presenter_type === 'passive' || presenter_type === 'both') {
                    this[presenter_property] = this;
                }
                this.presenter = presenter;
                this.___fastinject___(presenter);
                this.presenter_ready();
            }
        }
    },

    presenter_ready: function() {},
    
});

module.exports = TagComponent;