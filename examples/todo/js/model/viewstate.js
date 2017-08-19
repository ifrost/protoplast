(function(window) {
    'use strict';

    window.ViewStateModel = window.Protoplast.Model.extend({

        state: null,

        $create: function() {
            this.state = window.ViewStateModel.ALL;
        }

    });

    window.ViewStateModel.ALL = 'all';
    window.ViewStateModel.DONE = 'done';
    window.ViewStateModel.UNDONE = 'undone';
    
})(window);
