import time, datetime, os, psutil, csv, json, webhook, statistics
from datetime import datetime as dt
from w1thermsensor import W1ThermSensor
import RPi.GPIO as io
# import webhook - Maybe use requests instead
global crash

# File/File paths
logFilePath = "/home/fish/static/data/logs/"
crashFilePath = "/home/fish/static/data/crashLogs/"
logFilesRow = ["pondLevel","nexusInnerLevel","nexusOuterLevel","tubLevel","waterTemp","waterState","cpuTemp","cpuFreq","storageUsed","time"]
configPath = "/home/fish/static/data/config.json"
# - - - - - - - 

# Config data
configFile = open(configPath)
configData = json.load(configFile)
# - - - - - - - 

# Variables setup
deviceData = []
data = []
threeCheckValue = 'Ok' # 'Ok', 'Low, 'High'
waterState = 'Off' # 'Off', 'Filling', 'Draining'
nexusPump = True
tubPump = True
pumpTimeData = [0, 0]
update = False # Used for webhook
crash = [False, None, None]
pondStateArray = [False, "", False, "", False, "", False, "", False, "", "", False, "", False] # [pondLevelState, Message, innerLevelState, Message, outerLevelState, Message, tubLevelState, Message, pondTemp, Message, waterLevel ('Low', 'Ok', 'High'), Cleaning, endtime, ofp (overflow protection)]
pondStateTime = [0,0,0,0,0]
running = True
alerted = False
cleaning = False
ofp = False
cleaningEndTime = 0
# - - - - - - - 

# Pin setup
refillRelay = 21
innerAirRelay = 0 # Find one
OuterAirRelat = 0 # Find one
emptyRelay = 20 # Motor 1
nexusRelay = 25
tubRelay = 26
waterTemp = 4

pondTrig = 6
tubTrig = 2
nInnerTrig = 23
nOuterTrig = 27

pondEcho = 5
tubEcho = 3
nInnerEcho = 17
nOuterEcho = 22
# - - - - - - - 

# Sensors setup
io.setwarnings(False) 
io.setmode(io.BCM)
io.setup(refillRelay, io.OUT)
io.setup(emptyRelay, io.OUT)
io.setup(pondTrig, io.OUT)
io.setup(nInnerTrig, io.OUT)
io.setup(nOuterTrig, io.OUT)
io.setup(tubTrig, io.OUT)
io.setup(nexusRelay, io.OUT)
io.setup(tubRelay, io.OUT)

io.setup(pondEcho, io.IN)
io.setup(nInnerEcho, io.IN)
io.setup(nOuterEcho, io.IN)
io.setup(tubEcho, io.IN)
# - - - - - - - 


def pondLevel() -> int:
    global pondTrig
    global pondEcho
    distanceFromBottom = configData['sensorData']['pond']['DFB']
    runs = configData['sensorData']['pond']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(pondTrig, True)
        time.sleep(0.00001)
        io.output(pondTrig, False)

        while io.input(pondEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(pondEcho) == 1:
            stop_time = time.time()
        
        elapsed_time = stop_time - start_time
        distance_cm = elapsed_time * 34300 / 2
        array.append(distance_cm)
        x+=1
        time.sleep(0.02)
    
    try:
        # calculate the mode
        mode = statistics.mode(array)
        waterHeight = distanceFromBottom - mode

    except statistics.StatisticsError as e:
        # handle the StatisticsError exception
        waterHeight = distanceFromBottom - distance_cm

    return round(waterHeight)

def nexusInnerLevel() -> int:
    global nInnerTrig
    global nInnerEcho

    distanceFromBottom = configData['sensorData']['nexusInnerLevel']['DFB']
    runs = configData['sensorData']['nexusInnerLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(nInnerTrig, True)
        time.sleep(0.00001)
        io.output(nInnerTrig, False)

        while io.input(nInnerEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(nInnerEcho) == 1:
            stop_time = time.time()
        
        elapsed_time = stop_time - start_time
        distance_cm = elapsed_time * 34300 / 2
        array.append(distance_cm)
        x+=1
        time.sleep(0.02)
    
    try:
        # calculate the mode
        mode = statistics.mode(array)
        waterHeight = distanceFromBottom - mode

    except statistics.StatisticsError as e:
        # handle the StatisticsError exception
        waterHeight = distanceFromBottom - distance_cm

    return round(waterHeight)

def nexusOuterLevel() -> int:
    global nOuterTrig
    global nOuterEcho

    distanceFromBottom = configData['sensorData']['nexusOuterLevel']['DFB']
    runs = configData['sensorData']['nexusOuterLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(nOuterTrig, True)
        time.sleep(0.00001)
        io.output(nOuterTrig, False)

        while io.input(nOuterEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(nOuterEcho) == 1:
            stop_time = time.time()
        
        elapsed_time = stop_time - start_time
        distance_cm = elapsed_time * 34300 / 2
        array.append(distance_cm)
        x+=1
        time.sleep(0.02)
    
    try:
        # calculate the mode
        mode = statistics.mode(array)
        waterHeight = distanceFromBottom - mode

    except statistics.StatisticsError as e:
        # handle the StatisticsError exception
        waterHeight = distanceFromBottom - distance_cm

    return round(waterHeight)

def tubLevel() -> int:
    global tubTrig
    global tubEcho

    distanceFromBottom = configData['sensorData']['tubLevel']['DFB']
    runs = configData['sensorData']['tubLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(tubTrig, True)
        time.sleep(0.00001)
        io.output(tubTrig, False)

        while io.input(tubEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(tubEcho) == 1:
            stop_time = time.time()
        
        elapsed_time = stop_time - start_time
        distance_cm = elapsed_time * 34300 / 2
        array.append(distance_cm)
        x+=1
        time.sleep(0.02)
    
    try:
        # calculate the mode
        mode = statistics.mode(array)
        waterHeight = distanceFromBottom - mode

    except statistics.StatisticsError as e:
        # handle the StatisticsError exception
        waterHeight = distanceFromBottom - distance_cm

    return round(waterHeight)

def water(state : bool): # on/off the refill system
    global refillRelay
    global waterState

    if waterState != "Draining":
        if state:
            #Turn water on
            waterState = 'Filling'
            io.output(refillRelay, io.HIGH)
        else:
            #Turn water off
            io.output(refillRelay, io.LOW)
    else: return "Invalid operation - System is currently draining"

def empty(state : bool): # on/off the empty system
    global emptyRelay
    global waterState

    if waterState != "Filling":
        if state:
            #Turn water on
            waterState = 'Draining'
            io.output(emptyRelay, io.HIGH)
        else:
            #Turn water off
            io.output(emptyRelay, io.LOW)
    else: return "Invalid operation - System is currently filling"

def pump(pumpNo : int, state : bool): # on/off specific pump
    global nexusPump
    global tubPump

    if pumpNo == 1:
        if state:
            #Turn nexus pump on
            nexusPump = True
            io.output(nexusRelay, io.LOW)
        else:
            #Turn nexus pump off
            nexusPump = False
            io.output(nexusRelay, io.HIGH)
    elif pumpNo == 2:
        if state:
            #Turn tub pump on
            tubPump = True
            io.output(tubRelay, io.LOW)
        else:
            #Turn tub pump off
            tubPump = False
            io.output(tubRelay, io.HIGH)

def getDeviceData(): # Device data
    global deviceData
    global fanSpeed

    freq = psutil.cpu_freq()
    disk = psutil.disk_usage('/')

    cpuTemp = round(psutil.sensors_temperatures()['cpu_thermal'][0].current, 2)

    cpuFreq = round(freq.current, 2)

    usedDisk = round(disk.used / (1024*1024*1024), 2) #GB
    
    deviceData = [cpuTemp,cpuFreq,usedDisk]

def getData(): # Sensor data
    global data
    global update
    global threeCheckValue
    global lastPondLevel
    global lastInnerLevel
    global lastOuterLevel
    global lastTubLevel

    sensor = W1ThermSensor()

    try:
        pondL = pondLevel()
    except: pondL = -1
    try:
        innerL = nexusInnerLevel()
    except: innerL = -1
    try:
        outerL = nexusOuterLevel()
    except: outerL = -1
    try:
        tubL = tubLevel()
    except: tubL = -1
    
    try:
        waterTemp = round(sensor.get_temperature(), 2)
    except: waterTemp = 0

    if pondL <= -1:
        try:pondL = lastPondLevel
        except:pass
    else:lastPondLevel = pondL

    if innerL <= -1:
        try:innerL = lastInnerLevel
        except:pass
    else:lastInnerLevel = innerL

    if outerL <= -1:
        try:outerL = lastOuterLevel
        except:pass
    else:lastOuterLevel = outerL

    if tubL <= -1:
        try:tubL = lastTubLevel
        except:pass
    else:lastTubLevel = tubL

    data = [pondL, innerL, outerL, tubL, waterTemp, threeCheckValue]

def log(data : list): # Used to save/log data
    global crash

    dataToSave = []

    pondLevel = data[0][5] #This is the Low/Ok/High

    if pondLevel == 'Ok':
        data[0][5] = 0
    elif pondLevel == 'High':
        data[0][5] = 1
    else:
        data[0][5] = -1

    for x in data:
        for i in x:
            dataToSave.append(i)

    formatted_date = current_time.strftime("%Y-%m-%d")
    formatted_time = current_time.strftime("%H:%M:%S")
    dataToSave.append(formatted_time)

    filename = logFilePath+formatted_date+".csv"

    try:
        if not os.path.exists(filename):
            row = logFilesRow
            with open(filename, 'w', newline='') as file:
                writer = csv.writer(file)
                writer.writerow(row)

        # data.append(formatted_time)
        with open(filename, 'a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(dataToSave)
    except Exception as e:
        crash = [True, "logging | " +str(e), time.time()]

def systemState() -> list: # return layout - [Status, Running, Crashed, Error]
    global crash

    if crash[0] != True:
        try:
            global running
            return ([200, running, False])
        except Exception as e:
            return([500, None, True, str(e)])
    else:
        return ([200, False, crash[0], crash[1]])

def pondStatus() -> list: # Use to keep track of pond alerts
    global pondStateArray

    return pondStateArray

def currentData() -> list: # Displays current data on webpage
    global allData
    global waterState
    global nexusPump
    global tubPump


    dataToShare = [waterState, nexusPump, tubPump]

    for x in allData:
        for i in x:
            dataToShare.append(i)
    
    currentTime = datetime.datetime.now().strftime("%H:%M")

    dataToShare.append(currentTime)

    return dataToShare

def pondState(allData : list): # Controls pond systems
    global pondStateArray
    global pondStateTime
    global threeCheckValue
    global alerted
    global cleaning
    global cleaningEndTime
    global ofp

    waterData = allData[0]
    alert = False

    # pondStateArray = [pondLevelState, Message, innerLevelState, Message, outerLevelState, Message, tubLevelState, Message, pondTemp, Message, waterLevel ('Low', 'Ok', 'High'), Cleaning, endtime, ofp (overflow protection)]

    # levels = [high, low]
    pondLevels = [configData['waterLevels']['pond']['high'], configData['waterLevels']['pond']['low']] 
    nInnerLevels = [configData['waterLevels']['nexusInner']['high'], configData['waterLevels']['nexusInner']['low']]
    nOuterLevels = [configData['waterLevels']['nexusOuter']['high'], configData['waterLevels']['nexusOuter']['low']]
    tubLevels = [configData['waterLevels']['tub']['high'], configData['waterLevels']['tub']['low']]

    pondWarningTime = configData['warningTimes']['pond']
    nInnerWarningTime = configData['warningTimes']['nexusInner']
    nOuterWarningTime = configData['warningTimes']['nexusOuter']
    tubWarningTime = configData['warningTimes']['tub']

    pondLevel = waterData[0]
    innerLevel = waterData[1]
    outerLevel = waterData[2]
    tubLevel = waterData[3]
    waterTemp = waterData[4] # Temp alerts not in use

    endTimeDatetime = dt.fromtimestamp(cleaningEndTime)
    cleaningEndTimeStr = endTimeDatetime.strftime('%H:%M')
    
    pondStateArray[11] = cleaning
    pondStateArray[12] = cleaningEndTimeStr
    pondStateArray[13] = ofp


    threeCheckValue = threeCheck(pondLevel, innerLevel, tubLevel)

    if threeCheckValue != 'Ok':
        if pondStateTime[4] == 0:
            pondStateTime[4] = time.time()
        if time.time() >= pondStateTime[4] + 180:
            pondStateArray[10] = threeCheckValue
    else:
        pondStateTime[4] = 0
        pondStateArray[10] = threeCheckValue

    # - - -
    if pondLevel > pondLevels[0]:
        if pondStateTime[0] == 0:
            pondStateTime[0] = time.time()
        if time.time() >= pondStateTime[0] + pondWarningTime:
            pondStateArray[0] = True
            pondStateArray[1] = "over"
            alert = True

    elif pondLevel < pondLevels[1]:
        if pondStateTime[0] == 0:
            pondStateTime[0] = time.time()
        if time.time() >= pondStateTime[0] + pondWarningTime:
            pondStateArray[0] = True
            pondStateArray[1] = "under"
            alert = True
    else:
        pondStateArray[0] = False
        pondStateArray[1] = ""
        pondStateTime[0] = 0

    # - - -
    if innerLevel > nInnerLevels[0]:
        if pondStateTime[1] == 0:
            pondStateTime[1] = time.time()
        if time.time() >= pondStateTime[1] + nInnerWarningTime:
            pondStateArray[2] = True
            pondStateArray[3] = "over"
            alert = True

    elif innerLevel < nInnerLevels[1]:
        if pondStateTime[1] == 0:
            pondStateTime[1] = time.time()
        if time.time() >= pondStateTime[1] + nInnerWarningTime:
            pondStateArray[2] = True
            pondStateArray[3] = "under"
            alert = True
    else:
        pondStateArray[2] = False
        pondStateArray[3] = ""
        pondStateTime[1] = 0
    # - - -
    if outerLevel > nOuterLevels[0]:
        if pondStateTime[2] == 0:
            pondStateTime[2] = time.time()
        if time.time() >= pondStateTime[2] + nOuterWarningTime:
            pondStateArray[4] = True
            pondStateArray[5] = "over"
            alert = True

    elif outerLevel < nOuterLevels[1]:
        if pondStateTime[2] == 0:
            pondStateTime[2] = time.time()
        if time.time() >= pondStateTime[2] + nOuterWarningTime:
            pondStateArray[4] = True
            pondStateArray[5] = "under"
            alert = True
    else:
        pondStateArray[4] = False
        pondStateArray[5] = ""
        pondStateTime[2] = 0
    # - - -
    if tubLevel > tubLevels[0]:
        if pondStateTime[3] == 0:
            pondStateTime[3] = time.time()
        if time.time() >= pondStateTime[3] + tubWarningTime:
            pondStateArray[6] = True
            pondStateArray[7] = "over"
            alert = True

    elif tubLevel < tubLevels[1]:
        if pondStateTime[3] == 0:
            pondStateTime[3] = time.time()
        if time.time() >= pondStateTime[3] + tubWarningTime:
            pondStateArray[6] = True
            pondStateArray[7] = "under"
            alert = True
    else:
        pondStateArray[6] = False
        pondStateArray[7] = ""
        pondStateTime[3] = 0
    
    if alert and alerted == False and cleaning == False:
        keys = configData['devices']['keys']
        response = webhook.send("pondAlert", keys)
        if response == 200:
            alerted = True
    if alert == False:
        alerted = False

def pumpControl(allData : list):
    global pumpTimeData
    global cleaning

    nexusValues = configData['pumpControl']['nexusValues']
    tubValues = configData['pumpControl']['tubValues']

    waterData = allData[0]

    outerLevel = waterData[2]
    tubLevel = waterData[3]

    if not cleaning:
        if outerLevel <= nexusValues['off']:
            pumpTimeData[0] = time.time()
            pump(1, False)
        elif outerLevel >= nexusValues['on'] and time.time()+nexusValues['delay'] > pumpTimeData[0]:
            pump(1, True)
    
    if tubLevel <= tubValues['off']:
        pumpTimeData[1] = time.time()
        pump(2, False)
    elif tubLevel >= tubValues['on'] and time.time()+tubValues['delay'] > pumpTimeData[1]:
        pump(2, True) 

def waterControl():
    global threeCheckValue

    if threeCheckValue == 'Low':
        water(True)
    else:
        water(False)
    
def threeCheck(pond: int, nexus: int, tub: int) -> str: # Returns the current level of the pond (Using 3 water sensors). retruns - 'Low', 'Ok' or 'High'
    global configData
    # This should use the pond sensor, nexus inner senor and the tub sensor

    values = [0,0,0]

    # levels = [high, low]
    pondLevels = [configData['waterLevels']['3Check']['pond']['high'], configData['waterLevels']['3Check']['pond']['low']] 
    nexusLevels = [configData['waterLevels']['3Check']['nexus']['high'], configData['waterLevels']['3Check']['nexus']['low']]
    tubLevels = [configData['waterLevels']['3Check']['tub']['high'], configData['waterLevels']['3Check']['tub']['low']]

    # - - -
    if pond >= pondLevels[0]:
        values[0] = 1
    elif pond <= pondLevels[1]:
        values[0] = -1
    # - - -
    if nexus >= nexusLevels[0]:
        values[1] = 1
    elif nexus <= nexusLevels[1]:
        values[1] = -1
    # - - -
    if tub >= tubLevels[0]:
        values[2] = 1
    elif tub <= tubLevels[1]:
        values[2] = -1

    values.sort()

    if values[1] == 0: return 'Ok'
    elif values[1] == 1: return 'High'
    elif values[1] == -1: return 'Low'
    else: return 'Error'

def cleanMode(allData : list): # Automatic cleaning
    global cleaning
    global cleaningEndTime
    global ofp

    waterData = allData[0]
    outerLevel = waterData[2]

    nexusOuterMax = configData['waterLevels']['nexusOuter']['high']
    nexusInnerMax = configData['waterLevels']['nexusInner']['high']

    waterData = allData[0]

    innerLevel = waterData[1]
    outerLevel = waterData[2]

    current_time = datetime.datetime.now()

    day_of_week = current_time.strftime("%A")
    timeObj = current_time.strftime("%H:%M")

    schedule = configData['cleaning']['schedule']
    timeStr = configData['cleaning']['time']
    duration = configData['cleaning']['duration']
    levelBounce = configData['cleaning']['levelBounce']

    if outerLevel > nexusOuterMax or innerLevel > nexusInnerMax:
        ofp = True # overflow Protection
    elif schedule[day_of_week] == 'true'  and cleaning == False:
        if str(timeObj) == timeStr:
            cleaning = True
            if time.time() > cleaningEndTime:
                cleaningEndTime = time.time() + (duration * 60)

    elif time.time() > cleaningEndTime and cleaning == True:
        cleaning = False

    if ofp: # Reset ofp
        if outerLevel < nexusOuterMax-levelBounce and innerLevel < nexusInnerMax-levelBounce:
            ofp = False

    if cleaning:
        # This will hold auto drainage and air system
        # For now it will slow the water flow and allow dirt
        # to settle on the floor
        if not ofp:
            pump(1, False)
        else: pump(1, True)



def getConfig() -> object:
    global configData

    return configData

def updateJson(data : list) -> list:
    global configPath

    try:
        # Load the existing JSON data from the file
        with open(configPath, "r") as infile:
            config = json.load(infile)
        
        config['waterLevels']['pond']['high'] = int(data[0])
        config['waterLevels']['pond']['low'] = int(data[1])
        config['warningTimes']['pond'] = int(data[2])

        config['waterLevels']['nexusInner']['high'] = int(data[3])
        config['waterLevels']['nexusInner']['low'] = int(data[4])
        config['warningTimes']['nexusInner'] = int(data[5])

        config['waterLevels']['nexusOuter']['high'] = int(data[6])
        config['waterLevels']['nexusOuter']['low'] = int(data[7])
        config['warningTimes']['nexusOuter'] = int(data[8])

        config['waterLevels']['tub']['high'] = int(data[9])
        config['waterLevels']['tub']['low'] = int(data[10])
        config['warningTimes']['tub'] = int(data[11])

        config['sensorData']['pond']['DFB'] = int(data[12])
        config['sensorData']['pond']['runs'] = int(data[13])

        config['sensorData']['nexusInnerLevel']['DFB'] = int(data[14])
        config['sensorData']['nexusInnerLevel']['runs'] = int(data[15])

        config['sensorData']['nexusOuterLevel']['DFB'] = int(data[16])
        config['sensorData']['nexusOuterLevel']['runs'] = int(data[17])

        config['sensorData']['tubLevel']['DFB'] = int(data[18])
        config['sensorData']['tubLevel']['runs'] = int(data[19])

        config['pumpControl']['nexusValues']['off'] = int(data[20])
        config['pumpControl']['nexusValues']['on'] = int(data[21])
        config['pumpControl']['nexusValues']['delay'] = int(data[22])

        config['pumpControl']['tubValues']['off'] = int(data[23])
        config['pumpControl']['tubValues']['on'] = int(data[24])
        config['pumpControl']['tubValues']['delay'] = int(data[25])

        config['waterLevels']['3Check']['pond']['high'] = int(data[26])
        config['waterLevels']['3Check']['pond']['low'] = int(data[27])

        config['waterLevels']['3Check']['nexus']['high'] = int(data[28])
        config['waterLevels']['3Check']['nexus']['low'] = int(data[29])

        config['waterLevels']['3Check']['tub']['high'] = int(data[30])
        config['waterLevels']['3Check']['tub']['low'] = int(data[31])
        
        config['cleaning']['schedule']['Monday'] = str(data[32]).lower()
        config['cleaning']['schedule']['Tuesday'] = str(data[33]).lower()
        config['cleaning']['schedule']['Wednesday'] = str(data[34]).lower()
        config['cleaning']['schedule']['Thursday'] = str(data[35]).lower()
        config['cleaning']['schedule']['Friday'] = str(data[36]).lower()
        config['cleaning']['schedule']['Saturday'] = str(data[37]).lower()
        config['cleaning']['schedule']['Sunday'] = str(data[38]).lower()

        config['cleaning']['time'] = data[39]
        config['cleaning']['duration'] = int(data[40])
        config['cleaning']['levelBounce'] = int(data[41])


    

        # Write the modified object back to the JSON file
        with open(configPath, "w") as outfile:
            json.dump(config, outfile, indent=4)
    except Exception as e:
        return [500, str(e)]
    
    return [200, "None"]

def logCrash(crashData : list): #Changed this to save actual time not time in long format
    filename = crashFilePath+"crash.txt"

    crash_time = crashData[2]

    formatted_date = current_time.strftime("%Y-%m-%d")
    formatted_time = crash_time.strftime("%H:%M:%S")

    crashData[2] = formatted_time

    with open(filename, 'a') as file:
        file.write(str(crashData)+" | " + str(formatted_date) + "\n")

    
def start(): 
    global configFile
    global configData
    global current_time
    global crash
    global allData

    while running:
        if crash[0]:
            logCrash(crash)

        try: 
            if time.time() >= crash[2] + 30: crash = [False, None, None]
        except: pass

        try:
            configFile = open(configPath)
            configData = json.load(configFile)
        except Exception as e:
            crash = [True, "config | " +str(e), time.time()]

        # Trigger the water system
        current_time = datetime.datetime.now()
        try:
            getDeviceData()
        except Exception as e:
            crash = [True, "getDeviceData() | " +str(e), time.time()]
        try:
            getData()
        except Exception as e:
            crash = [True, "getData() | " + str(e), time.time()]
        
        allData = [data,deviceData]

        log(allData)

        try:
            pondState(allData)
        except Exception as e:
            crash = [True, "pondState() | " + str(e), time.time()]

        try:
            pumpControl(allData)
        except Exception as e:
            crash = [True, "pumpControl() | " + str(e), time.time()]
        try:
            waterControl()
        except Exception as e:
            crash = [True, "waterControl() | " + str(e), time.time()]

        try: 
            cleanMode(allData)
        except Exception as e:
            crash = [True, "cleanMode() | " + str(e), time.time()]

        time.sleep(configData['updateFreq']['time'])