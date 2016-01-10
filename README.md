# edon-http
A Route-less Node HTTP Server - the simplest way possible. Old-school is so cool...


Customize your server:


	Specify your root 'Private' and 'Public' folders.

		These are the defaults:

		this.serverDir = "/private/";  	// This is where your server js files live, in whatever vanilla, MVC, clean or crazy folder structure you want.
		this.clientDir = "/public/"; 	// This is where your client-side content lives. ie. /public/scripts/jquery.min.js, /public/styles/global-styles.css.
		this.indexFile = "/index";   	// This is your default landing page when nothing is specified in the URL. ie. /index.js



	Default mime-types (Of course you can add more as needed):

		fileTypes = {
			'.html': 'text/html',
			'.css':  'text/css',
			'.js': 	 'text/javascript',
			'.json': 'application/json',
			'.gif':  'image/gif',
			'.jpg':  'image/jpg',
			'.png':  'image/png'
		},


Usage Example:

	Here is a sample server.js file which you would start by running "node server".
	In this example below you can specify the port to listen on "node server 8080" or "sudo node server 80".

	------------------------------------------------------------------------------------
	// File: server.js
	// Created: January 2016

	var Edon = require("./edon-http.js"),
		Http = require("http");

	// Make 'Edon' accessible EVERYWHERE
	global.edon = new Edon();

	var svr = Http.createServer(global.edon.listener),
		port = 8888;

	console.log(process.argv);
	if (process.argv.length > 2 && !isNaN(process.argv[2]) && process.argv[2] >= 80) {
		port = process.argv[2];
	}

	svr.listen(port);

	console.log("Edon Server is running!\n\nListening on port: " + port + ".\n\n\n")
	------------------------------------------------------------------------------------
