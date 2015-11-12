(function(exports){

    var Protoplast = exports.Protoplast;

    /**
     * Creates a simple component tree-like architecture for the view layer. Used with DI
     * @alias Component
     */
    var Component = Protoplast.extend({

        __init__: function() {
            this._children = [];
            this.root = document.createElement(this.tag || 'div');
        },

        /**
         * Template method, used to create DOM of the component
         */
        create: function() {},

        /**
         * Destroy the component and all child components
         */
        destroy: function() {
            this._children.forEach(function(child){
                this.remove(child);
            }, this);
        },

        /**
         * Injected handler
         */
        injected: function() {
            this.create();
        },

        /**
         * Add a child component
         * @param {Component} child
         */
        add: function(child) {
            this._children.push(child);
            this.__fastinject__(child);
            this.root.appendChild(child.root);
        },

        /**
         * Remove child component
         * @param {Component} child
         */
        remove: function(child) {
            var index = this._children.indexOf(child);
            if (index !== -1) {
                this._children.splice(index, 1);
                this.root.removeChild(child.root);
                child.destroy();
            }
        }
    });

    Component.Root = function(element, context) {
        var component = new Component();
        component.root = element;
        context.register(component);
        return component;
    };

    exports.ProtoplastExt = exports.ProtoplastExt || {};
    exports.ProtoplastExt.Component = Component;

})(window);