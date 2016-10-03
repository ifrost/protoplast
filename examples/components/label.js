var Label = Protoplast.Component.extend({
    
    text: '',
    
    init: function() {
        this.bind('text', this._render);
        this.root.onclick = this.dispatch.bind(this, 'clicked');
    },
    
    _render: function() {
        this.root.innerHTML = this.text;
    }
    
});