var resolve_property = function(host, chain, handler) {
    var props = chain.split('.');

    if (!chain) {
        handler(host);
    }
    else if (props.length === 1) {
        handler(host[chain]);
    }
    else {
        var sub_host = host[props[0]];
        var sub_chain = props.slice(1).join('.');
        if (sub_host) {
            resolve_property(sub_host, sub_chain, handler);
        }
    }

};

var bind_setter = function(host, chain, handler) {
    var props = chain.split('.');

    if (props.length === 1) {
        host.on(chain + '_changed', handler);
        handler(host[chain]);
    }
    else {
        var sub_host = host[props[0]];
        var sub_chain = props.slice(1).join('.');
        if (sub_host) {
            bind_setter(sub_host, sub_chain, function() {
                resolve_property(sub_host, sub_chain, handler);
            });
        }
        host.on(props[0] + '_changed', function(_, previous) {
            if (previous && previous.on) {
                previous.off(props[0] + '_changed', handler);
            }
            bind_setter(host[props[0]], sub_chain, handler);
        });
    }

};

var bind_collection = function(host, source_chain, handler) {

    var previous_list = null, previous_handler;

    bind_setter(host, source_chain, function() {
        resolve_property(host, source_chain, function(list) {
            if (previous_list) {
                if (previous_list.off) {
                    previous_list.off('changed', previous_handler);
                }
                previous_list = null;
                previous_handler = null
            }
            if (list) {
                previous_list = list;
                previous_handler = handler.bind(host, list);
                if (list.on) {
                    list.on('changed', previous_handler);
                }
            }
            handler(list);
        });
    });

};

var bind = bind_collection;

var bind_property = function(host, host_chain, dest, dest_chain) {

    var props = dest_chain.split('.');
    var prop = props.pop();

    bind(host, host_chain, function() {
        resolve_property(host, host_chain, function(value) {
            resolve_property(dest, props.join('.'), function(final_object) {
                if (final_object) {
                    final_object[prop] = value;
                }
            })
        })
    });

};

module.exports = {
    resolve_property: resolve_property,
    bind: bind,
    bind_setter: bind_setter,
    bind_property: bind_property,
    bind_collection: bind_collection
};