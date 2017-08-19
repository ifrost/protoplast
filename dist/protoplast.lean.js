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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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

/**
 * Creates new factory function
 * @param [mixins]     list of mixins to merge with
 * @param description  object description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixinsMeta, desc;

    // normalise parameters
    if (!(mixins instanceof Array)) {
        description = mixins;
        mixins = [];
    }
    description = description || {};
    mixins = mixins || [];

    meta = description.$meta || {};
    meta.properties = meta.properties || {};

    // $meta section of the description has to be deleted
    // so it's not processed as a property definition later or.
    // All entries but $meta and $create are treated as
    // property definitions
    delete description.$meta;

    // $create is a shortcut for adding a constructor to constructors list
    if (description.$create !== undefined) {
        meta.constructors = meta.constructors || [];
        meta.constructors.push(description.$create);
        delete description.$create;
    }

    // mix-in all the mixins to the current prototype
    proto = utils.mixin(proto, mixins);

    // create description for all properties (properties are defined at the end)
    var propertyDefinitions = [];

    for (var property in description) {

        if (Object.prototype.toString.call(description[property]) !== "[object Object]") {
            desc = {value: description[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = description[property];

            // default value to undefined
            if (!(property in this) && !desc.set && !desc.get && !desc.value) {
                desc.value = undefined;
            }

            for (var d in desc) {
                // move all non standard descriptors to meta
                if (desc.hasOwnProperty(d) && STANDARD_DESCRIPTOR_PROPERTIES.indexOf(d) === -1) {
                    meta.properties[d] = meta.properties[d] || {};
                    meta.properties[d][property] = desc[d];
                    delete desc[d];
                }
            }
            if (!desc.hasOwnProperty("writable") && !desc.hasOwnProperty("set") && !desc.hasOwnProperty("get")) {
                desc.writable = true;
            }
            if (!desc.hasOwnProperty("enumerable")) {
                desc.enumerable = true;
            }
            if (!desc.hasOwnProperty("configurable")) {
                desc.configurable = true;
            }
        }
        propertyDefinitions.push({
            property: property,
            desc: desc
        });
    }

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
/* 4 */,
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
 * Merges source object into destination. Arrays are concatenated, primitives taken from the source if not
 * defined and complex object merged recursively
 * @param destination
 * @param source
 * @returns {Object}
 */
function merge(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            if (source[property] instanceof Array) {
                destination[property] = source[property].concat(destination[property] || []);
            }
            else if (isPrimitive(source[property]) || !isLiteral(source[property])) {
                if (!destination.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            else {
                destination[property] = destination[property] || {};
                merge(destination[property], source[property]);
            }
        }
    }
    return destination;
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

var createRendererFunction = function(host, opts) {

    opts = opts || {};
    opts.create = opts.create || renderListDefaultOptions.create;
    opts.remove = opts.remove || renderListDefaultOptions.remove;
    opts.update = opts.update || renderListDefaultOptions.update;
    opts.property = opts.property || "data";
    if (!opts.renderer) {
        throw new Error("Renderer is required");
    }

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

/***/ })
/******/ ]);
});