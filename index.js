'use strict';
var Q = require('q');
var Docker = require('dockerode');
var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

exports.containers = {};

exports.addPortmap = function(container, portMap) {
  container.portMap = {};
  for (var key in portMap) {
    if (key) {
      var port = key.split('/')[0];
      container.portMap[port] = portMap[key][0].HostPort;
    }
  }
};
exports.makeContainer = function(image) {
  var deferred = Q.defer();
  docker.createContainer(image, function(err, container) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(container);
    }
  });
  return deferred.promise;
};

exports.startContainer = function(container, opts) {
  var deferred = Q.defer();
  container.start(opts, function(err, data) {
    if (err) {
      deferred.resolve(container, data);
    } else {
      deferred.resolve(container, data);
    }
  });
  return deferred.promise;
};

exports.inspectContainer = function(container) {
  var deferred = Q.defer();
  container.inspect(function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve({
        container: container,
        data: data
      });
    }
  });
  return deferred.promise;
};

exports.closeContainer = function(container) {
  var deferred = Q.defer();
  container.stop(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};

process.on('SIGINT', function() {
  console.log('Received Exit Signal');
  var ids = Object.keys(exports.containers);
  var closePromises = [];
  ids.forEach(function(id) {
    if (id) {
      closePromises.push(exports.closeContainer(exports.containers[id]));
    }
  });
  Q.all(closePromises).done(function() {
    process.exit(1);
  });
});
