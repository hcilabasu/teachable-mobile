COMM = {}
COMM = {}

COMM.sendToApplet = function(message){
	var queryString = "?group=applet&message=" + message;
	$.ajax({
        url: APP.SEND + queryString,
        success: function(data) {
            console.dir("Sent " + message + " to server");
        }
    });
}