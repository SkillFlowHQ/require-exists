#! /usr/bin/env node

let fs = require('fs');
let path = require('path');
let read = require('fs-readdir-recursive');

require('../package.json');

let builtins = require('repl')._builtinLibs;
let deps = [];
if(fs.existsSync('package.json'))
  deps = Object.keys(JSON.parse(fs.readFileSync('package.json')).dependencies);
else
  console.warn('[warn] no package.json');

let installed = fs.readdirSync('node_modules');

//if(require.main === module)

let files = read(process.cwd()).filter(x => !x.includes('node_modules') && x.endsWith('.js'));

console.log('Output will only appear below if there is a problem.');

files.forEach(function(file){
  fs.readFile(file, function(err, data){
    if(err) console.error('can\'t read file ' + file + ':', err);
    let regex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match = regex.exec(data.toString());
    while(match != null){
      let req = match[1]; // won't properly handle wonky things like require(__dirname + '../index');
      if(!builtins.includes(req) && !deps.includes(req) && !installed.includes(req)){
        if(req.includes(path.sep)){
          let joined = path.join(path.dirname(file), req);
          let candidates = [joined];
          if(!joined.endsWith('.js'))
            candidates = [joined, joined + '.js', joined + path.sep + 'index.js']
          
          if(!candidates.find(p => fs.existsSync(p)))
            console.log(file, req, 'does not exist');
        }
        else
          console.log(file, req, 'is not a dep.');
      }
      match = regex.exec(data.toString());
    }
  });
});
