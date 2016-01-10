module.exports = (function(){

	console.log("\n\nInitializing Edon-HTTP server!\n\nThis server is still in beta,\nall requests show console debugging,\nand error messages show as much as possible.\n\n");

	var url = require("url"),
		fs = require("fs"),
		path = require("path"),
		sessions = require("client-sessions");

	function httpserver () {

		// PRIVATE ATTRIBUTES
		//
		var self = this,

			// http head content-type options
			fileTypes = {
				'.htm':  'text/html',
				'.html': 'text/html',
				'.css':  'text/css',
				'.js': 	 'text/javascript',
				'.json': 'application/json',
				'.gif':  'image/gif',
				'.jpg':  'image/jpg',
				'.png':  'image/png'
			},
			errorCatch = function(err, msg, request, response) {
				// console.log(err);
				console.log(msg);
				console.log(err.stack);
				response.write("<br /><br /><hr /><br />Oops! Something went wrong. My bad...<br /><br />");
				response.write("<br />Error Message: " + msg);
				response.write("<br />Error Stack: " + err.stack);
				postproc(request,response);

				// Clear the cached template so it's a fresh load next time. Expensive, but better in Development.
				// delete require.cache[request.reqPath];
				require.cache = [];

			},
			errorFileNotFound = function(relFilePath, request, response) {
				self.errDepth = (!("errDepth" in self)?1:self.errDepth+1);
				console.log("self.errDepth = " + self.errDepth);
				console.log("errorFileNotFound");
				try {
					if (self.errDepth>1) {
						throw "Error Depth: " + self.errDepth;
					} else {
						self.reqr(path.resolve(self.serverDir + "error/404notfound.js"));
					}
				} catch(err) {
					console.log("CATCHING ERROR in [errorFileNotFound]");
					errorCatch(err, "File not found.", request, response);

					// Clear the cached template so it's a fresh load next time. Expensive, but better in Development.
					// delete require.cache[relFilePath];
					require.cache = [];

				}
			},
			errorServer = function(relFilePath, request, response) {
				self.errDepth = (!("errDepth" in self)?1:self.errDepth+1);
				console.log("self.errDepth = " + self.errDepth);
				console.log("errorServer");
				try {
					if (self.errDepth>1) {
						throw "Error Depth: "+self.errDepth;
					} else {
						self.reqr(path.resolve(self.serverDir + "error/500servererror.js"));
					}
				} catch(err) {
					console.log("CATCHING ERROR in [errorServer]");
					errorCatch(err, "Server Error.", request, response);

					// Clear the cached template so it's a fresh load next time. Expensive, but better in Development.
					// delete require.cache[relFilePath];
					require.cache = [];

				}
			},
			preproc = function(request, response) {

				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!
				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!
				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!
				if (request.reqPath !== "/login"
				&& request.reqPath !== "/login_proc"
				&& !request.userSessionKey.loggedin) {
					request.reqPath = "/login";
					request.reqPathExt = path.extname(request.reqPath);
					request.reqPathType = ((request.reqPathExt in fileTypes) ? fileTypes[request.reqPathExt] : 'text/html');
					console.log("\n\n\n\n****** RESET TO request.reqPath: ["+request.reqPath+"] ******\n");
				} else if (request.reqPath === "/login" && request.userSessionKey.loggedin) {
					request.reqPath = "/index";
					request.reqPathExt = path.extname(request.reqPath);
					request.reqPathType = ((request.reqPathExt in fileTypes) ? fileTypes[request.reqPathExt] : 'text/html');
					console.log("\n\n\n\n****** RESET TO request.reqPath: ["+request.reqPath+"] ******\n");
				}
				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!
				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!
				// BEFORE loading the requested file -- AUTHENTICATE THE USER!!!


				console.log("\n\n==================== BEGIN ====================");
				console.log("request.reqPath:",request.reqPath);


			},
			loadDynamic = function(request, response) {
				// DYNAMIC - Javascript Server-Side source-code files

				request.cookieMgr = sessions({
					cookieName: 'userSessionKey', // cookie name dictates the key name added to the request object
					//requestKey: 'userSessionKey', // requestKey overrides cookieName for the key name added to the request object.
					secret: 'shouldbealargeunguessablestring', // should be a large unguessable string
					duration: 1000 * 60 * 60 * 24, // 1 day, how long the session will stay valid in ms
					activeDuration: 1000 * 60 * 60 // 1 Hr, if expiresIn < activeDuration, the session will be extended
				});

				request.cookieMgr(request, response, function(){
					// if (!request.userSessionKey.appid) {
					// 	request.userSessionKey.appid = 0;
					// 	console.log("<<<<<< Cookie 'appid' SET as: ", request.userSessionKey.appid);
					// 	// request.reqPath = "/login";
					// } else {
					// 	console.log("<<<<<< Cookie 'appid' EXISTED as: ", request.userSessionKey.appid);
					// }
					if (!request.userSessionKey.loggedin) {
						request.userSessionKey.loggedin = false;
						console.log("<<<<<< Cookie 'loggedin' SET as: ", request.userSessionKey.loggedin);
						// request.reqPath = "/login";
					} else {
						console.log("<<<<<< Cookie 'loggedin' EXISTED as: ", request.userSessionKey.loggedin);
					}
				});

				// Extend the 'response.write' to do more things:
				response.callwrite = response.write;
				response.write = function(content){
					if (!("finished" in response) || !response.finished) {
						if (content.length) {
							response.callwrite(content);
						} else {
							console.log("?????? Attempted response.write() with no content! ??????");
						}
						console.log("CALLED 'response.write' PROPERLY!!!! :)");
					}
					 else {
						console.log("!!!!!!!!!!!!!!!!!!!! CALLED 'response.write' AFTER 'response.end' !!!!!!!!!!!!!!!!!!!!");
						// console.log("vvvvvvvvvvvvvvv");
						// console.log(content);
						// console.log("^^^^^^^^^^^^^^^");
					}
				};

				// Extend the 'response.end' to do more things:
				response.callend = response.end;
				response.postprocTriggered = false;
				response.end = function(content){
					if (!("finished" in response) || !response.finished) {
						if (!!content) {
							response.write(content);
						}
						postproc(request,response);  // Inside 'postproc' is a call for response.callend
						console.log("CALLED 'response.end' PROPERLY!!!! :)", response.finished, request.reqPath);
					}
					 else {
						console.log("CALLED 'response.end' AFTER 'response.end':");
						console.log("vvvvvvvvvvvvvvv");
						if (!!content) { console.log(content); }
						console.log("^^^^^^^^^^^^^^^");
					}
					console.log("\n\n==================== -END- ====================\n\n");
				};


				// READY!
				// READY!
				// READY!

				request.reqPathOriginal = path.resolve( "./" + self.serverDir + request.reqPath + (!(/.js$/).test(request.reqPath)?'.js':'') );


				// Trigger any pre-load requirements (ie. loggedin, etc.)
				preproc(request, response);


				// SECURITY:
				// Adding [serverDir] to the path safely blocks the root directory
				// and prevents [serverDir] source code from ever being published!
				request.reqPath = path.resolve( "./" + self.serverDir + request.reqPath + (!(/.js$/).test(request.reqPath)?'.js':'') );
				console.log("[LOADDYNAMIC] request.reqPath: ",request.reqPath);

				response.statusCode = 200;
				response.setHeader("Content-Type", request.reqPathType);

				console.log(request.reqUrl);

				self.reqr(request.reqPath, request, response);

			},
			loadStatic = function(request, response) {
				// STATIC PUBLIC FILES

				request.reqPath = path.resolve( "./" + request.reqPath );
				console.log("[LOADSTATIC] request.reqPath: ",request.reqPath);

				if (!fs.existsSync(request.reqPath)) {
					response.statusCode = 404;
					// Load 404 - File not found
					//self.reqr("/error/404notfound.js", request, response);
					response.end();
					return;
				}

				response.statusCode = 200;
				// It exists, attempt to load the static file:
				fs.readFile(request.reqPath, function (error, content) {
					// Handle any fs.readfile error
					if (error) {
						console.log(error);
						// Load 500 - Server Error
						self.reqr("/error/500servererror.js", request, response);
						return;
					}
					// No error, write it.
					response.setHeader("Content-Type", request.reqPathType);
					response.write(content);
					postproc(request,response);
					// NOT HERE! response.end();
				});
			},
			postproc = function(request,response) {
				// This is called from the rewrite of response.end()
				// End it here in case it wasn't ended inside the requested file, it's is safe.
				if (!("postprocTriggered" in response) || !response.postprocTriggered) {
					postprocTriggered = true;
					if (("callend" in response)) {
						response.callend();
					} else {
						response.end();
					}
				}

				// Clear the cached template so it's a fresh load next time. Expensive, but better in Development.
				// for (var i = 0; i < request.reqfiles.length; i++) {
				// 	delete require.cache[request.reqfiles];
				// }
				require.cache = [];
			};

		// END PRIVATE VARS


		// PUBLIC ATTRIBUTES
		//
		// directory structure for this app
		this.serverDir = "/private/";
		this.clientDir = "/public/";
		this.indexFile = "/index";

		this.reqr = function(relFilePath, request, response) {
			console.log("Inside reqr: " + relFilePath);
			if (!fs.existsSync(relFilePath)) {

				// Load 404 - File not found
				errorFileNotFound(relFilePath, request, response);

			} else {

				if(!("catcherSet" in process)) {
					process.catcherSet = true;
					// Dynamic Module Error handling to prevent server shutdown!
					process.on('uncaughtException', function (err) {
						console.log('Hit uncaughtException!!!');
						if (!("finished" in response) || !response.finished) {
							errorCatch(err, "MODULE ERROR: "+relFilePath, request, response);
						} else {
							console.log(err.stack);
						}
						return; // exit out of 'reqr'.
					});
				}

				if ("reqfiles" in request) {
					request.reqfiles.push(relFilePath);
				} else {
					request.reqfiles = [relFilePath];
				}

				// LOAD THE REQUESTED MODULE
				// LOAD THE REQUESTED MODULE
				// LOAD THE REQUESTED MODULE

				require(relFilePath)(request, response);

				// LOAD THE REQUESTED MODULE
				// LOAD THE REQUESTED MODULE
				// LOAD THE REQUESTED MODULE

			}
		};

		this.inc = function(relFilePath) {
			// Read and return the non-js file
			return fs.readFileSync(path.resolve( "./" + self.serverDir + relFilePath),'utf8');
		};

		this.qs2obj = function(qs) {
			// Read and return the url query string as an object with key-value pairs
			var retobj = {},
				a = null,
				i = 0,
				ia = [];
			if (!!qs) {
				qs = qs.replace(/^\?/,'');  // Remove any leading '?'
				a = qs.split('&');
				for (i = 0; i < a.length; i++) {
					ia = a[i].split("=");
					retobj[ia[0]] = ia.length > 1 ? ia[1] : null;
				}
			}
			return retobj;
		};

		this.listener = function(request, response) {

			// SET ADDITIONAL REQUEST VARS!
			request.reqUrl = url.parse(request.url);
			request.reqUrlParams = self.qs2obj(request.reqUrl.query);
			request.reqRoot = __dirname;
			request.reqPath = path.normalize(request.reqUrl.pathname);
			request.reqPathExt = path.extname(request.reqPath);
			request.reqPathType = ((request.reqPathExt in fileTypes) ? fileTypes[request.reqPathExt] : 'text/html');
			console.log("\n\n\n\n****** request.reqPath: ["+request.reqPath+"] ******\n");


			// Set the default route (if none specified)
			if (request.reqPath == '/') {
				request.reqPath = self.indexFile;
				request.reqPathExt = path.extname(request.reqPath);
				request.reqPathType = ((request.reqPathExt in fileTypes) ? fileTypes[request.reqPathExt] : 'text/html');
				console.log("\n\n\n\n****** RESET TO request.reqPath: ["+request.reqPath+"] ******\n");
			}


			// Process the URL request: Static client CSS/JS/IMAGES files  -or-  Dynamic NODEJS files
			// All files are loaded from these two dirs:
			var rgx = new RegExp("^"+self.clientDir.replace(/\//g,'\/'));  // to add flags: new RegExp(str,"ig");
			if ( rgx.test(request.reqPath.toLowerCase()) ) {
				loadStatic(request, response);
			} else {
				loadDynamic(request, response);
			}

		};

	};

	// Maybe move the init portion outside of global_functions which is called in server.js. Maybe this way called here...
	// var sqlite_datafile = "./models/sqliteinit.js";
	// if (!fs.existsSync(sqlite_datafile)) {
	// 	require(sqlite_datafile);
	// }

	return httpserver;

})();
