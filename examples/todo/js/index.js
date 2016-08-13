(function(window) {

    var app = window.Protoplast.App.create();
    app.start({
        context: {
            todocontroller: window.TodoController.create(),
            viewstatecontroller: window.ViewStateController.create(),
            router: window.Router.create(),
            todos: window.TodosModel.create(),
            viewstate: window.ViewStateModel.create()
        },
        view: {
            root: document.body,
            top: [window.AppView.create(), window.InfoView.create()]
        }
    });

})(window);
