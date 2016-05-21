var utils = require('./utils');

/**
 * Base protoplast
 */
var Protoplast = {
    $meta: {},
    create: function() {
        return utils.createObject(this, arguments);
    }
};

/**
 * Creates new factory function
 * @param [mixins]
 * @param definition
 * @returns {Object}
 */
Protoplast.extend = function(mixins, definition) {
    var proto = Object.create(this), meta, desc, defined, property_processors = [];

    // set defaults
    if (!(mixins instanceof Array)) {
        definition = mixins;
        mixins = [];
    }
    definition = definition || {};
    mixins = mixins || [];
    meta = definition.$meta || {};
    delete definition.$meta;

    if (definition.$create !== undefined) {
        meta.$constructors = meta.$constructors || [];
        meta.$constructors.push(definition.$create);
        delete definition.$create;
    }

    proto = utils.mixin(proto, mixins);

    for (var property in definition) {
        defined = false;

        if (definition[property] && definition[property].hooks) {
            (function(property, desc){
                definition[property].hooks.forEach(function(hook) {
                    if (hook.desc) {
                        hook.desc(proto, property, desc);
                    }
                    if (hook.proto) {
                        (function(fn) {
                            property_processors.push(function(proto) {
                                proto[property] = (fn(proto[property], proto));
                            });
                        }(hook.proto));
                    }
                    if (hook.instance) {
                        meta.$constructors = meta.$constructors || [];
                        meta.$constructors.push(function() {
                            this[property] = (hook.instance(this[property], proto, this));
                        });
                    }
                });
            }(property, definition[property]));
        }
        
        if (Object.prototype.toString.call(definition[property]) !== "[object Object]") {
            defined = true;
            desc = {value: definition[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = definition[property];
            for (var d in desc) {
                if (['value', 'get', 'set', 'writable', 'enumerable', 'configurable'].indexOf(d) === -1) {
                    meta[d] = meta[d] || {};
                    meta[d][property] = desc[d];
                    delete desc[d];
                }
                else {
                    defined = true;
                }
            }
            if (!desc.hasOwnProperty('writable') && !desc.hasOwnProperty('set') && !desc.hasOwnProperty('get')) {
                desc.writable = true;
            }
            if (!desc.hasOwnProperty('enumerable')) {
                desc.enumerable = true;
            }
            if (!desc.hasOwnProperty('configurable')) {
                desc.configurable = true;
            }
        }
        if (defined) {
            Object.defineProperty(proto, property, desc);
        }
    }

    proto.$meta = utils.merge(meta, this.$meta);
    proto.$super = this;

    property_processors.forEach(function(property_processor) {
        property_processor(proto);
    });
    utils.processPrototype(proto);

    return proto;
};

module.exports = Protoplast;


