Mediengewitter (german for media thunderstorm)
==============================================

Mediengewitter is a [node.js](http://nodejs.org) framework to push images to all connected clients via websockets.


Dependencies
------------
*Node.js 6 (Boron) is required.*  

Mediengewitter needs a number of 3rd party libraries. You can install them with [npm](http://npmjs.org):

    npm install connect socket.io log4js sanitizer step nodeunit sass mongoose

Nix Package Manager
------------------
If you are not using a legacy package manager you can get the working package
by running:

    nix-build -A package


Running
-------

    MEDIENGEWITTER_INDEX=path/to/imageSum result/bin/mediengewitter
