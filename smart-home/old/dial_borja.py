import time
import serial

recipient = "610200425"

phone = serial.Serial("/dev/ttyAMA0", 9600, timeout=5)
try:
    phone.write(b'ATD' + recipient.encode() + b';\r')
    while(1):
        print(phone.readline())
    time.sleep(0.5)
finally:
    phone.close()
