import RPi.GPIO as io
import time

refillRelay = 21
io.setmode(io.BCM)
io.setup(refillRelay, io.OUT)

io.output(refillRelay, io.HIGH)
time.sleep(2)
io.output(refillRelay, io.LOW)