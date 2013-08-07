from py4j.java_gateway import JavaGateway
from RobotController import RobotController
from threading import Thread
import time
import math


direction = 0
position = (0,0)
gateway = JavaGateway()

angle_threshold = 13
small_angle_threshold = 5
distance_threshold = 0.5

lap_time = 4.4

rc = RobotController()

recursion_cutoff = 5

def index():
	return dict()

def update_direction():
	RobotController.d = request.vars['d']
	return RobotController.d

def get_direction():
	return int(float(RobotController.d))

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
	# calculating deltas
	d_x = t_x - c_x
	d_y = t_y - c_y
	new_angle = math.atan2(d_y,d_x) * 180 / math.pi
	if new_angle < 0:
		new_angle += 360
	# turning robot
	__turn_to(new_angle, backwards, 0)
	# # moving robot
	__move_to(t_x, t_y, backwards, 0)
	# if robot needs to face a final orientation, turn.
	if 'angle' in request.vars:
		__turn_to(angle, False, 0)


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
	direction = get_direction()
	d = angle - direction
	if d > 180: 
		d -= 360
	elif d < -180: 
		d += 360
	if d > 0:
		turn_left()
	elif d < 0:
		turn_right()
	while True:
		time.sleep(0.01)
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
	# print('Within : ' + str(diff) + ' - ' + str(diff < th))
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
		new_angle = math.atan2(d_y,d_x) * 180 / math.pi
		if new_angle < 0:
			new_angle += 360

		# turning robot
		__turn_to(new_angle, backwards, 0)	

		# determining if it'll be moving in x, y or both
		position = __get_position()
		c_x = position[0]# + distance_threshold
		c_y = position[1]# + distance_threshold
		move_x = math.fabs(c_x - x) > 0.15
		move_y = math.fabs(c_y - y) > 0.15

		print('Move X: ' + str(move_x) + ', Move Y: ' + str(move_y))

		if move_x or move_y:
			m() # either move_forward or move_backward
			while True:
				position = __get_position()
				c_x = position[0]# + distance_threshold
				c_y = position[1]# + distance_threshold

				if (move_x and math.fabs(x - c_x) < distance_threshold)  or (move_y and math.fabs(c_y - y) < distance_threshold): # TODO cases where x is + and c_x is -. Same for y
					print('T' + str(x) + ',' + str(y))
					print('C' + str(c_x) + ',' + str(c_y))
					stop()
					break

		if math.fabs(c_x - x) > distance_threshold or math.fabs(c_y - y) > distance_threshold:
			__move_to(x, y, backwards, recursion + 1)










def move_forward():
	rc.get_robot().forwardArrow()

def turn_left():
	rc.get_robot().leftArrow()

def turn_right():
	rc.get_robot().rightArrow()

def move_backward():
	rc.get_robot().backwardArrow()

def stop():
	rc.get_robot().stop()

def __get_position():
	return gateway.getCurrentPositionAsArray()