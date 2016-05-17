#!/usr/bin/env node
var fs   = require('fs'),
    args = require('optimist').argv,
    hbs  = require('handlebars'),
    _    = require('lodash/core');

function isTruthy(toTest) {
    var result = !!toTest;

    if (toTest && (_.isArray(toTest) || _.isObject(toTest))) {
        result = !_.isEmpty(toTest);
    }

    return result;
}

hbs.registerHelper('eq', function (op1, op2) {
    return op1 === op2;
});

hbs.registerHelper('not-eq', function (op1, op2) {
    return op1 !== op2;
});

hbs.registerHelper('not', function () {
    for (var i=0, len=arguments.length; i<len; i++) {
        if (isTruthy(arguments[i]) === true) {
          return false;
        }
    }

    return true;
});

hbs.registerHelper('and', function () {
    for (var i=0, len=arguments.length; i<len; i++) {
        if (isTruthy(arguments[i]) === false) {
          return arguments[i];
        }
    }

    return arguments[arguments.length-1];
});

jsdoc = JSON.parse(fs.readFileSync("./" + args._[0]).toString());
template_file_contents = fs.readFileSync(args._[1]).toString();


for(var x=0; x< jsdoc.length; x++){
    var docSec = jsdoc[x];
    if(docSec.params && docSec.params.length > 0){
        docSec.functionParams = [];

        for(var p=0; p< docSec.params.length; p++){
            if(docSec.params[p].name.indexOf('.') == -1){
                docSec.functionParams.push(docSec.params[p]);
            }
        }
    }
}

var template = hbs.compile(template_file_contents);
var result = template(jsdoc);

process.stdout.write(result);
