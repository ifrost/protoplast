var resolveProperty = function(host, chain, handler) {
    var props = chain.split('.');

    if (!chain) {
        handler(host);
    }
    else if (props.length === 1) {
        handler(host[chain]);
    }
    else {
        var subHost = host[props[0]];
        var subChain = props.slice(1).join('.');
        if (subHost) {
            resolveProperty(subHost, subChain, handler);
        }
    }

};

var observe = function(host, chain, handler, context) {
    var props = chain.split('.');

    context = context || {};

    if (props.length === 1) {
        host.on(chain + '_changed', handler, context);
        handler();
    }
    else {
        var subHost = host[props[0]];
        var subChain = props.slice(1).join('.');
        if (subHost) {
            observe(subHost, subChain, handler, context);
        }
        host.on(props[0] + '_changed', function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + '_changed', handler);
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
                resolveProperty(host, props.join('.'), function(value) {
                    value.off(null, null, context);
                });
            }
        }
    }
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
                    previousList.off('changed', previousHandler);
                }
                previousList = null;
                previousHandler = null
            }
            if (list) {
                previousList = list;
                previousHandler = handler.bind(host, list);
                if (list.on) {
                    list.on('changed', previousHandler, context);
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
        }
    }
};

var bindProperty = function(host, hostChain, dest, destChain) {

    var props = destChain.split('.');
    var prop = props.pop();

    return bind(host, hostChain, function() {
        resolveProperty(host, hostChain, function(value) {
            resolveProperty(dest, props.join('.'), function(finalObject) {
                if (finalObject) {
                    finalObject[prop] = value;
                }
            })
        })
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