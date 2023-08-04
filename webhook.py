import requests
import time


def send(event_name, keys):
    rCode = -1
    for key in keys:
        start = time.time()
        rCode = -1
        while rCode !=200 and time.time() < start + 5:
            webhook_url = "https://maker.ifttt.com/trigger/"+event_name+"/with/key/" + key
            response = requests.post(webhook_url.format(event=event_name))
            rCode = response.status_code
    
    return rCode
