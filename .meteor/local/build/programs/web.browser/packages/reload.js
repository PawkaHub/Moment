//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Log = Package.logging.Log;
var JSON = Package.json.JSON;

/* Package-scope variables */
var Reload;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/reload/reload.js                                                                 //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
/**                                                                                          // 1
 * This code does _NOT_ support hot (session-restoring) reloads on                           // 2
 * IE6,7. It only works on browsers with sessionStorage support.                             // 3
 *                                                                                           // 4
 * There are a couple approaches to add IE6,7 support:                                       // 5
 *                                                                                           // 6
 * - use IE's "userData" mechanism in combination with window.name.                          // 7
 * This mostly works, however the problem is that it can not get to the                      // 8
 * data until after DOMReady. This is a problem for us since this API                        // 9
 * relies on the data being ready before API users run. We could                             // 10
 * refactor using Meteor.startup in all API users, but that might slow                       // 11
 * page loads as we couldn't start the stream until after DOMReady.                          // 12
 * Here are some resources on this approach:                                                 // 13
 * https://github.com/hugeinc/USTORE.js                                                      // 14
 * http://thudjs.tumblr.com/post/419577524/localstorage-userdata                             // 15
 * http://www.javascriptkit.com/javatutors/domstorage2.shtml                                 // 16
 *                                                                                           // 17
 * - POST the data to the server, and have the server send it back on                        // 18
 * page load. This is nice because it sidesteps all the local storage                        // 19
 * compatibility issues, however it is kinda tricky. We can use a unique                     // 20
 * token in the URL, then get rid of it with HTML5 pushstate, but that                       // 21
 * only works on pushstate browsers.                                                         // 22
 *                                                                                           // 23
 * This will all need to be reworked entirely when we add server-side                        // 24
 * HTML rendering. In that case, the server will need to have access to                      // 25
 * the client's session to render properly.                                                  // 26
 */                                                                                          // 27
                                                                                             // 28
// XXX when making this API public, also expose a flag for the app                           // 29
// developer to know whether a hot code push is happening. This is                           // 30
// useful for apps using `window.onbeforeunload`. See                                        // 31
// https://github.com/meteor/meteor/pull/657                                                 // 32
                                                                                             // 33
var KEY_NAME = 'Meteor_Reload';                                                              // 34
// after how long should we consider this no longer an automatic                             // 35
// reload, but a fresh restart. This only happens if a reload is                             // 36
// interrupted and a user manually restarts things. The only time                            // 37
// this is really weird is if a user navigates away mid-refresh,                             // 38
// then manually navigates back to the page.                                                 // 39
var TIMEOUT = 30000;                                                                         // 40
                                                                                             // 41
                                                                                             // 42
var old_data = {};                                                                           // 43
// read in old data at startup.                                                              // 44
var old_json;                                                                                // 45
                                                                                             // 46
// This logic for sessionStorage detection is based on browserstate/history.js               // 47
var safeSessionStorage = null;                                                               // 48
try {                                                                                        // 49
  // This throws a SecurityError on Chrome if cookies & localStorage are                     // 50
  // explicitly disabled                                                                     // 51
  //                                                                                         // 52
  // On Firefox with dom.storage.enabled set to false, sessionStorage is null                // 53
  //                                                                                         // 54
  // We can't even do (typeof sessionStorage) on Chrome, it throws.  So we rely              // 55
  // on the throw if sessionStorage == null; the alternative is browser                      // 56
  // detection, but this seems better.                                                       // 57
  safeSessionStorage = window.sessionStorage;                                                // 58
                                                                                             // 59
  // Check we can actually use it                                                            // 60
  if (safeSessionStorage) {                                                                  // 61
    safeSessionStorage.setItem('__dummy__', '1');                                            // 62
    safeSessionStorage.removeItem('__dummy__');                                              // 63
  } else {                                                                                   // 64
    // Be consistently null, for safety                                                      // 65
    safeSessionStorage = null;                                                               // 66
  }                                                                                          // 67
} catch(e) {                                                                                 // 68
  // Expected on chrome with strict security, or if sessionStorage not supported             // 69
  safeSessionStorage = null;                                                                 // 70
}                                                                                            // 71
                                                                                             // 72
if (safeSessionStorage) {                                                                    // 73
  old_json = safeSessionStorage.getItem(KEY_NAME);                                           // 74
  safeSessionStorage.removeItem(KEY_NAME);                                                   // 75
} else {                                                                                     // 76
  // Unsupported browser (IE 6,7) or locked down security settings.                          // 77
  // No session resumption.                                                                  // 78
  // Meteor._debug("XXX UNSUPPORTED BROWSER/SETTINGS");                                      // 79
}                                                                                            // 80
                                                                                             // 81
if (!old_json) old_json = '{}';                                                              // 82
var old_parsed = {};                                                                         // 83
try {                                                                                        // 84
  old_parsed = JSON.parse(old_json);                                                         // 85
  if (typeof old_parsed !== "object") {                                                      // 86
    Meteor._debug("Got bad data on reload. Ignoring.");                                      // 87
    old_parsed = {};                                                                         // 88
  }                                                                                          // 89
} catch (err) {                                                                              // 90
  Meteor._debug("Got invalid JSON on reload. Ignoring.");                                    // 91
}                                                                                            // 92
                                                                                             // 93
if (old_parsed.reload && typeof old_parsed.data === "object" &&                              // 94
    old_parsed.time + TIMEOUT > (new Date()).getTime()) {                                    // 95
  // Meteor._debug("Restoring reload data.");                                                // 96
  old_data = old_parsed.data;                                                                // 97
}                                                                                            // 98
                                                                                             // 99
                                                                                             // 100
var providers = [];                                                                          // 101
                                                                                             // 102
////////// External API //////////                                                           // 103
                                                                                             // 104
Reload = {};                                                                                 // 105
                                                                                             // 106
// Packages that support migration should register themselves by                             // 107
// calling this function. When it's time to migrate, callback will                           // 108
// be called with one argument, the "retry function." If the package                         // 109
// is ready to migrate, it should return [true, data], where data is                         // 110
// its migration data, an arbitrary JSON value (or [true] if it has                          // 111
// no migration data this time). If the package needs more time                              // 112
// before it is ready to migrate, it should return false. Then, once                         // 113
// it is ready to migrating again, it should call the retry                                  // 114
// function. The retry function will return immediately, but will                            // 115
// schedule the migration to be retried, meaning that every package                          // 116
// will be polled once again for its migration data. If they are all                         // 117
// ready this time, then the migration will happen. name must be set if there                // 118
// is migration data.                                                                        // 119
//                                                                                           // 120
Reload._onMigrate = function (name, callback) {                                              // 121
  if (!callback) {                                                                           // 122
    // name not provided, so first arg is callback.                                          // 123
    callback = name;                                                                         // 124
    name = undefined;                                                                        // 125
  }                                                                                          // 126
  providers.push({name: name, callback: callback});                                          // 127
};                                                                                           // 128
                                                                                             // 129
// Called by packages when they start up.                                                    // 130
// Returns the object that was saved, or undefined if none saved.                            // 131
//                                                                                           // 132
Reload._migrationData = function (name) {                                                    // 133
  return old_data[name];                                                                     // 134
};                                                                                           // 135
                                                                                             // 136
                                                                                             // 137
var pollProviders = function (tryReload, options) {                                          // 138
  tryReload = tryReload || function () {};                                                   // 139
  var migrationData = {};                                                                    // 140
  var remaining = _.clone(providers);                                                        // 141
  var allReady = true;                                                                       // 142
  while (remaining.length) {                                                                 // 143
    var p = remaining.shift();                                                               // 144
    var status = p.callback(tryReload, options);                                             // 145
    if (!status[0])                                                                          // 146
      allReady = false;                                                                      // 147
    if (status.length > 1 && p.name)                                                         // 148
      migrationData[p.name] = status[1];                                                     // 149
  };                                                                                         // 150
  if (allReady || options.immediateMigration)                                                // 151
    return migrationData;                                                                    // 152
  else                                                                                       // 153
    return null;                                                                             // 154
};                                                                                           // 155
                                                                                             // 156
                                                                                             // 157
Reload._migrate = function (tryReload, options) {                                            // 158
  // Make sure each package is ready to go, and collect their                                // 159
  // migration data                                                                          // 160
  var migrationData = pollProviders(tryReload, options);                                     // 161
  if (migrationData === null)                                                                // 162
    return false; // not ready yet..                                                         // 163
                                                                                             // 164
  try {                                                                                      // 165
    // Persist the migration data                                                            // 166
    var json = JSON.stringify({                                                              // 167
      time: (new Date()).getTime(), data: migrationData, reload: true                        // 168
    });                                                                                      // 169
  } catch (err) {                                                                            // 170
    Meteor._debug("Couldn't serialize data for migration", migrationData);                   // 171
    throw err;                                                                               // 172
  }                                                                                          // 173
                                                                                             // 174
  if (typeof sessionStorage !== "undefined" && sessionStorage) {                             // 175
    try {                                                                                    // 176
      sessionStorage.setItem(KEY_NAME, json);                                                // 177
    } catch (err) {                                                                          // 178
      // happens in safari with private browsing                                             // 179
      Meteor._debug("Couldn't save data for migration to sessionStorage", err);              // 180
    }                                                                                        // 181
  } else {                                                                                   // 182
    Meteor._debug("Browser does not support sessionStorage. Not saving migration state.");   // 183
  }                                                                                          // 184
                                                                                             // 185
  return true;                                                                               // 186
};                                                                                           // 187
                                                                                             // 188
                                                                                             // 189
// Migrating reload: reload this page (presumably to pick up a new                           // 190
// version of the code or assets), but save the program state and                            // 191
// migrate it over. This function returns immediately. The reload                            // 192
// will happen at some point in the future once all of the packages                          // 193
// are ready to migrate.                                                                     // 194
//                                                                                           // 195
var reloading = false;                                                                       // 196
Reload._reload = function (options) {                                                        // 197
  options = options || {};                                                                   // 198
                                                                                             // 199
  if (reloading)                                                                             // 200
    return;                                                                                  // 201
  reloading = true;                                                                          // 202
                                                                                             // 203
  var tryReload = function () { _.defer(function () {                                        // 204
    // Make sure each package is ready to go, and collect their                              // 205
    // migration data                                                                        // 206
    var migrationData = {};                                                                  // 207
    var remaining = _.clone(providers);                                                      // 208
    while (remaining.length) {                                                               // 209
      var p = remaining.shift();                                                             // 210
      var status = p.callback(tryReload);                                                    // 211
      if (!status[0])                                                                        // 212
        return; // not ready yet..                                                           // 213
      if (status.length > 1 && p.name)                                                       // 214
        migrationData[p.name] = status[1];                                                   // 215
    };                                                                                       // 216
                                                                                             // 217
    try {                                                                                    // 218
      // Persist the migration data                                                          // 219
      var json = JSON.stringify({                                                            // 220
        time: (new Date()).getTime(), data: migrationData, reload: true                      // 221
      });                                                                                    // 222
    } catch (err) {                                                                          // 223
      Meteor._debug("Couldn't serialize data for migration", migrationData);                 // 224
      throw err;                                                                             // 225
    }                                                                                        // 226
                                                                                             // 227
    if (safeSessionStorage) {                                                                // 228
      try {                                                                                  // 229
        safeSessionStorage.setItem(KEY_NAME, json);                                          // 230
      } catch (err) {                                                                        // 231
        // We should have already checked this, but just log - don't throw                   // 232
        Meteor._debug("Couldn't save data for migration to sessionStorage", err);            // 233
      }                                                                                      // 234
    } else {                                                                                 // 235
      Meteor._debug("Browser does not support sessionStorage. Not saving migration state."); // 236
    }                                                                                        // 237
                                                                                             // 238
    if (Reload._migrate(tryReload, options)) {                                               // 239
      window.location.reload();                                                              // 240
    }                                                                                        // 241
  }); };                                                                                     // 242
                                                                                             // 243
  tryReload();                                                                               // 244
};                                                                                           // 245
                                                                                             // 246
///////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                           //
// packages/reload/deprecated.js                                                             //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
                                                                                             //
// Reload functionality used to live on Meteor._reload. Be nice and try not to               // 1
// break code that uses it, even though it's internal.                                       // 2
// XXX COMPAT WITH 0.6.4                                                                     // 3
Meteor._reload = {                                                                           // 4
  onMigrate: Reload._onMigrate,                                                              // 5
  migrationData: Reload._migrationData,                                                      // 6
  reload: Reload._reload                                                                     // 7
};                                                                                           // 8
                                                                                             // 9
///////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.reload = {
  Reload: Reload
};

})();