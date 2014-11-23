function Timer(callback){

    this.time = 7*60;
    this.timerId;
    this.callback = callback;
    this.strZeit;
    this.isRunning = false;

    this.getTime = function (){
        return this.time;
    }

    this.setTime = function(time){
        this.time = time;
        this.timeToString();
        this.renderTime();
        return this;
    }

    this.setTimeMinutes = function (minutes){
        this.time = minutes * 60;
        this.timeToString();
        this.renderTime();
        return this;
    }

    this.plusTime = function(){
        this.time++;
        this.timeToString();
        this.renderTime();
        return this;
    }

    this.minusTime = function(){
        this.time--;
        this.timeToString();
        this.renderTime();
        return this;
    }

    this.renderTime = function(){

        this.callback(this.strZeit, this.time);

        return this;
    }

    this.timeToString = function(){
        //time brauchen wir später noch
        var t = this.time;

        // Minuten berechnen
        // Sekunden durch 60 ergibt Minuten
        // Minuten gehen von 0-59
        //also Modulo 60 rechnen
        var m = Math.floor(t/60) %60;

        // Sekunden berechnen
        var s = t %60;

        //Zeiten formatieren
        m = (m < 10) ? "0"+m : m;
        s = (s < 10) ? "0"+s : s;

        // Ausgabestring generieren
        this.strZeit = m + ":" + s;

        return this;
    }

    this.playpause = function () {
        if (this.isRunning) {
            this.pause();
        } else {
            this.play();
        }
    }

    this.pause = function() {
        this.isRunning = false;
        window.clearTimeout(this.timerId);

        return this;
    };

    this.play = function(){
        this.isRunning = true;

        //Countdown-Funktion erneut aufrufen
        //diesmal mit einer Sekunde weniger
        window.clearTimeout(this.timerId);
        this.timerId = window.setTimeout(function(){
            --this.time;
            this.play();
        }.bind(this),1000);

        if(this.time <= 0)
        {
            this.strZeit = "00:00";
        } else {
            this.timeToString();
        }

        this.renderTime();

        return this;
    }

}

