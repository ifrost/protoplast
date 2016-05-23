var Protoplast = require('./protoplast');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Protoplast.extend({

    tag: '',

    html: '',

    root: {
        get: function() {
            return this._root;
        },
        set: function(value) {
            this._root = value;
            this._process_root();
        }
    },

    _process_root: function() {
        if (this._root) {
            var elem, prop, child,
                data_components = this._root.querySelectorAll('[data-comp]'),
                data_properties = this._root.querySelectorAll('[data-prop]');
            for (var i = 0; i < data_components.length; i++) {
                elem = data_components[i];
                prop = elem.getAttribute('data-comp');
                child = this[prop] = this.$meta.properties.component[prop].create();
                this._children.push(child);
                this.root.insertBefore(child.root, elem);
                this.root.removeChild(elem);
            }
            for (var i = 0; i < data_properties.length; i++) {
                elem = data_properties[i];
                (function(elem){
                    this[elem.getAttribute('data-prop')] = elem;
                    if (this.$meta.element_wrapper) {
                        this[elem.getAttribute('data-prop')] = this.$meta.element_wrapper(this[elem.getAttribute('data-prop')]);
                    }
                }.bind(this))(elem);
            }

        }
    },

    $create: function() {
        this._children = [];

        if (!this.tag && !this.html) {
            this.tag = 'div';
        }

        if (this.tag && !this.html) {
            this.html = '<' + this.tag + '></' + this.tag + '>';
        }

        var container = document.createElement('div');
        container.innerHTML = this.html;
        this.root = container.firstChild;
    },

    __fastinject__: {
        get: function() {return this.___fastinject___},
        set: function(value) {
            this.___fastinject___ = value;
            // fastinject all the children
            this._children.forEach(this.__fastinject__, this);
        }
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
        this._children.concat().forEach(function(child) {
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
        if (this.__fastinject__) {
            this.__fastinject__(child);
        } // otherwise it will be injected when __fastinject__ is set
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

/**
 *
 * @param {HTMLElement} element
 * @param {Context} [context]
 * @returns {Component}
 * @constructor
 */
Component.Root = function(element, context) {
    var component = Component.create();
    component.root = element;
    if (context) {
        context.register(component);
    }
    return component;
};

module.exports = Component;

