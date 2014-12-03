#!/bin/env node
'use strict';

var fs = require('fs');

var es6tr = require("es6-transpiler");
var transpiler = require('es6-module-transpiler');
var AMDFormatter = require('es6-module-transpiler-amd-formatter');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;

if ( process.argv[3] === 'js/runtime.js' ) {
	fs.createReadStream(__dirname + '/../requirejs/require.js').pipe(fs.createWriteStream(process.argv[4]));
} else if ( process.argv[3].indexOf('.min.js') > -1 ) {
	fs.createReadStream(process.argv[2] + '/' + process.argv[3]).pipe(fs.createWriteStream(process.argv[4]));
} else {
	var container = new Container({
		resolvers: [new FileResolver([process.argv[2]])],
		formatter: new AMDFormatter()
	});

	container.getModule(process.argv[3]);
	container.write(process.argv[4]);

	var test = es6tr.run({
		filename: process.argv[4],
		outputFilename: process.argv[4],
		environments: ['browser'],
		includePolyfills: false,
		globals: {
			"define": true,
		},
	});
	console.log(test.getFullLib());
}
