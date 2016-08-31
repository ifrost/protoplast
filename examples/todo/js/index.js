(function(window) {

    var config = {
        todocontroller: window.TodoController.create(),
        viewstatecontroller: window.ViewStateController.create(),
        router: window.Router.create(),
        todos: window.TodosModel.create(),
        viewstate: window.ViewStateModel.create(),
        appmodel: window.AppModel.create()
    };

    var context = window.Protoplast.Context.create();

    for (var name in config) {
        if (config.hasOwnProperty(name)) {
            context.register(name, config[name]);
        }
    }

    context.build();

    var root = window.Protoplast.Component.Root(document.body, context);
    root.add(window.AppView.create());
    root.add(window.InfoView.create());

})(window);
