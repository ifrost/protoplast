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

var bindSetter = function(host, chain, handler) {
    var props = chain.split('.');

    if (props.length === 1) {
        host.on(chain + '_changed', handler);
        handler(host[chain]);
    }
    else {
        var subHost = host[props[0]];
        var subChain = props.slice(1).join('.');
        if (subHost) {
            bindSetter(subHost, subChain, function() {
                resolveProperty(subHost, subChain, handler);
            });
        }
        host.on(props[0] + '_changed', function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + '_changed', handler);
            }
            bindSetter(host[props[0]], subChain, handler);
        });
    }

};

var bindCollection = function(host, sourceChain, handler) {

    var previousList = null, previousHandler;

    bindSetter(host, sourceChain, function() {
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
                    list.on('changed', previousHandler);
                }
            }
            handler(list);
        });
    });

};

var bind = function(host, bindingsOrChain, handler) {
    var handlersList;
    if (arguments.length === 3) {
        bindCollection(host, bindingsOrChain, handler);
    }
    else {
        for (var binding in bindingsOrChain) {
            handlersList = bindingsOrChain[binding];
            if (!(handlersList instanceof Array)) {
                handlersList = [handlersList];
            }
            handlersList.forEach(function(handler) {
                bind(host, binding, handler.bind(host));
            });
        }
    }
};

var bindProperty = function(host, hostChain, dest, destChain) {

    var props = destChain.split('.');
    var prop = props.pop();

    bind(host, hostChain, function() {
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
    bindCollection: bindCollection
};