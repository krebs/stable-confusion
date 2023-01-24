Mediengewitter (german for media thunderstorm)
==============================================

rewrite of mediengewitter in python since Node.js 6 (Boron) is outdated.
Thanks to [@makefu]( https://github.com/makefu ) and [@pfleidi]( https://github.com/pfleidi ) for their original work.

Mediengewitter is a python framework to push images to all connected clients via websockets.


Dependencies
------------
Mediengewitter needs a number of 3rd party libraries. 

You can install them with [pip]:
    - websockets
    - requests
    


example nginx.conf
------------

partial nginx.conf with websocket and static index.html

```
# mediengewitter
    server {
       server_name www.your-domian.com;
       listen [::]:5000;
       listen 5000;
       root /www/mediengewitter/public/;

       location /websocket {
            proxy_pass http://localhost:8080/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }

       location / {
            index index.html;
       }
    }

```
