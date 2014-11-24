$(function(){
    io.emit('registerViewer');

    $(window).unload(function(){
        io.emit('unregisterViewer');
    });

    io.on('mirror', function(){
        $('.left,.right').toggleClass('right left');
    });

    // Listen for the points event.
    io.on('game', function(data) {
        $.each(data.message, function(key,value){
            if (key.indexOf("points") > -1) {
                var newKey = key.replace('points','');
                if (value <= 9){
                    value = 0 + String(value);
                }
                $('#points .digits .' + newKey).html(value);
            } else {
                $('#' + key).html(value);
            }

        });
    })

    io.on('time', function(data) {
        $('#time').html(data.message.gameState + ': ' + data.message.time);
    })

    io.emit('ready') ;
});
