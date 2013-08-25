#This is the class for the robot. It will be used to establish a connection 
#and send commands to the robot
#It supports forward, backward, turnLeft, turnRight
#It also supports forwardArrow, backwardArrow, which provide the ability to stop the robot using the arrow keys
#(if the robot is moving forward, the back key will stop it, and vice versa)

import serial
import threading
import sys
import time
import binascii

class Robot:
    #Overloads init method, establishes serial connection with robot
    def __init__(self):
        print ("Connecting to Robot")
        try:
            self._tty = serial.Serial(port="/dev/tty.TAG-DevB", baudrate=115200, timeout=None   )
            self.forw = False
            self.back = False
            self.leftc = False
            self.rightc = False
            self.speed = 60
            self.turnSpeed = 30
            self.turnSpeedLow = 20
            self.backTurnSpeed = 65
            print ("Connected to Robot")
            # self.get_orientation();
        except Exception as ex:
            print ("Could not Connect to Robot. Make sure the robot and the computer's bluetooth are on.")
            print(ex)
            sys.exit()

    def setStraightSpeed(self, newSpeed):
        self.speed = newSpeed

    def setTurnSpeed(self, newSpeed):
        self.turnSpeed = newSpeed

    #utility function, returns the negative hex value
    def tohex(self, val, nbits):
        return hex((val + (1 << nbits)) % (1 << nbits))

    #returns the hex value of the current speed to be sent to the robot
    def currentSpeed(self):
        return chr(self.speed)

    #returns the hex value of the current turn speed
    def currentTurnSpeed(self):
        return chr(self.turnSpeed)

    def currentTurnSpeedLow(self):
        return chr(self.turnSpeedLow)

    #returns the negative hex value of the current speed to be sent to the robot
    def currentNegSpeed(self):
        return chr((-self.speed + (1 << 8)) % (1 << 8))

    def currentNegTurnSpeed(self):
        return chr((-self.backTurnSpeed + (1 << 8)) % (1 << 8))

    def stop(self):
        self._tty.write(self.stopmotbSTR() + self.stopmotcSTR())
        self.forw = False
        self.back = False
        self.leftc = False
        self.rightc = False
    
    def stopmotbSTR(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x01) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    def stopmotcSTR(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x02) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    def forward(self):
        self._tty.write(self.motbforwardSTR() + self.motcforwardSTR())
        self.forw = True
        self.back = False
        self.rightc = False
        self.leftc = False

    def beep(self):
        self._tty.write(chr(0x06)+chr(0x00)+chr(0x80)+chr(0x03)+chr(0x0B)+chr(0x02)+chr(0xF4)+chr(0x01))

    #These are functions to turn on and off specific motors using the forwardSpeed(self.speed)

    def get_orientation(self):
        print ("Setting sensor input")
        # for reading the compass sensor: http://hsrc.static.net/Research/NXT%20I2C%20Communication/
        # sensor register documentation: http://www.hitechnic.com/cgi-bin/commerce.cgi?preadd=action&key=NMC1034
        self._tty.write(chr(0x00)+chr(0x0f)+chr(0x01)+chr(0x03)+chr(0x00)+chr(0x02)+chr(0x41)+chr(0x04))
        # Set input type mode to lowspeedv9 and raw
        sleep(2)
        self._tty.write(chr(0x05)+chr(0x00)+  chr(0x08)+  chr(0x05)+ chr(0x03)+chr(0x0A)+chr(0x00))
        # send read command (through a write command :-)
        #                                               write cmd, port     , tx_l   , rx_l     , addr   , reg
        self._tty.write(chr(0x07)+chr(0x00)+ chr(0x08)+ chr(0x0F)+chr(0X01)+chr(0x03)+chr(0x02)+chr(0x02)+chr(0x42)+chr(0x43))
        # time.sleep(2);
        # self._tty.write(chr(0x03)+chr(0x00)+ chr(0x00)+ chr(0x10)+chr(0x01))
        self.checkBuffer()

    def checkBuffer(self):
        time.sleep(2)
        self._tty.write(chr(0x03)+chr(0x00)+ chr(0x00)+ chr(0x10)+chr(0x01))
        # while self._tty.inWaiting() == 0:
        #   pass
        time.sleep(2)
        print(self._tty.read(self._tty.inWaiting())[5:].__repr__())

    '''
    Package format: 
    ===============
    pkg_size_LSB | pkg_size_MSB | cmd_type | cmd ...    
    
    '''

    def motbforwardSTR(self):
        #       size        size       no reply    setoutstate  motorb      power set point       mode        regul       turn ratio  runstate    tacho       "           "           "        
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x01) + self.currentSpeed() + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))
        
    def motcforwardSTR(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x02) + self.currentSpeed() + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))
        
    def motbbackwardSTR(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x01) + self.currentNegSpeed() + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    def motcbackwardSTR(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x02) + self.currentNegSpeed() + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    #These are functions to turn on and off certain motors using the 
    def motbforwardTurn(self, speed):
        #       size        size       no reply    setoutstate  motorb      power set point       mode        regul       turn ratio  runstate    tacho       "           "           "        
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x01) + speed + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))
        
    def motcforwardTurn(self, speed):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x02) + speed + chr(0x07) + chr(0x00) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))
        
    def motbbackwardTurn(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x01) + self.currentNegTurnSpeed() + chr(0x01) + chr(0x01) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    def motcbackwardTurn(self):
        return (chr(0x0C) + chr(0x00) + chr(0x80) + chr(0x04) + chr(0x02) + self.currentNegTurnSpeed() + chr(0x01) + chr(0x01) + chr(0x00) + chr(0x20) + chr(0x00) + chr(0x00) + chr(0x00) + chr(0x00))

    def turnRight(self, low_speed):
        if low_speed:
            self._tty.write(self.motbforwardTurn(self.currentTurnSpeedLow()))
        else:
            self._tty.write(self.motcbackwardTurn() + self.motbforwardTurn(self.currentTurnSpeed()))    
        
        self.forw = False
        self.back = False
        self.rightc = True
        self.leftc = False

    def turnLeft(self, low_speed):
        if low_speed:
            self._tty.write(self.motcforwardTurn(self.currentTurnSpeedLow()))
        else:
            self._tty.write(self.motbbackwardTurn() + self.motcforwardTurn(self.currentTurnSpeed()))    
        
        self.forw = False
        self.back = False
        self.rightc = False
        self.leftc = True
        
    def backward(self):
        self._tty.write(self.motbbackwardSTR() + self.motcbackwardSTR())
        self.forw = False
        self.back = True
        self.rightc = False
        self.leftc = False

    #This is a backwards command to be used with the arrow. If the robot is currently moving forward, the back button will
    #stop the robot. Otherwise, it will make it go backwards
    def backwardArrow(self):
        if self.forw:
            self.stop()
            self.forw = False
            self.backward()
        elif self.back:
            self.stop()
            self.back = False
        else:
            self.backward()

    #The reverse command from above
    def forwardArrow(self):
        if self.back:
            self.stop()
            self.back = False
            self.forward()
        elif self.forw:
            self.stop()
            self.forw = False
        else:
            self.forward()

    def leftArrow(self, low_speed):
        if self.leftc:
            self.stop()
            self.leftc = False
        elif self.rightc:
            self.stop()
            self.rightc = False
            self.turnLeft(low_speed)
        else:
            self.turnLeft(low_speed)


    def rightArrow(self, low_speed):
        if self.rightc:
            self.stop()
            self.rightc = False
        elif self.leftc:
            self.stop()
            self.leftc = False
            self.turnRight(low_speed)
        else:
            self.turnRight(low_speed)