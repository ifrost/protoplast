var OneClickButtonPresenter = Protoplast.Object.extend({

    init: function() {
        this.view.label = 'One-Click Button';
        this.view.on('clicked', this._clicked.bind(this));
    },

    _clicked: function() {
        this.view.enabled = false;
    }
    
});