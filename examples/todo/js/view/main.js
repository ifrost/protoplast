(function (window) {
    'use strict';

    window.MainView = window.View.extend(function(proto){

        proto.init = function(parent) {
            this.root = parent.append('section').classed('main', true);

            this.toggleAll = this.root.append('input').classed('toggle-all', true).attr('type', 'checkbox');
            this.root.append('label').attr('for', 'toggle-all').text('Mark all as complete');

            this.todoList = window.TodosView(this.root);
        }

    });

})(window);
