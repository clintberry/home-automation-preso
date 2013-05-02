// Code for switching a zwave switch...


var SerialPort = require("serialport").SerialPort;

var serialPort = new SerialPort("/dev/tty.SLAB_USBtoUART", {
  baudrate: 115200
});

var switchId = 0x02;

var switchOn = [
  0x01, 
  0x09, 
  0x00, 
  0x13, // data function
  switchId, // node ID
  0x03, // length of command
  0x20, // binary switch
  0x01, // set
  0xff, // off of 0xff for on
  0x05 // send ack
];
switchOn.push(generateChecksum(switchOn));

var switchBuff = new Buffer(switchOn);


serialPort.on("open", function () {
  console.log('Connected to zwave stick...');

  serialPort.on('data', function(data) {
    console.log('data received: ' + data.toString('hex'));
    if(data[0] != 6) {
      serialPort.write(new Buffer([0x06])); // Send ack...
    }
  });

  console.log('Sending switch buffer...');
  console.log(switchBuff.toString('hex'))
  serialPort.write(switchBuff);

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