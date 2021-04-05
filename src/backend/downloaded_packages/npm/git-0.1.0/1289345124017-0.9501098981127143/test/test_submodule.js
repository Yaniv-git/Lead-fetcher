require.paths.unshift("./spec/lib", "./lib", "./external-libs/node-httpclient/lib", "./external-libs/node-xml/lib",
  "./external-libs/node-async-testing");

var TestSuite = require('async_testing').TestSuite,
  sys = require('sys'),
  fs = require('fs'),
  exec  = require('child_process').exec,
  Repo = require('git').Repo,
  BinaryParser = require('git').BinaryParser,
  Actor = require('git').Actor,
  Blob = require('git').Blob,
  Submodule = require('git').Submodule;

var suite = exports.suite = new TestSuite("node-git submodule tests");

var to_bin = function(sha1o) {
  var sha1 = '';
  for(var i = 0; i < sha1o.length; i = i + 2) {
    sha1 = sha1 + String.fromCharCode(parseInt(sha1o.substr(i, 2), 16));
  }  
  return sha1;
}

var create_tmp_directory = function(clone_path, callback) {
  var filename = 'git_test' + new Date().getTime().toString() + Math.round((Math.random(100000) * 300)).toString();
  var tmp_path = '/tmp/' + filename;
  // Create directory
  fs.mkdirSync(tmp_path, 0777);
  // Copy the old directory to the new one
  var child = exec('cp -R ' + clone_path + ' ' + tmp_path, function (error, stdout, stderr) {
      if (error !== null) {
        sys.puts('exec error: ' + error);
        return callback(error, null);
      }
      return callback(null, tmp_path);
  });
}

var fixture = function(name, trim) {
  return trim ? fs.readFileSync("./test/fixtures/" + name, 'ascii').trim() : fs.readFileSync("./test/fixtures/" + name, 'ascii');
}

var destroy_directory = function(directory, callback) {
  // Copy the old directory to the new one
  var child = exec('rm -rf ' + directory, function (error, stdout, stderr) {
      if (error !== null) {
        sys.puts('exec error: ' + error);
        return callback(error, null);
      }
      return callback(null, null);    
  });  
}

/**
  Test basic node-git functionality
**/
suite.addTests({
  "Should correctly extract the config":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      var data = fixture('gitmodules');
      var blob = {data:data, id:'abc'};
      var tree = {find:function() { return blob; }};
      var commit = {tree:tree};
      var repo = {commit:function() { 
          var args = Array.prototype.slice.call(arguments, 0);
          callback = args.pop();        
          callback(null, commit);
        }};
      
      // Create a config
      Submodule.config(repo, function(err, config) {
        assert.equal('git://github.com/mojombo/glowstick', config['test/glowstick']['url']);
        assert.equal('git://github.com/mojombo/god', config['god']['url']);
        finished();        
      });
    });
  },
  
  "Should correctly fetch config with windows lineendings":function(assert, finished) {
    var data = fixture('gitmodules').replace(/\n/g, '\r\n');
    var blob = {data:data, id:'abc'};
    var tree = {find:function() { return blob; }};
    var commit = {tree:tree};
    var repo = {commit:function() { 
        var args = Array.prototype.slice.call(arguments, 0);
        callback = args.pop();        
        callback(null, commit);
      }};
      
    Submodule.config(repo, function(err, config) {
      assert.equal('git://github.com/mojombo/glowstick', config['test/glowstick']['url']);
      assert.equal('git://github.com/mojombo/god', config['god']['url']);
      finished();
    });
  },
  
  "Should correctly test no config":function(assert, finished) {
    var tree = {find:function() { return null; }};
    var commit = {tree:tree};
    var repo = {commit:function() { 
        var args = Array.prototype.slice.call(arguments, 0);
        callback = args.pop();        
        callback(null, commit);
      }};
    
    Submodule.config(repo, function(err, config) {
      assert.deepEqual({}, config);
      finished();
    });
  },
  
  "Should correctly test empty config":function(assert, finished) {
    var blob = {data:'', id:'abc'};
    var tree = {find:function() { return blob; }};
    var commit = {tree:tree};
    var repo = {commit:function() { 
        var args = Array.prototype.slice.call(arguments, 0);
        callback = args.pop();        
        callback(null, commit);
      }};
      
    Submodule.config(repo, function(err, config) {
      assert.deepEqual({}, config);
      finished();
    });
  },
  
  //  inspect 
  "Should correctly extract base name":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      Submodule.create(repo, {name:'foo/bar'}, function(err, submodule) {
        assert.equal('bar', submodule.basename);
        finished();        
      });
    });
  },
});



















