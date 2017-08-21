(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Protoplast"] = factory();
	else
		root["Protoplast"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var common = __webpack_require__(5),
    binding = __webpack_require__(2),
    component = __webpack_require__(6),
    html = __webpack_require__(7);

module.exports = {
    createObject: common.createObject,
    merge: common.merge,
    isLiteral: common.isLiteral,
    isPrimitive: common.isPrimitive,
    mixin: common.mixin,
    uniqueId: common.uniqueId,
    meta: common.meta,

    resolveProperty: binding.resolveProperty,
    bind: binding.bind,
    bindSetter: binding.bindSetter,
    bindProperty: binding.bindProperty,
    bindCollection: binding.bindCollection,
    observe: binding.observe,

    renderList: component.renderList,
    createRendererFunction: component.createRendererFunction,
    renderListDefaults: component.renderListDefaults,
    domProcessors: {
        injectElement: component.domProcessors.injectElement,
        createComponents: component.domProcessors.createComponents
    },
    
    html: html
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var utils = __webpack_require__(0);

/**
 * Base protoplast
 */
var Protoplast = new (function() {
});

var STANDARD_DESCRIPTOR_PROPERTIES = ["value", "get", "set", "writable", "enumerable", "configurable"];

Protoplast.$meta = {};
Protoplast.$defineProperty = function(property, desc) {
    Object.defineProperty(this, property, desc);
};
Protoplast.create = function() {
    return utils.createObject(this, arguments);
};

function getArgs(mixins, description) {
    // normalise parameters
    if (!(mixins instanceof Array)) {
        description = mixins;
        mixins = [];
    }

    return {
        description: description || {},
        mixins: mixins || []
    };
}

function defineMetaDataObject(description) {
    var meta = description.$meta || {};
    meta.properties = meta.properties || {};

    // $meta section of the description has to be deleted
    // so it's not processed as a property definition later or.
    // All entries but $meta and $create are treated as
    // property definitions
    delete description.$meta;
    
    return meta;
}

function process$create(meta, description) {
    // $create is a shortcut for adding a constructor to constructors list
    if (description.$create !== undefined) {
        meta.constructors = meta.constructors || [];
        meta.constructors.push(description.$create);
        delete description.$create;
    }
}

function validateDescriptionValue(property, desc) {
    // default value to undefined
    if (!(property in this) && !desc.set && !desc.get && !desc.value) {
        desc.value = undefined;
    }

    return desc;
}

function validateDescription(desc) {
    if (!desc.hasOwnProperty("writable") && !desc.hasOwnProperty("set") && !desc.hasOwnProperty("get")) {
        desc.writable = true;
    }
    if (!desc.hasOwnProperty("enumerable")) {
        desc.enumerable = true;
    }
    if (!desc.hasOwnProperty("configurable")) {
        desc.configurable = true;
    }
    
    return desc;
}

function defineCustomMetaData(meta, metaKey, property, desc) {
    // move all non standard descriptors to meta
    if (desc.hasOwnProperty(metaKey) && STANDARD_DESCRIPTOR_PROPERTIES.indexOf(metaKey) === -1) {
        meta.properties[metaKey] = meta.properties[metaKey] || {};
        meta.properties[metaKey][property] = desc[metaKey];
        delete desc[metaKey];
    }
}

function createPropertyDefinitions(meta, description) {
    var desc;
    
    // create description for all properties (properties are defined at the end)
    var propertyDefinitions = [];

    for (var property in description) {

        if (Object.prototype.toString.call(description[property]) !== "[object Object]") {
            desc = {value: description[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = description[property];

            validateDescriptionValue(property, desc);

            for (var metaKey in desc) {
                defineCustomMetaData(meta, metaKey, property, desc);
            }
            
            validateDescription(desc);
        }
        propertyDefinitions.push({
            property: property,
            desc: desc
        });
    }
    
    return propertyDefinitions;
}

/**
 * Creates new factory function
 * @param [mixins]     list of mixins to merge with
 * @param description  object description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixinsMeta, args = getArgs(mixins, description);

    mixins = args.mixins;
    description = args.description;
    meta = defineMetaDataObject(description);
    process$create(meta, description);

    // mix-in all the mixins to the current prototype
    proto = utils.mixin(proto, mixins);

    var propertyDefinitions = createPropertyDefinitions(meta, description);
    
    // mix meta data from the mixins into one object
    mixinsMeta = (mixins || []).reduce(function(current, next) {
        return utils.merge(current, next.$meta);
    }, {});
    // mix all mixins meta data
    meta = utils.merge(meta, mixinsMeta);
    // mix base prototype meta to the current meta
    proto.$meta = utils.merge(meta, this.$meta);
    
    // define properties
    propertyDefinitions.forEach(function(definition) {
        var property = definition.property,
            desc = definition.desc;
        proto.$defineProperty(property, desc);
    });

    return proto;
};

global.Protoplast = Protoplast;
module.exports = Protoplast;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var resolveProperty = function(host, chain, handler) {
    var props = chain.split(".");

    if (!chain) {
        handler(host);
    }
    else if (props.length === 1) {
        handler(host[chain]);
    }
    else {
        var subHost = host[props[0]];
        var subChain = props.slice(1).join(".");
        if (subHost) {
            resolveProperty(subHost, subChain, handler);
        }
    }

};

var observe = function(host, chain, handler, context) {
    var props = chain.split(".");

    context = context || {};

    if (props.length === 1) {
        host.on(chain + "_changed", handler, context);
        handler();
    }
    else {
        var subHost = host[props[0]];
        var subChain = props.slice(1).join(".");
        if (subHost) {
            observe(subHost, subChain, handler, context);
        }
        host.on(props[0] + "_changed", function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + "_changed", handler);
            }
            observe(host[props[0]], subChain, handler, context);
        }, context);
    }

    return {
        start: function() {
            observe(host, chain, handler);
        },
        stop: function() {
            resolveProperty(host, chain, function(value) {
                if (value && value.off) {
                    value.off(null, null, context);
                }
            });
            while (props.length) {
                props.pop();
                resolveProperty(host, props.join("."), function(value) {
                    value.off(null, null, context);
                });
            }
        }
    };
};

var bindSetter = function(host, chain, handler, context) {
    return observe(host, chain, function() {
        resolveProperty(host, chain, function(value) {
            if (value !== undefined) {
                handler(value);
            }
        });
    }, context);
};

// TODO: fails when collection is null
var bindCollection = function(host, sourceChain, handler, context) {

    var previousList = null, previousHandler;

    context = context || {};

    return bindSetter(host, sourceChain, function() {
        resolveProperty(host, sourceChain, function(list) {
            if (previousList) {
                if (previousList.off) {
                    previousList.off("changed", previousHandler);
                }
                previousList = null;
                previousHandler = null;
            }
            if (list) {
                previousList = list;
                previousHandler = handler.bind(host, list);
                if (list.on) {
                    list.on("changed", previousHandler, context);
                }
            }
            handler(list);
        });
    }, context);

};

var bind = function(host, bindingsOrChain, handler) {
    var handlersList;
    if (arguments.length === 3) {
        return bindCollection(host, bindingsOrChain, handler);
    }
    else {
        var watchers = [], subWatcher;
        for (var binding in bindingsOrChain) {
            if (bindingsOrChain.hasOwnProperty(binding)) {
                handlersList = bindingsOrChain[binding];
                if (!(handlersList instanceof Array)) {
                    handlersList = [handlersList];
                }
                handlersList.forEach(function(handler) {
                    subWatcher = bind(host, binding, handler.bind(host));
                    watchers.push(subWatcher);
                });
            }
        }
        var args = arguments;
        return {
            start: function() {
                bind.apply(null, args);
            },
            stop: function() {
                watchers.forEach(function(watcher) {
                    watcher.stop();
                });
            }
        };
    }
};

var bindProperty = function(host, hostChain, dest, destChain) {

    var props = destChain.split(".");
    var prop = props.pop();

    return bind(host, hostChain, function() {
        resolveProperty(host, hostChain, function(value) {
            resolveProperty(dest, props.join("."), function(finalObject) {
                if (finalObject) {
                    finalObject[prop] = value;
                }
            });
        });
    });

};

module.exports = {
    resolveProperty: resolveProperty,
    bind: bind,
    bindSetter: bindSetter,
    bindProperty: bindProperty,
    bindCollection: bindCollection,
    observe: observe
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Protoplast = __webpack_require__(1),
    Dispatcher = __webpack_require__(8),
    utils = __webpack_require__(0);

function defineComputedProperty(name, desc, isLazy) {
    var calc = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        if (this["_" + name] === undefined) {
            this["_" + name] = calc.call(this);
        }
        return this["_" + name];
    };

    if (isLazy) {
        desc.set = function() {
            var old = this["_" + name];
            this["_" + name] = undefined;
            this.dispatch(name + "_changed", undefined, old);
        };
    }
    else {
        desc.set = function() {
            var value, old;
            old = this["_" + name];
            this["_" + name] = undefined;
            value = this[name];
            if (value !== old) {
                this.dispatch(name + "_changed", value, old);
            }
        };
    }
}

function defineBindableProperty(name, desc, proto) {
    var initialValue = desc.value;

    delete desc.value;
    delete desc.writable;
    delete desc.enumerable;

    desc.get = function() {
        return this["_" + name];
    };
    desc.set = function(value) {
        if (value !== this["_" + name]) {
            var old = this["_" + name];
            this["_" + name] = value;
            this.dispatch(name + "_changed", value, old);
        }
    };
    proto["_" + name] = initialValue;
}

// TODO: destroy bindings
var Model = Protoplast.extend([Dispatcher], {

    $create: function() {
        var computed = this.$meta.properties.computed;
        for (var computedProperty in computed) {
            if (computed.hasOwnProperty(computedProperty)) {
                computed[computedProperty].forEach(function(chain) {
                    (function(name){
                        utils.observe(this, chain, function() {
                            this[name] = undefined;
                        }.bind(this));
                    }.bind(this))(computedProperty);
                }, this);
            }
        }
    },

    $defineProperty: function(property, desc) {

        if (this.$meta.properties.computed && this.$meta.properties.computed[property]) {
            var isLazy = this.$meta.properties.lazy && this.$meta.properties.lazy[property];
            defineComputedProperty(property, desc, isLazy);
        }
        else if (!desc.get || ["number", "boolean", "string"].indexOf(typeof(desc.value)) !== -1) {
            defineBindableProperty(property, desc, this);
        }

        Protoplast.$defineProperty.call(this, property, desc);
    }

});

module.exports = Model;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var idCounter = 0;

/**
 * Generate a unique id prefixed with prefix if defined
 * @param {String} prefix
 * @returns {String}
 */
function uniqueId(prefix) {
    var id = ++idCounter;
    return (prefix || "") + id;
}

/**
 * Create an object for the prototype
 * @param {Object} proto
 * @param {Object[]} args
 * @returns {Object}
 */
function createObject(proto, args) {
    var instance = Object.create(proto);
    if (instance.$meta.constructors) {
        instance.$meta.constructors.forEach(function(constructor) {
            constructor.apply(instance, args);
        });
    }
    return instance;
}

function isPrimitive(value) {
    return ["number", "boolean", "string", "function"].indexOf(typeof(value)) !== -1;
}

function isLiteral(value) {
    return value && value.constructor === Object;
}

/**
 * Merge source object into destination
 * @see mergerProperty
 *
 * @param destination
 * @param source
 * @returns {Object}
 */
function merge(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            mergeProperty(destination, source, property);
        }
    }
    return destination;
}

/**
 * Merge a single property
 *
 * Arrays are concatenated, primitives taken from the source if not
 * defined and complex object merged recursively
 *
 * @param {Object} destination
 * @param {Object} source
 * @param {String} property
 */
function mergeProperty(destination, source, property) {
    if (source[property] instanceof Array) {
        mergeAsArray(destination, source, property);
    }
    else if (isPrimitive(source[property]) || !isLiteral(source[property])) {
        overrideIfNotExists(destination, source, property);
    }
    else {
        mergeAsObject(destination, source, property);
    }
}

/**
 * Merges arrays by concatenating them
 *
 * @param {Object} destination
 * @param {Object} source
 * @param {String} property
 */
function mergeAsArray(destination, source, property) {
    destination[property] = source[property].concat(destination[property] || []);
}

/**
 * Sets the property from source if it wasn't defined in destination
 *
 * @param {Object} destination
 * @param {Object} source
 * @param {String} property
 */
function overrideIfNotExists(destination, source, property) {
    if (!destination.hasOwnProperty(property)) {
        destination[property] = source[property];
    }
}

/**
 * Merges object recursively using merge function
 *
 * @param {Object} destination
 * @param {Object} source
 * @param {String} property
 */
function mergeAsObject(destination, source, property) {
    destination[property] = destination[property] || {};
    merge(destination[property], source[property]);
}

/**
 * Mixes mixin source properties into destination object unless the property starts with __
 * @param {Object} destination
 * @param {Object} source
 * @returns {Object}
 */
function mix(destination, source) {
    for (var property in source) {
        if (property.substr(0, 2) !== "__" && !(property in destination)) {
            destination[property] = source[property];
        }
    }
    return destination;
}

/**
 * Mixes all mixins into the instance
 * @param {Object} instance
 * @param {Object[]} mixins
 * @returns {Object}
 */
function mixin(instance, mixins) {
    mixins.forEach(function(Mixin) {
        mix(instance, Mixin);
    });
    return instance;
}

function meta(instance, metaProperty, handler) {
    for (var property in instance.$meta.properties[metaProperty]) {
        if (instance.$meta.properties[metaProperty].hasOwnProperty(property)) {
            handler(property, instance.$meta.properties[metaProperty][property]);
        }
    }
}

module.exports = {
    createObject: createObject,
    merge: merge,
    isLiteral: isLiteral,
    isPrimitive: isPrimitive,
    mixin: mixin,
    uniqueId: uniqueId,
    meta: meta
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var binding = __webpack_require__(2);

/**
 * Inject Element processor. Parses the template for elements with [data-prop] and injects the element to the
 * property passed as the value of the data-prop attribute. If a wrapper is defined the element is wrapped before
 * setting on the component
 */
var injectElement = {
    attribute: "data-prop",
    process: function(component, element, value) {
        (function(element){
            component[value] = element;
            if (component.$meta.elementWrapper) {
                component[value] = component.$meta.elementWrapper(component[value]);
            }
            else if (component.$meta.elementWrapperFunctionName) {
                component[value] = component[component.$meta.elementWrapperFunctionName](component[value]);
            }
        })(element);
    }
};

/**
 * Create Component processor. Replaces an element annotated with data-comp attribute with a component set in a property
 * of name passes as the value of the attribute, example
 * <div data-comp="foo"></div>
 */
var createComponents = {
    attribute: "data-comp",
    process: function(component, element, value) {
        var child = component[value] = component.$meta.properties.component[value].create();
        component.attach(child, element, element.parentNode);
    }
};

var renderListDefaultOptions = {
    remove: function(parent, child) {
        parent.remove(child);
    },
    create: function(parent, data, renderer, propertyName) {
        var child = renderer.create();
        child[propertyName] = data;
        parent.add(child);
    },
    update: function(child, item, propertyName) {
        child[propertyName] = item;
    }
};

/*eslint-disable complexity */
var validateRenderingOptions = function(opts) {
    opts = opts || {};
    opts.create = opts.create || renderListDefaultOptions.create;
    opts.remove = opts.remove || renderListDefaultOptions.remove;
    opts.update = opts.update || renderListDefaultOptions.update;
    opts.property = opts.property || "data";
    if (!opts.renderer) {
        throw new Error("Renderer is required");
    }
    return opts;
};
/*eslint-enable complexity */

var createRendererFunction = function(host, opts) {

    opts = validateRenderingOptions(opts);

    return function(list) {
        var max = Math.max(this.children.length, list.length),
            children = this.children.concat();

        for (var i = 0; i < max; i++) {
            if (children[i] && list.toArray()[i]) {
                opts.update(children[i], list.toArray()[i], opts.property);
            }
            else if (!children[i]) {
                opts.create(this, list.toArray()[i], opts.renderer, opts.property);
            }
            else if (!list.toArray()[i]) {
                opts.remove(this, children[i]);
            }
        }
    }.bind(host);
};

var renderList = function(host, sourceChain, opts) {
    var rendererFunction = createRendererFunction(opts.parent || host, opts);
    binding.bindCollection(host, sourceChain, rendererFunction);
};

module.exports = {
    createRendererFunction: createRendererFunction,
    renderList: renderList,
    renderListDefaults: renderListDefaultOptions,
    domProcessors: {
        injectElement: injectElement,
        createComponents: createComponents
    }
};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

/**
 * Source: https://gist.github.com/Munawwar/6e6362dbdf77c7865a99
 *
 * jQuery 2.1.3's parseHTML (without scripts options).
 * Unlike jQuery, this returns a DocumentFragment, which is more convenient to insert into DOM.
 * MIT license.
 *
 * If you only support Edge 13+ then try this:
 function parseHTML(html, context) {
        var t = (context || document).createElement('template');
            t.innerHTML = html;
        return t.content.cloneNode(true);
    }
 */
var parseHTML = (function() {
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        // We have to close these tags to support XHTML (#13200)
        wrapMap = {
            // Support: IE9
            option: [1, "<select multiple='multiple'>", "</select>"],

            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            tbody: [1, "<table>", "</table>"],

            _default: [0, "", ""]
        };

    /**
     * @param {String} elem A string containing html
     * @param {Document} context
     */
    return function parseHTML(elem, context) {
        context = context || document;

        var tmp, tag, wrap, j,
            fragment = context.createDocumentFragment();

        if (!rhtml.test(elem)) {
            fragment.appendChild(context.createTextNode(elem));

            // Convert html into DOM nodes
        } else {
            tmp = fragment.appendChild(context.createElement("div"));

            // Deserialize a standard representation
            tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
            wrap = wrapMap[tag] || wrapMap._default;
            tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

            // Descend through wrappers to the right content
            j = wrap[0];
            while (j--) {
                tmp = tmp.lastChild;
            }

            // Remove wrappers and append created nodes to fragment
            fragment.removeChild(fragment.firstChild);
            while (tmp.firstChild) {
                fragment.appendChild(tmp.firstChild);
            }
        }

        return fragment;
    };
}());

module.exports = {
    parseHTML: parseHTML
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {


var Protoplast = __webpack_require__(1);

/**
 * EventDispatcher implementation, can be used as mixin or base protoype
 */
var Dispatcher = Protoplast.extend({

    $create: function() {
        this._topics = {};
    },

    dispatch: function(topic) {
        var args = Array.prototype.slice.call(arguments, 1);
        (this._topics[topic] || []).forEach(function(config) {
            config.handler.apply(config.context, args);
        });
    },

    on: function(topic, handler, context) {
        if (!handler) {
            throw new Error("Handler is required for event " + topic);
        }
        this._topics[topic] = this._topics[topic] || [];
        this._topics[topic].push({handler: handler, context: context});
    },

    off: function(topic, handler, context) {
        if (!topic) {
            this._offAll(handler, context);
        }
        else {
            this._offSingle(topic, handler, context);
        }
    },
    
    _offAll: function(handler, context) {
        for (var topic in this._topics) {
            if (this._topics.hasOwnProperty(topic)) {
                this.off(topic, handler, context);
            }
        }
    },
    
    _offSingle: function(topic, handler, context) {
        this._topics[topic] = (this._topics[topic] || []).filter(function(config) {
            return handler ? config.handler !== handler : config.context !== context;
        });
    }
});

module.exports = Dispatcher;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Model = __webpack_require__(4);

var Collection = Model.extend({

    $create: function(array) {
        this.array = array || [];
    },

    length: {
        get: function() {
            return this.array.length;
        }
    },

    get: function(index) {
        return this.array[index];
    },

    indexOf: function() {
        return this.array.indexOf.apply(this.array, arguments);
    },

    add: function(item) {
        var result = this.array.push(item);
        this.dispatch("changed", {added: [item], removed: []});
        return result;
    },

    addAll: function(array) {
        array.forEach(this.add, this);
    },
    
    remove: function(item) {
        var index = this.array.indexOf(item);
        if (index !== -1) {
            this.array.splice(index, 1);
            this.dispatch("changed", {added: [], removed: [item]});
        }
    },

    forEach: function(handler, context) {
        return this.array.forEach(handler, context);
    },
    
    concat: function() {
        return Collection.create(this.array.concat.apply(this.array, arguments));
    },

    filter: function(handler, context) {
        return Collection.create(this.array.filter(handler, context));
    },

    toArray: function() {
        return this.array;
    },

    toJSON: function() {
        return this.toArray();
    }

});

module.exports = Collection;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var Protoplast = __webpack_require__(1),
    Dispatcher = __webpack_require__(8);

/**
 * Dependency Injection context builder
 * @type {Object}
 */
var Context = Protoplast.extend({

    $create: function() {
        var self = this;
        this._children = [];
        this._objects = {
            pub: {
                instance: function(topic, message) {
                    self._dispatcher.dispatch(topic, message);
                }
            },
            sub: {
                instance: function(topic) {
                    var instanceSelf = this;
                    return {
                        add: function(handler) {
                            self._dispatcher.on(topic, handler, instanceSelf);
                        },
                        remove: function(handler) {
                            self._dispatcher.off(topic, handler, instanceSelf);
                        }
                    };
                }
            }
        };
        this._unknows = [];

        this._dispatcher = Dispatcher.create();
    },

    /**
     * Map of object in the context
     * @type {Object}
     * @private
     */
    _objects: null,

    /**
     * List of objects added to the registry but having no id
     */
    _unknows: null,

    /**
     * List of children contexts
     */
    _children: null,

    /**
     * Registers object in the DI context
     * @param {String} [id]
     * @param {Object} instance
     */
    register: function(id, instance, opts) {
        if (arguments.length === 1) {
            instance = id;
            this._unknows.push({
                instance: instance,
                readonly: opts && opts.readonly
            });
        }
        else {
            this._objects[id] = {
                instance: instance,
                readonly: opts && opts.readonly
            };
        }

        // fast inject is used to register and process new objects after the config has been built
        // any object registered in the config has this method.
        instance.__fastinject__ = function(obj) {
            this.register(obj);
            this.process(obj);
        }.bind(this);

        this._children.forEach(function(context) {
            context.register(id, instance, {readonly: true});
        });
    },
    
    _injectDependencies: function(obj) {
        var injectId;
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.inject) {
            Object.keys(obj.$meta.properties.inject).forEach(function(property){
                injectId = obj.$meta.properties.inject[property];
                if (this._objects[injectId]) {
                    obj[property] = this._objects[injectId].instance;
                }
                else if (injectId.isPrototypeOf) {
                    var objects = [];
                    Object.keys(this._objects).forEach(function(id) {
                        objects.push(this._objects[id]);
                    }, this);
                    this._unknows.concat(objects).forEach(function(dependencyDescriptor) {
                        if (injectId.isPrototypeOf(dependencyDescriptor.instance)) {
                            obj[property] = dependencyDescriptor.instance;
                        }
                    }, this);
                }
            }, this);
        }
    },

    /**
     * Runs method for each object in context
     * @param method
     * @private
     */
    _runOnAll: function(method) {
        Object.keys(this._objects)
            .filter(function(id) {
                return !this._objects[id].readonly;
            }, this)
            .forEach(function(id) {
                var instance = this._objects[id].instance;
                method(instance);
            }, this);

        this._unknows
            .filter(function(descriptor) {
                return !descriptor.readonly;
            }, this)
            .forEach(function(descriptor){
                method(descriptor.instance);
            }, this);
    },

    _runInitMethods: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.injectInit) {
            Object.keys(obj.$meta.properties.injectInit).forEach(function(handler){
                obj[handler]();
            }, this);
        }
    },
    
    _runDestroyMethods: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.injectDestroy) {
            Object.keys(obj.$meta.properties.injectDestroy).forEach(function(handler){
                if (obj.$meta.properties.injectDestroy[handler]) {
                    obj[handler]();
                }
            }, this);
        }
    },

    _initialiseSubscriptions: function(obj) {
        if (obj.$meta && obj.$meta.properties && obj.$meta.properties.sub) {
            Object.keys(obj.$meta.properties.sub).forEach(function(handler){
                this._objects.sub.instance.call(obj, obj.$meta.properties.sub[handler]).add(obj[handler]);
            }, this);
        }
    },

    process: function(obj) {
        this._injectDependencies(obj);
        this._runInitMethods(obj);
        this._initialiseSubscriptions(obj);
    },

    /**
     * Process all objects
     */
    build: function() {
        this._runOnAll(this.process.bind(this));
    },

    /**
     * Creates new child context
     * @returns {Context}
     */
    createChildContext: function() {
        var context = Context.create();
        this._children.push(context);
        return context;
    },

    /**
     * Destroy all objects in the context
     */
    destroy: function() {
        this._runOnAll(this._runDestroyMethods.bind(this));
    }

});

module.exports = Context;



/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var constructors = __webpack_require__(12),
    utils = __webpack_require__(0),
    Model = __webpack_require__(4);

var Object = Model.extend({
    
    $meta: {
        constructors: [constructors.autobind]
    },
    
    init: {
        injectInit: true,
        value: function() {}
    },
    
    destroy: {
        injectDestroy: true,
        value: function() {}
    },

    bind: function(chain, handler) {
        utils.bind(this, chain, handler);
    },

    bindProperty: function(chain, dest, destChain) {
        utils.bindProperty(this, chain, dest, destChain);
    }
    
});

module.exports = Object;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

/**
 * Collection of constructors
 */
var constructors = {
    
    /**
     * Bind all the function to the instance
     */
    autobind: function () {
        for (var property in this) {
            if (typeof(this[property]) === "function") {
                this[property] = this[property].bind(this);
            }
        }
    }

};

module.exports = constructors;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var Protoplast = __webpack_require__(1),
    Collection = __webpack_require__(9),
    CollectionView = __webpack_require__(14),
    Dispatcher = __webpack_require__(8),
    Context = __webpack_require__(10),
    Component = __webpack_require__(15),
    Model = __webpack_require__(4),
    Object = __webpack_require__(11),
    utils = __webpack_require__(0),
    constructors = __webpack_require__(12);

var protoplast = {
    extend: Protoplast.extend.bind(Protoplast),
    create: Protoplast.create.bind(Protoplast),
    Dispatcher: Dispatcher,
    Context: Context,
    Component: Component,
    Model: Model,
    Object: Object,
    Collection: Collection,
    CollectionView: CollectionView,
    constructors: constructors,
    utils: utils
};

global.Protoplast = protoplast;
module.exports = protoplast;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var Model = __webpack_require__(4);

var CollectionView = Model.extend({

    _filters: null,

    _sort: null,

    _hiddenSelected: null,
    
    selected: null,

    length: {
        get: function() {
            return this._current.length;
        }
    },

    $create: function(collection) {
        this._source = collection;
        this._current = [];
        this._filters = [];
        this._sort = [];

        this._source.on("changed", this._invalidate, this);

        this.refresh = this.refresh.bind(this);

        this._invalidate({
            added: this._source.toArray()
        });
    },

    refresh: function() {
        this._invalidate();
    },

    addFilter: function(filter) {
        this._filters.push(filter);
        this._invalidate();
    },

    removeFilter: function(filter) {
        var index = this._filters.indexOf(filter);
        if (index !== -1) {
            this._filters.splice(index, 1);
            this._invalidate();
        }
    },

    addSort: function(sort) {
        this._sort.push(sort);
        this._invalidate();
    },

    removeSort: function(sort) {
        var index = this._sort.indexOf(sort);
        if (index !== -1) {
            this._sort.splice(index, 1);
            this._invalidate();
        }
    },

    get: function(index) {
        return this._current[index];
    },

    toArray: function() {
        return this._current;
    },

    forEach: function() {
        return this._current.forEach.apply(this._current, arguments);
    },

    _resubscribe: function(filterOrSort, event) {
        event.removed.forEach(function(item) {
            if (filterOrSort.properties) {
                filterOrSort.properties.forEach(function(property) {
                    item.off(property + "_changed", this.refresh, this);
                }, this);
            }
        }, this);

        event.added.forEach(function(item) {
            if (filterOrSort.properties) {
                filterOrSort.properties.forEach(function(property) {
                    item.on(property + "_changed", this.refresh, this);
                }, this);
            }
        }, this);
    },

    _invalidate: function(event) {

        if (!event) {
            event = {added: this._source.toArray(), removed: this._source.toArray()};
        }

        this._current = this._source.toArray().concat();

        this._filters.forEach(function(filter) {
            this._resubscribe(filter, event);
            this._current = this._current.filter(function(item) {
                return filter.fn(item);
            });

        }, this);

        if (this._sort.length) {
            this._sort.forEach(function(sort) {
                this._resubscribe(sort, event);
            }, this);

            this._current.sort(function(a, b) {
                var sorts = this._sort.concat();
                var result = 0, sort = sorts.shift();
                
                while (result === 0 && sort) {
                    result = sort.fn(a, b);
                    sort = sorts.shift();
                }

                return result;
            }.bind(this));
        }
        
        if (this.selected && this._current.indexOf(this.selected) === -1) {
            this._hiddenSelected = this.selected;
            this.selected = null;
        }
        else if (!this.selected && this._hiddenSelected && this._current.indexOf(this._hiddenSelected) !== -1) {
            this.selected = this._hiddenSelected;
            this._hiddenSelected = null;
        }
        
        this.dispatch("changed");
    }

});

module.exports = CollectionView;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var Context = __webpack_require__(10),
    Collection = __webpack_require__(9),
    Object = __webpack_require__(11),
    utils = __webpack_require__(0);

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



/***/ })
/******/ ]);
});