$(function(){
    //register on server
    io.emit('registerInput');

    var mirrorPushed = false;

    //mirror monitor
    var addLi = function(id, ip){
        $a = $('<a href="#"><span class="glyphicon glyphicon-random"></span></a>');
        $a.bind('click', function(){
            $elem = $(this);
            io.emit('mirrorView', {message:{id: id, force: true}});
            $elem.parent().toggleClass('active');
            return false;
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
            return false;
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

        return false;
    });

    $(':radio').on('change', radioBind);


    if (typeof window.timer == 'undefined') {

        window.gameState = '1sthalf';

        window.timer = new Timer(function(timeStr, time){

            $('#timerView').html(timeStr);

            //add blink if time < 10
            if (time == 10) {
                if (!$('#timerView').hasClass('blink')) {
                    $('#timerView').addClass('blink');
                }
            }

            if (time == 0) {
                $('#timerView')
                    .removeClass('blink')
                    .removeClass('danger');

                //play buzz sound
                io.emit('buzzer');

                this.pause();
            }


            io.emit('time', {
                message: {
                    time: timeStr,
                    gameState: window.gameState,
                    mirrorPush: mirrorPushed
                }
            });

            if (mirrorPushed) {

                mirrorPushed = false;
            }


        });
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
        var x = n >= 30 ? 30 : n;
        (x).times(function() {
            window.timer.plusTime();
        })

    },300,1);

    holdit($('#minusTime'),function(n){
        var n;
        var x = n >= 30 ? 30 : n;
        (x).times(function() {
            window.timer.minusTime();
        })

    },300,1);

    $('#play').click(function(){
        window.timer.play();
        return false;
    });

    $('#pause').click(function(){
        window.timer.pause();
        return false;
    });

    $('#timeMultiplicator a').click(function(){
        $(this).parents('ul').find('li').removeClass('active');
        $(this).parent().addClass('active');
        window.timer.setTimeMinutes($(this).data('id'));
        return false;
    });


    //bind play/pause to space key (32)
    $(document).keydown(function(event) {
        if($("#teamNames input").is(":focus")) return; //Will fail if already focused.

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
            default:
                return true;
        }

        return false;
    });

    $('#halftimes li a').click(function(){

        mirrorPushed ? false : true;

        $(this).parents('ul').find('li').removeClass('active');
        $(this).parent().addClass('active');

        var newTime = $('#timeMultiplicator .active a').html()*60;

        window.timer.setTime(newTime);

        $('#timerView')
            .removeClass('blink')
            .removeClass('danger');

        window.gameState = $(this).data('id');


        io.emit('time', {
            message: {
                time: newTime,
                gameState: window.gameState,
                mirrorPush: mirrorPushed
            }
        });

        return false;
    });

});
