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


/*
 * This is an example reactor (a module that is run after a search result is received. It does
 * not do anything but shows the type of structure used.
 */
var SearchResult = require('SearchResult');

var ExampleReactor = function(config) {
	
	this.connection = function(socket) {
		
	};
	this.disconnect = function(socket) {
		
	};
	this.reset = function(socketId) {
		
	};
	this.onSearch = function(q) {
		
	};
	this.onResult = function(request, result, socketId) {
		
	};
};
module.exports = ExampleReactor;