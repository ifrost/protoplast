(function(window){

    var App = Protoplast.extend({

        start: function() {
            alert('started');
        }

    });

    window.onload = function() {
        var app = App.create();
        app.start();
    }

}(window));