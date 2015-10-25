(function (window) {
    'use strict';

    window.MainView = window.View.extend(function(proto, base, config){

        config.inject = {get_todos: 'todos'};

        proto.init = function(parent) {
            this.root = parent.append('section').classed('main', true);

            this.toggleAll = this.root.append('input')
                .classed('toggle-all', true)
                .attr('type', 'checkbox')
                .on('change', this.toggle.bind(this));
            this.root.append('label').attr('for', 'toggle-all').text('Mark all as complete');

            window.TodosView(this.root);

            this.get_todos().on('updated', this.update_toggle, this);
            this.update_toggle();
        };

        proto.toggle = function() {
            this.pub('todos/toggle_all', this.toggleAll.property('checked'));
        };

        proto.update_toggle = function() {
            var checked = this.get_todos().all().length === this.get_todos().done().length;
            this.toggleAll.property('checked', checked);
            this.toggleAll.style('display', this.get_todos().all().length ? 'block' : 'none');
        };

    });

})(window);
