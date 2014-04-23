var nodemailer = require('nodemailer');

// Create a SMTP transport object
var transport = nodemailer.createTransport("Direct", {
});

console.log('SMTP Configured');

// Message object
var message = {

  // sender info
  from: 'Sender Name <sender@example.com>',

  // Comma separated list of recipients
  to: '"Receiver Name" <vinz243@gmail.com>',

  // Subject of the message
  subject: 'Nodemailer is unicode friendly ✔',

  // plaintext body
  text: 'Hello to myself!',

  // HTML body
  html: '<p><b>Hello</b> to myself <img src="cid:note@node"/></p>' +
    '<p>Here\'s a nyan cat for you as an embedded attachment:<br/></p>'
};

console.log('Sending Mail');
transport.sendMail(message, function (error) {
  if (error) {
    console.log('Error occured');
    console.log(error.message);
    return;
  }
  console.log('Message sent successfully!');

  // if you don't want to use this transport object anymore, uncomment following line
  transport.close(); // close the connection pool
});
