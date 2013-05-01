import config
from gluon.contrib.websocket_messaging import websocket_send

__current_user_name = config.TORNADO_USER
__current_ip = config.TORNADO_IP
__socket_port = config.TORNADO_PORT
__key = config.TORNADO_KEY

def send():
	group = request.vars.group
	message = request.vars.message
	# TODO wrap object before sending
	websocket_send('http://' + __current_ip + ':' + __socket_port, message, __key, group)