import utils from "../js/utils";

export function meta(data: any): Function {
    return function(...args: any[]): void {
        if (args.length === 1) {
            // class
            const target = args[0];
            target.prototype.$meta = utils.merge(data, target.prototype.constructor.prototype.$meta || { properties: {} });

        } else {
            // property
            const prototype = args[0],
                  name = args[1];

            if (!prototype.hasOwnProperty("$meta")) {
                prototype.$meta = utils.merge({}, prototype.constructor.prototype.$meta ||  { properties: {} });
            }
            var $sourceMeta = prototype.constructor.prototype.$meta;
            var $source = ($sourceMeta && $sourceMeta.properties) || {};
            for (var metaKey in data) {
                prototype.$meta.properties[metaKey] = prototype.$meta.properties[metaKey] || {};
                prototype.$meta.properties[metaKey][name] = utils.merge(data[metaKey], ($source[metaKey] && $source[metaKey][name]) || {});
            }
        }
    }
}