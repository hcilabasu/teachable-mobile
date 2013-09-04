from py4j.java_gateway import JavaGateway
from RobotController import RobotController
from threading import Thread
import time
import math
import config
import urllib
import collections
from copy import copy
from gluon.contrib.websocket_messaging import websocket_send

__current_user_name = config.TORNADO_USER
__current_ip = config.TORNADO_IP
__socket_port = config.TORNADO_PORT
__key = config.TORNADO_KEY
__socket_group_name = config.TORNADO_GROUP_ROBOT

direction = 0
position = (0,0)
gateway = JavaGateway()

angle_threshold = 13
small_angle_threshold = 5
distance_threshold = 0.35
small_distance_threshold = 0.1

lap_time = 4.4

rc = RobotController()

recursion_cutoff = 5

def index():
	return dict(ip=__current_ip, port=__socket_port, group_name=__socket_group_name)

def control():
	return dict()

def update_direction():
	RobotController.d = request.vars['d']
	return RobotController.d

def see_position():
	return str(session.position)

def current_status():
	position = __get_position()
	x = position[0]
	y = position[1]
	return 'Position(' + str(x) + ',' + str(y) + '), Orientation(' + str(RobotController.d) + ')'

def turn_to():
	angle = int(request.vars['angle'])
	backwards = 'backwards' in request.vars

	Thread(target=__call_turn_to, args=(angle, backwards)).start()
	# __turn_to(angle, backwards, 0)
	

def move_to():

	# retrieving current position
	curr_position = __get_position()
	c_x = curr_position[0]
	c_y = curr_position[1]
	# retrieving target position
	t_x = float(request.vars['x'])
	t_y = float(request.vars['y'])
	# should the robot move backwards?
	backwards = 'backwards' in request.vars
	# final angle
	angle = None
	if 'angle' in request.vars:
		angle = int(request.vars['angle'])
	# # moving robot
	Thread(target=__call_move_to, args=(t_x, t_y, angle, backwards)).start()

def plot_point():
	__move_forward()
	time.sleep(0.4)
	__move_backward()
	time.sleep(0.5)
	__stop()

def __call_turn_to(angle, backwards):
	__turn_to(angle, backwards, 0)
	__set_auto(True)
	__stop()
	print("Finished turn to!")

def __call_move_to(x, y, angle, backwards):
	__move_to(x,y,backwards,0)
	if angle:
		time.sleep(1)
		__turn_to(angle, False, 0)
	__set_auto(True)
	__stop()
	print("Finished move to!")

def __turn_to(angle, backwards, recursion):
	if __auto():
		if backwards: 
			angle = (angle + 180) % 360
		print('%s' % str(angle))
		if not __within_threshold(angle, small_angle_threshold):
			direction = get_direction()
			d = angle - direction
			if d > 180: 
				d -= 360
			elif d < -180: 
				d += 360
		
			if d > 0:
				__turn_left(__within_threshold(angle, angle_threshold))
			elif d < 0:
				__turn_right(__within_threshold(angle, angle_threshold))
			while __auto():
				# time.sleep(0.01)
				if __within_threshold(angle, angle_threshold):
					__stop()
					break
			time.sleep(1)
			if not __within_threshold(angle, small_angle_threshold) and recursion < recursion_cutoff:
				backwards = not backwards if backwards else backwards # read this expression outloud. Laugh. This sets backwards to False if it was True
				__turn_to(angle, backwards, recursion + 1)
			print('Finished turn step')
	

def __within_threshold(desired, th):
	current = get_direction()
	if desired >= 360 - th and current < 180:
		current += 360
	elif desired <= 0 + th and current > 180:
		current -= 360
	# print('Current: ' + str(current))
	# print('Desired: ' + str(desired))
	diff = math.fabs(current - desired)
	print('Within : ' + str(diff) + ' - ' + str(diff < th))
	return diff < th

def __move_to(x, y, backwards, recursion):
	if __auto():
		print('Move to #' + str(recursion))
		m = __move_forward if not backwards else __move_backward # based on the backwards variable, determine function for robot movement
		if recursion < recursion_cutoff:
			# retrieving current position
			curr_position = __get_position()
			c_x, c_y = curr_position[0], curr_position[1]
			# retrieving target position
			t_x, t_y = x, y
			# calculating deltas
			d_x, d_y = t_x - c_x, t_y - c_y
			# calculatin angle
			new_angle = int(math.atan2(d_y,d_x) * 180 / math.pi)
			if new_angle < 0:
				new_angle += 360

			# turning robot
			angle_delta = math.fabs(get_direction() - new_angle)
			if angle_delta > 5:
				__turn_to(new_angle, backwards, 0)	

			# determining if it'll be moving in x, y or both
			position = __get_position()
			c_x = position[0]
			c_y = position[1]
			move_x = math.fabs(c_x - x) > distance_threshold
			move_y = math.fabs(c_y - y) > distance_threshold

			print('Move X: ' + str(move_x) + ', Move Y: ' + str(move_y))

			if move_x or move_y:
				m() # either __move_forward or __move_backward
				while __auto():
					position = __get_position()
					c_x = position[0]
					c_y = position[1]

					if (move_x and math.fabs(x - c_x) < small_distance_threshold)  or (move_y and math.fabs(c_y - y) < small_distance_threshold): # TODO cases where x is + and c_x is -. Same for y
						print('T' + str(x) + ',' + str(y))
						print('C' + str(c_x) + ',' + str(c_y))
						__stop()
						break

			if math.fabs(c_x - x) > distance_threshold or math.fabs(c_y - y) > distance_threshold:
				__move_to(x, y, backwards, recursion + 1)


def make_attribution():
	outcome = True if request.vars['out'] == 'success' else False # either success or failure
	attribution = __search_attribution(outcome)
	if not attribution:
		__reset(outcome)
		attribution = __search_attribution(outcome)
	# updating db
	attribution.used = True
	attribution.session = True
	attribution.update_record()
	# wrapping info in package
	message_wrapper = '{"type":"attribution", "value":{"emotion":"%s","file":"%s.aiff","message":"%s"}}' % (attribution.emotion,attribution.file_name,attribution.message)	
	websocket_send('http://' + 'localhost' + ':' + __socket_port, message_wrapper, 'mykey', 'robot')
	return message_wrapper
	

def __reset(outcome):
	for r in db(db.attributions.success == outcome).select():
		r.update_record(used=False)

def new_session():
	for r in db(db.attributions).select():
		r.update_record(session=False)

queries = {
	'both':(db.attributions.used == False) & (db.attributions.session == False),
	'session':(db.attributions.session == False),
	'used':(db.attributions.used == False)
}

def __search_attribution(outcome):
	success_query = db.attributions.success == outcome
	if not db(success_query & queries['both']).isempty():
		return db(success_query & queries['both']).select(orderby='<random>').first()
	else:
		if not db(success_query & queries['session']).isempty():
			return db(success_query & queries['session']).select(orderby='<random>').first()
		else:
			return db(success_query & queries['used']).select(orderby='<random>').first()

def move_forward():
	__move_forward()

def move_backward():
	__move_backward()

def stop():
	__stop()

def turn_left():
	__turn_left(False)

def turn_right():
	__turn_right(False)

def connect():
	try:
		robot = rc.get_robot()
		return 'yes'
	except Exception as ex:
		return 'no'

def reset_zero():
	websocket_send('http://' + 'localhost' + ':' + __socket_port, '{"type":"reset"}', 'mykey', 'robot')

def toggle_auto_control():
	return rc.set_auto(not rc.auto)

def get_direction():
	return int(float(RobotController.d))


## private functions
def __auto():
	return rc.auto

def __set_auto(auto):
	rc.set_auto(auto)

def __move_forward():
	rc.get_robot().forwardArrow()

def __move_backward():
	rc.get_robot().backwardArrow()

def __turn_left(low_speed):
	rc.get_robot().leftArrow(low_speed)

def __turn_right(low_speed):
	rc.get_robot().rightArrow(low_speed)

def __stop():
	rc.get_robot().stop()

def __get_position():
	return gateway.getCurrentPositionAsArray()

