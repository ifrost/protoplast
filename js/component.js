
var Protoplast = require('./protoplast');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Protoplast.extend({

    $create: function() {
        this._children = [];
        this.root = document.createElement(this.tag || 'div');
    },

    /**
     * Template method, used to create DOM of the component
     */
    init: {
        inject_init: true,
        value: function() {}
    },

    /**
     * Destroy the component and all child components
     */
    destroy: function() {
        this._children.forEach(function(child) {
            this.remove(child);
        }, this);
    },

    /**
     * Add a child component
     * @param {Component} child
     */
    add: function(child) {
        if (!child) {
            throw new Error('Child component cannot be null');
        }
        if (!child.root) {
            throw new Error('Child component should have root property');
        }
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
    var component = Component.create();
    component.root = element;
    context.register(component);
    return component;
};

module.exports = Component;

