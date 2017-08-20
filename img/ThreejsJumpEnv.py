"""
Allows users to select a window, define a reward, and connects to a learner
"""


import gym
from gym import spaces
from gym.utils import seeding
import numpy as np
import PIL.ImageGrab as PIG
import win32api as wp
import win32gui as wg
import win32con as wc
import time
import pytesseract


pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe'
tessdata_dir_config = '--tessdata-dir "C:\\Program Files (x86)\\Tesseract-OCR\\tessdata"'

## https://76.182.75.177:8000/LearningTask testing.

class ThreejsJumpEnv(gym.Env): ## let the user identify a Threejs window, and let them point to a number that we will interpret as the current score
    metadata = {
        'render.modes': ['human', 'rgb_array'],
        'video.frames_per_second' : 50
    }
    gravity    = 9.8 ## we usually want to do some math using on screen info, user input?
    fail       = 5 ## when do we reset the window?
    setupTime  = 5
    maxHeight  = 0 ## save max score?
    timePenalty = -1
    timeLimit  = 30
    keys = ['spacebar','a','w','s','d']
    
    VK_CODE = {'spacebar':0x20,
               'a':0x41,
               'd':0x44,
               's':0x53,
               'w':0x57,
               'F5':0x74}
    handle     =  None ## store the focused window
    rewardRect = None
        
        
    def __init__(self):
        self.getHandle()
        self.getRewardRect()
        self.startTime = time.time()
        

        # self.action_space = spaces.Discrete(9)
        
        ## .action_space.contains does not seem to work the way I think it does, fix it later
        self.action_space = spaces.Tuple((spaces.Discrete(6), ## the valid keystrokes
                                          spaces.Box(low=-500, high=500, shape=1))) ## a box representing mouse moves
        
        self.observation_space = 0 # size of users window?

        self._seed()
        self.state = None
        
        ## Dictionary code from: Chris chriskiehl

        
        
    def _seed(self, seed=None):
        self.np_random, seed = seeding.np_random(seed)
        return [seed]

    def _step(self, action):
        ## interpret learner actions, send them to the window,
        ## figure out the reward, return pic of game and reward,
        ## probably end state won't make sense with ongoing environments
        
        # assert self.action_space.contains(action), "%r (%s) invalid"%(action, type(action)) ## I don't get why int is invalid, so I refuse to check
        
        if (type(action) == int or type(action) == np.int64 or type(action) == np.int32  ):
            self.sendKey(self.keys[action]) ## take action
        elif(type(action) is tuple):
            self.mouseMove(action)
        else:
            print(type(action))
            print("Action confused Env. It hurt itself in it's confusion")
            self.sendKey(self.keys[action]) ## take action
            
        # state = self.state
        scoreImage = PIG.grab(self.rewardRect)
        ## include some image processing here?
        score = 0
        try:
            decodedScore = pytesseract.image_to_string(scoreImage)
            print(decodedScore)
            score = int(decodedScore) ## Your jump height should be numeric
        except ValueError:
            score = 0
            print("Failed to read score")
            
        if(self.maxHeight < score):
            self.maxHeight = score
        
        score += self.timePenalty
        
        if((time.time() - self.startTime) > self.timeLimit):
            done = 1 ## I could reset for you, but I won't
        else:
            done = 0
        
        if(done == 1):
            reward = self.maxHeight
        else:
            reward = score
        # return state, reward, done?, {}
        # granular rewards are good, point me in the direction of success,also , penalize inaction
        return self.screenGrab(), reward, done, {}

    def _reset(self):
        # wg.SetForegroundWindow(self.handle)
        # self.click(x,y)
        self.sendKey("F5")
        
        time.sleep(2)
        self.click(self.rewardRect[0]+50,self.rewardRect[1]+50)
        self.startTime = time.time()
        return 0

    def _render(self, mode='human', close=False):
        # Grab a screenshot of the game window? or should that data only come from observation?
        # Actually, the window is already rendered, just don't call this.
        # screenGrab(self).show() ## NVM
        return self.screenGrab()
        
    def getHandle(self):
        print("Select the game window, then wait " + str(self.setupTime) + " seconds")
        time.sleep(self.setupTime)
        self.handle = wg.GetForegroundWindow()
        print("Found window: " + wg.GetWindowText(self.handle))
        return(self.handle)
        
    def getRewardRect(self): # if you move the game window later, these coords are invalid, fix it?
        print("Place mouse cursor top left of where the score displays then wait " + str(self.setupTime) + " seconds")
        time.sleep(self.setupTime)
        topLeft = wg.GetCursorInfo()[2] #grabs cursor X, Y
        print("Saved top left, place cursor on bottom right of where score displays")
        time.sleep(self.setupTime)
        bottomRight = wg.GetCursorInfo()[2] 
        self.rewardRect = (topLeft[0], topLeft[1], bottomRight[0], bottomRight[1])
        print("Found Rect: " + ''.join([str(x) + "," for x in self.rewardRect]))
        return(self.rewardRect)
        
    def screenGrab(self):        
        return(PIG.grab(wg.GetWindowRect(self.handle)))
        
    def sendKey(self,i): ##include handle parameter to steal focus?
        ## wg.SetForegroundWindow(self.handle) ## ehhh, don't do this
        wp.keybd_event(self.VK_CODE[i], 0,0,0)
        time.sleep(.2)
        wp.keybd_event(self.VK_CODE[i],0 ,wc.KEYEVENTF_KEYUP ,0)
        
    def click(self,x,y):
        wp.SetCursorPos((x,y))
        wp.mouse_event(wc.MOUSEEVENTF_LEFTDOWN,x,y,0,0)
        time.sleep(.05)
        wp.mouse_event(wc.MOUSEEVENTF_LEFTUP,x,y,0,0)
        
        
    def mouseMove(self,coords): ## smooth move?
        parts = 50
        dx = coords[0]/parts
        dy = -1*coords[1]/parts ## windows considers the top left to be 0,0, so flip the y
        for i in range(0,parts):
            sX, sY = wg.GetCursorPos()
            wp.SetCursorPos((int(sX+dx),int(sY+dy)))
            time.sleep(0.01)






