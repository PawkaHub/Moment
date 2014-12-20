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
var $ = Package.jquery.$;
var jQuery = Package.jquery.jQuery;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Template = Package.templating.Template;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var ReactiveDict = Package['reactive-dict'].ReactiveDict;
var Pince = Package['jag:pince'].Pince;
var Logger = Package['jag:pince'].Logger;
var MicroEvent = Package['jag:pince'].MicroEvent;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var FView, log, postFirstAddQueue, Engine, Transform, initializeFamous, optionString, handleOptions, options, MeteorFamousView, throwError, sequencer, parentViewName, parentTemplateName, famousContextWrapper, templateSurface, div;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famous-views.js                                                      //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
// Could use something from --settings too                                                                  // 1
var isDev = ("localhost" === window.location.hostname);                                                     // 2
                                                                                                            // 3
log = new Logger('famous-views');                                                                           // 4
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');                                                  // 5
                                                                                                            // 6
FView = {};                                                                                                 // 7
FView.log = log; // allow other fview-* packages to use this too                                            // 8
                                                                                                            // 9
var readyQueue = [];                                                                                        // 10
var readyDep = new Tracker.Dependency();                                                                    // 11
FView.ready = function(func) {                                                                              // 12
  if (func) {                                                                                               // 13
    if (FView.isReady)                                                                                      // 14
      func();                                                                                               // 15
    else                                                                                                    // 16
      readyQueue.push(func);                                                                                // 17
  } else {                                                                                                  // 18
    readyDep.depend();                                                                                      // 19
    return FView.isReady;                                                                                   // 20
  }                                                                                                         // 21
};                                                                                                          // 22
FView.runReadies = function() {                                                                             // 23
  FView.isReady = true;                                                                                     // 24
  readyDep.changed();                                                                                       // 25
  while(readyQueue.length) {                                                                                // 26
    (readyQueue.shift())();                                                                                 // 27
  }                                                                                                         // 28
};                                                                                                          // 29
                                                                                                            // 30
postFirstAddQueue = [];                                                                                     // 31
FView.postFirstAdd = function(func) {                                                                       // 32
  postFirstAddQueue.push(func);                                                                             // 33
};                                                                                                          // 34
                                                                                                            // 35
// famous-views globals from Famous                                                                         // 36
Engine = null;                                                                                              // 37
Transform = null;                                                                                           // 38
                                                                                                            // 39
if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')                                       // 40
define(function(require) {                                                                                  // 41
//  console.log(1);                                                                                         // 42
});                                                                                                         // 43
                                                                                                            // 44
/*                                                                                                          // 45
 * This must be an exact copy of the function from famous.core.Engine                                       // 46
 * which is not public.  We only use it if famousContext is a direct                                        // 47
 * child of the document body.  Current as of 0.3.1.                                                        // 48
 */                                                                                                         // 49
initializeFamous = function() {                                                                             // 50
  // prevent scrolling via browser                                                                          // 51
  window.addEventListener('touchmove', function(event) {                                                    // 52
      event.preventDefault();                                                                               // 53
  }, true);                                                                                                 // 54
  document.body.classList.add('famous-root');                                                               // 55
  document.documentElement.classList.add('famous-root');                                                    // 56
};                                                                                                          // 57
                                                                                                            // 58
FView.startup = function() {                                                                                // 59
  log.debug('Current logging default is "debug" (for localhost).  ' +                                       // 60
    'Change in your app with Logger.setLevel("famous-views", "info");');                                    // 61
  FView.startedUp = true;                                                                                   // 62
                                                                                                            // 63
  // Globals for inside all of famous-views                                                                 // 64
  Engine = famous.core.Engine;                                                                              // 65
  Engine.setOptions({appMode: false});                                                                      // 66
  Transform = famous.core.Transform;                                                                        // 67
                                                                                                            // 68
                                                                                                            // 69
  // Required document.body                                                                                 // 70
  Meteor.startup(function() {                                                                               // 71
                                                                                                            // 72
    // Sanity check, disallow templates with same name as a View                                            // 73
    var names = [];                                                                                         // 74
    for (var name in FView.views)                                                                           // 75
      if (Template[name])                                                                                   // 76
        names.push(name);                                                                                   // 77
    if (names.length)                                                                                       // 78
      throw new Error("You have created Template(s) with the same name " +                                  // 79
        "as these famous-views: " + names.join(', ') +                                                      // 80
        '.  Nothing will work until you rename them.');                                                     // 81
                                                                                                            // 82
    /*                                                                                                      // 83
    THIS WAS MOVED TO meteorFamousView.js AND IS ONLY CALLED IF A                                           // 84
    VIEW IS CREATED IN LIMBO AND FVIEW.MAINCTX IS UNSET                                                     // 85
    if (!FView.mainCtx) {                                                                                   // 86
      if (typeof FView.mainCtx === 'undefined')                                                             // 87
        log.debug('Creating a new main context.  If you already have '                                      // 88
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '                            // 89
          + 'rid of this warning, or null to not set a mainContext)');                                      // 90
      if (FView.mainCtx !== null) {                                                                         // 91
        var view = FView.famousContext.constructView();                                                     // 92
        var wrapped = Blaze.With({ id:"mainCtx", style:"" },                                                // 93
          function() { return view });                                                                      // 94
        wrapped.__isTemplateWith = true;                                                                    // 95
        Blaze.render(wrapped, document.body);                                                               // 96
                                                                                                            // 97
        /*                                                                                                  // 98
         * Mostly for old way of using iron-router (pre #famousContext)                                     // 99
         * In future, we could return after Blaze.render                                                    // 100
         * and move stuff below to inside arendered callback */                                             // 101
         /*                                                                                                 // 102
        Tracker.flush();                                                                                    // 103
                                                                                                            // 104
        FView.mainCtx = FView.byId("mainCtx").context;                                                      // 105
      }                                                                                                     // 106
    }                                                                                                       // 107
    */                                                                                                      // 108
                                                                                                            // 109
    // Note, various views are registered here                                                              // 110
    FView.runReadies();                                                                                     // 111
                                                                                                            // 112
    if (Template.famousInit)                                                                                // 113
      Blaze.render(Template.famousInit, document.body);                                                     // 114
  });                                                                                                       // 115
};                                                                                                          // 116
                                                                                                            // 117
FView.isReady = false;                                                                                      // 118
                                                                                                            // 119
// Imports from weak deps                                                                                   // 120
/*                                                                                                          // 121
if (Package['mjnetworks:famous'])                                                                           // 122
  // @famono ignore                                                                                         // 123
  famous = Package['mjnetworks:famous'].famous;                                                             // 124
else if (Package['mjnetworks:mj-famous'])                                                                   // 125
  // @famono ignore                                                                                         // 126
  famous = Package['mjnetworks:mj-famous'].famous;                                                          // 127
*/                                                                                                          // 128
                                                                                                            // 129
// Load as ealry as possible, and keep trying                                                               // 130
if (typeof(famous) !== 'undefined') {                                                                       // 131
  log.debug("Starting up.  famous global found while loading package, great!");                             // 132
  FView.startup();                                                                                          // 133
}                                                                                                           // 134
else                                                                                                        // 135
  Meteor.startup(function() {                                                                               // 136
    if (typeof(famous) !== 'undefined') {                                                                   // 137
      log.debug("Starting up.  famous global found during Meteor.startup()");                               // 138
      FView.startup();                                                                                      // 139
    } else {                                                                                                // 140
      log.debug("No famous global available in Meteor.startup().  Call FView.startup() when appropriate."); // 141
    }                                                                                                       // 142
  });                                                                                                       // 143
                                                                                                            // 144
var optionEval = function(string, key) {                                                                    // 145
  if (FView.attrEvalAllowedKeys && (FView.attrEvalAllowedKeys == '*' ||                                     // 146
      FView.attrEvalAllowedKeys.indexOf(key) > -1)) {                                                       // 147
    /* jshint ignore:start */                                                                               // 148
    // Obviously this is "safe" since it's been whitelisted by app author                                   // 149
    return eval(string.substr(5));  // strip "eval:"                                                        // 150
    /* jshint ignore:end */                                                                                 // 151
  } else {                                                                                                  // 152
    throw new Error("[famous-views] Blocked " + key + '="' + string + '".  ' +                              // 153
      'Set FView.attrEvalAllowedKeys = "*" or FView.attrEvalAllowedKeys = ["' +                             // 154
      key + '"] and make sure you understand the security implications. ' +                                 // 155
      'Particularly, make sure none of your helper functions return a string ' +                            // 156
      'that can be influenced by client-side input');                                                       // 157
    }                                                                                                       // 158
};                                                                                                          // 159
                                                                                                            // 160
var optionBlaze = function(string, key, blazeView) {                                                        // 161
  // temporary, for options that get called (wrongly!) from init as well                                    // 162
  // or maybe that is the right place and render is the wrong place :)                                      // 163
  if (!blazeView)                                                                                           // 164
    return '__FVIEW::SKIP__';                                                                               // 165
                                                                                                            // 166
  var args = string.substr(2, string.length-4).split(" ");                                                  // 167
  var view = blazeView, value;                                                                              // 168
  while (view.name.substr(0,9) !== 'Template.')                                                             // 169
    view = view.parentView;                                                                                 // 170
  value = view.lookup(args.splice(0,1)[0]);                                                                 // 171
                                                                                                            // 172
  // Scalar value from data context                                                                         // 173
  if (typeof value !== 'function')                                                                          // 174
    return value;                                                                                           // 175
                                                                                                            // 176
  // Reactive value from helper                                                                             // 177
  Engine.defer(function() {                                                                                 // 178
    blazeView.autorun(function() {                                                                          // 179
      var run = value.apply(null, args);                                                                    // 180
      blazeView.fview._view.attrUpdate.call(blazeView.fview, key, run);                                     // 181
    });                                                                                                     // 182
  });                                                                                                       // 183
                                                                                                            // 184
  return '__FVIEW::SKIP__';                                                                                 // 185
};                                                                                                          // 186
                                                                                                            // 187
optionString = function(string, key, blazeView) {                                                           // 188
  // special handling based on special key names                                                            // 189
  if (key === 'direction')                                                                                  // 190
    return famous.utilities.Utility.Direction[string];                                                      // 191
  if (key === 'id')                                                                                         // 192
    return string;                                                                                          // 193
                                                                                                            // 194
  // general string handling                                                                                // 195
  if (string.substr(0,5) == 'eval:')                                                                        // 196
    return optionEval(string, key);                                                                         // 197
  if (string == 'undefined')                                                                                // 198
    return undefined;                                                                                       // 199
  if (string == 'true')                                                                                     // 200
    return true;                                                                                            // 201
  if (string == 'false')                                                                                    // 202
    return false;                                                                                           // 203
  if (string === null)                                                                                      // 204
    return null;                                                                                            // 205
                                                                                                            // 206
  if (string.substr(0,2) === '{{')                                                                          // 207
    return optionBlaze(string, key, blazeView);                                                             // 208
                                                                                                            // 209
  if (string[0] == '[' || string[0] == '{') {                                                               // 210
    var obj;                                                                                                // 211
    string = string.replace(/\bauto\b/g, '"auto"');                                                         // 212
    string = string.replace(/undefined/g, '"__undefined__"');                                               // 213
    // JSON can't parse values like ".5" so convert them to "0.5"                                           // 214
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');                                        // 215
                                                                                                            // 216
    try {                                                                                                   // 217
      obj = JSON.parse(string);                                                                             // 218
    }                                                                                                       // 219
    catch (err) {                                                                                           // 220
      log.error("Couldn't parse JSON, skipping: " + string);                                                // 221
      log.error(err);                                                                                       // 222
      return undefined;                                                                                     // 223
    }                                                                                                       // 224
                                                                                                            // 225
    // re-use of "key" variable from function args that's not needed anymore                                // 226
    for (key in obj)                                                                                        // 227
      if (obj[key] === '__undefined__')                                                                     // 228
        obj[key] = undefined;                                                                               // 229
    return obj;                                                                                             // 230
  } else {                                                                                                  // 231
    var float = parseFloat(string);                                                                         // 232
    if (!_.isNaN(float))                                                                                    // 233
      return float;                                                                                         // 234
    return string;                                                                                          // 235
  }                                                                                                         // 236
                                                                                                            // 237
  /*                                                                                                        // 238
  if (string == 'undefined')                                                                                // 239
    return undefined;                                                                                       // 240
  if (string == 'true')                                                                                     // 241
    return true;                                                                                            // 242
  if (string == 'false')                                                                                    // 243
    return false;                                                                                           // 244
  if (string.substr(0,1) == '[') {                                                                          // 245
    var out = [];                                                                                           // 246
    string = string.substr(1, string.length-2).split(',');                                                  // 247
    for (var i=0; i < string.length; i++)                                                                   // 248
      out.push(optionString(string[i].trim()));                                                             // 249
    return out;                                                                                             // 250
  }                                                                                                         // 251
  if (string.match(/^[0-9\.]+$/))                                                                           // 252
    return parseFloat(string);                                                                              // 253
  */                                                                                                        // 254
};                                                                                                          // 255
                                                                                                            // 256
handleOptions = function(data) {                                                                            // 257
  options = {};                                                                                             // 258
  for (var key in data) {                                                                                   // 259
    var value = data[key];                                                                                  // 260
    if (_.isString(value))                                                                                  // 261
      options[key] = optionString(value, key);                                                              // 262
    else                                                                                                    // 263
      options[key] = value;                                                                                 // 264
  }                                                                                                         // 265
  return options;                                                                                           // 266
};                                                                                                          // 267
                                                                                                            // 268
FView.transitions = {};                                                                                     // 269
FView.registerTransition = function (name, transition) {                                                    // 270
  check(name, String);                                                                                      // 271
  check(transition, Function);                                                                              // 272
                                                                                                            // 273
  FView.transitions[name] = transition;                                                                     // 274
};                                                                                                          // 275
                                                                                                            // 276
/* --- totally not done --- */                                                                              // 277
                                                                                                            // 278
FView.showTreeGet = function(renderNode) {                                                                  // 279
  var obj = renderNode._node._child._object;                                                                // 280
    if (obj.node)                                                                                           // 281
      obj.node = this.showTreeGet(obj.node);                                                                // 282
  return obj;                                                                                               // 283
};                                                                                                          // 284
FView.showTreeChildren = function(renderNode) {                                                             // 285
  var out = {}, i=0;                                                                                        // 286
  if (renderNode._node)                                                                                     // 287
    out['child'+(i++)] = this.showTreeGet(renderNode);                                                      // 288
  return out;                                                                                               // 289
};                                                                                                          // 290
FView.showTree = function() {                                                                               // 291
  console.log(this.showTreeChildren(mainCtx));                                                              // 292
};                                                                                                          // 293
                                                                                                            // 294
/* --- */                                                                                                   // 295
                                                                                                            // 296
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/meteorFamousView.js                                                  //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/*                                                                                                          // 1
 * Templates are always added to a MeteorFamousView ("fview"), in turn is                                   // 2
 * added to it's parent fview or a context.  This allows us to handle                                       // 3
 * situations where a template is later removed (since nodes cannot ever                                    // 4
 * be manually removed from the render tree).                                                               // 5
 *                                                                                                          // 6
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren                             // 7
 */                                                                                                         // 8
                                                                                                            // 9
var meteorFamousViews = {};                                                                                 // 10
var meteorFamousViewsCount = 0;                                                                             // 11
                                                                                                            // 12
MeteorFamousView = function(blazeView, options, noAdd) {                                                    // 13
  this.id = options.id || ++meteorFamousViewsCount;                                                         // 14
  meteorFamousViews[this.id] = this;                                                                        // 15
                                                                                                            // 16
  this.blazeView = blazeView;                                                                               // 17
  this.children = [];                                                                                       // 18
                                                                                                            // 19
  // this._callbacks = { destroy: [] };                                                                     // 20
                                                                                                            // 21
  if (noAdd)                                                                                                // 22
    return;                                                                                                 // 23
                                                                                                            // 24
  var parent = blazeView;                                                                                   // 25
  while ((parent=parent.parentView) && !parent.fview);                                                      // 26
  if (parent) {                                                                                             // 27
    parent = parent.fview;                                                                                  // 28
  } else {                                                                                                  // 29
    // backcompat with children created in limbo going to main context                                      // 30
    // but we should still only create that if we need to now                                               // 31
    if (!FView.mainCtx) {                                                                                   // 32
      if (typeof FView.mainCtx === 'undefined')                                                             // 33
        log.debug('Creating a new main context to maintain backwards ' +                                    // 34
          'compatibility.  Consider using ' +                                                               // 35
          '{{#famousContext id="mainCtx"}} in your body.');                                                 // 36
        /*                                                                                                  // 37
        log.debug('Creating a new main context.  If you already have '                                      // 38
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '                            // 39
          + 'rid of this warning, or null to not set a mainContext)');                                      // 40
        */                                                                                                  // 41
      if (FView.mainCtx !== null) {                                                                         // 42
        var view = FView.famousContext.constructView();                                                     // 43
        var wrapped = Blaze.With({ id:"mainCtx" },                                                          // 44
          function() { return view; });                                                                     // 45
        wrapped.__isTemplateWith = true;                                                                    // 46
        // Because of id:mainCtx, this populates FView.mainCtxFView                                         // 47
        Blaze.render(wrapped, document.body);                                                               // 48
      }                                                                                                     // 49
      parent = FView.mainCtxFView;                                                                          // 50
    } else {                                                                                                // 51
      // backcompat, user set FView.mainCtx manually                                                        // 52
                                                                                                            // 53
    }                                                                                                       // 54
  }                                                                                                         // 55
  //parent = parent ? parent.fview : { node: FView.mainCtx, children: [] };                                 // 56
                                                                                                            // 57
  this.parent = parent;                                                                                     // 58
                                                                                                            // 59
  // Keep track of fview children, since Meteor only tracks children in DOM                                 // 60
  parent.children.push(this);                                                                               // 61
                                                                                                            // 62
  // Adding to famous parent node, once done here, is now in famous.js                                      // 63
                                                                                                            // 64
  // Now we have a tree, and a FView.mainCtx if in appMode                                                  // 65
  if (postFirstAddQueue) {                                                                                  // 66
    for (var i=0; i < postFirstAddQueue.length; i++)                                                        // 67
      Engine.defer(postFirstAddQueue[i]);                                                                   // 68
    postFirstAddQueue = null;                                                                               // 69
    FView.postFirstAdd = function(func) {                                                                   // 70
      Engine.defer(postFirstAddQueue[i]);                                                                   // 71
    };                                                                                                      // 72
  }                                                                                                         // 73
};                                                                                                          // 74
                                                                                                            // 75
MeteorFamousView.prototype.render = function() {                                                            // 76
  if (this.isDestroyed)                                                                                     // 77
    return [];                                                                                              // 78
  if (this.node)                                                                                            // 79
    return this.node.render();                                                                              // 80
  console.log('render called before anything set');                                                         // 81
  return [];                                                                                                // 82
};                                                                                                          // 83
                                                                                                            // 84
MeteorFamousView.prototype.setNode = function(node) {                                                       // 85
  // surface or modifier/view                                                                               // 86
  this.node = new famous.core.RenderNode(node);                                                             // 87
  return this.node;                                                                                         // 88
};                                                                                                          // 89
                                                                                                            // 90
/*                                                                                                          // 91
  Replace fview.onDestroy = function() with fview.on('destroy', function)                                   // 92
  which can be called multiple times.  The old way will still work                                          // 93
  but will show a deprecation warning.                                                                      // 94
                                                                                                            // 95
MeteorFamousView.prototype.onDestroy = function() {                                                         // 96
  return '__original__';                                                                                    // 97
}                                                                                                           // 98
*/                                                                                                          // 99
                                                                                                            // 100
MeteorFamousView.prototype.preventDestroy = function() {                                                    // 101
  this.destroyPrevented = true;                                                                             // 102
};                                                                                                          // 103
                                                                                                            // 104
MeteorFamousView.prototype.destroy = function(isTemplateDestroy) {                                          // 105
  var fview = this;                                                                                         // 106
  log.debug('Destroying ' + (fview._view ?                                                                  // 107
    fview._view.name : (fview._modifier ? fview._modifier.name : fview.kind)) +                             // 108
    ' (#' + fview.id + ') and children' +                                                                   // 109
    (isTemplateDestroy&&fview.destroyPrevented ? ' (destroyPrevented)':''));                                // 110
                                                                                                            // 111
  // XXX ADD TO DOCS                                                                                        // 112
  if (isTemplateDestroy) {                                                                                  // 113
                                                                                                            // 114
    /*                                                                                                      // 115
    if (fview.onDestroy() === '__original__')                                                               // 116
      for (var i=0; i < fview._callbacks.destroy.length; i++)                                               // 117
        fview._calbacks.destroy[i].call(fview);                                                             // 118
    else                                                                                                    // 119
      log.warn('#' + fview.id + ' - you set fview.onDestroy = function().  '                                // 120
        + 'This will work for now '                                                                         // 121
        + 'but is deprecated.  Please use fview.onDestoy(callback), which may '                             // 122
        + 'be used multiple times, and receives the `fview` as `this`.');                                   // 123
    */                                                                                                      // 124
                                                                                                            // 125
    if (fview.onDestroy)                                                                                    // 126
      fview.onDestroy();                                                                                    // 127
                                                                                                            // 128
    if (fview.destroyPrevented) {                                                                           // 129
      // log.debug('  #' + fview.id + ' - destroyPrevented');                                               // 130
      return;                                                                                               // 131
    }                                                                                                       // 132
  }                                                                                                         // 133
                                                                                                            // 134
  // First delete children (via Blaze to trigger Template destroy callback)                                 // 135
  if (fview.children)                                                                                       // 136
    for (var i=0; i < fview.children.length; i++)                                                           // 137
      Blaze.remove(fview.children[i].blazeView);                                                            // 138
                                                                                                            // 139
  if (fview._view && fview._view.onDestroy)                                                                 // 140
    fview._view.onDestroy.call(fview);                                                                      // 141
                                                                                                            // 142
  fview.isDestroyed = true;                                                                                 // 143
  fview.node = null;                                                                                        // 144
  fview.view = null;                                                                                        // 145
  fview.modifier = null;                                                                                    // 146
  delete(meteorFamousViews[fview.id]);                                                                      // 147
                                                                                                            // 148
  // If we're part of a sequence, now is the time to remove ourselves                                       // 149
  if (fview.parent.sequence) {                                                                              // 150
    if (fview.sequence) {                                                                                   // 151
      // TODO, we're a child sequence, remove the child (TODO in sequencer.js)                              // 152
      // log.debug("child sequence");                                                                       // 153
    } else {                                                                                                // 154
      Engine.defer(function() {                                                                             // 155
        fview.parent.sequence.remove(fview);  // less flicker in a defer                                    // 156
      });                                                                                                   // 157
    }                                                                                                       // 158
  }                                                                                                         // 159
};                                                                                                          // 160
                                                                                                            // 161
MeteorFamousView.prototype.getSize = function() {                                                           // 162
  return this.node && this.node.getSize() || this.size || [true,true];                                      // 163
};                                                                                                          // 164
                                                                                                            // 165
throwError = function(startStr, object) {                                                                   // 166
  if (object instanceof Object)                                                                             // 167
    console.error(object);                                                                                  // 168
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or ' +                             // 169
      'DOM node, but got ' + object);                                                                       // 170
};                                                                                                          // 171
                                                                                                            // 172
FView.from = function(viewOrTplorEl) {                                                                      // 173
  if (viewOrTplorEl instanceof Blaze.View)                                                                  // 174
    return FView.fromBlazeView(viewOrTplorEl);                                                              // 175
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)                                                 // 176
    return FView.fromTemplate(viewOrTplorEl);                                                               // 177
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')                                     // 178
    return FView.fromElement(viewOrTplorEl);                                                                // 179
  else {                                                                                                    // 180
    throwError('FView.getData() expects BlazeView or TemplateInstance or ' +                                // 181
        'DOM node, but got ', viewOrTplorEl);                                                               // 182
  }                                                                                                         // 183
};                                                                                                          // 184
                                                                                                            // 185
FView.fromBlazeView = FView.dataFromView = function(view) {                                                 // 186
  while (!view.fview && (view=view.parentView));                                                            // 187
  return view ? view.fview : undefined;                                                                     // 188
};                                                                                                          // 189
                                                                                                            // 190
FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {                                       // 191
  return this.dataFromView(tplInstance.view);                                                               // 192
};                                                                                                          // 193
                                                                                                            // 194
FView.fromElement = FView.dataFromElement = function(el) {                                                  // 195
  var view = Blaze.getView(el);                                                                             // 196
  return this.dataFromView(view);                                                                           // 197
};                                                                                                          // 198
                                                                                                            // 199
FView.byId = function(id) {                                                                                 // 200
  return meteorFamousViews[id];                                                                             // 201
};                                                                                                          // 202
                                                                                                            // 203
// Leave as alias?  Deprecate?                                                                              // 204
FView.dataFromCmp = FView.dataFromComponent;                                                                // 205
FView.dataFromTpl = FView.dataFromTemplate;                                                                 // 206
                                                                                                            // 207
FView.dataFromComponent = function(component) {                                                             // 208
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");      // 209
  return FView.fromBlazeView(component);                                                                    // 210
};                                                                                                          // 211
                                                                                                            // 212
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/sequencer.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* Sequencer and childSequence */                                                                           // 1
                                                                                                            // 2
sequencer = function(parent) {                                                                              // 3
  this._sequence = [];                                                                                      // 4
  this._children = [];                                                                                      // 5
                                                                                                            // 6
  if (parent) {                                                                                             // 7
    this.parent = parent;                                                                                   // 8
    this.childNo = parent._children.length;                                                                 // 9
    this.startIndex = parent._sequence.length;                                                              // 10
  }                                                                                                         // 11
};                                                                                                          // 12
                                                                                                            // 13
// TODO, refactor + cleanup for constructor                                                                 // 14
sequencer.prototype.child = function(index) {                                                               // 15
  var child = new sequencer(this);                                                                          // 16
                                                                                                            // 17
  if (typeof index !== 'undefined') {                                                                       // 18
    child.childNo = index;                                                                                  // 19
    child.startIndex = index < this._children.length ?                                                      // 20
      this._children[index].startIndex : this._sequence.length;                                             // 21
    // Recall for below loop that child has not been inserted yet                                           // 22
    for (var i=index; i < this._children.length; i++)                                                       // 23
      this._children[i].childNo++;                                                                          // 24
  } else                                                                                                    // 25
    index = this._children.length;                                                                          // 26
                                                                                                            // 27
  this._children.splice(index, 0, child);                                                                   // 28
  return child;                                                                                             // 29
};                                                                                                          // 30
                                                                                                            // 31
/*                                                                                                          // 32
 * For both functions below:                                                                                // 33
 *                                                                                                          // 34
 *   1. Splice into correct position in parent sequencer's _sequence                                        // 35
 *   2. Update the startIndex of all siblings born after us                                                 // 36
 *   3. Modify our own _sequence                                                                            // 37
 */                                                                                                         // 38
                                                                                                            // 39
sequencer.prototype.push = function(value) {                                                                // 40
  if (this.parent) {                                                                                        // 41
    this.parent.splice(this.startIndex+this._sequence.length, 0, value);                                    // 42
    for (var i=this.childNo+1; i < this.parent._children.length; i++) {                                     // 43
      this.parent._children[i].startIndex++;                                                                // 44
    }                                                                                                       // 45
  }                                                                                                         // 46
  return this._sequence.push(value);                                                                        // 47
};                                                                                                          // 48
                                                                                                            // 49
sequencer.prototype.splice = function(index, howMany /*, arguments */) {                                    // 50
  if (!this.parent)                                                                                         // 51
    return this._sequence.splice.apply(this._sequence, arguments);                                          // 52
                                                                                                            // 53
  var diff, max = this._sequence.length - index;                                                            // 54
  if (howMany > max) howMany = max;                                                                         // 55
  diff = (arguments.length - 2) - howMany; // inserts - howMany                                             // 56
                                                                                                            // 57
  for (var i=this.childNo+1; i < this.parent._children.length; i++)                                         // 58
    this.parent._children[i].startIndex += diff;                                                            // 59
                                                                                                            // 60
  this._sequence.splice.apply(this._sequence, arguments);                                                   // 61
  // add startIndex and re-use args                                                                         // 62
  arguments[0] += this.startIndex;  // jshint ignore:line                                                   // 63
  return this.parent.splice.apply(this.parent, arguments);                                                  // 64
};                                                                                                          // 65
                                                                                                            // 66
/*                                                                                                          // 67
 * Currently we don't keep track of our children and descedent children separately,                         // 68
 * so grandChild.push(x) && parent.remove(x) would break everything.  That's                                // 69
 * because x lands up in our top-level list, and there's nothing to stop us                                 // 70
 * from removing it from the wrong place (and breaking all indexes).  Although as                           // 71
 * long as we don't mistakenly do this in our code, the only way this can happen                            // 72
 * is if x exists in both the grandParent and grandChild (not supported).                                   // 73
 */                                                                                                         // 74
sequencer.prototype.remove = function(value /*, suspectedIndex */) {                                        // 75
  var index;                                                                                                // 76
  for (index=0; index < this._sequence.length; index++)                                                     // 77
    if (this._sequence[index] === value)                                                                    // 78
      return this.splice(index, 1);                                                                         // 79
};                                                                                                          // 80
                                                                                                            // 81
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famous.js                                                            //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* Extend Meteor Template framework for .famousEvents() */                                                  // 1
Template.prototype.famousEvents = function (eventMap) {                                                     // 2
  var template = this;                                                                                      // 3
  template.__famousEventMaps = (template.__famousEventMaps || []);                                          // 4
  template.__famousEventMaps.push(eventMap);                                                                // 5
};                                                                                                          // 6
                                                                                                            // 7
function setupEvents(fview, template) {                                                                     // 8
  if (template.__famousEventMaps) {                                                                         // 9
    var target = fview.surface || fview.view;                                                               // 10
    _.each(template.__famousEventMaps, function(eventMap) {                                                 // 11
      for (var k in eventMap) {                                                                             // 12
        target.on(k, (function(k) {                                                                         // 13
          return function(/* arguments */) {                                                                // 14
            Array.prototype.push.call(arguments, fview);                                                    // 15
            eventMap[k].apply(this, arguments);                                                             // 16
          };                                                                                                // 17
        })(k)); // jshint ignore:line                                                                       // 18
      }                                                                                                     // 19
    });                                                                                                     // 20
  }                                                                                                         // 21
}                                                                                                           // 22
                                                                                                            // 23
// Used by famousEach too                                                                                   // 24
parentViewName = function(blazeView) {                                                                      // 25
  while (blazeView &&                                                                                       // 26
      (blazeView.name == "with" || blazeView.name == "(contentBlock)"))                                     // 27
    blazeView = blazeView.parentView;                                                                       // 28
  return blazeView ? blazeView.name : '(root)';                                                             // 29
};                                                                                                          // 30
                                                                                                            // 31
parentTemplateName = function(blazeView) {                                                                  // 32
  while (blazeView &&                                                                                       // 33
      !blazeView.name.match(/^Template/) && !blazeView.name.match(/^body_content/))                         // 34
    blazeView = blazeView.parentView;                                                                       // 35
  return blazeView ? blazeView.name : '(none)';                                                             // 36
};                                                                                                          // 37
                                                                                                            // 38
function famousCreated() {                                                                                  // 39
  var blazeView = this.view;                                                                                // 40
  var famousViewName = blazeView.name ? blazeView.name.substr(7) : "";                                      // 41
                                                                                                            // 42
  // don't re-use parent's data/attributes, don't mutate data object                                        // 43
  var inNewDataContext = blazeView.parentView && blazeView.parentView.__isTemplateWith;                     // 44
  var data = inNewDataContext ? _.clone(this.data) : {};                                                    // 45
                                                                                                            // 46
  // deprecate                                                                                              // 47
  if (!data.view && famousViewName === "")                                                                  // 48
    data.view = 'SequentialLayout';                                                                         // 49
  if (!data.view) data.view = famousViewName;                                                               // 50
  else if (!famousViewName) {                                                                               // 51
    famousViewName = data.view;                                                                             // 52
    blazeView.viewName = 'Famous.' + famousViewName;                                                        // 53
  }                                                                                                         // 54
                                                                                                            // 55
  // Deprecated 2014-08-17                                                                                  // 56
  if (data.size && _.isString(data.size) && data.size.substr(0,1) != '[')                                   // 57
    throw new Error('[famous-views] size="' + data.size + '" is deprecated, ' +                             // 58
      'please use size="['+ data.size + ']" instead');                                                      // 59
                                                                                                            // 60
  // See attribute parsing notes in README                                                                  // 61
  var options = handleOptions(data);                                                                        // 62
                                                                                                            // 63
  // These require special handling (but should still be moved elsewhere)                                   // 64
  if (options.translate) {                                                                                  // 65
    options.transform =                                                                                     // 66
      Transform.translate.apply(null, options.translate);                                                   // 67
    delete options.translate;                                                                               // 68
  }                                                                                                         // 69
  // any other transforms added here later must act on existing transform matrix                            // 70
                                                                                                            // 71
  var fview = blazeView.fview = new MeteorFamousView(blazeView, options);                                   // 72
                                                                                                            // 73
  var pViewName = parentViewName(blazeView.parentView);                                                     // 74
  var pTplName = parentTemplateName(blazeView.parentView);                                                  // 75
  log.debug('New ' + famousViewName + " (#" + fview.id + ')' +                                              // 76
    (data.template ?                                                                                        // 77
      ', content from "' + data.template + '"' :                                                            // 78
      ', content from inline block') +                                                                      // 79
    ' (parent: ' + pViewName +                                                                              // 80
    (pViewName == pTplName ? '' : ', template: ' + pTplName) + ')');                                        // 81
                                                                                                            // 82
  /*                                                                                                        // 83
  if (FView.viewOptions[data.view]                                                                          // 84
      && FView.viewOptions[data.view].childUiHooks) {                                                       // 85
    // if childUiHooks specified, store them here too                                                       // 86
    fview.childUiHooks = FView.viewOptions[data.view].childUiHooks;                                         // 87
  } else if (fview.parent.childUiHooks) {                                                                   // 88
    if (data.view == 'Surface') {                                                                           // 89
      fview.uiHooks = fview.parent.childUiHooks;                                                            // 90
    } else {                                                                                                // 91
      // Track descedents                                                                                   // 92
    }                                                                                                       // 93
    console.log('child ' + data.view);                                                                      // 94
  }                                                                                                         // 95
  */                                                                                                        // 96
                                                                                                            // 97
  var view, node, notReallyAView=false /* TODO :) */;                                                       // 98
                                                                                                            // 99
  // currently modifiers come via 'view' arg, for now (and Surface)                                         // 100
  if (data.view /* != 'Surface' */) {                                                                       // 101
                                                                                                            // 102
    var registerable = FView._registerables[data.view];                                                     // 103
    if (!registerable)                                                                                      // 104
      throw new Error('Wanted view/modifier "' + data.view + '" but it ' +                                  // 105
        'doesn\'t exists.  Try FView.registerView/Modifier("'+ data.view +                                  // 106
        '", etc)');                                                                                         // 107
                                                                                                            // 108
    fview['_' + registerable.type] = registerable;        // fview._view                                    // 109
    node = registerable.create.call(fview, options);      // fview.node                                     // 110
    fview[registerable.type] = node;                      // fview.view                                     // 111
                                                                                                            // 112
    if (node.sequenceFrom) {                                                                                // 113
      fview.sequence = new sequencer();                                                                     // 114
      node.sequenceFrom(fview.sequence._sequence);                                                          // 115
    }                                                                                                       // 116
                                                                                                            // 117
  }                                                                                                         // 118
                                                                                                            // 119
  // If no modifier used, default to Modifier if origin/translate/etc used                                  // 120
  if (!data.modifier && !fview.modifier &&                                                                  // 121
      (data.origin || data.translate || data.transform ||                                                   // 122
      (data.size && !node.size)))                                                                           // 123
    data.modifier = 'Modifier';                                                                             // 124
                                                                                                            // 125
  // Allow us to prepend a modifier in a single template call                                               // 126
  if (data.modifier) {                                                                                      // 127
                                                                                                            // 128
    fview._modifier = FView._registerables[data.modifier];                                                  // 129
    fview.modifier = fview._modifier.create.call(fview, options);                                           // 130
                                                                                                            // 131
    if (node) {                                                                                             // 132
      fview.setNode(fview.modifier).add(node);                                                              // 133
      fview.view = node;                                                                                    // 134
    } else                                                                                                  // 135
      fview.setNode(fview.modifier);                                                                        // 136
                                                                                                            // 137
    if (fview._modifier.postRender)                                                                         // 138
      fview._modifier.postRender();                                                                         // 139
                                                                                                            // 140
  } else if (node) {                                                                                        // 141
                                                                                                            // 142
    fview.setNode(node);                                                                                    // 143
                                                                                                            // 144
  }                                                                                                         // 145
                                                                                                            // 146
  // could do pipe=1 in template helper?                                                                    // 147
  if (fview.parent.pipeChildrenTo)                                                                          // 148
    fview.pipeChildrenTo = fview.parent.pipeChildrenTo;                                                     // 149
                                                                                                            // 150
  // think about what else this needs  XXX better name, documentation                                       // 151
  if (fview._view && fview._view.famousCreatedPost)                                                         // 152
    fview._view.famousCreatedPost.call(fview);                                                              // 153
                                                                                                            // 154
  // Render contents (and children)                                                                         // 155
  var newBlazeView, template, scopedView;                                                                   // 156
  if (blazeView.templateContentBlock) {                                                                     // 157
    if (data.template)                                                                                      // 158
      throw new Error("A block helper {{#View}} cannot also specify template=X");                           // 159
    // Called like {{#famous}}inlineContents{{/famous}}                                                     // 160
    template = blazeView.templateContentBlock;                                                              // 161
  } else if (data.template) {                                                                               // 162
    template = Template[data.template];                                                                     // 163
    if (!template)                                                                                          // 164
      throw new Error('Famous called with template="' + data.template +                                     // 165
        '" but no such template exists');                                                                   // 166
    fview.template = template;                                                                              // 167
  } else {                                                                                                  // 168
    // Called with inclusion operator but not template {{>famous}}                                          // 169
    throw new Error("No template='' specified");                                                            // 170
  }                                                                                                         // 171
                                                                                                            // 172
  // Avoid Blaze running rendered() before it's actually on the DOM                                         // 173
  // Delete must happen before Blaze.render() called.                                                       // 174
  if (data.view == 'Surface' && template.rendered) {                                                        // 175
    template.onDocumentDom = template.rendered;                                                             // 176
    delete template.rendered;                                                                               // 177
  }                                                                                                         // 178
                                                                                                            // 179
  newBlazeView = template.constructView();                                                                  // 180
  setupEvents(fview, template);                                                                             // 181
                                                                                                            // 182
  if (inNewDataContext) {                                                                                   // 183
    scopedView = Blaze._TemplateWith(                                                                       // 184
      data.data || Blaze._parentData(1) && Blaze._parentData(1, true) || {},                                // 185
      function() { return newBlazeView; }                                                                   // 186
    );                                                                                                      // 187
  }                                                                                                         // 188
                                                                                                            // 189
  if (data.view === 'Surface') {                                                                            // 190
                                                                                                            // 191
    // in views/Surface.js; materialization happens via Blaze.render()                                      // 192
    fview.surfaceBlazeView = newBlazeView;                                                                  // 193
    templateSurface(fview, scopedView || newBlazeView, blazeView, options,                                  // 194
      data.template ||                                                                                      // 195
        parentTemplateName(blazeView.parentView).substr(9) + '_inline');                                    // 196
                                                                                                            // 197
  } else {                                                                                                  // 198
                                                                                                            // 199
    materializeView(scopedView || newBlazeView, blazeView);                                                 // 200
    /*                                                                                                      // 201
     * Currently, we run this before we're added to the Render Tree, to                                     // 202
     * allow the rendered() callback to move us off screen before entrance,                                 // 203
     * etc.  In future, might be better to specify original position as                                     // 204
     * attributes, and then just do the animation in callback after we're                                   // 205
     * added to the tree                                                                                    // 206
     */                                                                                                     // 207
    if (template.rendered) {                                                                                // 208
      template.rendered.call(newBlazeView._templateInstance);                                               // 209
    }                                                                                                       // 210
  }                                                                                                         // 211
                                                                                                            // 212
  // XXX name, documentation                                                                                // 213
  // after render, templateSurface, etc                                                                     // 214
  if (fview._view && fview._view.postRender)                                                                // 215
    fview._view.postRender.call(fview);                                                                     // 216
                                                                                                            // 217
  /*                                                                                                        // 218
   * This is the final step where the fview is added to Famous Render Tree                                  // 219
   * By deferring the actual add we can prevent flicker from various causes                                 // 220
   */                                                                                                       // 221
                                                                                                            // 222
  var parent = fview.parent;                                                                                // 223
  Engine.defer(function() {                                                                                 // 224
    /*                                                                                                      // 225
     * Blaze allows for situations where templates may be created and destroyed,                            // 226
     * without being rendered.  We should accomodate this better by not                                     // 227
     * rendering unnecessarily, but in the meantime, let's make sure at least                               // 228
     * that we don't crash.  TODO                                                                           // 229
     *                                                                                                      // 230
     * E.g. subscription + cursor with sort+limit                                                           // 231
     */                                                                                                     // 232
    if (fview.isDestroyed)                                                                                  // 233
      return;                                                                                               // 234
                                                                                                            // 235
    if (parent._view && parent._view.add)                                                                   // 236
      // views can explicitly handle how their children should be added                                     // 237
      parent._view.add.call(parent, fview, options);                                                        // 238
    else if (parent.sequence)                                                                               // 239
      // 'sequence' can be an array, sequencer or childSequencer, it doesn't matter                         // 240
      parent.sequence.push(fview);                                                                          // 241
    else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))                      // 242
      // compView->compView.  long part above is temp hack for template rerender #2010                      // 243
      parent.setNode(fview);                                                                                // 244
    else                                                                                                    // 245
      // default case, just use the add method                                                              // 246
      parent.node.add(fview);                                                                               // 247
                                                                                                            // 248
    // XXX another undocumented... consolidate names and document                                           // 249
    // e.g. famousCreatedPost; and is modifier.postRender documented?                                       // 250
    if (fview._view && fview._view.onRenderTree)                                                            // 251
      fview._view.onRenderTree.call(fview);                                                                 // 252
  });                                                                                                       // 253
}                                                                                                           // 254
                                                                                                            // 255
/*                                                                                                          // 256
 * Here we emulate the flow of Blaze._materializeView but avoid all                                         // 257
 * DOM stuff, since we don't need it                                                                        // 258
 */                                                                                                         // 259
var materializeView = function(view, parentView) {                                                          // 260
  Blaze._createView(view, parentView);                                                                      // 261
                                                                                                            // 262
  var lastHtmljs;                                                                                           // 263
  Tracker.nonreactive(function() {                                                                          // 264
    view.autorun(function doFamousRender(c) {                                                               // 265
      view.renderCount++;                                                                                   // 266
      view._isInRender = true;                                                                              // 267
      var htmljs = view._render(); // <-- only place invalidation happens                                   // 268
      view._isInRender = false;                                                                             // 269
                                                                                                            // 270
      Tracker.nonreactive(function doFamousMaterialize() {                                                  // 271
        var materializer = new Blaze._DOMMaterializer({parentView: view});                                  // 272
        materializer.visit(htmljs, []);                                                                     // 273
        if (c.firstRun || !Blaze._isContentEqual(lastHtmljs, htmljs)) {                                     // 274
          if (c.firstRun)                                                                                   // 275
            view.isRendered = true;                                                                         // 276
          // handle this elsewhere                                                                          // 277
          // Blaze._fireCallbacks(view, 'rendered');                                                        // 278
        }                                                                                                   // 279
      });                                                                                                   // 280
      lastHtmljs = htmljs;                                                                                  // 281
    });                                                                                                     // 282
  });                                                                                                       // 283
};                                                                                                          // 284
                                                                                                            // 285
/*                                                                                                          // 286
 * This is called by Blaze when the View/Template is destroyed,                                             // 287
 * e.g. {{#if 0}}{{#Scrollview}}{{/if}}.  When this happens we need to:                                     // 288
 *                                                                                                          // 289
 * 1) Destroy children (Blaze won't do it since it's not in the DOM),                                       // 290
 *    and any "eaches" that may have been added from a famousEach.                                          // 291
 * 2) Call fview.destroy() which handles cleanup w.r.t. famous,                                             // 292
 *    which lives in meteorFamousView.js.                                                                   // 293
 *                                                                                                          // 294
 * It's possible we want to have the "template" destroyed but not the                                       // 295
 * fview in the render tree to do a graceful exit animation, etc.                                           // 296
 */                                                                                                         // 297
function famousDestroyed() {                                                                                // 298
  this.view.fview.destroy(true);                                                                            // 299
}                                                                                                           // 300
                                                                                                            // 301
// Keep this at the bottom; Firefox doesn't do function hoisting                                            // 302
                                                                                                            // 303
FView.famousView = new Template(                                                                            // 304
  'famous',           // viewName: "famous"                                                                 // 305
  function() {        // Blaze.View "renderFunc"                                                            // 306
    var blazeView = this;                                                                                   // 307
    var data = Blaze.getData(blazeView);                                                                    // 308
    var tpl = blazeView._templateInstance;                                                                  // 309
    var fview = blazeView.fview;                                                                            // 310
                                                                                                            // 311
    var changed = {};                                                                                       // 312
    var orig = {};                                                                                          // 313
    for (var key in data) {                                                                                 // 314
      var value = data[key];                                                                                // 315
      if (typeof value === "string")                                                                        // 316
        value = optionString(value, key, blazeView);                                                        // 317
      if (value === '__FVIEW::SKIP__')                                                                      // 318
        continue;                                                                                           // 319
      if (!EJSON.equals(value, tpl.data[key]) || !blazeView.hasRendered) {                                  // 320
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;                                           // 321
        changed[key] = tpl.data[key] = value;                                                               // 322
      }                                                                                                     // 323
    }                                                                                                       // 324
                                                                                                            // 325
    /*                                                                                                      // 326
     * Think about:                                                                                         // 327
     *                                                                                                      // 328
     * 1) Should the function get the old value or all old data too?                                        // 329
     * 2) Should the function get all the new data, but translated?                                         // 330
     *                                                                                                      // 331
     */                                                                                                     // 332
                                                                                                            // 333
    _.each(['modifier', 'view'], function(node) {                                                           // 334
                                                                                                            // 335
      // If the fview has a modifier or view                                                                // 336
      var what = '_' + node;                                                                                // 337
      if (fview[what]) {                                                                                    // 338
        if (fview[what].attrUpdate) {                                                                       // 339
          // If that mod/view wants to finely handle reactive updates                                       // 340
          for (var key in changed)                                                                          // 341
            fview[what].attrUpdate.call(fview,                                                              // 342
              key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);                              // 343
        } else if (fview[node].setOptions && blazeView.hasRendered) {                                       // 344
          // Otherwise if it has a setOptions                                                               // 345
          fview[node].setOptions(tpl.data);                                                                 // 346
        }                                                                                                   // 347
      }                                                                                                     // 348
                                                                                                            // 349
    });                                                                                                     // 350
                                                                                                            // 351
//    console.log(view);                                                                                    // 352
    blazeView.hasRendered = true;                                                                           // 353
    return null;                                                                                            // 354
  }                                                                                                         // 355
);                                                                                                          // 356
                                                                                                            // 357
Blaze.registerHelper('famous', FView.famousView);                                                           // 358
FView.famousView.created = famousCreated;                                                                   // 359
FView.famousView.destroyed = famousDestroyed;                                                               // 360
                                                                                                            // 361
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famousEach.js                                                        //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
function famousEachRender(eachView, template, argFunc) {                                                    // 1
  var fview = eachView.fview;                                                                               // 2
  var sequence = fview.sequence;            // fviews for Famous Render Tree                                // 3
  var children = fview.children = [];       // each contentBlock instance                                   // 4
                                                                                                            // 5
  // For Blaze.currentView (see blaze/builtins.js#each)                                                     // 6
  eachView.argVar = new Blaze.ReactiveVar();                                                                // 7
  eachView.autorun(function () {                                                                            // 8
    eachView.argVar.set(argFunc());                                                                         // 9
  }, eachView.parentView);                                                                                  // 10
                                                                                                            // 11
  eachView.stopHandle = ObserveSequence.observe(function () {                                               // 12
      return eachView.argVar.get();                                                                         // 13
    }, {                                                                                                    // 14
      addedAt: function (id, item, index) {                                                                 // 15
        Tracker.nonreactive(function () {                                                                   // 16
          var newItemView = Blaze.With(item, function() {                                                   // 17
            return template.constructView();                                                                // 18
          });                                                                                               // 19
                                                                                                            // 20
          /*                                                                                                // 21
           * This is the repeated block inside famousEach, but not the actual node/                         // 22
           * view/surface that gets created on render as this block's children.                             // 23
           * We create a pseudo-fview for this                                                              // 24
           */                                                                                               // 25
          newItemView.fview = new MeteorFamousView(null, {}, true /* noAdd */);                             // 26
          newItemView.fview.kind = 'famousEachBlock';                                                       // 27
                                                                                                            // 28
          if (fview.parent.pipeChildrenTo)                                                                  // 29
            newItemView.fview.pipeChildrenTo =                                                              // 30
              fview.parent.pipeChildrenTo;                                                                  // 31
                                                                                                            // 32
          // Maintain ordering with other deferred operations                                               // 33
          Engine.defer(function() {                                                                         // 34
            newItemView.fview.sequence = sequence.child(index);                                             // 35
            children.splice(index, 0, { blazeView: newItemView });                                          // 36
                                                                                                            // 37
            var unusedDiv = document.createElement('div');                                                  // 38
            Blaze.render(newItemView, unusedDiv, eachView);                                                 // 39
          });                                                                                               // 40
                                                                                                            // 41
          //Blaze.materializeView(newItemView, eachView);                                                   // 42
          //runRenderedCallback(newItemView);  // now called by Blaze.render                                // 43
        });                                                                                                 // 44
      },                                                                                                    // 45
      removedAt: function (id, item, index) {                                                               // 46
        Engine.defer(function() {                                                                           // 47
          Blaze.remove(children[index].blazeView);                                                          // 48
          children.splice(index, 1);                                                                        // 49
        });                                                                                                 // 50
      },                                                                                                    // 51
      changedAt: function (id, newItem, oldItem, index) {                                                   // 52
        Engine.defer(function() {                                                                           // 53
          children[index].blazeView.dataVar.set(newItem);                                                   // 54
        });                                                                                                 // 55
      },                                                                                                    // 56
      movedTo: function (id, doc, fromIndex, toIndex) {                                                     // 57
        Engine.defer(function () {                                                                          // 58
          var item = sequence.splice(fromIndex, 1)[0];                                                      // 59
          sequence.splice(toIndex, 0, item);                                                                // 60
                                                                                                            // 61
          item = children.splice(fromIndex, 1)[0];                                                          // 62
          children.splice(toIndex, 0, item);                                                                // 63
        });                                                                                                 // 64
      }                                                                                                     // 65
    });                                                                                                     // 66
}                                                                                                           // 67
                                                                                                            // 68
function famousEachCreated() {                                                                              // 69
  var blazeView = this.view;                                                                                // 70
  var fview = blazeView.fview = new MeteorFamousView(blazeView, {});                                        // 71
  fview.kind = 'famousEach';                                                                                // 72
                                                                                                            // 73
  log.debug('New famousEach' + " (#" + fview.id + ')' +                                                     // 74
    ' (parent: ' + parentViewName(blazeView.parentView) + ',' +                                             // 75
    ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                        // 76
                                                                                                            // 77
                                                                                                            // 78
  // Maintain order with other deferred operations                                                          // 79
  Engine.defer(function() {                                                                                 // 80
    fview.sequence = fview.parent.sequence.child();                                                         // 81
                                                                                                            // 82
    // Contents of {{#famousEach}}block{{/famousEach}}                                                      // 83
    if (blazeView.templateContentBlock)                                                                     // 84
      famousEachRender(blazeView, blazeView.templateContentBlock, function() {                              // 85
        return Blaze.getData(blazeView);                                                                    // 86
      });                                                                                                   // 87
  });                                                                                                       // 88
}                                                                                                           // 89
                                                                                                            // 90
function famousEachDestroyed() {                                                                            // 91
  this.view.fview.destroy(true);                                                                            // 92
}                                                                                                           // 93
                                                                                                            // 94
// Keep this at the bottom; Firefox doesn't do function hoisting                                            // 95
                                                                                                            // 96
FView.famousEachView = new Template(                                                                        // 97
  'famousEach',       // viewName: "famousEach"                                                             // 98
  function() {        // Blaze.View "renderFunc"                                                            // 99
    var view = this;  // Blaze.View, viewName "famousEach"                                                  // 100
    // console.log(view);                                                                                   // 101
    return null;                                                                                            // 102
  }                                                                                                         // 103
);                                                                                                          // 104
                                                                                                            // 105
Blaze.registerHelper('famousEach', FView.famousEachView);                                                   // 106
FView.famousEachView.created = famousEachCreated;                                                           // 107
FView.famousEachView.destroyed = famousEachDestroyed;                                                       // 108
                                                                                                            // 109
/*                                                                                                          // 110
FView.Each = function (argFunc, contentFunc, elseFunc) {                                                    // 111
  var eachView = Blaze.View('Feach', function() {                                                           // 112
    return null;                                                                                            // 113
  });                                                                                                       // 114
                                                                                                            // 115
  eachView.onCreated(function() {                                                                           // 116
    // For Blaze.currentView (see blaze/builtins.js#each)                                                   // 117
    eachView.autorun(function () {                                                                          // 118
      eachView.argVar.set(argFunc());                                                                       // 119
    }, eachView.parentView);                                                                                // 120
                                                                                                            // 121
                                                                                                            // 122
  });                                                                                                       // 123
                                                                                                            // 124
  return eachView;                                                                                          // 125
}                                                                                                           // 126
Blaze.registerHelper('famousEach', FView.Each);                                                             // 127
*/                                                                                                          // 128
                                                                                                            // 129
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famousIf.js                                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/*                                                                                                          // 1
 * In brief, on Create we setup a child sequence to serve as a placeholder for                              // 2
 * any children (so that order is retained).  On reactive render, we destroy any                            // 3
 * existing children and render the contentBlock / elseBlock (as our children).                             // 4
 * On destroy, we cleanup and remove (TODO) child sequence placeholder.                                     // 5
 */                                                                                                         // 6
                                                                                                            // 7
/* Other thoughts:                                                                                          // 8
 * - Currently this is only used to retain order in a sequence                                              // 9
 * - If used in a surface we could force rerun of autoHeight, etc?                                          // 10
 */                                                                                                         // 11
                                                                                                            // 12
function famousIfCreated() {                                                                                // 13
  var blazeView = this.view;                                                                                // 14
  var fview = blazeView.fview = new MeteorFamousView(blazeView, {});                                        // 15
                                                                                                            // 16
  log.debug('New famousIf' + " (#" + fview.id + ')' +                                                       // 17
    ' (parent: ' + parentViewName(blazeView.parentView) + ',' +                                             // 18
    ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                        // 19
                                                                                                            // 20
  fview.kind = 'famousIf';                                                                                  // 21
                                                                                                            // 22
  // Maintain ordering with other deferred operations                                                       // 23
  Engine.defer(function() {                                                                                 // 24
    if (fview.parent.sequence) {                                                                            // 25
      fview.sequence = fview.parent.sequence.child();                                                       // 26
    } else {                                                                                                // 27
      fview.setNode(null);                                                                                  // 28
      fview.parent.node.add(fview);                                                                         // 29
    }                                                                                                       // 30
  });                                                                                                       // 31
}                                                                                                           // 32
                                                                                                            // 33
function cleanupChildren(blazeView) {                                                                       // 34
  var children = blazeView.fview.children;                                                                  // 35
  for (var i=0; i < children.length; i++)                                                                   // 36
    Blaze.remove(children[i].blazeView);                                                                    // 37
                                                                                                            // 38
  var fview = blazeView.fview;                                                                              // 39
  if (fview.sequence) {                                                                                     // 40
    fview.setNode(null);                                                                                    // 41
    fview.children = [];                                                                                    // 42
  }                                                                                                         // 43
}                                                                                                           // 44
                                                                                                            // 45
function famousIfDestroyed() {                                                                              // 46
  this.view.fview.destroy(true);                                                                            // 47
}                                                                                                           // 48
                                                                                                            // 49
FView.famousIfView = new Template('famousIf', function() {                                                  // 50
  var blazeView = this;                                                                                     // 51
  var condition = Blaze.getData(blazeView);                                                                 // 52
                                                                                                            // 53
  log.debug('famousIf' + " (#" + blazeView.fview.id + ')' +                                                 // 54
    ' is now ' + !!condition +                                                                              // 55
    ' (parent: ' + parentViewName(blazeView.parentView) + ',' +                                             // 56
    ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                        // 57
                                                                                                            // 58
  var dataContext = null /* this.data.data */ ||                                                            // 59
    Blaze._parentData(1) && Blaze._parentData(1, true) ||                                                   // 60
    Blaze._parentData(0) && Blaze._parentData(0, true) ||                                                   // 61
    {};                                                                                                     // 62
                                                                                                            // 63
  var unusedDiv = document.createElement('div');                                                            // 64
  var template = blazeView.templateContentBlock;                                                            // 65
                                                                                                            // 66
  // Maintain order with other deferred operations                                                          // 67
  Engine.defer(function() {                                                                                 // 68
    // Any time condition changes, remove all old children                                                  // 69
    cleanupChildren(blazeView);                                                                             // 70
                                                                                                            // 71
    var template = condition ?                                                                              // 72
      blazeView.templateContentBlock : blazeView.templateElseBlock;                                         // 73
                                                                                                            // 74
    if (template)                                                                                           // 75
      Blaze.renderWithData(template, dataContext, unusedDiv, null, blazeView);                              // 76
  });                                                                                                       // 77
});                                                                                                         // 78
                                                                                                            // 79
Blaze.registerHelper('famousIf', FView.famousIfView);                                                       // 80
FView.famousIfView.created = famousIfCreated;                                                               // 81
FView.famousIfView.destroyed = famousIfDestroyed;                                                           // 82
                                                                                                            // 83
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famousContext.js                                                     //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
// Flag for inserting CSS rules only if at least one context is declared.                                   // 1
var isFamousContextDeclared = false;                                                                        // 2
                                                                                                            // 3
var famousContext = new Template('famousContext', function () {                                             // 4
  // Only inject CSS rules if a famousContext is created                                                    // 5
  if (!isFamousContextDeclared) {                                                                           // 6
    var css = new CSSC();                                                                                   // 7
    css.add('div.fview-context', {                                                                          // 8
      webkitTransformStyle: 'preserve-3d',                                                                  // 9
      transformStyle: 'preserve-3d',                                                                        // 10
      webkitBackfaceVisibility: 'visible',                                                                  // 11
      backfaceVisibility: 'visible',                                                                        // 12
      pointerEvents: 'none',                                                                                // 13
      position: 'relative',                                                                                 // 14
      overflow: 'hidden',                                                                                   // 15
      width: '100%',                                                                                        // 16
      height: '100%'                                                                                        // 17
    });                                                                                                     // 18
  }                                                                                                         // 19
  // Ensure that no additional CSS rules for famousContext will get added.                                  // 20
  isFamousContextDeclared = true;                                                                           // 21
                                                                                                            // 22
  // don't re-use parent's data/attributes, don't mutate data object                                        // 23
  var inNewDataContext = this.parentView && this.parentView.__isTemplateWith;                               // 24
  var data = inNewDataContext ? _.clone(this.templateInstance().data) : {};                                 // 25
                                                                                                            // 26
  var fview = this.fview = new MeteorFamousView(this, data, true /*noAdd*/ );                               // 27
  fview.children = [];                                                                                      // 28
                                                                                                            // 29
  var pViewName = parentViewName(this.parentView);                                                          // 30
  var pTplName = parentTemplateName(this.parentView);                                                       // 31
  log.debug('New famousContext (#' + fview.id + ')' +                                                       // 32
    (data.template ?                                                                                        // 33
      ', content from "' + data.template + '"' :                                                            // 34
      ', content from inline block') +                                                                      // 35
    ' (parent: ' + pViewName +                                                                              // 36
    (pViewName == pTplName ? '' : ', template: ' + pTplName) + ')');                                        // 37
                                                                                                            // 38
  var divOptions = {};                                                                                      // 39
  if (!data.useParent) {                                                                                    // 40
    if (data.size) {                                                                                        // 41
      data.size = optionString(data.size, 'size');                                                          // 42
      for (var i = 0; i < 2; i++) {                                                                         // 43
        var size = data.size[i];                                                                            // 44
        if (size === true)                                                                                  // 45
          throw new Error("Can't use `true` size on famousContext");                                        // 46
        else if (!size)                                                                                     // 47
          data.size[i] = '100%';                                                                            // 48
        else                                                                                                // 49
          data.size[i] += 'px';                                                                             // 50
      }                                                                                                     // 51
      if (!data.style)                                                                                      // 52
        data.style = '';                                                                                    // 53
      data.style = "width: " + data.size[0];                                                                // 54
      data.style = "height: " + data.size[1];                                                               // 55
    }                                                                                                       // 56
                                                                                                            // 57
    if (typeof data.style === 'undefined' && data.id !== 'mainCtx')                                         // 58
      log.debug('^__ no style="" specified; you probably want to specify a ' +                              // 59
        'size, unless you\'re doing it via CSS on .fview-context');                                         // 60
                                                                                                            // 61
    divOptions.class = 'fview-context';                                                                     // 62
    if (data.id) divOptions.id = data.id;                                                                   // 63
    if (data.style) divOptions.style = data.style;                                                          // 64
    if (data.class) divOptions.class += ' ' + data.class;                                                   // 65
                                                                                                            // 66
    if (data.id === "mainCtx")                                                                              // 67
      FView.mainCtxFView = fview;                                                                           // 68
  }                                                                                                         // 69
                                                                                                            // 70
  var addQueue = [];                                                                                        // 71
  fview.node = fview.context = {                                                                            // 72
    add: function (node) {                                                                                  // 73
      addQueue.push(node);                                                                                  // 74
    }                                                                                                       // 75
  };                                                                                                        // 76
  if (data.id === "mainCtx")                                                                                // 77
    FView.mainCtx = fview.context;                                                                          // 78
                                                                                                            // 79
  this.onViewReady(function () {                                                                            // 80
    var container = data.useParent ? this._domrange.parentElement : this._domrange.members[0];              // 81
    fview.node = fview.context = Engine.createContext(container);                                           // 82
    if (data.id === "mainCtx")                                                                              // 83
      FView.mainCtx = fview.context;                                                                        // 84
                                                                                                            // 85
    for (var i = 0; i < addQueue.length; i++)                                                               // 86
      fview.node.add(addQueue[i]);                                                                          // 87
    addQueue = [];                                                                                          // 88
                                                                                                            // 89
    if (data.id === "mainCtx" || (container.parentNode === document.body &&                                 // 90
        document.body.childElementCount == 1)) {                                                            // 91
      initializeFamous();                                                                                   // 92
      $(container).removeClass('fview-context').addClass('famous-container');                               // 93
      window.dispatchEvent(new Event('resize'));                                                            // 94
    }                                                                                                       // 95
                                                                                                            // 96
    var template = data.template ? Template[data.template] : this.templateContentBlock;                     // 97
    if (!template)                                                                                          // 98
      return;                                                                                               // 99
                                                                                                            // 100
    if (inNewDataContext) {                                                                                 // 101
      var dataContext = data.data ||                                                                        // 102
        Blaze._parentData(1) && Blaze._parentData(1, true) || {};                                           // 103
      Blaze.renderWithData(template, dataContext, container, null, this);                                   // 104
    } else                                                                                                  // 105
      Blaze.render(template, container, null, this);                                                        // 106
  });                                                                                                       // 107
                                                                                                            // 108
  // what else do we need here?  some stuff is automatic because of div/DOM                                 // 109
  this.onViewDestroyed(function() {                                                                         // 110
    if (fview === FView.mainCtxFView)                                                                       // 111
      FView.mainCtxFView = null;                                                                            // 112
      FView.mainCtx = undefined;                                                                            // 113
  });                                                                                                       // 114
                                                                                                            // 115
  if (data.useParent)                                                                                       // 116
    return null;                                                                                            // 117
  else                                                                                                      // 118
    return HTML.DIV(divOptions);                                                                            // 119
});                                                                                                         // 120
                                                                                                            // 121
// Not usually necessary but let's make super sure we're ready :)                                           // 122
                                                                                                            // 123
famousContextWrapper = new Template('famousContextWrapper', function() {                                    // 124
  if (FView.ready()) {                                                                                      // 125
    var self = this;                                                                                        // 126
    var view = famousContext.constructView();                                                               // 127
    view.templateContentBlock = this.templateContentBlock;                                                  // 128
                                                                                                            // 129
    var withView = Blaze.With(                                                                              // 130
      function() { return Blaze.getData(self) || {}; },                                                     // 131
      function() { return view; }                                                                           // 132
    );                                                                                                      // 133
    withView.__isTemplateWith = true;                                                                       // 134
    return withView;                                                                                        // 135
  } else                                                                                                    // 136
    return null;                                                                                            // 137
});                                                                                                         // 138
                                                                                                            // 139
FView.ready(function() {                                                                                    // 140
  delete famousContextWrapper;                                                                              // 141
  delete Blaze._globalHelpers.famousContext;                                                                // 142
  delete Blaze._globalHelpers.FamousContext;                                                                // 143
  Blaze.Template.registerHelper('famousContext', famousContext);                                            // 144
  Blaze.Template.registerHelper('FamousContext', famousContext); // alias                                   // 145
});                                                                                                         // 146
                                                                                                            // 147
Blaze.Template.registerHelper('famousContext', famousContextWrapper);                                       // 148
Blaze.Template.registerHelper('FamousContext', famousContextWrapper); // alias                              // 149
FView.famousContext = famousContext;                                                                        // 150
                                                                                                            // 151
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/modifiers.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView._registerables = {};  // used in views.js too                                                         // 1
                                                                                                            // 2
function defaultCreate(options) {                                                                           // 3
  return new this._modifier.constructor(options);                                                           // 4
}                                                                                                           // 5
                                                                                                            // 6
/* Available in JS via `FView._registerables.Modifier` and in templates via                                 // 7
  `{{#famous modifier='Scrollview'}}` or just `{{#Modifier}}`. */                                           // 8
FView.registerModifier = function(name, modifier, options) {                                                // 9
  if (FView._registerables[name])                                                                           // 10
    return;                                                                                                 // 11
                                                                                                            // 12
  FView._registerables[name] = _.extend(                                                                    // 13
    { create: defaultCreate },                                                                              // 14
    options,                                                                                                // 15
    { name: name, constructor: modifier, type: 'modifier' }                                                 // 16
  );                                                                                                        // 17
                                                                                                            // 18
  var fview = FView.famousView;                                                                             // 19
  var tpl = new Template('Famous.' + name, fview.renderFunction);                                           // 20
  tpl.created = fview.created;                                                                              // 21
  tpl.destroyed = fview.destroyed;                                                                          // 22
  Blaze.registerHelper(name, tpl);                                                                          // 23
};                                                                                                          // 24
                                                                                                            // 25
FView.ready(function(require) {                                                                             // 26
  var Modifier = famous.core.Modifier;                                                                      // 27
                                                                                                            // 28
  /*                                                                                                        // 29
   * "Modifier" (the base class) should not be used for dynamic                                             // 30
   * updates (as per the docs deprecating setXXX methods).  As                                              // 31
   * such, we set up everything in `create` vs an `attrUpdate`                                              // 32
   * function.                                                                                              // 33
   */                                                                                                       // 34
  FView.registerModifier('Modifier', Modifier);                                                             // 35
                                                                                                            // 36
  /* simple short cuts below */                                                                             // 37
                                                                                                            // 38
  FView.registerModifier('identity', null, {                                                                // 39
    create: function(options) {                                                                             // 40
      return new Modifier(_.extend({                                                                        // 41
        transform : Transform.identity                                                                      // 42
      }, options));                                                                                         // 43
    }                                                                                                       // 44
  });                                                                                                       // 45
                                                                                                            // 46
  FView.registerModifier('inFront', null, {                                                                 // 47
    create: function(options) {                                                                             // 48
      return new Modifier(_.extend({                                                                        // 49
        transform : Transform.inFront                                                                       // 50
      }, options));                                                                                         // 51
    }                                                                                                       // 52
  });                                                                                                       // 53
                                                                                                            // 54
});                                                                                                         // 55
                                                                                                            // 56
/*                                                                                                          // 57
FView.modifiers.pageTransition = function(blazeView, options) {                                             // 58
  this.blazeView = blazeView;                                                                               // 59
  this.famous = new Modifier({                                                                              // 60
    transform : Transform.identity,                                                                         // 61
    opacity   : 1,                                                                                          // 62
    origin    : [-0.5, -0.5],                                                                               // 63
    size      : [100, 100]                                                                                  // 64
  });                                                                                                       // 65
};                                                                                                          // 66
                                                                                                            // 67
FView.modifiers.pageTransition.prototype.postRender = function() {                                          // 68
  this.famous.setOrigin([0,0], {duration : 5000});                                                          // 69
};                                                                                                          // 70
*/                                                                                                          // 71
                                                                                                            // 72
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views.js                                                             //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
/* Note, `modifiers.js` is called first, so FView.registerables exists */                                   // 1
                                                                                                            // 2
/* Available in JS via `FView._registerables.Scrollview` and in templates via                               // 3
  `{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */                                             // 4
FView.registerView = function(name, famousView, options) {                                                  // 5
  if (FView._registerables[name])                                                                           // 6
    return;                                                                                                 // 7
                                                                                                            // 8
  /*                                                                                                        // 9
  var tpl = _.clone(FView.famousView);                                                                      // 10
  tpl.viewName = 'Famous.' + name;                                                                          // 11
  console.log(tpl);                                                                                         // 12
  */                                                                                                        // 13
                                                                                                            // 14
  var fview = FView.famousView;                                                                             // 15
  var tpl = new Template('Famous.' + name, fview.renderFunction);                                           // 16
  tpl.created = fview.created;                                                                              // 17
  tpl.destroyed = fview.destroyed;                                                                          // 18
  Blaze.registerHelper(name, tpl);                                                                          // 19
                                                                                                            // 20
  FView._registerables[name] = _.extend(                                                                    // 21
    { create: defaultCreate },                                                                              // 22
    options || {},                                                                                          // 23
    { name: name, constructor: famousView, type: 'view' }                                                   // 24
  );                                                                                                        // 25
};                                                                                                          // 26
                                                                                                            // 27
function defaultCreate(options) {                                                                           // 28
  return new this._view.constructor(options);                                                               // 29
}                                                                                                           // 30
                                                                                                            // 31
/* Do we still need this?  Most people explicitly register views with                                       // 32
   registerView() these days, to get the template helper */                                                 // 33
/*                                                                                                          // 34
FView.getView = function(name)  {                                                                           // 35
  // @famono silent                                                                                         // 36
  if (FView.views[name])                                                                                    // 37
    return FView.views[name].constructor;                                                                   // 38
  if (typeof Famous !== 'undefined' && Famous[name])                                                        // 39
    return Famous[name];                                                                                    // 40
  if (typeof Famous !== 'undefined' && famous.Views && Famous.Views[name])                                  // 41
    return Famous.Views[name];                                                                              // 42
  if (typeof famous !== 'undefined' && famous.views && famous.views[name])                                  // 43
    return famous.views[name];                                                                              // 44
                                                                                                            // 45
  /// XXX temp for proof-of-concept                                                                         // 46
  if (FView.modifiers[name])                                                                                // 47
    return FView.modifiers[name].modifier;                                                                  // 48
                                                                                                            // 49
  else                                                                                                      // 50
    throw new Error('Wanted view "' + name + '" but it doesn\'t exists.'                                    // 51
      + ' Try FView.registerView("'+name+'", require(...))');                                               // 52
}                                                                                                           // 53
*/                                                                                                          // 54
                                                                                                            // 55
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/_simple.js                                                     //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('SequentialLayout', famous.views.SequentialLayout);                                    // 2
  FView.registerView('View', famous.core.View);                                                             // 3
});                                                                                                         // 4
                                                                                                            // 5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/ContainerSurface.js                                            //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('ContainerSurface', famous.surfaces.ContainerSurface, {                                // 2
                                                                                                            // 3
    add: function(child_fview, child_options) {                                                             // 4
      this.view.add(child_fview);                                                                           // 5
    },                                                                                                      // 6
                                                                                                            // 7
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 8
      if (key == 'overflow')                                                                                // 9
        this.view.setProperties({ overflow: value });                                                       // 10
      else if (key == 'class')                                                                              // 11
        this.view.setClasses(value.split(" "));                                                             // 12
      else if (key == 'perspective')                                                                        // 13
        this.view.context.setPerspective(value);                                                            // 14
    }                                                                                                       // 15
  });                                                                                                       // 16
});                                                                                                         // 17
                                                                                                            // 18
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/EdgeSwapper.js                                                 //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('EdgeSwapper', famous.views.EdgeSwapper, {                                             // 2
    add: function(child_fview, child_options) {                                                             // 3
      if (!this.view)                                                                                       // 4
        return;  // when?                                                                                   // 5
                                                                                                            // 6
      if (this.currentShow)                                                                                 // 7
        this.previousShow = this.currentShow;                                                               // 8
      this.currentShow = child_fview;                                                                       // 9
                                                                                                            // 10
      child_fview.preventDestroy();                                                                         // 11
                                                                                                            // 12
      var self = this;                                                                                      // 13
      this.view.show(child_fview, null, function() {                                                        // 14
        if (self.previousShow)                                                                              // 15
          self.previousShow.destroy();                                                                      // 16
      });                                                                                                   // 17
    }                                                                                                       // 18
  });                                                                                                       // 19
});                                                                                                         // 20
                                                                                                            // 21
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/Flipper.js                                                     //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('Flipper', famous.views.Flipper, {                                                     // 2
    add: function(child_fview, child_options) {                                                             // 3
      var target = child_options.target;                                                                    // 4
      if (!target || (target != 'back' && target != 'front'))                                               // 5
        throw new Error('Flipper must specify target="back/front"');                                        // 6
                                                                                                            // 7
      if (target == 'front')                                                                                // 8
        this.view.setFront(child_fview);                                                                    // 9
      else                                                                                                  // 10
        this.view.setBack(child_fview);                                                                     // 11
    }                                                                                                       // 12
  });                                                                                                       // 13
});                                                                                                         // 14
                                                                                                            // 15
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/HeaderFooterLayout.js                                          //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {                               // 2
    add: function(child_fview, child_options) {                                                             // 3
      var target = child_options.target;                                                                    // 4
      if (!target)                                                                                          // 5
        throw new Error('HeaderFooterLayout children must specify target="header/footer/content"');         // 6
      this.view[target].add(child_fview);                                                                   // 7
    }                                                                                                       // 8
  });                                                                                                       // 9
});                                                                                                         // 10
                                                                                                            // 11
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/Lightbox.js                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
// NOT DONE!                                                                                                // 1
                                                                                                            // 2
FView.ready(function(require) {                                                                             // 3
  FView.registerView('Lightbox', famous.views.Lightbox, {                                                   // 4
    add: function(child_fview, child_options) {                                                             // 5
      if (!this.view)                                                                                       // 6
        return;  // when?                                                                                   // 7
                                                                                                            // 8
      if (this.currentShow)                                                                                 // 9
        this.previousShow = this.currentShow;                                                               // 10
      this.currentShow = child_fview;                                                                       // 11
                                                                                                            // 12
      child_fview.preventDestroy();                                                                         // 13
                                                                                                            // 14
      var self = this;                                                                                      // 15
      this.view.show(child_fview, null, function() {                                                        // 16
        if (self.previousShow)                                                                              // 17
          self.previousShow.destroy();                                                                      // 18
      });                                                                                                   // 19
    },                                                                                                      // 20
                                                                                                            // 21
    attrUpdate: function(key, value, oldValue, allData, firstTime) {                                        // 22
      if (key == 'transition') {                                                                            // 23
        var data = FView.transitions[value];                                                                // 24
        if (data) {                                                                                         // 25
          for (key in data)                                                                                 // 26
            this.view[key](data[key]);                                                                      // 27
        } else {                                                                                            // 28
          log.error('No such transition ' + transition);                                                    // 29
        }                                                                                                   // 30
      }                                                                                                     // 31
    }                                                                                                       // 32
  });                                                                                                       // 33
});                                                                                                         // 34
                                                                                                            // 35
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/RenderController.js                                            //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
function fullOpacity() { return 1; }                                                                        // 1
function transformIdentity() { return Transform.Identity; }                                                 // 2
                                                                                                            // 3
FView.transitionModifiers = {                                                                               // 4
  opacity: {                                                                                                // 5
    outOpacityFrom: function (progress) {                                                                   // 6
      return progress;                                                                                      // 7
    },                                                                                                      // 8
    inOpacityFrom: function (progress) {                                                                    // 9
      return progress;                                                                                      // 10
    },                                                                                                      // 11
    outTransformFrom: transformIdentity, inTransformFrom: transformIdentity                                 // 12
  },                                                                                                        // 13
  slideWindow: {                                                                                            // 14
    outTransformFrom: function(progress) {                                                                  // 15
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);                   // 16
    },                                                                                                      // 17
    inTransformFrom: function(progress) {                                                                   // 18
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);                               // 19
    },                                                                                                      // 20
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity                                                 // 21
  },                                                                                                        // 22
  WIP: {                                                                                                    // 23
    outTransformFrom: function(progress) {                                                                  // 24
      return Transform.rotateY(Math.PI*progress);                                                           // 25
    },                                                                                                      // 26
    inTransformFrom: function(progress) {                                                                   // 27
      return Transform.rotateY(Math.PI + Math.PI*progress);                                                 // 28
    },                                                                                                      // 29
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity                                                 // 30
  }                                                                                                         // 31
};                                                                                                          // 32
                                                                                                            // 33
// Other option is to allow a slideDirection attribute.  Think about this.                                  // 34
FView.transitionModifiers.slideWindowLeft = FView.transitionModifiers.slideWindow;                          // 35
FView.transitionModifiers.slideWindowRight = {                                                              // 36
    outTransformFrom: FView.transitionModifiers.slideWindow.inTransformFrom,                                // 37
    inTransformFrom: FView.transitionModifiers.slideWindow.outTransformFrom                                 // 38
};                                                                                                          // 39
                                                                                                            // 40
FView.ready(function(require) {                                                                             // 41
  FView.registerView('RenderController', famous.views.RenderController, {                                   // 42
    add: function(child_fview, child_options) {                                                             // 43
      var fview = this;                                                                                     // 44
                                                                                                            // 45
      if (!fview.view)                                                                                      // 46
        return;  // when?                                                                                   // 47
                                                                                                            // 48
      if (fview._currentShow)                                                                               // 49
        fview._previousShow = fview._currentShow;                                                           // 50
      fview._currentShow = child_fview;                                                                     // 51
                                                                                                            // 52
      child_fview.preventDestroy();                                                                         // 53
                                                                                                            // 54
      var transition = fview._transition || null;                                                           // 55
                                                                                                            // 56
      var origTransitionData = {};                                                                          // 57
      if (fview._transitionOnce !== 'undefined') {                                                          // 58
        origTransitionData.transition = transition;                                                         // 59
        transition = fview._transitionOnce;                                                                 // 60
        delete fview._transitionOnce;                                                                       // 61
      }                                                                                                     // 62
      if (fview._transitionModifierOnce) {                                                                  // 63
        origTransitionData.modifierName = fview._transitionModifier;                                        // 64
        var data = FView.transitionModifiers[fview._transitionModifierOnce];                                // 65
        if (data) {                                                                                         // 66
          for (var key in data)                                                                             // 67
            fview.view[key](data[key]);                                                                     // 68
        } else {                                                                                            // 69
          log.error('No such transition ' + fview._transitionModifierOnce);                                 // 70
        }                                                                                                   // 71
        delete fview._transitionModifierOnce;                                                               // 72
      }                                                                                                     // 73
                                                                                                            // 74
      fview.view.show(child_fview, transition, function() {                                                 // 75
        // Now that transition is complete, we can destroy the old template                                 // 76
        if (fview._previousShow)                                                                            // 77
          fview._previousShow.destroy();                                                                    // 78
                                                                                                            // 79
        // If _transitionOnce was used, now we can restore the defaults                                     // 80
        if (origTransitionData.modifierName) {                                                              // 81
          console.log('restore ' + origTransitionData.modifierName);                                        // 82
          var data = FView.transitionModifiers[origTransitionData.modifierName];                            // 83
          for (var key in data)                                                                             // 84
            fview.view[key](data[key]);                                                                     // 85
        }                                                                                                   // 86
        if (origTransitionData.transition)                                                                  // 87
          fview._transition = origTransitionData.transition;                                                // 88
      });                                                                                                   // 89
    },                                                                                                      // 90
                                                                                                            // 91
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 92
      if (key == 'transition') {                                                                            // 93
        var data = FView.transitionModifiers[value];                                                        // 94
        if (data) {                                                                                         // 95
          this._transitionModifier = value;                                                                 // 96
          for (var key in data)                                                                             // 97
            this.view[key](data[key]);                                                                      // 98
        } else {                                                                                            // 99
          log.error('No such transition ' + value);                                                         // 100
        }                                                                                                   // 101
      }                                                                                                     // 102
    }                                                                                                       // 103
  });                                                                                                       // 104
});                                                                                                         // 105
                                                                                                            // 106
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/Scrollview.js                                                  //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('Scrollview', famous.views.Scrollview, {                                               // 2
                                                                                                            // 3
    create: function(options) {                                                                             // 4
      var fview = this;                                                                                     // 5
      var scrollview = new fview._view.constructor(options);                                                // 6
                                                                                                            // 7
      fview.properties = new ReactiveDict();                                                                // 8
                                                                                                            // 9
      if (options.paginated) {                                                                              // 10
        fview.properties.set('index', 0);                                                                   // 11
                                                                                                            // 12
        // famo.us pageChange event seems completely broken??                                               // 13
        scrollview.on('pageChange', function(props) {                                                       // 14
          for (var key in props)                                                                            // 15
            fview.properties.set(key, props[key]);                                                          // 16
        });                                                                                                 // 17
                                                                                                            // 18
        // workaround for the above:                                                                        // 19
        // - fires when event doesn't fire                                                                  // 20
        // - will override wrong value before flush                                                         // 21
        scrollview.on('settle', function(props) {                                                           // 22
          fview.properties.set('index',                                                                     // 23
            fview.view.getCurrentIndex());                                                                  // 24
        });                                                                                                 // 25
      }                                                                                                     // 26
                                                                                                            // 27
      return scrollview;                                                                                    // 28
    },                                                                                                      // 29
                                                                                                            // 30
    famousCreatedPost: function() {                                                                         // 31
      this.pipeChildrenTo = this.parent.pipeChildrenTo ?                                                    // 32
        [ this.view, this.parent.pipeChildrenTo[0] ] :                                                      // 33
        [ this.view ];                                                                                      // 34
    }                                                                                                       // 35
                                                                                                            // 36
  });                                                                                                       // 37
});                                                                                                         // 38
                                                                                                            // 39
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/views/Surface.js                                                     //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function(require) {                                                                             // 1
  FView.registerView('Surface', famous.core.Surface, {                                                      // 2
                                                                                                            // 3
    add: function(child_fview, child_options) {                                                             // 4
      var blazeView = this.blazeView;                                                                       // 5
                                                                                                            // 6
      log.error("You tried to embed a " + child_fview._view.name + " inside " +                             // 7
        "a Surface (parent: " + parentViewName(blazeView) + ", template: " +                                // 8
        parentTemplateName(blazeView) + ").  Surfaces are endpoints in the " +                              // 9
        "Famous Render Tree and may not contain children themselves.  See " +                               // 10
        "https://github.com/gadicc/meteor-famous-views/issues/78 for more info.");                          // 11
                                                                                                            // 12
      throw new Error("Cannot add View to Surface");                                                        // 13
    },                                                                                                      // 14
                                                                                                            // 15
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 16
      switch(key) {                                                                                         // 17
        case 'size':                                                                                        // 18
          // Let our modifier control our size                                                              // 19
          // Long term, rather specify modifierSize and surfaceSize args?                                   // 20
          if (this._modifier && this._modifier.name == 'StateModifier')                                     // 21
            this.surface.setSize([undefined,undefined]);                                                    // 22
          else {                                                                                            // 23
            this.surface.setSize(value);                                                                    // 24
          }                                                                                                 // 25
          break;                                                                                            // 26
                                                                                                            // 27
        case 'class':                                                                                       // 28
        case 'classes':                                                                                     // 29
          if (Match.test(value, String))                                                                    // 30
            value = value === "" ? [] : value.split(" ");                                                   // 31
          else if (!Match.test(value, [String]))                                                            // 32
            throw new Error('Surface class= expects string or array of strings');                           // 33
          value.push(this.surfaceClassName);                                                                // 34
          this.view.setClasses(value);                                                                      // 35
          break;                                                                                            // 36
                                                                                                            // 37
        case 'style':                                                                                       // 38
        case 'properties':                                                                                  // 39
          if (Match.test(value, String)) {                                                                  // 40
            var parts = value.split(';'), pair;                                                             // 41
            value = {};                                                                                     // 42
            for (var i=0; i < parts.length; i++) {                                                          // 43
              pair = parts[i].split(':');                                                                   // 44
              if (pair.length > 1)                                                                          // 45
                value[pair[0].trim()] = pair[1].trim();                                                     // 46
            }                                                                                               // 47
          } else if (!Match.test(value, Object))                                                            // 48
            throw new Error('Surface properties= expects string or key-value dictionary');                  // 49
          this.view.setProperties(value);                                                                   // 50
          break;                                                                                            // 51
      }                                                                                                     // 52
    },                                                                                                      // 53
                                                                                                            // 54
    onDestroy: function() {                                                                                 // 55
      if (this.mutationObserver)                                                                            // 56
        this.mutationObserver.disconnect();                                                                 // 57
    },                                                                                                      // 58
                                                                                                            // 59
    postRender: function() {                                                                                // 60
      if (this.template && this.template.onDocumentDom) {                                                   // 61
        var fview = this;                                                                                   // 62
        var cb = function() {                                                                               // 63
          fview.template.onDocumentDom.call(fview.surfaceBlazeView.templateInstance());                     // 64
          fview.surface.removeListener('deploy', cb);                                                       // 65
        };                                                                                                  // 66
        fview.surface.on('deploy', cb);                                                                     // 67
      }                                                                                                     // 68
    }                                                                                                       // 69
                                                                                                            // 70
  });                                                                                                       // 71
});                                                                                                         // 72
                                                                                                            // 73
/*                                                                                                          // 74
 * Called in famous.js when rendering a Surface (which unlike anything else,                                // 75
 * gets rendered to a div via Blaze.render and is treated differently)                                      // 76
 */                                                                                                         // 77
templateSurface = function (fview, view, parentView, options, tName) {                                      // 78
  div = document.createElement('div');                                                                      // 79
  Blaze.render(view, div, null, parentView);                                                                // 80
                                                                                                            // 81
  if (!options)                                                                                             // 82
    options = {};                                                                                           // 83
                                                                                                            // 84
  var autoSize = options.size && options.size[1] == 'auto';                                                 // 85
                                                                                                            // 86
  if (autoSize)                                                                                             // 87
    options.size = [0, 0];                                                                                  // 88
  else                                                                                                      // 89
    div.style.height='100%';                                                                                // 90
  div.style.width='100%';                                                                                   // 91
                                                                                                            // 92
  fview.surfaceClassName = 't_'+tName.replace(/ /, '_');                                                    // 93
  if (options.classes)                                                                                      // 94
    throw new Error('Surface classes="x,y" is deprecated.  Use class="x y" instead.');                      // 95
                                                                                                            // 96
  var surfaceOptions = {                                                                                    // 97
    content: div,                                                                                           // 98
    size: fview.size                                                                                        // 99
  };                                                                                                        // 100
                                                                                                            // 101
  fview.surface = fview.view;                                                                               // 102
  fview.surface.setOptions(surfaceOptions);                                                                 // 103
                                                                                                            // 104
  var pipeChildrenTo = fview.parent.pipeChildrenTo;                                                         // 105
  if (pipeChildrenTo)                                                                                       // 106
    for (var i=0; i < pipeChildrenTo.length; i++)                                                           // 107
      fview.surface.pipe(pipeChildrenTo[i]);                                                                // 108
                                                                                                            // 109
  if (autoSize) {                                                                                           // 110
    fview.autoHeight = autoHeight;                                                                          // 111
    fview.autoHeight();                                                                                     // 112
    // Deprecated 2014-11-01                                                                                // 113
    log.warn(fview.surfaceClassName + ': size="[undefined,auto"] is ' +                                     // 114
      'deprecated.  Since Famo.us 0.3.0 ' +                                                                 // 115
      'you can simply use size="[undefined,true]" and it will work as ' +                                   // 116
      'expected in all cases (including SequentialLayout, Scrollview, etc');                                // 117
  }                                                                                                         // 118
                                                                                                            // 119
  if (options.watchSize) {                                                                                  // 120
    if (typeof MutationObserver === 'undefined')                                                            // 121
      return console.warn("Can't observe on browser where MutationObserver " +                              // 122
        "is not supported");                                                                                // 123
    fview.mutationObserver = new MutationObserver(function(mutations) {                                     // 124
      fview.surface._contentDirty = true;                                                                   // 125
    });                                                                                                     // 126
    fview.mutationObserver.observe(div, {                                                                   // 127
      attributeFilter: true, attributes: true,                                                              // 128
      characterData: true, childList: true, subtree: true                                                   // 129
    });                                                                                                     // 130
  }                                                                                                         // 131
};                                                                                                          // 132
                                                                                                            // 133
function autoHeight(callback) {                                                                             // 134
  var fview = this;                                                                                         // 135
  var div = fview.surface.content;                                                                          // 136
                                                                                                            // 137
  var height = div.scrollHeight;                                                                            // 138
  if (height && (!fview.size || (fview.size.length == 2 && fview.size[1] != height))) {                     // 139
    fview.size = [undefined, height];                                                                       // 140
    if (fview.modifier) {                                                                                   // 141
      fview.modifier.setSize(fview.size);                                                                   // 142
      fview.surface.setSize([undefined,undefined]);                                                         // 143
    } else {                                                                                                // 144
      fview.surface.setSize(fview.size);                                                                    // 145
    }                                                                                                       // 146
                                                                                                            // 147
    if (callback)                                                                                           // 148
      callback.call(fview, height);                                                                         // 149
  } else {                                                                                                  // 150
    // Ideally Engine.nextTick, but                                                                         // 151
    // https://github.com/Famous/famous/issues/342                                                          // 152
    // e.g. /issue10                                                                                        // 153
    window.setTimeout(function() {                                                                          // 154
      fview.autoHeight();                                                                                   // 155
    }, 10);  // FYI: 16.67ms = 1x 60fps animation frame                                                     // 156
  }                                                                                                         // 157
}                                                                                                           // 158
                                                                                                            // 159
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/modifiers/StateModifier.js                                           //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
FView.ready(function() {                                                                                    // 1
  FView.registerModifier('StateModifier', famous.modifiers.StateModifier, {                                 // 2
                                                                                                            // 3
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 4
      // Allow for values like { value: 30, transition: {}, halt: true }                                    // 5
      var options = {};                                                                                     // 6
      if (typeof value === 'object' && value && typeof value.value !== 'undefined') {                       // 7
        options = value;                                                                                    // 8
        value = options.value;                                                                              // 9
      }                                                                                                     // 10
      if (typeof oldValue === 'object' && oldValue && typeof oldValue.value !== 'undefined')                // 11
        oldValue = oldValue.value;                                                                          // 12
      var amount;                                                                                           // 13
                                                                                                            // 14
      switch(key) {                                                                                         // 15
        case 'transform': case 'opacity': case 'align': case 'size': case 'origin':                         // 16
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value, options);                   // 17
          break;                                                                                            // 18
                                                                                                            // 19
        // Below are helpful shortcuts for transforms                                                       // 20
                                                                                                            // 21
        case 'translate':                                                                                   // 22
          modifierMethod(this, 'setTransform',                                                              // 23
            Transform.translate.apply(null, value), options);                                               // 24
          break;                                                                                            // 25
                                                                                                            // 26
        case 'scaleX': case 'scaleY': case 'scaleZ':                                                        // 27
          amount = degreesToRadians((value || 0) - (oldValue || 0));                                        // 28
          var scale = [0,0,0];                                                                              // 29
          if (key == 'scaleX') scale[0] = amount;                                                           // 30
          else if (key == 'scaleY') scale[1] = amount;                                                      // 31
          else scale[2] = amount;                                                                           // 32
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 33
            this.modifier.getFinalTransform(),                                                              // 34
            Transform.scale.apply(null, scale)                                                              // 35
          ), options);                                                                                      // 36
          break;                                                                                            // 37
                                                                                                            // 38
        case 'skewX': case 'skewY':                                                                         // 39
          amount = (value || 0) - (oldValue || 0);                                                          // 40
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 41
            this.modifier.getFinalTransform(),                                                              // 42
            Transform[key](degreesToRadians(amount))                                                        // 43
          ), options);                                                                                      // 44
          break;                                                                                            // 45
                                                                                                            // 46
        case 'skewZ': // doesn't exist in famous                                                            // 47
          amount = (value || 0) - (oldValue || 0);                                                          // 48
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 49
            this.modifier.getFinalTransform(),                                                              // 50
            Transform.skew(0, 0, degreesToRadians(amount))                                                  // 51
          ), options);                                                                                      // 52
          break;                                                                                            // 53
                                                                                                            // 54
        case 'rotateX': case 'rotateY': case 'rotateZ':                                                     // 55
          // value might be undefined from Session with no SessionDefault                                   // 56
          var rotateBy = (value || 0) - (oldValue || 0);                                                    // 57
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 58
            this.modifier.getFinalTransform(),                                                              // 59
            Transform[key](degreesToRadians(rotateBy))                                                      // 60
          ), options);                                                                                      // 61
          break;                                                                                            // 62
      }                                                                                                     // 63
    }                                                                                                       // 64
  });                                                                                                       // 65
});                                                                                                         // 66
                                                                                                            // 67
function modifierMethod(fview, method, value, options) {                                                    // 68
  if (typeof options.halt !== 'undefined' ?                                                                 // 69
      options.halt : fview.modifierTransitionHalt)                                                          // 70
  fview.modifier.halt();                                                                                    // 71
                                                                                                            // 72
  fview.modifier[method](                                                                                   // 73
    value,                                                                                                  // 74
    options.transition || fview.modifierTransition,                                                         // 75
    options.done || fview.modifierTransitionDone                                                            // 76
  );                                                                                                        // 77
}                                                                                                           // 78
                                                                                                            // 79
function degreesToRadians(x) {                                                                              // 80
  return x * Math.PI / 180;                                                                                 // 81
}                                                                                                           // 82
                                                                                                            // 83
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['gadicohen:famous-views'] = {
  FView: FView
};

})();
