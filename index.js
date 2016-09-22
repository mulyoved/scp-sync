

var chokidar = require('chokidar');
var client = require('scp2');
var extend = require('util')._extend;
var fs = require('fs');
var SSHClient = require('ssh2').Client;

var source = 'test';
var target = '/home/vagrant/'
var identify = 'c:/Users/Muly/.ssh/id_rsa';
var verbose = false;

var NULL_DBG = function() {};

var _ssh2 = {
  host: '10.115.1.9', //40.87.64.165',
  port: 22,
  username: 'muly',
  privateKey: fs.readFileSync(identify),
  debug: verbose ? console.log.bind(console) : NULL_DBG, 
}

var _ssh1 = {
  host: '40.87.64.165',
  port: 22,
  username: 'muly',
  privateKey: fs.readFileSync(identify),
  debug: verbose ? console.log.bind(console) : NULL_DBG,
}

function sshConnect1(path, target, ssh1, ssh2) {
  var sshConn1 = new SSHClient();

  sshConn1.on('ready', function() {
    ssh1.debug('FIRST :: connection ready');
    sshConn1.exec('nc ' + ssh1.host + ' ' + ssh1.port, function(err, stream) {
      if (err) {
        console.error('FIRST :: exec error: ' + err);
        return sshConn1.end();
      }
      ssh2.sock = stream;

      stream.on('end', function() {
        ssh1.debug('FIRST :: stream end');
      }).on('exit', function(exitcode) {
        ssh1.debug('FIRST :: stream exit');
      });

      uploadOneItem(path, target, ssh2);
      //scpSync('README.md', '/home/muly/temp/', ssh2);
    });
  }).connect(ssh1);
}

function uploadOneItem(path, target, ssh) {
    var options = extend({}, ssh)
    options.path = target + path;
    console.log('sync', path);
    client.scp(path, options, function(err) {
      if(err) {
        console.log(err)
      } else {
        console.log('send ' + path + ' to remote')
      }
    })  
}

function scpSync (source, target, ssh1, ssh2) {
  chokidar.watch(source).on('all', (event, path) => {
    if(event == 'change') {
      console.log(event, path);
    }
    
    if(event == 'add' || event == 'change') {
      if (ssh2) {
        sshConnect1(path, target, ssh1, ssh2);
      } else {
        uploadOneItem(path, target, ssh1);        
      }
    }
  });
}

module.exports = scpSync;
//scpSync('README.md', '/home/muly/temp/', _ssh1, _ssh2);
//sshConnect1();