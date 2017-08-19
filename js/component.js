var Context = require("./di"),
    Collection = require("./collection"),
    Object = require("./object"),
    utils = require("./utils");

/**
 * Creates a simple component tree-like architecture for the view layer. Used with DI
 * @alias Component
 */
var Component = Object.extend({

    $meta: {
        domProcessors: [utils.domProcessors.createComponents, utils.domProcessors.injectElement]
    },
    
    tag: "",

    html: "",

    root: {
        get: function() {
            return this._root;
        },
        set: function(value) {
            this._root = value;
            this.processRoot();
        }
    },
    
    parent: null,

    children: {
        get: function() {
            return this._children;
        }
    },

    /**
     * Init the object, construct and process DOM
     */
    $create: function() {
        var domWrapper;

        this._children = [];
        this._createRootHtml();
        
        domWrapper = utils.html.parseHTML(this.html);
        if (domWrapper.childNodes.length > 1) {
            throw new Error("Component should have only one root element");
        }
        this.root = domWrapper.firstChild;

        this.processInstance();
    },
    
    /**
     * Process DOM using defined DOM processors
     */
    processRoot: function() {
        var i, elements, element, value;
        if (this._root) {
            (this.$meta.domProcessors || []).forEach(function(processor) {
                elements =  this._root.querySelectorAll("[" + processor.attribute + "]");
                for (i = 0; i < elements.length; i++) {
                    element = elements[i];
                    value = element.getAttribute(processor.attribute);
                    processor.process(this, element, value);
                }
            }, this);
        }
    },

    /**
     * Process instance applying shortcuts defined in metadata
     */
    processInstance: function() {
        utils.meta(this, "renderWith", function(property) {
            this[property] = Collection.create(this[property] || []);
        }.bind(this));
    },

    processBinding: {
        injectInit: true,
        value: function() {
            var properties;

            utils.meta(this, "bindWith", function(property, meta) {
                properties = utils.isPrimitive(meta) ? [meta] : meta;
                properties.forEach(function(propertyToBind) {
                    utils.bind(this, propertyToBind, this[property]);
                }, this);
            }.bind(this));

            utils.meta(this, "renderWith", function(property, meta) {
                utils.renderList(this, property, meta);
            }.bind(this));
        }
    },

    /**
     * @type {Function}
     */
    __fastinject__: {
        get: function() {return this.___fastinject___;},
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
        injectInit: true,
        value: function() {}
    },

    /**
     * Destroy the component and all child components
     */
    destroy: {
        injectDestroy: false,
        value: function() {
            if (this.__presenter__ && this.__presenter__.destroy) {
                this.__presenter__.destroy();
            }
            this.removeAll();
        }
    },

    /**
     * Add a child component
     * @param {Component} child
     */
    add: function(child) {
        this._validateChild(child);
        if (child.parent) {
            child.parent.remove(child);
        }
        child.parent = this;
        this._children.push(child);
        this.root.appendChild(child.root);
        if (this.__fastinject__) {
            this.__fastinject__(child);
        } // otherwise it will be injected when __fastinject__ is set
    },

    /**
     * Validates if child is correctly defined
     * @param {Component} child
     * @private
     */
    _validateChild: function(child) {
        if (!child) {
            throw new Error("Child component cannot be null");
        }
        if (!child.root) {
            throw new Error("Child component should have root property");
        }
    },

    /**
     * Create root html (if not defined) based on "tag" property (defaulting to "div")
     * @private
     */
    _createRootHtml: function() {
        if (!this.tag && !this.html) {
            this.tag = "div";
        }

        if (this.tag && !this.html) {
            this.html = "<" + this.tag + "></" + this.tag + ">";
        }
    },
    
    /**
     * Remove child component
     * @param {Component} child
     */
    remove: function(child) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child.root.parentNode.removeChild(child.root);
            child.destroy();
        }
    },

    /**
     * Remove all children component
     */
    removeAll: function() {
        this._children.concat().forEach(function(child) {
            this.remove(child);
        }, this);
    },

    /**
     * Attaches a component by replacing the provided element. Element must be an element inside the parent component.
     * @param {Component} child
     * @param {Element} element
     * @param {HTMLElement} root if different than child.root
     */
    attach: function(child, element, root) {
        this._children.push(child);
        (root || this.root).insertBefore(child.root, element);
        (root || this.root).removeChild(element);
    },

    /**
     * Attaches the component to a root created on a provided element
     * @param element
     * @param context
     */
    attachTo: function(element, context) {
        var parent = Component.Root(element, context);
        parent.add(this);
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
    context = context || Context.create();
    component.root = element;
    context.register(component);
    return component;
};

Component.Mount = function(tag, Component, context) {
    var elements, element, component;

    elements = document.getElementsByTagName(tag);

    if (!context) {
        context = Context.create();
        context.build();
    }

    for (var i=0; i < elements.length; i++) {
        element = elements[i];
        component = Component.create();

        element.parentNode.insertBefore(component.root, element);
        element.parentNode.removeChild(element);

        context.register(component);
        context.process(component);
    }

    return component;
};

module.exports = Component;

