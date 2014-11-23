$(function(){
    //register on server
    io.emit('registerInput');

    //mirror monitor
    var addLi = function(id, ip){
        $a = $('<a href="#"><span class="glyphicon glyphicon-random"></span></a>');
        $a.bind('click', function(){
            $elem = $(this);
            io.emit('mirrorView', {message:{id:id}});
            $elem.parent().toggleClass('active');
        });
        $badge = $('<span class="badge"></span>');
        $badge.append($a);
        $li = $('<li class="list-group-item" data-id="' + id + '">' + ip + '</li>');
        return $li.append($badge);
    };

    //show monitors
    io.on('registeredViewers', function(data) {
        $('#viewers').html('');
        $.each(data, function(i,viewer){
            $('#viewers').append(addLi(i, viewer.ip));

        });
    });

    //add/substract goals
    var namesArray = [];
    $('.btn.goals').each(function() {
        var elem = $(this);

        elem.bind("click", function(event){
            var obj = {};
            obj[elem.data('id')]= elem.data('val');
            io.emit('goals',{
                message: obj
            });

            var $display = $('#goals' + elem.data('id') + ' span');
            var oldValue = $display.html();
            $display.html(eval(oldValue + elem.data('val')));

        });


    });

    $('input').each(function() {
        var elem = $(this);

        // Save current value of element
        elem.data('oldVal', elem.val());

        // Look for changes in the value
        elem.bind("propertychange keyup input paste", function(event){
            // If value has changed...
            if (elem.data('oldVal') != elem.val()) {
                // Updated stored value
                elem.data('oldVal', elem.val());

                // Do action
                var obj = {};
                obj[elem.attr('id')] = elem.val();
                io.emit('names', {
                    message: obj
                });
            }
        });

        elem.bind("blur", function(event){
            namesArray.push(elem.val());
        });
    });

    /*
    $('#refresh').bind('click',function(){
        if(confirm("Spiel wirklich vorbei?")){
            $('input').val('');
            io.emit('names', {
                message: {team1:'Team 1', team2:'Team 2', pointsteam1: 0, pointsteam2: 0}
            });
        }
    });
    */

    var radioBind = function(){
        if ($(this).is(':checked')) {
            var $target = $('#' + $(this).attr('name'));
            var $value = $(this).parents('.input-group').find(':text').val();

            $target.val($value);
            $target.trigger('propertychange');

        }

    };

    $('#addTeamName').click(function(){
        var n = $('#teamNames .input-group').length + 1;
        var newInput = '<div class="input-group"><span class="input-group-addon"><input type="radio" name="team1"></span><input tabindex="' + n + '" placeholder="Teamname" type="text" name="teamName' + n + '" value="" class="form-control"><span class="input-group-addon"><input type="radio" name="team2"></span></div>';
        $newInput = $(newInput);
        $newInput.find(':radio').on('change', radioBind);
        $('#teamNames').append($newInput);
        $('#teamNames').find(':text[name="teamName' + n + '"]').focus();
    });

    $(':radio').on('change', radioBind);


    if (typeof window.timer == 'undefined') {

        var gameState = '1sthalf';

        window.timer = new Timer(function(timeStr, time){

            $('#timerView').html(timeStr);

            io.emit('time', {
                message: timeStr
            });

            //add blink if time < 10
            if (time == 10) {
                if (!$('#timerView').hasClass('blink')) {
                    $('#timerView').addClass('blink');
                }
            }

            if (time == 0) {
                $('#timerView')
                    .removeClass('blink')
                    .addClass('danger');
            }

            if (time == -5 && gameState == 'pause') {
                $('#timerView')
                    .removeClass('danger')
                    .removeClass('blink');
                $('#halftimes li').removeClass('active');
                $('#halftimes li[data-id="2ndhalf"]').addClass('active');
                this.setTimeMinutes($('#timeMultiplicator li.active a').data('id'));

                this.pause();
                gameState = '2ndhalf';
            }

            if (time == -5 && gameState == '1sthalf') {
                $('#timerView')
                    .removeClass('danger')
                    .removeClass('blink');
                $('#halftimes li').removeClass('active');
                $('#halftimes li[data-id="pause"]').addClass('active');
                this.setTime(115);
                this.play();
                gameState = 'pause';
            }


            if (time < -5) {
                this.pause();
            }


        });
    }

    function fib(n){
        return n<2?n:fib(n-1)+fib(n-2);
    }

    function holdit(btn, callback, start, speedup) {
        var t, n = 1;

        var repeat = function () {
            callback(n++);
            t = setTimeout(repeat, start);
            start = start / speedup;
        }

        btn.on('mousedown', function() {
            repeat();
        });

        btn.on('mouseup', function() {
            n = 1;
            clearTimeout(t);
        });
    };

    Number.prototype.times = function(func) {
        for(var i = 0; i < Number(this); i++) {
            func();
        }
    }

    holdit($('#plusTime'),function(n){
        var f = fib(n)/10;
        var x = f >= 30 ? 30 : f;
        (x).times(function() {
            window.timer.plusTime();
        })

    },300,1);

    holdit($('#minusTime'),function(n){
        var f = fib(n)/10;
        var x = f >= 30 ? 30 : f;
        (x).times(function() {
            window.timer.minusTime();
        })

    },300,1);

    $('#play').click(function(){
        window.timer.play();
    });

    $('#pause').click(function(){
        window.timer.pause();
    });

    $('#timeMultiplicator a').click(function(){
        $(this).parents('ul').find('li').removeClass('active');
        $(this).parent().addClass('active');
        window.timer.setTimeMinutes($(this).data('id'));
    });


    //bind play/pasue to space key (32)
    $(document).keydown(function(event) {
        if($("input:not(:button)").is(":focus")) return; //Will fail if already focused.

        switch(event.keyCode) {
            case(32): //space
                window.timer.playpause();
                break;
            case(49): //1
                $('.goals.minus[data-id="team1"]').click();
                break;
            case(50): //2
                $('.goals.plus[data-id="team1"]').click();
                break;
            case(57): //9
                $('.goals.minus[data-id="team2"]').click();
                break;
            case(48): //0
                $('.goals.plus[data-id="team2"]').click();
                break;
        }

        if (event.keyCode == 32) { //space

        }
    });

});
