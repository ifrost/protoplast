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