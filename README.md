# Profalux Roller Shutter Controller

This Node.js library allow control of a Profalux roller shutter by wiring its remote control to a Raspberry Pi.

## Installation

You'll need:
- a Raspberry Pi with Node.js 6 installed
- a Profalux remote control paired with one or multiple roller shutters (i use the model MAI-EMPX)

You'll also need to create a `config.json` file with these informations:

```json
{
    "port": 19240,
    "shutter": {
        "name": "Living room",
        "travel": 30000,
        "pins": {
            "common": 37,
            "down": 36,
            "stop": 35,
            "up": 38
        }
    }
}
```

Simply enter the physical GPIO pin number assigned to each of the remote dry-contact pinouts. They are located on the bottom-left of the remote motherboard and are (from top to bottom):
- Down
- Stop
- Up
- Common

The **travel** parameter allows *rpi-profalux-shutters* to simulate the position in percent of the shutter (starting from 0, closed).

Remember to run `npm install` before actually running the server.

## Usage

To start the server, simply type the following command on your terminal. You'll probably need to be **root** or execute the script as **sudo** for GPIO access.

```bash
(sudo) node index.js 
```

You can also display debug logs on your terminal with the following command.

```bash
DEBUG=Profalux* (sudo -E) node index.js
```

The application will initialize the GPIO pins and start the webserver. By default, it will listen globally on port 19240. You can change the port number in the config file.

Then you'll be able to issue commands on your roller shutter with a PUT request on these URLs:
```bash
curl -X PUT http://raspberrypi:19240/shutter/set/100
curl -X PUT http://raspberrypi:19240/shutter/stop
curl -X PUT http://raspberrypi:19240/shutter/set/0
```

You can also retrieve the current position and state of the shutter with:

```shell
curl -X GET http://raspberrypi:19240/shutter/get/position
curl -X GET http://raspberrypi:19240/shutter/get/state
```

Valid values for current state are:

- 0: the shutter is closing
- 1: the shutter is opening
- 2: the shutter is stopped

### Web interface

You can control your shutter with a virtual remote by going to `http://raspberrypi:19240/`, where:
- `raspberrypi` is the IP address or the local network name of your Raspberry Pi
- `19240` is the port specified in the configuration file

## Todo
- [x] Create a simple web interface
- [ ] Handle multiple shutters
- [x] Compute approximate shutter position
