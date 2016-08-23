(function(window) {
    'use strict';
    
    window.TodoModel = window.Protoplast.Model.extend({

        done: null,

        text: null,

        $create: function(text, done) {
            this.text = text;
            this.done = !!done;
        },

        toJSON: function() {
            return {
                text: this.text,
                done: this.done
            }
        }
    });

})(window);
