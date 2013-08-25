from py4j.java_gateway import JavaGateway
from RobotController import RobotController
from threading import Thread
import time
import math
import config
import urllib
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
	# t = Thread(target=turn_degrees, args=(angle,))
	# t.start()
	return __turn_to(angle, backwards, 0)

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
	if 'angle' in request.vars:
		angle = int(request.vars['angle'])
	# # moving robot
	__move_to(t_x, t_y, backwards, 0)
	# if robot needs to face a final orientation, turn.
	if 'angle' in request.vars:
		time.sleep(1)
		__turn_to(angle, False, 0)

def plot_point():
	move_forward()
	time.sleep(0.4)
	move_backward()
	time.sleep(0.5)
	stop()

def __turn_to(angle, backwards, recursion):
	# direction = get_direction()
	# if direction < angle:
	# 	turn_left()
	# 	while True:
	# 		direction = get_direction()
	# 		print(direction)
	# 		if direction >= angle - angle_threshold:
	# 			stop()
	# 			break
	# else:
	# 	turn_right()
	# 	while True:
	# 		direction = get_direction()
	# 		print(direction)
	# 		if direction <= angle + angle_threshold:
	# 			stop()
	# 			break
	# if not __within_threshold(angle, small_angle_threshold) and recursion < recursion_cutoff:
	# 	__turn_to(angle, backwards, recursion+1)
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
			turn_left(__within_threshold(angle, angle_threshold))
		elif d < 0:
			turn_right(__within_threshold(angle, angle_threshold))
		while True:
			# time.sleep(0.01)
			if __within_threshold(angle, angle_threshold):
				stop()
				break
		time.sleep(1)
		if not __within_threshold(angle, small_angle_threshold) and recursion < recursion_cutoff:
			backwards = not backwards if backwards else backwards # read this expression outloud. Laugh. This sets backwards to False if it was True
			__turn_to(angle, backwards, recursion + 1)
	

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

	print('Move to #' + str(recursion))
	m = move_forward if not backwards else move_backward # based on the backwards variable, determine function for robot movement
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
		if new_angle > 5:
			__turn_to(new_angle, backwards, 0)	

		# determining if it'll be moving in x, y or both
		position = __get_position()
		c_x = position[0]
		c_y = position[1]
		move_x = math.fabs(c_x - x) > distance_threshold
		move_y = math.fabs(c_y - y) > distance_threshold

		print('Move X: ' + str(move_x) + ', Move Y: ' + str(move_y))

		if move_x or move_y:
			m() # either move_forward or move_backward
			while True:
				position = __get_position()
				c_x = position[0]
				c_y = position[1]

				if (move_x and math.fabs(x - c_x) < small_distance_threshold)  or (move_y and math.fabs(c_y - y) < small_distance_threshold): # TODO cases where x is + and c_x is -. Same for y
					print('T' + str(x) + ',' + str(y))
					print('C' + str(c_x) + ',' + str(c_y))
					stop()
					break

		if math.fabs(c_x - x) > distance_threshold or math.fabs(c_y - y) > distance_threshold:
			__move_to(x, y, backwards, recursion + 1)

url = 'http://169.254.67.33:59125/process.wav?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT={0}&VOICE_SELECTIONS=cmu-rms-hsmm%20en_US%20male%20hmm&AUDIO_OUT=AIFF_FILE&LOCALE=en_US&VOICE=cmu-rms-hsmm&AUDIO=AIFF_FILE'
url = 'http://169.254.67.33:59125/process.wav?INPUT_TEXT={0}&INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&AUDIO=WAVE_FILE&LOCALE=en_US'
# url = 'http://169.254.67.33:8000/mobileinterface/static/audio/welcome.wav'

def speak():
	sentence = urllib.quote(request.vars['sentence'])
	tts_url = url.format(sentence)
	websocket_send('http://' + 'localhost' + ':' + __socket_port, tts_url, 'mykey', 'robot')


def a():
	return A('asdjlkashdjkashdlashd', _href="http://169.254.67.33:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=Welcome%20to%20the%20world%20of%20speech%20synthesis!%0A&OUTPUT_TEXT=&effect_Volume_selected=&effect_Volume_parameters=amount%3A2.0%3B&effect_Volume_default=Default&effect_Volume_help=Help&effect_TractScaler_selected=&effect_TractScaler_parameters=amount%3A1.5%3B&effect_TractScaler_default=Default&effect_TractScaler_help=Help&effect_F0Scale_selected=&effect_F0Scale_parameters=f0Scale%3A2.0%3B&effect_F0Scale_default=Default&effect_F0Scale_help=Help&effect_F0Add_selected=&effect_F0Add_parameters=f0Add%3A50.0%3B&effect_F0Add_default=Default&effect_F0Add_help=Help&effect_Rate_selected=&effect_Rate_parameters=durScale%3A1.5%3B&effect_Rate_default=Default&effect_Rate_help=Help&effect_Robot_selected=&effect_Robot_parameters=amount%3A100.0%3B&effect_Robot_default=Default&effect_Robot_help=Help&effect_Whisper_selected=&effect_Whisper_parameters=amount%3A100.0%3B&effect_Whisper_default=Default&effect_Whisper_help=Help&effect_Stadium_selected=&effect_Stadium_parameters=amount%3A100.0&effect_Stadium_default=Default&effect_Stadium_help=Help&effect_Chorus_selected=&effect_Chorus_parameters=delay1%3A466%3Bamp1%3A0.54%3Bdelay2%3A600%3Bamp2%3A-0.10%3Bdelay3%3A250%3Bamp3%3A0.30&effect_Chorus_default=Default&effect_Chorus_help=Help&effect_FIRFilter_selected=&effect_FIRFilter_parameters=type%3A3%3Bfc1%3A500.0%3Bfc2%3A2000.0&effect_FIRFilter_default=Default&effect_FIRFilter_help=Help&effect_JetPilot_selected=&effect_JetPilot_parameters=&effect_JetPilot_default=Default&effect_JetPilot_help=Help&HELP_TEXT=&exampleTexts=&VOICE_SELECTIONS=cmu-slt-hsmm%20en_US%20female%20hmm&AUDIO_OUT=WAVE_FILE&LOCALE=en_US&VOICE=cmu-slt-hsmm&AUDIO=WAVE_FILE")

def move_forward():
	rc.get_robot().forwardArrow()

def turn_left(low_speed):
	rc.get_robot().leftArrow(low_speed)

def turn_right(low_speed):
	rc.get_robot().rightArrow(low_speed)

def move_backward():
	rc.get_robot().backwardArrow()

def stop():
	rc.get_robot().stop()

def __get_position():
	return gateway.getCurrentPositionAsArray()

def get_direction():
	return int(float(RobotController.d))