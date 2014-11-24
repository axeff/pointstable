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
                $('#points .digits .' + newKey).html(value);
            } else {
                $('#' + key).html(value);
            }

        });
    })

    io.on('time', function(data) {
        var time = data.message.time;
        if (time == '00:10') {
            $('#time').addClass('blink');
        }
        if (time == '00:00') {
            $('#time').removeClass('blink');
        }
        $('#time').html(time);
    })

    io.emit('ready') ;
});
