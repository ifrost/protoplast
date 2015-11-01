(function(exports){

    var Protoplast = exports.Protoplast;

    /**
     * Creates a simple component tree-like architecture for the view layer. Used with DI
     * @alias Component
     */
    var Component = Protoplast.extend(function(proto){

        /**
         * Initialize component by creating the root tag
         */
        proto.init = function() {
            this._children = [];
            this.root = document.createElement(this.__meta__.tag);
        };

        /**
         * Template method, used to create DOM of the component
         */
        proto.create = function() {};

        /**
         * Destroy the component and all child components
         */
        proto.destroy = function() {
            this._children.forEach(function(child){
                this.remove(child);
            }, this);
        };

        /**
         * Injected handler
         */
        proto.injected = function() {
            this.create();
        };

        /**
         * Add a child component
         * @param {Component} child
         */
        proto.add = function(child) {
            this._children.push(child);
            if (this.__fastinject__) {
                this.__fastinject__(child);
            }
            this.root.appendChild(child.root);
        };

        /**
         * Remove child component
         * @param {Component} child
         */
        proto.remove = function(child) {
            var index = this._children.indexOf(child);
            if (index !== -1) {
                this._children.splice(index, 1);
                this.root.removeChild(child.root);
                child.destroy();
            }
        }
    });

    exports.Component = Component;

})(window);