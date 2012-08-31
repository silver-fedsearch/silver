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
var rest = require('restler');
var util = require('util');
var SearchResults = require('../modules/SearchResults');
var SearchResult = require('../modules/SearchResult');

var AtlasSearch = function(q, config, fn) {
	this.q = q;
	this.config = config;
	this.fn = fn; // callback function
};

AtlasSearch.prototype.run = function() {
	var url = 'http://atlas.metabroadcast.com/3.0/search.json?limit='
			+ this.config.limit + '&q=' + this.q + '&publisher=bbc.co.uk&apiKey=' + this.config.apiKey;
	
	var o = this;
	var request;
	
	request = rest.get(url);
	
	var atlas_timeout = setTimeout(function () {
		request.abort("timeout");
	}, this.config.timeout);
	
	request.on('complete', function(data) {
		clearTimeout(atlas_timeout);
		var resultnum = 0;
		if (data.contents) {
			for ( var i in data.contents) {
				var content = data.contents[i];
				var result = new SearchResult();
				result.addId("atlas", content.uri);
				result.title = content.title;
				result.thumbnail_url = content.thumbnail ? content.thumbnail : "";
				result.source = "atlas";
				result.type = content.specialization == "film" ? "film" : "broadcast";
				result.media_type = content.media_type;
				result.specialization = content.specialization;
				o.fn(result, false);
				resultnum++;
				if (resultnum > o.config.limit) {
					break;
				}
			}
		} else {
			util.error("atlas: Cannot understand response");
			util.error(data);
			util.error("=====");
		}
		o.fn("atlas", true);
	});
};

module.exports = AtlasSearch;