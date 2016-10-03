var Button = Protoplast.Component.extend({

    html: '<button></button>',

    label: '',

    init: function() {
        this.bind('label', this._render);
        this.root.onclick = this.dispatch.bind(this, 'clicked');
    },

    _render: function() {
        this.root.innerHTML = this.label;
    }

});