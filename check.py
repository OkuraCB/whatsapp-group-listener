import sys
import threading
import time

import pystray
from icmplib import ping
from PIL import Image


def ping_host():
    while True:
        host = sys.argv[1]
        response = ping(host, count=10, privileged=False)
        if response.packet_loss >= 0.5:
            icn = Image.new("RGB", (32, 32), (255, 0, 0))
        else:
            icn = Image.new("RGB", (32, 32), (0, 255, 0))
        
        icon.icon = icn
        time.sleep(600)

icon = pystray.Icon('ping', icon=Image.new("RGB", (32, 32), (255, 255, 255)))

threading.Thread(target=ping_host).start()
icon.run()
