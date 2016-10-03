var OneClickButton = Button.extend({

    $meta: {
        presenter: OneClickButtonPresenter
    },

    enabled: true,

    init: function() {
        Button.init.call(this);
        this.bind('enabled', this._updateEnabled);
    },

    _updateEnabled: function() {
        this.root.disabled = !this.enabled;
    }

});