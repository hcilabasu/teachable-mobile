from gluon.contrib.websocket_messaging import websocket_send

__current_user_name = 'user'
__current_ip = '127.0.0.1' # ip for local testing
# __current_ip = '169.254.67.33' # ip for adhoc network
__socket_port = '8888'
__key = 'mykey'

def send():
	group = request.vars.group
	message = request.vars.message
	# TODO wrap object before sending
	websocket_send('http://' + __current_ip + ':' + __socket_port, message, __key, group)