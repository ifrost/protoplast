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
    var proto = Object.create(this), meta, desc, defined;

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

        if (Object.prototype.toString.call(definition[property]) !== "[object Object]") {
            defined = true;
            desc = {value: definition[property], writable: true, enumerable: true};
        } else {
            desc = definition[property];
            for (var d in desc) {
                if (['value', 'get', 'set', 'writable', 'enumerable'].indexOf(d) === -1) {
                    meta[d] = meta[d] || {};
                    meta[d][property] = desc[d];
                    delete desc[d];
                }
                else {
                    defined = true;
                }
            }
        }
        if (defined) {
            Object.defineProperty(proto, property, desc);
        }
    }

    proto.$meta = utils.merge(meta, this.$meta);

    utils.processPrototype(proto);

    return proto;
};

module.exports = Protoplast;


