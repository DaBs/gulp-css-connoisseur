'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var assign = require('object-assign')
var css = require('css');
var fs = require('fs');
var path = require('path');

module.exports = function (opts) {
  opts = assign({
    colors: [],
    compress: false,
    path: './'
  }, opts);

  return through.obj(function(file, enc, cb) {
    opts.data = file.contents.toString();
    opts.css = css.parse(opts.data);
    opts.occurences = {};
    opts.matches = opts.matches || [];

    if (opts.replaces) {
      Object.keys(opts.replaces).forEach(function(key) {
        opts.matches.push(key);
      });
    }

    try {
      opts.css.stylesheet.rules.forEach(function(rule) {
        if(rule.declarations) {
          rule.declarations.forEach(function(declaration) {
            opts.matches.forEach(function(match) {
              if (declaration.value) {
                if (declaration.value.indexOf(match) > -1 && declaration.value.indexOf('gradient') < 0) {
                  var val = declaration.value.replace(/ /g, "_");
                  //console.log(declaration.value);
                  //console.log(declaration);
                  opts.occurences[val] = opts.occurences[val] || {};
                  opts.occurences[val][declaration.property] = opts.occurences[val][declaration.property] || [];
                  //console.log(opts.occurences[val][declaration.property]);
                  rule.selectors.forEach(function(selector) {
                    opts.occurences[val][declaration.property].push(selector);
                  });
                };
              };
            });
          });
        };
      });
    } catch(err) {
      console.log(err);
    }
    var newCss = {
      stylesheet: {
        rules: []
      }
    };
    for (var key in opts.occurences) {
      var val = opts.occurences[key];
      for (var key2 in val) {
        var val2 = val[key2];
        var declarationValue = (opts.replaces) ? opts.replaces[key] : key.replace(/_/g, " ");
        var rule = {
          type: "rule",
          selectors: val2,
          declarations: [
            {
              type: "declaration",
              property: key2,
              value: declarationValue
            }
          ]
        }
        newCss.stylesheet.rules.push(rule);
      }
    }
    var string = css.stringify(newCss, {
      indent: opts.indent,
      compress: opts.compress,
      sourcemap: opts.sourcemap
    });
    string = string.replace(/,\n/g, ', ');
    fs.writeFile(opts.path + path.basename(file.path, '.css') + '_customize.css', string, function(err) {
      if (err) return console.log(err);
    });
    cb(null, file);
  });
}
