from Robot import Robot
import serial
import thread
from Tkinter import *
from time import sleep

'''
from RobotController import RobotController
rc = RobotController()
rc.get_robot()
'''

class RobotController:

	r = None
	d = None
	auto = True

	def get_robot(self):
		if RobotController.r != None:
			return RobotController.r
		else:

			
			# thread.start_new_thread(self.control_window, tuple())

			RobotController.r = Robot()
			return RobotController.r

	def set_auto(self, auto):
		RobotController.auto = auto
		return RobotController.auto

	def control_window(self):
		root = Tk()

		root.title('Robot Controller')
		Label(root, text='Click here to control the robot!\n\nUse the arrow keys to move and the space bar to stop\n\nClick The Exit Button To End Communication').pack(pady=10)

		frame = Frame(root, width=350, height=100)
		frame.bind("<KeyPress>", self.keyDown)
		frame.pack()
		frame.focus_force()
		root.mainloop()

	def keyDown(self, event):
	    if event.char == '\xef\x9c\x80':
	        self.r.forwardArrow()
	    elif event.char == ' ':
	        self.r.stop()
	    elif event.char == '\xef\x9c\x81':
	        self.r.backwardArrow()
	    elif event.char == '\xef\x9c\x82':
	        self.r.leftArrow(False)
	    elif event.char == '\xef\x9c\x83':
	        self.r.rightArrow(False)


