window.onload = function() {

    var footer = Protoplast.Component.Root(document.getElementById('footer'));

    var button = Button.create();
    button.attachTo(document.getElementById('main'));
    button.label = 'add label';

    var myButton = OneClickButton.create();
    myButton.attachTo(document.getElementById('main'));
    
    button.on('clicked', function() {
        var label = Label.create();
        label.text = 'Click me';
        label.on('clicked', function() {
            label.text = ':)';
        });
        footer.add(label);
    });
};