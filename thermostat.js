// Code for setting thermostat

var SerialPort = require("serialport").SerialPort;

var serialPort = new SerialPort("/dev/tty.SLAB_USBtoUART", {
  baudrate: 115200
});

var thermostatId = 0x05;
var temp = 70;

var thermostatSet = [
  0x01, 
  0x0C, // Length of message
  0x00, // Request (0x00) or Response (0x01)
  0x13, // data function
  thermostatId, // node ID
  0x06, // length of command
  0x43, // command class (thermostat set point)
  0x01, // set
  0x01, // heating (0x01) or cooling (0x02)
  0x09, // Fahrenheit (0x01) | precision | size 
  temp,
  0x05, // send ack
  0x02 // Callback ID
];
thermostatSet.push(generateChecksum(thermostatSet));

var thermBuff = new Buffer(thermostatSet);


serialPort.on("open", function () {
  console.log('Connected to zwave stick...');

  serialPort.on('data', function(data) {
    console.log('data received: ' + data.toString('hex'));
    if(data[0] != 6) {
      serialPort.write(new Buffer([0x06])); // Send ack...
    }
  });

  console.log('Sending switch buffer...');
  console.log(thermBuff.toString('hex'))
  serialPort.write(thermBuff);

});


function generateChecksum(data) {
  var offset = 0; // Initialize this to 0xFF and no need to NOT result below
  ret = data[offset];
  for (var i = offset; i < data.length; i++) {
    // Xor bytes
    ret ^= data[i];
  }
  ret = ~ret;
  return ret;
}