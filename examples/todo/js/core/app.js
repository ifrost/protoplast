(function (window) {
	'use strict';

	var App = window.Protoplast.extend(function(proto){
		proto.run = function(config) {
			var context = window.ProtoplastExt.Context();
			for (var controller in config.controllers) {
				context.register(controller, config.controllers[controller]);
			}
			for (var model in config.models) {
				context.register(model, config.models[model]);
			}
			context.build();

			this.root = window.ProtoplastExt.Component.Root(config.root_node, context);
			config.root_views.forEach(function(view){
				this.root.add(view);
			}, this);
		}
	});

	window.App = App;

})(window);
