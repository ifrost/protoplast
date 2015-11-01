(function (window) {
	'use strict';

	var context = window.Context();

	// models
	context.register('todos', window.TodosModel());
	context.register('viewstate', window.ViewStateModel());

	// controllers
	context.register('todocontroller', window.TodoController());
	context.register('viewstatecontroller', window.ViewStateController());

	// misc
	context.register('router', window.Router());

	context.build();

	// view
	var root = window.Component.Root(document.body, context);
	root.add(window.AppView());
	root.add(window.InfoView());

})(window);
