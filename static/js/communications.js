// version: 1
// Increment every time a change is made

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

/*
 * This method uses the comm.py controller to send a message to another application
 * address: the address against which the AJAX request will be submited
 * target: the targeted recipient of the message. options: interface, applet, robot
 * type: the type of the message. This will be used by the recipieng to know what to do with the message
 * value: the content of the message
 */
COMM.sendMessage = function(address, target, type, value){
	var queryString = "?target=" + target + "&type="+ type + "&value=" + value;
	$.ajax({
        url: address + queryString,
        success: function(data) {
            console.dir("Sent " + type + " message to " + target);
        }
    });
}