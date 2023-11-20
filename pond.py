import time, datetime, os, psutil, csv, json, webhook, statistics
from datetime import datetime as dt
from w1thermsensor import W1ThermSensor
import RPi.GPIO as io
# import webhook - Maybe use requests instead

class pc:
    # File/File paths
    logFilePath = "/home/fish/static/data/logs/"
    crashFilePath = "/home/fish/static/data/crashLogs/"
    logFilesRow = ["pondLevel","nexusInnerLevel","nexusOuterLevel","tubLevel","waterTemp","waterState","cpuTemp","cpuFreq","storageUsed","time"]
    configPath = "/home/fish/static/data/config.json"
    # - - - - - - - 

    # Variables setup
    allData = []
    deviceData = []
    data = []
    levelCheckValue = 'Ok' # 'Ok', 'Low, 'High'
    waterState = 'Off' # 'Off', 'Filling', 'Draining'
    nexusPump = True
    tubPump = True
    pumpTimeData = [0, 0]
    update = False # Used for webhook
    crash = [False, None, None]
    pondStateArray = [False, "", False, "", False, "", False, "", False, "", "Ok", False, "", False] # [pondLevelState, Message, innerLevelState, Message, outerLevelState, Message, tubLevelState, Message, pondTemp, Message, waterLevel ('Low', 'Ok', 'High'), Cleaning, endtime, ofp (overflow protection)]
    pondStateTime = [0,0,0,0,0]
    alerted = False
    crashAlerted = False
    cleaning = False
    ofp = False
    cleaningEndTime = 0
    # - - - - - - - 

    # Last check values
    lastCrashTime = 0
    lastPondLevel = 0
    lastInnerLevel = 0
    lastOuterLevel = 0
    lastTubLevel = 0
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


def pondLevel(configData) -> int:
    distanceFromBottom = configData['sensorData']['pond']['DFB']
    runs = configData['sensorData']['pond']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(pc.pondTrig, True)
        time.sleep(0.00001)
        io.output(pc.pondTrig, False)

        while io.input(pc.pondEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(pc.pondEcho) == 1:
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

def nexusInnerLevel(configData) -> int:
    distanceFromBottom = configData['sensorData']['nexusInnerLevel']['DFB']
    runs = configData['sensorData']['nexusInnerLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(pc.nInnerTrig, True)
        time.sleep(0.00001)
        io.output(pc.nInnerTrig, False)

        while io.input(pc.nInnerEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(pc.nInnerEcho) == 1:
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

def nexusOuterLevel(configData) -> int:
    distanceFromBottom = configData['sensorData']['nexusOuterLevel']['DFB']
    runs = configData['sensorData']['nexusOuterLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(pc.nOuterTrig, True)
        time.sleep(0.00001)
        io.output(pc.nOuterTrig, False)

        while io.input(pc.nOuterEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(pc.nOuterEcho) == 1:
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

def tubLevel(configData) -> int:
    distanceFromBottom = configData['sensorData']['tubLevel']['DFB']
    runs = configData['sensorData']['tubLevel']['runs']
    array = []
    x = 0

    while x<runs:
        run = time.time()
        failed = False

        io.output(pc.tubTrig, True)
        time.sleep(0.00001)
        io.output(pc.tubTrig, False)

        while io.input(pc.tubEcho) == 0 and failed == False:
            start_time = time.time()

            if time.time() >= run+2:
                failed = True
        
        if failed: return -1

        while io.input(pc.tubEcho) == 1:
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

    if pc.waterState != "Draining":
        if state:
            #Turn water on
            pc.waterState = 'Filling'
            io.output(pc.refillRelay, io.HIGH)
        else:
            #Turn water off
            pc.waterState = 'Off'
            io.output(pc.refillRelay, io.LOW)
    else: return "Invalid operation - System is currently draining"

def empty(state : bool): # on/off the empty system

    if pc.waterState != "Filling":
        if state:
            #Turn water on
            pc.waterState = 'Draining'
            io.output(pc.emptyRelay, io.HIGH)
        else:
            #Turn water off
            pc.waterState = 'Off'
            io.output(pc.emptyRelay, io.LOW)
    else: return "Invalid operation - System is currently filling"

def pump(pumpNo : int, state : bool): # on/off specific pump

    if pumpNo == 1:
        if state:
            #Turn nexus pump on
            pc.nexusPump = True
            io.output(pc.nexusRelay, io.LOW)
        else:
            #Turn nexus pump off
            pc.nexusPump = False
            io.output(pc.nexusRelay, io.HIGH)
    elif pumpNo == 2:
        if state:
            #Turn tub pump on
            pc.tubPump = True
            io.output(pc.tubRelay, io.LOW)
        else:
            #Turn tub pump off
            pc.tubPump = False
            io.output(pc.tubRelay, io.HIGH)

def getDeviceData(): # Device data

    freq = psutil.cpu_freq()
    disk = psutil.disk_usage('/')

    cpuTemp = round(psutil.sensors_temperatures()['cpu_thermal'][0].current, 2)

    cpuFreq = round(freq.current, 2)

    usedDisk = round(disk.used / (1024*1024*1024), 2) #GB
    
    return [cpuTemp,cpuFreq,usedDisk]

def getData(configData, levelCheckValue, lastPondLevel : int, lastInnerLevel : int, lastOuterLevel : int, lastTubLevel : int): # Sensor data

    sensor = W1ThermSensor()

    try:
        pondL = pondLevel(configData)
    except: pondL = -1
    try:
        innerL = nexusInnerLevel(configData)
    except: innerL = -1
    try:
        outerL = nexusOuterLevel(configData)
    except: outerL = -1
    try:
        tubL = tubLevel(configData)
    except: tubL = -1
    
    try:
        waterTemp = round(sensor.get_temperature(), 2)
    except: waterTemp = 0

    if pondL <= -1:
        try:pondL = pc.lastPondLevel
        except:pass
    else:pc.lastPondLevel = pondL

    if innerL <= -1:
        try:innerL = pc.lastInnerLevel
        except:pass
    else:pc.lastInnerLevel = innerL

    if outerL <= -1:
        try:outerL = pc.lastOuterLevel
        except:pass
    else:pc.lastOuterLevel = outerL

    if tubL <= -1:
        try:tubL = pc.lastTubLevel
        except:pass
    else:pc.lastTubLevel = tubL

    return [pondL, innerL, outerL, tubL, waterTemp, levelCheckValue]

def log(data : list, logFilePath : str, logFilesRow : list, current_time : float) : # Used to save/log data

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


    if not os.path.exists(filename):
        row = logFilesRow
        with open(filename, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(row)

    # data.append(formatted_time)
    with open(filename, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(dataToSave)

def systemState() -> list: # return layout - [Status, Running, Crashed, Error]

    if pc.crash[0] != True:
        try:
            return ([200, True, False])
        except Exception as e:
            return([500, None, True, str(e)])
    else:
        return ([200, False, pc.crash[0], pc.crash[1]])

def pondStatus() -> list: # Use to keep track of pond alerts
    return pc.pondStateArray

def currentData() -> list: # Displays current data on webpage

    dataToShare = [pc.waterState, pc.nexusPump, pc.tubPump]

    for x in pc.allData:
        for i in x:
            dataToShare.append(i)
    
    currentTime = datetime.datetime.now().strftime("%H:%M")

    dataToShare.append(currentTime)

    return dataToShare

def pondState(configData, allData : list): # Controls pond systems

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

    endTimeDatetime = dt.fromtimestamp(pc.cleaningEndTime)
    cleaningEndTimeStr = endTimeDatetime.strftime('%H:%M')
    
    pc.pondStateArray[11] = pc.cleaning
    pc.pondStateArray[12] = cleaningEndTimeStr
    pc.pondStateArray[13] = pc.ofp

    raw_levelCheckValue = levelCheck(configData, pondLevel)
    if raw_levelCheckValue != None:
        pc.levelCheckValue = raw_levelCheckValue
        pc.pondStateArray[10] = pc.levelCheckValue

    # - - -
    if pondLevel > pondLevels[0]:
        if pc.pondStateTime[0] == 0:
            pc.pondStateTime[0] = time.time()
        if time.time() >= pc.pondStateTime[0] + pondWarningTime:
            pc.pondStateArray[0] = True
            pc.pondStateArray[1] = "over"
            alert = True

    elif pondLevel < pondLevels[1]:
        if pc.pondStateTime[0] == 0:
            pc.pondStateTime[0] = time.time()
        if time.time() >= pc.pondStateTime[0] + pondWarningTime:
            pc.pondStateArray[0] = True
            pc.pondStateArray[1] = "under"
            alert = True
    else:
        pc.pondStateArray[0] = False
        pc.pondStateArray[1] = ""
        pc.pondStateTime[0] = 0

    # - - -
    if innerLevel > nInnerLevels[0]:
        if pc.pondStateTime[1] == 0:
            pc.pondStateTime[1] = time.time()
        if time.time() >= pc.pondStateTime[1] + nInnerWarningTime:
            pc.pondStateArray[2] = True
            pc.pondStateArray[3] = "over"
            alert = True

    elif innerLevel < nInnerLevels[1]:
        if pc.pondStateTime[1] == 0:
            pc.pondStateTime[1] = time.time()
        if time.time() >= pc.pondStateTime[1] + nInnerWarningTime:
            pc.pondStateArray[2] = True
            pc.pondStateArray[3] = "under"
            alert = True
    else:
        pc.pondStateArray[2] = False
        pc.pondStateArray[3] = ""
        pc.pondStateTime[1] = 0
    # - - -
    if outerLevel > nOuterLevels[0]:
        if pc.pondStateTime[2] == 0:
            pc.pondStateTime[2] = time.time()
        if time.time() >= pc.pondStateTime[2] + nOuterWarningTime:
            pc.pondStateArray[4] = True
            pc.pondStateArray[5] = "over"
            alert = True

    elif outerLevel < nOuterLevels[1]:
        if pc.pondStateTime[2] == 0:
            pc.pondStateTime[2] = time.time()
        if time.time() >= pc.pondStateTime[2] + nOuterWarningTime:
            pc.pondStateArray[4] = True
            pc.pondStateArray[5] = "under"
            alert = True
    else:
        pc.pondStateArray[4] = False
        pc.pondStateArray[5] = ""
        pc.pondStateTime[2] = 0
    # - - -
    if tubLevel > tubLevels[0]:
        if pc.pondStateTime[3] == 0:
            pc.pondStateTime[3] = time.time()
        if time.time() >= pc.pondStateTime[3] + tubWarningTime:
            pc.pondStateArray[6] = True
            pc.pondStateArray[7] = "over"
            alert = True

    elif tubLevel < tubLevels[1]:
        if pc.pondStateTime[3] == 0:
            pc.pondStateTime[3] = time.time()
        if time.time() >= pc.pondStateTime[3] + tubWarningTime:
            pc.pondStateArray[6] = True
            pc.pondStateArray[7] = "under"
            alert = True
    else:
        pc.pondStateArray[6] = False
        pc.pondStateArray[7] = ""
        pc.pondStateTime[3] = 0
    
    if alert and pc.alerted == False and pc.cleaning == False:
        server = configData['webhook']['server']
        key = configData['webhook']['keys']['alert']
        response = webhook.send(server, key)
        if response == 200:
            pc.alerted = True
    if alert == False:
        pc.alerted = False

def pumpControl(configData, allData : list):

    nexusValues = configData['pumpControl']['nexusValues']
    tubValues = configData['pumpControl']['tubValues']

    waterData = allData[0]

    outerLevel = waterData[2]
    tubLevel = waterData[3]

    if not pc.cleaning:
        if outerLevel <= nexusValues['off']:
            pc.pumpTimeData[0] = time.time()
            pump(1, False)
        elif outerLevel >= nexusValues['on'] and time.time()+nexusValues['delay'] > pc.pumpTimeData[0]:
            pump(1, True)
    
    if tubLevel <= tubValues['off']:
        pc.pumpTimeData[1] = time.time()
        pump(2, False)
    elif tubLevel >= tubValues['on'] and time.time()+tubValues['delay'] > pc.pumpTimeData[1]:
        pump(2, True) 
 
def levelCheck(configData, pond: int) -> str: # Returns the current level of the pond. retruns - 'Low', 'Ok' or 'High'

    # levels = [high, low]
    pondLevels = [configData['waterLevels']['levelCheck']['pond']['high'], configData['waterLevels']['levelCheck']['pond']['low'], configData['waterLevels']['levelCheck']['pond']['ok']] 
    
    if not configData['waterLevels']['levelCheck']['refill']:
        water(False)
    
    if pond < 0:
        water(False)
        return 'Low'

    # - - -
    if pond > pondLevels[0]:
        water(False)
        return 'High'
    elif pond < pondLevels[1]:
        if configData['waterLevels']['levelCheck']['refill']:
            water(True)
        return 'Low'
    elif pond >= pondLevels[2]:
        water(False)
        return 'Ok'
    
    if pc.pondStateArray[10] == "High":
        return "Ok"
    
    return None

def cleanMode(configData, allData : list): # Automatic cleaning

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

    if outerLevel > nexusOuterMax or innerLevel > nexusInnerMax and pc.cleaning:
        pc.ofp = True # overflow Protection
    elif schedule[day_of_week] == 'true' and not pc.cleaning:
        if str(timeObj) == timeStr:
            pc.cleaning = True
            if time.time() > pc.cleaningEndTime:
                pc.cleaningEndTime = time.time() + (duration * 60)

    elif time.time() > pc.cleaningEndTime and pc.cleaning:
        pc.cleaning = False

    if pc.ofp: # Reset ofp
        if outerLevel < nexusOuterMax-levelBounce and innerLevel < nexusInnerMax-levelBounce:
            pc.ofp = False
        elif not pc.cleaning:
            pc.ofp = False

    if pc.cleaning:
        # This will hold auto drainage and air system
        # For now it will slow the water flow and allow dirt
        # to settle on the floor
        if not pc.ofp:
            pump(1, False)
        else: pump(1, True)



def getConfig() -> object:

    with open(pc.configPath) as config_file:
        configData = json.load(config_file)

    return configData

def updateJson(data : list) -> list:
    try:
        # Load the existing JSON data from the file
        with open(pc.configPath, "r") as infile:
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

        config['waterLevels']['levelCheck']['pond']['high'] = int(data[26])
        config['waterLevels']['levelCheck']['pond']['low'] = int(data[27])
        config['waterLevels']['levelCheck']['pond']['ok'] = int(data[28])
        
        config['cleaning']['schedule']['Monday'] = str(data[29]).lower()
        config['cleaning']['schedule']['Tuesday'] = str(data[30]).lower()
        config['cleaning']['schedule']['Wednesday'] = str(data[31]).lower()
        config['cleaning']['schedule']['Thursday'] = str(data[32]).lower()
        config['cleaning']['schedule']['Friday'] = str(data[33]).lower()
        config['cleaning']['schedule']['Saturday'] = str(data[34]).lower()
        config['cleaning']['schedule']['Sunday'] = str(data[35]).lower()

        config['cleaning']['time'] = data[36]
        config['cleaning']['duration'] = int(data[37])
        config['cleaning']['levelBounce'] = int(data[38])

        config['waterLevels']['levelCheck']['refill'] = data[39]


    

        # Write the modified object back to the JSON file
        with open(pc.configPath, "w") as outfile:
            json.dump(config, outfile, indent=4)
    except Exception as e:
        return [500, str(e)]
    
    return [200, "None"]

def logCrash(crashData : list, crashAlerted : bool, crashFilePath : str, lastCrashTime : float): #Changed this to save actual time not time in long format

    crash_time = crashData[2]
    if crash_time != lastCrashTime:
        lastCrashTime = crash_time

        time = datetime.datetime.now()

        formatted_date = time.strftime("%Y-%m-%d")

        time_obj = datetime.datetime.fromtimestamp(crash_time)
        crash_time = time_obj.strftime("%H:%M:%S")

        filename = f"{crashFilePath}{formatted_date}.txt"
        row = f"{str(crashData[1])}, {str(crash_time)}\n"

        if not os.path.exists(filename):
            with open(filename, 'w', newline='') as file:
                file.write(row)
        else:
            with open(filename, 'a', newline='') as file:
                file.write(row)
        
    if crashAlerted == False:
        server = configData['webhook']['server']
        key = configData['webhook']['keys']['crash']
        response = webhook.send(server, key)
        if response == 200:
            crashAlerted = True

 
def start(): 

    runTime = 0
    while True:
        if time.time() >= runTime:

            try:
                with open(pc.configPath) as config_file:
                    configData = json.load(config_file)

                runTime = time.time() + configData['updateFreq']['time']
            except Exception as e:
                pc.crash = [True, "config | " +str(e), time.time()]

            if pc.crash[0]:
                logCrash(pc.crash, pc.crashAlerted, pc.crashFilePath, pc.lastCrashTime)
            else:
                pc.crashAlerted = False

            try: 
                if time.time() >= pc.crash[2] + 30: pc.crash = [False, None, None]
            except: pass

            current_time = datetime.datetime.now() # Used for logging date/time

            # Collect data
            try:
                pc.deviceData = getDeviceData()
            except Exception as e:
                pc.crash = [True, "getDeviceData() | " +str(e), time.time()]
            try:
                pc.data = getData(configData, pc.levelCheckValue, pc.lastPondLevel, pc.lastInnerLevel, pc.lastOuterLevel, pc.lastTubLevel)
            except Exception as e:
                pc.crash = [True, "getData() | " + str(e), time.time()]
            
            pc.allData = [pc.data, pc.deviceData]
            # - - - - - - -

            try:
                log(pc.allData, pc.logFilePath, pc.logFilesRow, current_time)
            except Exception as e:
                pc.crash = [True, "log() | " +str(e), time.time()]

            try:
                pondState(configData, pc.allData)
            except Exception as e:
                pc.crash = [True, "pondState() | " + str(e), time.time()]

            try:
                pumpControl(configData, pc.allData)
            except Exception as e:
                pc.crash = [True, "pumpControl() | " + str(e), time.time()]

            try: 
                cleanMode(configData, pc.allData)
            except Exception as e:
                pc.crash = [True, "cleanMode() | " + str(e), time.time()]

        time.sleep(0.2)