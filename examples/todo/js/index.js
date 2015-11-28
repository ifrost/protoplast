(function(window) {

    var app = App.create();
    app.run({
        controllers: {
            todocontroller: window.TodoController.create(),
            viewstatecontroller: window.ViewStateController.create(),
            router: window.Router.create()
        },
        models: {
            todos: window.TodosModel.create(),
            viewstate: window.ViewStateModel.create()
        },
        root_node: document.body,
        root_views: [window.AppView.create(), window.InfoView.create()]
    });

})(window);
