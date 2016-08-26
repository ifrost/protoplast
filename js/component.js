var Model = require('./model'),
    utils = require('./utils');

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Model.extend({

    $meta: {
        dom_processors: [utils.dom_processors.create_component, utils.dom_processors.inject_element]
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

    children: {
        get: function() {
            return this._children
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

        var _init = this.init.bind(this);
        this.init = function() {
            this.dispatch('initialising');
            _init();
            this.dispatch('initialised');
        }.bind(this);

        var _destroy = this.destroy.bind(this);
        this.destroy = function() {
            this.dispatch('destroying');
            _destroy();
            this.dispatch('destroyed');
        }.bind(this);
        
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
            if (!this.___fastinject___) {
                this.___fastinject___ = value;
                // fastinject all the children
                this._children.forEach(this.__fastinject__, this);

                if (this.$meta.presenter) {
                    this.__presenter__ = this.$meta.presenter.create();
                }

            }
        }
    },

    __presenter__: {
        get: function() {
            return this.___presenter___;
        },
        set: function(presenter) {
            this.___presenter___ = presenter;
            presenter.view = this;
            this.___fastinject___(presenter);
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
        if (this.__presenter__ && this.__presenter__.destroy) {
            this.__presenter__.destroy();
        }
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
    },

    /**
     * Attaches a component by replacing the provided element. Element must be an element inside the parent component.
     * @param {Component} child
     * @param {Element} element
     */
    attach: function(child, element) {
        this._children.push(child);
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

