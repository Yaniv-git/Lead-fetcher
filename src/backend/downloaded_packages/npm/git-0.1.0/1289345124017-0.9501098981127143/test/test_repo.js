require.paths.unshift("./spec/lib", "./lib", "./external-libs/node-httpclient/lib", "./external-libs/node-xml/lib",
  "./external-libs/node-async-testing");

TestSuite = require('async_testing').TestSuite,
  sys = require('sys'),
  Repo = require('git').Repo,
  Ref = require('git').Ref,
  Head = require('git').Head,
  Tag = require('git').Tag,
  Remote = require('git').Remote,
  Blob = require('git').Blob,
  Submodule = require('git').Submodule,
  Tree = require('git').Tree,
  Git = require('git').Git,
  Commit = require('git').Commit,
  GitFileOperations = require('git').GitFileOperations,
  fs = require('fs'),
  exec  = require('child_process').exec;

var suite = exports.suite = new TestSuite("repo tests");

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
      return callback(null, tmp_path + '/dot_git');    
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
  "Should update refs packed":function(assert, finished) {
    var a = "./test/dot_git"
    
    // create_tmp_directory("./test/dot_git", function(err, target_path) {
    create_tmp_directory(a, function(err, target_path) {
      new Repo(target_path, {is_bare:true}, function(err, repo) {
        // new and existing
        var test   = 'ac9a30f5a7f0f163bbe3b6f0abf18a6c83b06872'
        var master = 'ca8a30f5a7f0f163bbe3b6f0abf18a6c83b0687a'
  
        repo.update_ref('testref', test, function(err, result) {          
          repo.get_head('testref', function(err, testref_head) {
            assert.ok(testref_head.commit.sha != master);
        
            repo.update_ref('master', test, function(err, result) {
              repo.get_head('testref', function(err, master_head) {
                assert.ok(master_head.commit.sha != master)
        
                // Test nonpack
                repo.get_head('nonpack', function(err, nonpack_head) {
                  repo.update_ref('nonpack', test, function(err, result) {
                
                    repo.get_head('nonpack', function(err, nonpack_head_2) {
                      assert.ok(nonpack_head_2.commit.sha != nonpack_head.commit.sha);
                
                      destroy_directory(target_path, function(err, result) {
                        finished();        
                      })
                    });            
                  })
                })      
              })
            })
          })
        });  
      });      
    });    
  },
  
  "Should raise error on invalid repo location":function(assert, finished) {
    new Repo('/tmp', function(err, repo) {
      assert.equal("invalid git repository", err);
      finished();
    });
  },
  
  "Should raise error on non existing path":function(assert, finished) {
    new Repo('/foobar', function(err, repo) {
      assert.equal("no such path", err);
      finished();
    });
  },
  
  // Description
  "Should correctly retrieve the description":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      repo.description(function(err, description) {
        assert.ok(description.indexOf("Unnamed repository; edit this file") != -1);
        finished();
      });
    });
  },
  
  // Refs
  "Should correctly return array of ref objects":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      repo.refs(function(err, refs) {
        refs.forEach(function(ref) {
          assert.ok(ref instanceof Remote || ref instanceof Tag || ref instanceof Head);
        })
      
        finished();
      });
    });
  },
  
  // Heads
  "Should correctly return the current head":function(assert, finished) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.head(function(err, head) {
        assert.ok(head instanceof Head);
        assert.equal('master', head.name);
  
        repo.commits(head.name, function(err, commits) {
          assert.equal('ca8a30f5a7f0f163bbe3b6f0abf18a6c83b0687a', commits[0].id);
          finished();
        });
      })      
    });
  },
  
  "Should correcty return array of head objects":function(assert, finished) {
    new Repo("./test/..", function(err, repo) {
      repo.heads(function(err, heads) {
        heads.forEach(function(head) {
          assert.ok(head instanceof Head);        
        })
        finished();
      })      
    });
  },
  
  "Should populate head data":function(assert, finished) {
    new Repo("./test/dot_git", {is_bare:true}, function(err, repo) {
      repo.heads(function(err, heads) {
        var head = heads[1];
  
        assert.equal('test/master', head.name);        
        assert.equal('2d3acf90f35989df8f262dc50beadc4ee3ae1560', head.commit.id);
        finished();
      })      
    });
  },
  
  // Commits
  
  "Should correctly fetch commits":function(assert, finished) {
    new Repo("./..", {is_bare:true}, function(err, repo) {
      // Save function we are mocking
      var back = Git.prototype.rev_list;
      // Repace mocked function
      Git.prototype.rev_list = function(options, string, callback) { callback(null, fixture('rev_list')); };
  
      repo.commits('master', 10, function(err, commits) {
        var commit = commits[0];
  
        assert.equal('4c8124ffcf4039d292442eeccabdeca5af5c5017', commit.id);
        var p_commit_ids = commit.parents.map(function(p_commit) { return p_commit.id; });
        assert.deepEqual(["634396b2f541a9f2d58b00be1a07f0c358b999b3"], p_commit_ids);
  
        assert.equal('672eca9b7f9e09c22dcb128c283e8c3c8d7697a4', commit.tree.id);
        assert.equal('Tom Preston-Werner', commit.author.name);
        assert.equal('tom@mojombo.com', commit.author.email);
        assert.deepEqual(new Date(1191999972*1000), commit.authored_date);
        
        assert.equal('Tom Preston-Werner', commit.committer.name);
        assert.equal('tom@mojombo.com', commit.committer.email);
        assert.deepEqual(new Date(1191999972*1000), commit.committed_date);
        assert.equal('implement Grit#heads', commit.message);
  
        // Check commit 1
        assert.deepEqual([], commits[1].parents)
  
        // Check commit 2
        p_commit_ids = commits[2].parents.map(function(p_commit) { return p_commit.id; });
        assert.deepEqual(["6e64c55896aabb9a7d8e9f8f296f426d21a78c2c", "7f874954efb9ba35210445be456c74e037ba6af2"], p_commit_ids);
        
        assert.equal("Merge branch 'site'\n\n  * Some other stuff\n  * just one more", commits[2].message);
        assert.equal("Merge branch 'site'", commits[2].short_message);
        
        // Restore the rev_list function
        Git.prototype.rev_list = back;
        finished();        
      })   
    });
  },
  
  "Should correctly retrieve the commit":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      repo.commit('634396b2f541a9f2d58b00be1a07f0c358b999b3', function(err, commit) {
        assert.equal('634396b2f541a9f2d58b00be1a07f0c358b999b3', commit.id);
        finished();
      })      
    });
  },
  
  // commit count
  "Should correctly retrieve the commit count":function(assert, finished) {
    // Save function we are mocking
    var back = Git.prototype.rev_list;
    // Repace mocked function
    Git.prototype.rev_list = function(options, string, callback) { 
      if(string == "master") {
        callback(null, fixture('rev_list_count'));         
      } else {
        back(options, string, callback);
      }
    };
    
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      repo.commit_count('master', function(err, count) {
        assert.equal(655, count);
  
        // Restore the rev_list function
        Git.prototype.rev_list = back;
        finished();        
      });
    });
  },
    
  // tree
  "Should correctly retrieve the repo tree":function(assert, finished) {
    // Save function we are mocking
    var back = Git.prototype.ls_tree;
    Git.prototype.ls_tree = function(treeish, paths, options, callback) { 
      var self = this;
      var args = Array.prototype.slice.call(arguments, 0);
      callback = args.pop();
      
      callback(null, fixture('ls_tree_a', true)); 
    };    
    
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      repo.tree('master', function(err, tree) {
        var entries_1 = tree.contents.filter(function(entry) { return entry instanceof Blob; })
        var entries_2 = tree.contents.filter(function(entry) { return entry instanceof Tree; })
        assert.equal(4, entries_1.length);
        assert.equal(3, entries_2.length);
        // Restore the ls_tree function
        Git.prototype.ls_tree = back;
        finished();        
      });
    });
  },
    
  // blob
  "Should correctly fetch blog instance":function(assert, finished) {  
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      // Save function we are mocking
      var back = Git.prototype.cat_file;
      Git.prototype.cat_file = function(type, ref, callback) { 
        callback(null, fixture('cat_file_blob')); 
      };    
  
      repo.blob("abc", function(err, blob) {
        assert.equal("Hello world", blob.data);
        // Restore the cat_file function
        Git.prototype.cat_file = back;
        finished();
      })          
    });    
  },
    
  // init_bare
  "Should correctly init bare":function(assert, finished) {
    // Override the create function    
    Repo.init_bare("/foo/bar.git", function(err, result) {
      var back_fs_mkdir = GitFileOperations.fs_mkdir;    
      GitFileOperations.fs_mkdir = function(path, callback) { 
        callback(null, true); 
      }    
  
      var back_init = Git.prototype.init;
      Git.prototype.init = function(options, callback) { 
        assert.equal(true, options.bare)
        callback(null, true)
      }
  
      // Override file system behaviour to return a "valid git" repo
      var old_real_path_sync = fs.realpathSync;
      fs.realpathSync = function(path) {
        return "./test/..";
      }
  
  
      // Reset the overriden functions
      Git.prototype.init = back_init;
      GitFileOperations.fs_mkdir = back_fs_mkdir;      
      fs.realpathSync = old_real_path_sync;
      finished();
    })
  },
  
  "Should correctly init bare with options":function(assert, finished) {    
    // Override the create function    
    Repo.init_bare("/foo/bar.git", {template:'/baz/sweet'}, function(err, result) {
      var back_fs_mkdir = GitFileOperations.fs_mkdir;    
      GitFileOperations.fs_mkdir = function(path, callback) { 
        callback(null, true); 
      }    
  
      var back_init = Git.prototype.init;
      Git.prototype.init = function(options, callback) { 
        assert.equal(true, options.bare)
        assert.equal('/baz/sweet', options.template)
        callback(null, true)
      }
  
      // Override file system behaviour to return a "valid git" repo
      var old_real_path_sync = fs.realpathSync;
      fs.realpathSync = function(path) {
        return "./test/..";
      }
  
      // Reset the overriden functions
      Git.prototype.init = back_init;
      GitFileOperations.fs_mkdir = back_fs_mkdir;     
      fs.realpathSync = old_real_path_sync;
      finished();
    })      
  },  
  
  // fork_bare
  "Should correctly fork_bare":function(assert, finished) {            
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      var back_clone = Git.prototype.clone;
      Git.prototype.clone = function(options, original_path, target_path, callback) { 
        callback(null, null)
      };
  
      // Override file system behaviour to return a "valid git" repo
      var old_real_path_sync = fs.realpathSync;
      fs.realpathSync = function(path) {
        return "./test/..";
      }    
  
      var back_fs_mkdir = GitFileOperations.fs_mkdir;    
      GitFileOperations.fs_mkdir = function(path, callback) { 
        callback(null, true); 
      };  
  
      repo.fork_bare('/foo/bar.git', {template:'/awesome'}, function(err, result) {
        assert.equal(null, err);
        // Restore functions
        GitFileOperations.fs_mkdir = back_fs_mkdir;
        Git.prototype.clone = back_clone;
        fs.realpathSync = old_real_path_sync;
        finished();
      });
    });
  },
  
  // diff
  // "Should correctly do a diff between two entries":function(assert, finished) {
  //   new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
  //     var back_diff = Git.prototype.diff;
  //     
  //     Git.prototype.diff = function(a, b, c, d, e, callback) { 
  //         assert.deepEqual({}, a);
  //         assert.equal('master^', b);
  //         assert.equal('master', c);
  //         assert.equal('--', d);
  //       }
  //     repo.diff('master^', 'master', function(err, result) {});
  // 
  //     Git.prototype.diff = function(a, b, c, d, e, callback) { 
  //         assert.deepEqual({}, a);
  //         assert.equal('master^', b);
  //         assert.equal('master', c);
  //         assert.equal('--', d);
  //         assert.equal('foo/bar', e);
  //       }
  //     repo.diff('master^', 'master', ['foo/bar'], function(err, result) {});
  // 
  //     Git.prototype.diff = function(a, b, c, d, e, f) { 
  //         assert.deepEqual({}, a);
  //         assert.equal('master^', b);
  //         assert.equal('master', c);
  //         assert.equal('--', d);
  //         assert.deepEqual(['foo/bar', 'foo/baz'], e);
  //       }
  //     repo.diff('master^', 'master', ['foo/bar', 'foo/baz'], function(err, result) {});    
  //     
  //     // Restore functions
  //     Git.prototype.diff = back_diff;
  //     finished();
  //   });
  // },
    
  // commit_diff
  "Should correctly do a commit diff":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var back_diff = Git.prototype.diff;
  
      Git.prototype.diff = function() { 
        var self = this;
        var args = Array.prototype.slice.call(arguments, 0);
        // Pop the callback
        var callback = args.pop();
        callback(null, fixture('diff_p', true));
      }
  
      repo.commit_diff('master', function(err, diffs) {
        // sys.puts(sys.inspect(diffs))
        
        assert.equal(15, diffs.length);
  
        // Restore functions
        Git.prototype.diff = back_diff;
        finished();
      });
    });
  },
    
  // alternates
  "Should correctly locate alternates":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var back_exists = GitFileOperations.fs_exist;
      var back_read = GitFileOperations.fs_read;
      
      GitFileOperations.fs_exist
      
      GitFileOperations.fs_exist = function(dir, path, callback) {         
        assert.ok(dir != null);
        assert.ok(path.match(/objects\/info\/alternates/));
        callback(null, true); }        
      GitFileOperations.fs_read = function(dir, path, callback) { 
        assert.ok(dir != null);
        assert.ok(path.match(/objects\/info\/alternates/));
        callback(null, '/path/to/repo1/.git/objects\n/path/to/repo2.git/objects\n'); }
  
      repo.alternates(function(err, alternates) {
        assert.deepEqual(["/path/to/repo1/.git/objects", "/path/to/repo2.git/objects"], alternates);
        
        // Restore functions
        GitFileOperations.exist = back_exists;
        GitFileOperations.read = back_read;
        finished();
      })
    });
  },
  
  "Should fail to retrieve alternates":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var back_exists = GitFileOperations.fs_exist;
  
      GitFileOperations.fs_exist = function(dir, path, callback) {         
        assert.ok(dir != null);
        assert.ok(path.match(/objects\/info\/alternates/));
        callback(null, false); }        
  
      repo.alternates(function(err, alternates) {
        assert.deepEqual([], alternates);
  
        // Restore functions
        GitFileOperations.exist = back_exists;
        finished();
      });
    });
  },
  
  // set alternates
  "Should correctly set alternates":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var alts = {"/path/to/repo.git/objects":1, "/path/to/repo2.git/objects":1};
      var alts_array = ["/path/to/repo.git/objects", "/path/to/repo2.git/objects"];
  
      var back_exists = GitFileOperations.fs_exist;
      var back_write = GitFileOperations.fs_write;
  
      GitFileOperations.fs_exist = function(dir, path, callback) {
        assert.ok(dir != null);
        assert.ok(alts[path]);
        callback(null, true);
      }
  
      GitFileOperations.fs_write = function(dir, path, content, callback) { 
        assert.ok(dir != null);
        callback(null, true); 
      }
    
      repo.set_alternates(alts_array, function(err, result) {
        assert.ok(!err);
        
        // Restore functions
        GitFileOperations.fs_exist = back_exists;
        GitFileOperations.fs_write = back_write;
        finished();
      });
    });
  },
  
  "Should fail to set alternates":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      var alts = {"/path/to/repo.git/objects":1};
      var alts_array = ["/path/to/repo.git/objects"];
  
      repo.git.fs_exist = function(path, callback) {
        assert.ok(path != null);
        assert.ok(alts[path]);        
        callback(null, false);
      }
    
      repo.set_alternates(alts_array, function(err, result) {
        assert.ok(err);
        // Restore functions
        finished();
      });
    });
  },
  
  "Should set empty alternates":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      var back_write = GitFileOperations.fs_write;
  
      GitFileOperations.fs_write = function(dir, path, content, callback) { 
        assert.ok(dir != null);
        callback(null, true); 
      }
      
      repo.set_alternates([], function(err, result) {
        assert.ok(!err);
  
        // Restore functions
        GitFileOperations.fs_write = back_write;
        finished();
      });    
    });
  },
    
  // log
  "Should correctly test log":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {
      var back_log = Git.prototype.log;
  
      Git.prototype.log = function(commit, path, options, callback) {
        var args = Array.prototype.slice.call(arguments, 1);
        callback = args.pop();
        path = args.length ? args.shift() : null;
        options = args.length ? args.shift() : {};
  
        assert.deepEqual({pretty:'raw'}, options);
        assert.equal('master', commit);
        callback(null, fixture('rev_list')); 
      }
    
      repo.log(function(err, log_items) {
        assert.equal('4c8124ffcf4039d292442eeccabdeca5af5c5017', log_items[0].id);
        assert.equal('ab25fd8483882c3bda8a458ad2965d2248654335', log_items[log_items.length - 1].id);
  
        // Restore functions
        Git.prototype.log = back_log;
        finished();
      });
    });
  },
  
  "Should test log with path and options":function(assert, finished) {
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var back_log = Git.prototype.log;
  
      Git.prototype.log = function(commit, path, options, callback) { 
        var args = Array.prototype.slice.call(arguments, 1);
        callback = args.pop();
        path = args.length ? args.shift() : null;
        options = args.length ? args.shift() : {};        
        
        assert.deepEqual({pretty:'raw', max_count:1}, options);
        assert.equal('master', commit);
        assert.equal('file.rb', path);
        callback(null, fixture('rev_list')); 
      }    
      
      repo.log('master', 'file.rb', {max_count:1}, function(err, log_items) {
        assert.equal('4c8124ffcf4039d292442eeccabdeca5af5c5017', log_items[0].id);
        assert.equal('ab25fd8483882c3bda8a458ad2965d2248654335', log_items[log_items.length - 1].id);
  
        // Restore functions
        Git.prototype.log = back_log;
        finished();
      });
    });
  },
  
  // commit_deltas_from
  "Should correctly extract commit deltas from nothing new":function(assert, finished) {
    // Open the first repo
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      // Open object to the other repo
      new Repo("./test/grit", {is_bare:true}, function(err, other_repo) {  
        repo.git.rev_list = function(a, b, callback) {
            assert.deepEqual({}, a);
            assert.equal('master', b);
            callback(null, fixture('rev_list_delta_b'));
          }
  
        other_repo.git.rev_list = function(a, b, callback ) {
            assert.deepEqual({}, a);
            assert.equal('master', b);
            callback(null, fixture('rev_list_delta_a'));
          }
  
        repo.commit_deltas_from(other_repo, function(err, delta_blobs) {
          assert.equal(0, delta_blobs.length);
          finished();
        });
      });
    });
  },
  
  "Should commit deltas from when other has new":function(assert, finished) {
    // Open the first repo
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      // Open object to the other repo
      new Repo("./test/grit", {is_bare:true}, function(err, other_repo) {  
        var commit_ids = {"4c8124ffcf4039d292442eeccabdeca5af5c5017":1, "634396b2f541a9f2d58b00be1a07f0c358b999b3":1, "ab25fd8483882c3bda8a458ad2965d2248654335":1};
        var commit_ids_array = ["4c8124ffcf4039d292442eeccabdeca5af5c5017", "634396b2f541a9f2d58b00be1a07f0c358b999b3", "ab25fd8483882c3bda8a458ad2965d2248654335"];
  
        repo.git.rev_list = function(a, b, callback) {
            assert.deepEqual({}, a);
            assert.equal('master', b);
            callback(null, fixture('rev_list_delta_a'));
          }
  
        other_repo.git.rev_list = function(a, b, callback) {
            assert.deepEqual({}, a);
            assert.equal('master', b);
            callback(null, fixture('rev_list_delta_b'));
          }
    
        Commit.find_all = function(a, b, c, callback) {
            assert.equal(other_repo, a);
            assert.ok(commit_ids[b] != null);
            assert.deepEqual({max_count:1}, c);
            callback(null, [{}]);
          }
    
        repo.commit_deltas_from(other_repo, function(err, delta_blobs) {
          assert.equal(3, delta_blobs.length);
          finished();
        })
      });
    });
  },
  
  // object_exist
  "Should correctly select existing objects":function(assert, finished) {
    // Open the first repo
    new Repo("./test/grit", {is_bare:true}, function(err, repo) {  
      var before = ['634396b2f541a9f2d58b00be1a07f0c358b999b3', 'deadbeef'];
      var after = ['634396b2f541a9f2d58b00be1a07f0c358b999b3'];
  
      repo.git.select_existing_objects(before, function(err, objects) {
        assert.deepEqual(after, objects);
        finished();
      });
    });
  }
});



























