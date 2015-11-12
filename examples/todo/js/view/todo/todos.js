(function (window) {
    'use strict';

    window.TodosView = window.View.extend({

        tag: 'ul',

        __meta__: {
            inject: {
                todos: 'todos',
                view_state: 'viewstate'
            }
        },

        create: function() {

            this.$root.classed('todo-list', true);

            this.todos.on('updated', this.render, this);
            this.view_state.on('updated', this.render, this);

            var self = this;
            d3.select(window)
                .on('click', function() {
                    if (!d3.select(d3.event.target).classed('edit')) {
                        self.exit_edit_mode();
                    }
                })
                .on('keyup', function() {
                    if (d3.event.keyCode === 27) {
                        self.exit_edit_mode();
                    }
                });

            this.render();
        },

        get_data: function() {
            var state = this.view_state.get_state(), data;
            if (state == window.ViewStateModel.ALL) {
                data = this.todos.all();
            }
            else if (state == window.ViewStateModel.DONE) {
                data = this.todos.done();
            }
            else if (state == window.ViewStateModel.UNDONE) {
                data = this.todos.undone();
            }
            return data;
        },

        render: function() {
            var data = this.get_data();

            var self = this;

            var update = this.$root.selectAll('li').data(data);
            var exit = update.exit();
            var enter = update.enter();

            // enter
            var new_li = enter.append('li');
            new_li
                .style({opacity: 0, height: '0px'})
                .transition().duration(200)
                .style({opacity: 1, height: '58px'});
            var new_div = new_li.append('div').classed('view', true);

            new_div
                .append('input')
                .classed('toggle', true)
                .on('click', this.pub.bind(this, 'todos/toggle'))
                .attr('type', 'checkbox');
            new_div
                .append('label')
                .on('dblclick', function(d) {
                    self.exit_edit_mode();
                    self.enter_edit_mode(d);
                });

            new_div
                .append('button')
                .classed('destroy', true).on('click', this.pub.bind(this, 'todos/remove'));

            new_li
                .append('input')
                .classed('edit', true)
                .on('keypress', function(todo){
                    var text = d3.select(this).property('value').trim();
                    if (d3.event.keyCode === 13) {
                        self.exit_edit_mode();
                        if (text.length) {
                            self.pub('todos/edit', {todo: todo, text: text})
                        }
                        else {
                            self.pub('todos/remove', todo)
                        }
                    }
                });

            // exit
            exit
                .transition()
                .duration(200)
                .style('opacity', 0)
                .remove();

            // update
            update.classed('completed', function(d){return d.done});
            var div = update.select('div');
            div.select('label')
                .text(function(d){return d.text});
            div.select('input.toggle')
                .property('checked', function(d){return d.done});
            div.select('input.edit');
            div.select('button.destroy');
        },

        enter_edit_mode: function(todo) {
            var li = this.$root.selectAll('li').filter(function(d){
                return d === todo;
            }).classed('editing', true);
            li.selectAll('input').attr('value', todo.text).node().focus();
        },

        exit_edit_mode: function() {
            this.$root.selectAll('li').classed('editing', false);
        }
    });

})(window);
