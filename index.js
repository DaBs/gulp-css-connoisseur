'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var assign = require('object-assign')
var css = require('css');
var fs = require('fs');

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
    try {
      opts.css.stylesheet.rules.forEach(function(rule) {
        rule.declarations.forEach(function(declaration) {
          opts.colors.forEach(function(color) {
            var declaColor = (declaration.value.length < 5 && declaration.value.indexOf('#') > -1) ? declaration.value + declaration.value.substring(1) : declaration.value;
            if (declaColor.toLowerCase() === color.toLowerCase()) {
              opts.occurences[declaColor] = opts.occurences[declaColor] || [];
              opts.occurences[declaColor][declaration.property] = opts.occurences[declaColor][declaration.property] || [];
              rule.selectors.forEach(function(selector) {
                opts.occurences[declaColor][declaration.property].push(selector);
              });
            };
          });
        });
      });
    } catch(err) {
      console.log(err);
    };
    var newCss = {
      stylesheet: {
        rules: []
      }
    };
    for (var key in opts.occurences) {
      var val = opts.occurences[key];
      for (var key2 in val) {
        var val2 = val[key2];
        var rule = {
          type: "rule",
          selectors: val2,
          declarations: [
            {
              type: "declaration",
              property: key2,
              value: key
            }
          ]
        }
        newCss.stylesheet.rules.push(rule);
      }
    }
    var string = css.stringify(newCss, {
      compress: opts.compress
    });
    string = string.replace(/,\n/g, ', ');
    fs.writeFile(opts.path + 'customize.css', string, function(err) {
      if (err) return console.log(err);
    });
  });
}
