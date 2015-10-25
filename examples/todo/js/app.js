(function (window) {
	'use strict';

	window.Proto.register('todos', window.TodosModel());
	window.Proto.register('viewstate', window.ViewStateModel());

	window.AppView(d3.select('body'));

	window.TodoController();
	window.ViewStateController();
	window.Router();

})(window);
