/*
 * The MIT License
 * 
 * Copyright (c) 2012 MetaBroadcast
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
var http = require('http');
var url = require('url');
var rest = require('restler');
var socketio = require('socket.io');
var child = require('child_process');
var util = require('util');
var path = require('path');
var ReadyListener = require('./modules/ReadyListener');
var SearchResults = require('./modules/SearchResults');
var SearchResult = require('./modules/SearchResult');

var config = false; // Will be loaded when app starts
var configPath = "./config";
var host = "127.0.0.1";
var port = 8585;

var searchObjects = {};
var reactors = {};

var init = function() {
	// Load in search providers
	for (var index in config.searchProviders) {
		var searchProviderPath = config.searchProviders[index];
		var searchProviderKey = path.basename(searchProviderPath);
		util.log("Loading " + searchProviderKey);
		searchObjects[searchProviderKey] = require(searchProviderPath);
	}
	// load the reactors (modules called when a search result is received
	for (var index in config.reactorProviders) {
		var reactorProviderPath = config.reactorProviders[index];
		var reactorProviderKey = path.basename(reactorProviderPath);
		util.log("Loading " + reactorProviderKey);
		var reactorObject = require(reactorProviderPath);
		var reactor = new reactorObject(config[reactorProviderKey]);
		reactors[reactorProviderKey] = reactor;
	}
	util.log("Server listening on " + host + ":" + port);
	app.listen(port, host);
};

var reactorsInvoke = function() {
	if (arguments.length > 0) {
		var args = Array.prototype.slice.call(arguments);
		var func = args.shift();
		// call this function on each reactor
		var reactorKeys = Object.keys(reactors);
		for (var index in reactorKeys) {
			var reactor = reactors[reactorKeys[index]];
			var callback = reactor[func];
			callback.apply(null, args);
		}
	}
};

var doSearches = function(q, fn) {
	q = encodeURIComponent(q);
	var searchKeys = Object.keys(searchObjects);
	for (var index in searchKeys) {
		var searchProvider = searchKeys[index];
		var searchObject = searchObjects[searchProvider];
		var search = new searchObject(q, config[searchProvider], fn);
		search.run();
	}
};

// Web server
var app = http.createServer(function(req, res) {
	var request_url = url.parse(req.url, true);

	if (request_url.pathname == '/search.json') {
		res.writeHead(200, {
			'Content-Type' : 'application/json'
		});

		var results = new SearchResults();

		var rl = new ReadyListener(config.searchProviders.length, function() {
			res.end(JSON.stringify(results));
		});
		
		var fn = function(result, finished) {
			if (finished) {
				rl.add(result);
			} else if (result) {
				results.addResult(result);
			}
		};
		
		try {
			doSearches(request_url.query.q, fn);
		} catch (err) {
			util.error(err);
			res.writeHead(500);
			res.end("500 Sorry something went wrong with your search");
		}
		

	} else {
		res.writeHead(404);
		res.end("404 Page not found");
	}
});

// Socket IO listener
var io = socketio.listen(app);

// Help function for command line
var printHelp = function() {
	var commandLine = process.argv[0] + " " + process.argv[1] + " [OPTIONS]";
	util.puts(commandLine);
	util.puts(" --host Override server host name");
	util.puts(" --port Override server port");
	util.puts(" --config Specify path to configuration file without ending '.js' (defult: " + configPath + ")");
	util.puts(" --help Print out this page and exit");
	return true;
};


io.sockets.on('connection', function(socket) {
	
	reactorsInvoke('connection', socket);
	
	socket.on('disconnect', function() {
		reactorsInvoke('disconnect', socket.id);
	});
	
	socket.on('search', function(request) {
		reactorsInvoke('reset', socket.id);
		
		var count = 0;
		var rl = new ReadyListener(config.searchProviders.length, function() {
			socket.emit('results_finished', count);
		});
		var fn = function(result, finished) {
			if (finished) {
				rl.add(result);
			} else if (result) {
				socket.emit('result', result);
				count++;
				reactorsInvoke('onResult', request, result, socket.id);
			}
		};
		
		try {
			doSearches(request.q, fn);
		} catch (err) {
			util.error("There was an error:");
			util.error(err);
			rl = null;
		}
		
	});
});

io.sockets.on('disconnect', function(socket) {
	reactors.Invoke('disconnect', socket);
});

process.on('uncaughtException', function (err) {
  util.error('Caught exception:');
  util.error(err);
});

// Get args
var showHelpOnly = false;
var manualHost = false;
var manualPort = false;
process.argv.forEach(function (val, index, array) {
	  var parts = val.split('=');
	  if (parts.length > 0) {
	      if (parts[0] == "--host") {
	    	  manualHost = parts[1];
	      } else if (parts[0] == "--port") {
	    	  manualPort = parts[1];
	      } else if (parts[0] == "--config") {
	    	  configPath = parts[1];
	      } else if (parts[0] == "--help") {
	    	  printHelp();
	    	  showHelpOnly = true;
	      }
	  }
	});

// only start up app if doing something other than just showing help
if (showHelpOnly) {
	process.exit(0);
} else {
	try {
		// Load in config
		var config = require(configPath);
		// use host and port values from command line if present
		host = manualHost ? manualHost : config.host;
		port = manualPort ? manualPort : config.port;
		init();
	}
	catch (e) {
		util.error(e);
		process.exit(0);
	}
} 
