var nodemailer = require("nodemailer");
transport = nodemailer.createTransport('direct', {
	debug: true, //this!!!
});
transport.sendMail({
	from: "Fred Foo ✔ <foo@blurdybloop.com>", // sender address
	to: "vinz243@gmail.com", // list of receivers
	subject: "Hello ✔", // Subject line
	text: "Hello world ✔", // plaintext body
	html: "<b>Hello world ✔</b>" // html body
});
