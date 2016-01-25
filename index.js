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
          console.log(declaration);
          opts.matches.forEach(function(match) {
            if (declaration.value.indexOf(match) > -1) {
              opts.occurences[declaration.value] = opts.occurences[declaration.value] || [];
              opts.occurences[declaration.value][declaration.property] = opts.occurences[declaration.value][declaration.property] || []
              rule.selectors.forEach(function(selector) {
                opts.occurences[declaration.value][declaration.property].push(selector);
              });
            };
          });
        });
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
      indent: opts.indent,
      compress: opts.compress,
      sourcemap: opts.sourcemap
    });
    string = string.replace(/,\n/g, ', ');
    fs.writeFile(opts.path + 'customize.css', string, function(err) {
      if (err) return console.log(err);
    });
    cb(null, file);
  });
}
