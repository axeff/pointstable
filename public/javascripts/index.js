var halftimeTranlations = {
    '1sthalf': "1. Halbzeit",
    '2ndhalf': "2. Halbzeit",
    'pause': "Pause"
};

$(window).unload(function(){
    io.emit('unregisterViewer');
});

$(function(){
    io.emit('registerViewer');

    function hmsToSecondsOnly(str) {
        var p = str.split(':'),
            s = 0, m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }

        return s;
    }


    $(window).unload(function(){
        io.emit('unregisterViewer');
    });

    io.on('mirror', function(data){

    var doMirrorStuff = function(data){

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
    }

    io.on('mirror', function(data){
        doMirrorStuff(data);
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
        var timeStr = data.message.timeStr;

        $('#halftime').html(halftimeTranlations[data.message.gameState]);

        if (time >= 0) {
            if (time <= 10 && time > 0) {
                $('#time').addClass('blink');
            }
            else {
                $('#time').removeClass('blink');
            }

            $('#time').html(timeStr);

        }

        if (data.message.mirrorPush == true) {
            doMirrorStuff(data);
        }

    })

    io.emit('ready');
});
