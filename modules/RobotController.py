from Robot import Robot


class RobotController:

	r = None
	d = None

	def get_robot(self):
		if RobotController.r != None:
			return RobotController.r
		else:
			RobotController.r = Robot()
			return RobotController.r
