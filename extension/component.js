(function(exports){

    var Protoplast = exports.Protoplast;

    var Component = Protoplast.extend(function(proto, base, meta){

        proto.init = function() {
            this._children = [];
            this.root = document.createElement(this.__meta__.tag);
        };

        proto.create = function() {

        };

        proto.injected = function() {
            this.create();
        };

        proto.add = function(child) {
            this._children.push(child);
            if (this.__fastinject__) {
                this.__fastinject__(child);
            }
            this.root.appendChild(child.root);
        };

    });

    exports.Component = Component;

})(window);