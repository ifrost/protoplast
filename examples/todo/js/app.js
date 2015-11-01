(function (window) {
	'use strict';

	var context = window.Context(), appView;

	context.register('todos', window.TodosModel());
	context.register('viewstate', window.ViewStateModel());
	context.register('appview', appView = AppView());
	context.register('todocontroller', window.TodoController());
	context.register('viewstatecontroller', window.ViewStateController());
	context.register('router', window.Router());
	context.build();

	document.body.appendChild(appView.root);
	document.body.appendChild(window.InfoView().root);

})(window);
