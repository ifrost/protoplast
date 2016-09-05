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
 * @param description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixins_meta, desc, defined, property_hooks = [];

    // set defaults
    if (!(mixins instanceof Array)) {
        description = mixins;
        mixins = [];
    }
    description = description || {};
    mixins = mixins || [];

    if (description.$meta && description.$meta.hooks) {
        description.$meta.hooks.forEach(function(hook) {
            if (hook.desc) {
                hook.desc(description);
            }
        });
    }

    meta = description.$meta || {};
    meta.properties = meta.properties || {};

    delete description.$meta;

    if (description.$create !== undefined) {
        meta.constructors = meta.constructors || [];
        meta.constructors.push(description.$create);
        delete description.$create;
    }

    proto = utils.mixin(proto, mixins);

    var property_definitions = [];

    for (var property in description) {
        defined = false;

        if (description[property] && description[property].hooks) {
            (function(property, desc){
                description[property].hooks.forEach(function(hook) {
                    if (hook.desc) {
                        hook.desc(proto, property, desc);
                    }
                    if (hook.proto) {
                        (function(fn) {
                            property_hooks.push(function(proto) {
                                proto[property] = (fn(proto[property], property, proto));
                            });
                        }(hook.proto));
                    }
                    if (hook.instance) {
                        meta.constructors = meta.constructors || [];
                        meta.constructors.push(function() {
                            this[property] = (hook.instance(this[property], property, proto, this));
                        });
                    }
                });
            }(property, description[property]));
        }

        if (Object.prototype.toString.call(description[property]) !== "[object Object]") {
            defined = true;
            desc = {value: description[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = description[property];
            if (!(property in this) && !desc.set && !desc.get && !desc.value) {
                desc.value = null;
            }
            for (var d in desc) {
                if (['value', 'get', 'set', 'writable', 'enumerable', 'configurable'].indexOf(d) === -1) {
                    meta.properties[d] = meta.properties[d] || {};
                    meta.properties[d][property] = desc[d];
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
            property_definitions.push({
                property : property,
                desc: desc
            });
        }
    }

    mixins_meta = (mixins || []).reduce(function(current, next) {
        return utils.merge(current, next.$meta);
    }, {});
    meta = utils.merge(meta, mixins_meta);
    proto.$meta = utils.merge(meta, this.$meta);

    property_definitions.forEach(function(definition) {
        var property = definition.property,
            desc = definition.desc;

        if (proto.$meta && proto.$meta.hooks) {
            proto.$meta.hooks.forEach(function(hook) {
                if (hook.def) {
                    hook.def(property, desc, proto);
                }
            });
        }
        Object.defineProperty(proto, property, desc);
    });

    property_hooks.forEach(function(property_processor) {
        property_processor(proto);
    });

    (proto.$meta.hooks || []).forEach(function(hook) {
        if (hook.proto) {
            hook.proto(proto);
        }
    });

    return proto;
};

global.Protoplast = Protoplast;
module.exports = Protoplast;


