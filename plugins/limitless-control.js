var Promise = require('bluebird');
var led = Promise.promisifyAll(require('limitless-gem'));
var sleep = require('sleep');
var await = require('asyncawait/await');
var async = require('asyncawait/async');

module.exports = {
    run: function (params, log, callback) {

        var connection = led.createSocket({
                host: params.host,
                port: params.port
            },
            'udp',
            function () {
                log.info('Connected to LimitlessLED %s:%d', params.host, params.port);
            }
        );
        switch(params.func.toUpperCase()) {
          case("SWITCH"):
            var cmd = switchLED(connection, params.zone, params.onoff);
            break;
          case("COLOR"):
            var cmd = switchLED(connection, params.zone, 'ON');
            var cmd = switchCOLOR(connection, params.color);
            break;
          case("COLOR_WHITE"):
            var cmd = colorwhite(connection, params);
            break;
        }
        callback({
            'success' : true,
            'output'  : 'Sent command '+cmd
        });
    },
    info: function() {
        return 'IFTTN LimitlessLED Plugin - Control';
    }
};

var colorwhite = async (function(connection, params) {
    var cmd = await(switchCOLOR(connection, params.color));
    await(sleep.sleep(parseInt(params.delay)));
    await(sleep.sleep(parseInt(params.delay)));
    var cmd = await(switchWHITE(connection, params.zone));
});

var switchWHITE = function(connection, zone) {
    var cmd = led.RGBW['GROUP'+zone+'_SET_TO_WHITE'];
    connection.send(cmd);
    return cmd;
};

var switchCOLOR = async (function(connection, color) {
    var cmd = ''
    switch(color.toUpperCase()) {
      case 'AQUA':
      case 'BABY_BLUE':
      case 'FUSIA':
      case 'GREEN':
      case 'LAVENDAR':
      case 'LILAC':
      case 'LIME_GREEN':
      case 'ORANGE':
      case 'PINK':
      case 'RED':
      case 'ROYAL_BLUE':
      case 'ROYAL_MINT':
      case 'SEAFOAM_GREEN':
      case 'VIOLET':
      case 'YELLOW':
      case 'YELLOW_ORANGE':
          cmd = led.RGBW['SET_COLOR_TO_'+color.toUpperCase()];
          break;
      default:
          log.warn('Error with command, input %s invalid', color);
    }
    connection.send(cmd);
    return cmd;
});

var switchLED = function(connection, zone, onoff) {
    var cmd = '';
    switch(onoff.toUpperCase()) {
        case('ON'):
            cmd = led.RGBW['GROUP'+zone+'_ON'];
            break;
        case('OFF'):
            cmd = led.RGBW['GROUP'+zone+'_OFF'];
            break;
        default:
            log.warn('Error with command, input %s invalid', onoff);
            break;
    }
    connection.send(cmd);
    return cmd;
}
