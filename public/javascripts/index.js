var halftimeTranlations = {
    '1sthalf': "1. Halbzeit",
    '2ndhalf': "2. Halbzeit",
    'pause': "Pause"
};

$(function(){
    io.emit('registerViewer');

    $(window).unload(function(){
        io.emit('unregisterViewer');
    });

    io.on('mirror', function(data){
        if (data.message.force == true) {
            $('.dleft,.dright').toggleClass('dright dleft');    
        }
        if (data.message.reset == true) {
            $('.dleft, .dright').removeClass('right left');
            $('.dleft').addClass('left');
            $('.dright').addClass('right');
        } else {
            $('.left,.right').toggleClass('right left');    
        }
        
    });

    // Listen for the points event.
    io.on('game', function(data) {
        $.each(data.message, function(key,value){
            if (key.indexOf("points") > -1) {
                var newKey = key.replace('points','');
                $('#points .digits .' + newKey).html(value);
            } else {
                $('#' + key).html(value);
            }

        });
    })

    io.on('time', function(data) {
        var time = data.message.time;
        console.log(data.message);
        if (time == '00:10') {
            $('#time').addClass('blink');
        }
        if (time == '00:00') {
            $('#time').removeClass('blink');
        }
        $('#time').html(time);
        $('#halftime').html(halftimeTranlations[data.message.gameState]);
    })

    io.emit('ready') ;
});
