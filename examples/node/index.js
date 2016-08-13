var App = require('protoplast').App,
    MainController = require('./main-controller'),
    Output = require('./output'),
    Data = require('./data');

var app = App.create();

app.start({
   
    context: {
        main: MainController.create(),
        data: Data.create(),
        output: Output.create()
    }
    
});

