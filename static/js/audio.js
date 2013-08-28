AUDIO = {};

AUDIO.loadSound = function(name){
	if (!AUDIO[name]){
		AUDIO[name] = document.getElementById(name);
		AUDIO[name].load();
	}
}

AUDIO.addStartListener = function(name, listener){
	if(AUDIO[name].readyState !== 4) { // if the audio's state is different than HAVE_ENOUGH_DATA (4), it's not ready to play
		AUDIO[name].addEventListener('loadeddata', listener);
	} else {
		AUDIO[name].addEventListener('play', listener);
	}
}

AUDIO.addFinishListener = function(name, listener){
	AUDIO[name].addEventListener('ended', listener);
}

AUDIO.play = function(name){
	AUDIO[name].play();
}