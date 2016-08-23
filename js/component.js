var Model = require('./model'),
    utils = require('./utils');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Model.extend({

    __registry: {
        value: {}
    },

    tag: '',

    html: '',

    root: {
        get: function() {
            return this._root;
        },
        set: function(value) {
            this._root = value;
            this.process_root();
        }
    },

    /**
     * Process DOM using defined DOM processors
     */
    process_root: function() {
        var i, elements, element, value;
        if (this._root) {
            (this.$meta.dom_processors || []).forEach(function(processor) {
                elements =  this._root.querySelectorAll('[' + processor.attribute + ']');
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    value = element.getAttribute(processor.attribute);
                    processor.process(this, element, value);
                }
            }, this);
        }
    },

    /**
     * Init the object, construct and process DOM
     */
    $create: function() {
        this._children = [];
        this._inlines = [];

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
            (this._children.concat(this._inlines)).forEach(this.__fastinject__, this);
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
        (this._children.concat(this._inlines)).forEach(function(child) {
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

    // TODO: unused?
    item_renderer: null,

    // data: {
    //     get: function() {
    //         return this._data;
    //     },
    //     set: function(data) {
    //
    //         this._data = data;
    //         this.update_data();
    //     }
    // },
    //
    // create_from_item_renderer: function(item) {
    //     var child = this.item_renderer(item);
    //     child.data = item;
    //     this.add(child);
    // },
    //
    // update_data: function() {
    //     if (this.item_renderer) {
    //
    //         var array = this._data;
    //
    //         this._children.forEach(this.remove, this);
    //         array.forEach(this.create_from_item_renderer, this);
    //
    //         if (array.on) {
    //             array.on('changed', function() {
    //
    //                 var max = Math.max(this._children.length, this.data.length),
    //                     children = this._children.concat();
    //
    //                 for (var i = 0; i < max; i++) {
    //                     if (children[i] && this.data.toArray()[i]) {
    //                         children[i].data = this.data.toArray()[i];
    //                     }
    //                     else if (!children[i]) {
    //                         this.create_from_item_renderer(this.data.toArray()[i]);
    //                     }
    //                     else if (!this.data.toArray()[i]) {
    //                         this.remove(children[i]);
    //                     }
    //                 }
    //
    //                 /**
    //
    //                 this._children.concat().forEach(function(child) {
    //                     if (this.data.indexOf(child.data) === -1) {
    //                         this.remove(child);
    //                     }
    //                 }, this);
    //
    //                 var child_items = this._children.map(function(child) {
    //                     return child.data;
    //                 });
    //
    //                 this.data.forEach(function(item) {
    //                     if (child_items.indexOf(item) === -1) {
    //                         this.create_from_item_renderer(item)
    //                     }
    //                 }, this);
    //
    //                  **/
    //
    //             }, this);
    //         }
    //     }
    // },

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
    },

    /**
     * Attaches a component by replacing the provided element. Element must be an element inside the parent component.
     * @param {Component} child
     * @param {Element} element
     */
    attach: function(child, element) {
        this._inlines.push(child);
        this.root.insertBefore(child.root, element);
        this.root.removeChild(element);
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

