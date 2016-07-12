var chokidar = require('chokidar');
var client = require('scp2');
var extend = require('util')._extend;

var source = 'test';
var target = '/home/vagrant/'

var ssh = {
  host: '127.0.0.1',
  port: 2222,
  username: 'vagrant',
  password: 'vagrant',
}

function scpSync (source, target, ssh) {
  chokidar.watch(source).on('all', (event, path) => {
    if(event == 'change') {
      console.log(event, path);
    }
    
    if(event == 'add' || event == 'change') {
      var options = extend({}, ssh)
      options.path = target + path;
      client.scp(path, options, function(err) {
        if(err) {
          console.log(err)
        } else {
          console.log('send ' + path + ' to remote')
        }
      })
    }
  });
}

module.exports = scpSync;
