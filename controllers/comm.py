import json
from gluon.contrib.websocket_messaging import websocket_send

__current_ip = '127.0.0.1'
# __current_ip = '169.254.67.33'
__socket_group_name = 'applet'
__socket_port = '8888'

def send_message():
	'''
	This message is used by the communication.js file to send a message to another application
	target: the desired target recipient of the message. Options: applet, interface, robot
	type: a value indicating what the message is about. The client code will use this to determine what to do with the message
	value: the json object containing the desired message params
	'''
	target = request.vars['target']
	type = request.vars['type']
	value = request.vars['value']
	obj = {'type':type, 'value':value}
	objJSON = json.dumps(obj)
	websocket_send('http://' + __current_ip + ':' + __socket_port, objJSON, 'mykey', target)


def test():
	'''Loads test page'''
	return dict()