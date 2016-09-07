var utils = require('./utils');

/**
 * Base protoplast
 */
var Protoplast = {
    $meta: {},
    $define_property: function(property, desc) {
        Object.defineProperty(this, property, desc);
    },
    create: function() {
        return utils.createObject(this, arguments);
    }
};

/**
 * Creates new factory function
 * @param [mixins]     list of mixins to merge with
 * @param description  object description
 * @returns {Object}
 */
Protoplast.extend = function(mixins, description) {
    var proto = Object.create(this), meta, mixins_meta, desc;

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
    var property_definitions = [];

    for (var property in description) {
        
        if (Object.prototype.toString.call(description[property]) !== "[object Object]") {
            desc = {value: description[property], writable: true, enumerable: true, configurable: true};
        } else {
            desc = description[property];

            // default value to null
            if (!(property in this) && !desc.set && !desc.get && !desc.value) {
                desc.value = null;
            }

            for (var d in desc) {
                // move all non standard descriptors to meta
                if (desc.hasOwnProperty(d) && ['value', 'get', 'set', 'writable', 'enumerable', 'configurable'].indexOf(d) === -1) {
                    meta.properties[d] = meta.properties[d] || {};
                    meta.properties[d][property] = desc[d];
                    delete desc[d];
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
        property_definitions.push({
            property : property,
            desc: desc
        });
    }

    // mix meta data from the mixins into one object
    mixins_meta = (mixins || []).reduce(function(current, next) {
        return utils.merge(current, next.$meta);
    }, {});
    // mix all mixins meta data
    meta = utils.merge(meta, mixins_meta);
    // mix base prototype meta to the current meta
    proto.$meta = utils.merge(meta, this.$meta);

    // define properties
    property_definitions.forEach(function(definition) {
        var property = definition.property,
            desc = definition.desc;
        proto.$define_property(property, desc);
    });

    return proto;
};

global.Protoplast = Protoplast;
module.exports = Protoplast;
