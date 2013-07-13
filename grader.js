#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

	+ cheerio
		- https://github.com/MatthewMueller/cheerio
		- https://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
		- http://maxogden.com/scraping-with-node.html

	+ commander.js
		- https://github.com/visionmedia/commander.js
		- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy
	
	+ restler.js
 		- https://github.com/danwrong/restler

	+ JSON
		- http://en.wikipedia.org/wiki/JSON
		- https://developer.mozilla.org/en-US/docs/JSON
		- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	var instr = infile.toString();
	if(!fs.existsSync(instr)) {
		console.log("%s does note exist. Exiting.", instr);
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
	return ;
};

var getFile = function(file,checks,callback) {
	return fs.readFile(file,function read(err, data) {
		callback(data,checks);});
};

var getUrl = function(url,checks,callback) {
	rest.get(url.toString()).on('complete', function(result) {
		if (result instanceof Error) {
	      console.error('Error: ' + result.message);
			this.retry(5000); // try again after 5 sec
		} else {
			return callback(result,checks);
		}
	})
	return;
};

var clone = function(fn) {
	// Workaround for commander.js issue.
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

var processInput = function(processFunction, outputFunction) {
	
}

if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_to_html_file>', 'URL to index.html')
		.parse(process.argv);
	
	if(program.url) {
		//console.log("Using url: " + program.url);
		var checkJson = getUrl(program.url,program.checks,checkHtmlFile);
	} else {
		//console.log("Using file: " + program.file);
		var checkJson = getFile(program.file,program.checks,checkHtmlFile);
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
}