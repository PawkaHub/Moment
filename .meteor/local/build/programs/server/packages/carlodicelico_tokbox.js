(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var OpenTok, OpenTokClient;

(function () {

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// packages/carlodicelico:tokbox/server/index.js                       //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
OpenTok = Npm.require('opentok');                                      // 1
var Future = Npm.require('fibers/future');                             // 2
                                                                       // 3
OpenTokClient = function OpenTokClient(key, secret) {                  // 4
  this._client = new OpenTok(key, secret);                             // 5
};                                                                     // 6
                                                                       // 7
OpenTokClient.prototype.createSession = function(options) {            // 8
  var self = this;                                                     // 9
  options = options || {};                                             // 10
  var sessionId = sync(function(done) {                                // 11
    self._client.createSession(options, function(err, result) {        // 12
      done(err, result.sessionId);                                     // 13
    });                                                                // 14
  });                                                                  // 15
                                                                       // 16
  return sessionId;                                                    // 17
};                                                                     // 18
                                                                       // 19
OpenTokClient.prototype.generateToken = function(sessionId, options) { // 20
  options = _.clone(options) || {};                                    // 21
  return this._client.generateToken(sessionId, options);               // 22
};                                                                     // 23
                                                                       // 24
OpenTokClient.prototype.startArchive = function(sessionId, options) {  // 25
  var self = this;                                                     // 26
  var archive = sync(function(done) {                                  // 27
    self._client.startArchive(sessionId, options, function(result) {   // 28
      done(null, result);                                              // 29
    });                                                                // 30
  });                                                                  // 31
                                                                       // 32
  return archive;                                                      // 33
};                                                                     // 34
                                                                       // 35
OpenTokClient.prototype.stopArchive = function(sessionId) {            // 36
  var self = this;                                                     // 37
  var archive = sync(function(done) {                                  // 38
    self._client.stopArchive(sessionId, function(result) {             // 39
      done(null, result);                                              // 40
    });                                                                // 41
  });                                                                  // 42
                                                                       // 43
  return archive;                                                      // 44
};                                                                     // 45
                                                                       // 46
OpenTokClient.prototype.getArchive = function(archiveId) {             // 47
  return this._client.getArchive(archiveId);                           // 48
};                                                                     // 49
                                                                       // 50
function sync(asynFunction) {                                          // 51
  var future = new Future();                                           // 52
  var sent = false;                                                    // 53
  var payload;                                                         // 54
                                                                       // 55
  setTimeout(function() {                                              // 56
    asynFunction(done);                                                // 57
    function done(err, result) {                                       // 58
      if(!sent) {                                                      // 59
        payload = {                                                    // 60
          result: result,                                              // 61
          error: err                                                   // 62
        };                                                             // 63
                                                                       // 64
        if(future.ret) {                                               // 65
          //for 0.6.4.1 and older                                      // 66
          future.ret();                                                // 67
        } else {                                                       // 68
          //for 0.6.5 and newer                                        // 69
          future.return();                                             // 70
        }                                                              // 71
      }                                                                // 72
    }                                                                  // 73
  }, 0);                                                               // 74
                                                                       // 75
  future.wait();                                                       // 76
  sent = true;                                                         // 77
                                                                       // 78
  if(payload.error) {                                                  // 79
    throw new Meteor.Error(500, payload.error.message);                // 80
  } else {                                                             // 81
    return payload.result;                                             // 82
  }                                                                    // 83
};                                                                     // 84
                                                                       // 85
/////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['carlodicelico:tokbox'] = {
  OpenTok: OpenTok,
  OpenTokClient: OpenTokClient
};

})();
