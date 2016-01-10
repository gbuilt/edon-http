# edon-http
A Route-less Node HTTP Server - the simplest way possible. Old-school is so cool...


Route-less structure:

	Two key directories: '/private/' and '/public/'.

		'/private/'
			Server-side Nodejs files go here
			in whatever vanilla, MVC, clean
			or crazy directory structure you want.
			Example: a url of 'htp://site.com/login'
			will hit the nodejs file '/private/login.js'
			Nothing inside the /private/ directory
			can be accessed accidentally like a
			client-side .js file. Your source is safe.

		'/public/'
			Client-side files go here, like:
			/public/scripts/jquery.min.js
			/public/styles/global-styles.css
			/public/images/cat.gif.
			These will use their /public/ base,
			meaning: <link type="text/css" rel="stylesheet" href="/public/styles/global-styles.css">

		Your default landing page when nothing is specified in the URL, ie. 'http://site.com/' will hit 'private/index.js'.



A basic node http server start file:

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




There are additional functions in edon-http for static file usage:

	Referencing 'global.edon = new Edon();' from the sample 'server.js' shown above:

	INC - to include static file content:
		response.write(global.edon.inc("./views/login_form.html"));

	REQR - to include nodejs file functions
		self.reqr(path.resolve(global.edon.serverDir + "error/404notfound.js"));  // self.serverDir = '/private/'

	QS2OBJ
		request.reqUrlParams = global.edon.qs2obj(request.reqUrl.query);


