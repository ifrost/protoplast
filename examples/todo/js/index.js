(function(window){

    var app = App();
    app.run({
        controllers: {
            todocontroller: window.TodoController(),
            viewstatecontroller: window.ViewStateController()
        },
        models: {
            todos: window.TodosModel(),
            viewstate: window.ViewStateModel()
        },
        root_node: document.body,
        root_views: [window.AppView(), window.InfoView()]
    });

})(window);