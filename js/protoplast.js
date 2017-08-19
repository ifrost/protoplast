var utils = require("./utils");

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
