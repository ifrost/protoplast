(function(window) {

    var app = new App();
    app.run({
        controllers: {
            todocontroller: new window.TodoController(),
            viewstatecontroller: new window.ViewStateController(),
            router: new window.Router()
        },
        models: {
            todos: new window.TodosModel(),
            viewstate: new window.ViewStateModel()
        },
        root_node: document.body,
        root_views: [new window.AppView(), new window.InfoView()]
    });

})(window);