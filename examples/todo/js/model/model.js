(function (window) {
    'use strict';

    var model_plugin = {
        merge_config_processor: function() {
            this.config.update_after = (this.config.update_after || []).concat(this.base_config.update_after || []);
        },
        constructor_processor: function() {
            this.constructor.aop(this.config.update_after, {
                after: function () {
                    this._update();
                }
            });
        }
    };

    window.Model = window.Proto.extend(function(proto, base, config){
        config.mixin = [window.Proto.Dispatcher];
        config.plugins = [model_plugin];

        proto._update = function() {
            this.dispatch('updated');
        };
    });

})(window);
