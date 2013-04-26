AUDIO = {};

AUDIO.loadSound = function(name){
	AUDIO[name] = document.getElementById(name);
	AUDIO[name].load();
}

AUDIO.play = function(name){
	AUDIO[name].play();
}