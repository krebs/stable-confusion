#!/usr/bin/env python3

#requires additionally installed 
# websockets-10.4
# requests

import websockets
import asyncio
import json
from random import randrange
import requests #to check for valid images
import os

PORT = 8080

imgcache= ["/image/default.jpg","/image/default.jpg","/image/default.jpg","/image/default.jpg","/image/default.jpg"]

# A set of connected ws clients
connected = set()

async def handler(websocket):

    connected.add(websocket) #add client to list
    print(f"{websocket.remote_address[0]} just connected")

    try:
        #send init sequence/imagecache to new client
        initdata = {
            "type":"cache",
            "payload":{
                "action":"init",
                "data":imgcache
                }
            }

        await websocket.send(json.dumps(initdata))

        async for message in websocket:
            try:
                indata = json.loads(message)
                if indata["type"] == "chat":
                    #print("Received message from client: " + message)
                    print( f"msg:{websocket.remote_address[0]}: {indata['payload']['data']} ")
                    chatmsg = {
                        "type":"chat",
                        "payload":{
                            "action":"msg",
                            "data": "anonym:" + indata['payload']['data']
                            }
                        }
                    websockets.broadcast(connected, json.dumps(chatmsg))
            except:
                pass
    except websockets.exceptions.ConnectionClosed as e:
        print(f"{websocket.remote_address[0]} disconnected")
    finally:
        connected.remove(websocket)

def checkURL(url):
        try:
            r = requests.head(url, data ={'key':'value'})
            return r.status_code == 200
        except:
            return False


async def broadcast_messages():

    imagelist = []
    with open("./list.txt") as file:
        imagelist = file.read().splitlines()
    urls= len(imagelist)

    while True:
        
        #check for new image list file
        try:
            if os.path.isfile("./update.txt"):
                with open("./update.txt") as file:
                    imagelist.extend(file.read().splitlines())
                    urls= len(imagelist)
                    print("added new images")
                os.rename("./update.txt", "./update_done.txt") 
        except:
            pass
        # get next (random) image from list
        url = imagelist[ randrange(urls) ]
        # check if image available
        while(checkURL(url)==False):
            #print("404 image skipped")
            url = imagelist[randrange(urls) ]

        msg = '{"type":"cache","payload":{"action":"nextImage","data":"' + url + '"}}'  # your application logic goes here

        # wait till it's time to update
        await asyncio.sleep(7)
        websockets.broadcast(connected, msg)
        
        #update imgcache with current picture
        imgcache.pop(0)
        imgcache.append(url)


async def main():
    async with websockets.serve(handler, "", PORT):
        await broadcast_messages()  # runs forever

if __name__ == "__main__":
    asyncio.run(main())
