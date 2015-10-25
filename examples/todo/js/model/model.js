(function (window) {
    'use strict';

    var model_plugin = {
        merge_config_processor: function(target, base) {
            target.update_after = (target.update_after || []).concat(base.update_after || []);
        },
        constructor_processor: function(constructor, proto) {
            constructor.aop(proto.__config.update_after, {
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
