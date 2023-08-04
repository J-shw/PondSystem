import RPi.GPIO as io
import time, statistics

pondTrig = 27
pondEcho = 22

io.setmode(io.BCM)
io.setup(pondTrig, io.OUT)

io.setup(pondEcho, io.IN)

def pondLevel():
    global pondTrig
    global pondEcho

    array = []
    x = 0

    while x<=4:

        io.output(pondTrig, True)
        time.sleep(0.00001)
        io.output(pondTrig, False)

        run = time.time()
        failed = False

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
    print(array)
    try:
        # calculate the mode
        mode = statistics.mode(array)
        return round(mode, 1)

    except statistics.StatisticsError as e:
        # handle the StatisticsError exception
        print("Error:", e)
        return round(distance_cm,1)


    

while True:
    print(str(pondLevel()) + "cm")
    time.sleep(1)