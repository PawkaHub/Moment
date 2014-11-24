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
var FView, log, postFirstAddQueue, Engine, Transform, initializeFamous, optionString, handleOptions, options, MeteorFamousView, throwError, sequencer, parentViewName, parentTemplateName, runRenderedCallback, key;

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
var readyDep = new Tracker.Dependency;                                                                      // 11
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
}                                                                                                           // 22
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
}                                                                                                           // 57
                                                                                                            // 58
FView.startup = function() {                                                                                // 59
  log.debug('Current logging default is "debug" (for localhost).  '                                         // 60
    + 'Change in your app with Logger.setLevel("famous-views", "info");');                                  // 61
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
      throw new Error("You have created Template(s) with the same name "                                    // 79
        + "as these famous-views: " + names.join(', ')                                                      // 80
        + '.  Nothing will work until you rename them.');                                                   // 81
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
  if (FView.attrEvalAllowedKeys && (FView.attrEvalAllowedKeys == '*'                                        // 146
      || FView.attrEvalAllowedKeys.indexOf(key) > -1))                                                      // 147
    return eval(string.substr(5));  // strip "eval:"                                                        // 148
  else                                                                                                      // 149
    throw new Error("[famous-views] Blocked " + key + '="' + string + '".  Set '                            // 150
      + 'FView.attrEvalAllowedKeys = "*" or FView.attrEvalAllowedKeys = ["'                                 // 151
      + key + '"] and make sure you understand the security implications. '                                 // 152
      + 'Particularly, make sure none of your helper functions return a string '                            // 153
      + 'that can be influenced by client-side input');                                                     // 154
}                                                                                                           // 155
                                                                                                            // 156
var optionBlaze = function(string, key, blazeView) {                                                        // 157
  // temporary, for options that get called (wrongly!) from init as well                                    // 158
  // or maybe that is the right place and render is the wrong place :)                                      // 159
  if (!blazeView)                                                                                           // 160
    return '__FVIEW::SKIP__';                                                                               // 161
                                                                                                            // 162
  var args = string.substr(2, string.length-4).split(" ");                                                  // 163
  var view = blazeView, value;                                                                              // 164
  while (view.name.substr(0,9) !== 'Template.')                                                             // 165
    view = view.parentView;                                                                                 // 166
  value = view.lookup(args.splice(0,1)[0]);                                                                 // 167
                                                                                                            // 168
  // Scalar value from data context                                                                         // 169
  if (typeof value !== 'function')                                                                          // 170
    return value;                                                                                           // 171
                                                                                                            // 172
  // Reactive value from helper                                                                             // 173
  Engine.defer(function() {                                                                                 // 174
    blazeView.autorun(function() {                                                                          // 175
      var run = value.apply(null, args);                                                                    // 176
      blazeView.fview._view.attrUpdate.call(blazeView.fview, key, run);                                     // 177
    });                                                                                                     // 178
  });                                                                                                       // 179
                                                                                                            // 180
  return '__FVIEW::SKIP__';                                                                                 // 181
}                                                                                                           // 182
                                                                                                            // 183
optionString = function(string, key, blazeView) {                                                           // 184
  if (string.substr(0,5) == 'eval:')                                                                        // 185
    return optionEval(string, key);                                                                         // 186
  if (string == 'undefined')                                                                                // 187
    return undefined;                                                                                       // 188
  if (string == 'true')                                                                                     // 189
    return true;                                                                                            // 190
  if (string == 'false')                                                                                    // 191
    return false;                                                                                           // 192
  if (string === null)                                                                                      // 193
    return null;                                                                                            // 194
                                                                                                            // 195
  if (string.substr(0,2) === '{{')                                                                          // 196
    return optionBlaze(string, key, blazeView);                                                             // 197
                                                                                                            // 198
  if (string[0] == '[' || string[0] == '{') {                                                               // 199
    var obj;                                                                                                // 200
    string = string.replace(/\bauto\b/g, '"auto"');                                                         // 201
    string = string.replace(/undefined/g, '"__undefined__"');                                               // 202
    // JSON can't parse values like ".5" so convert them to "0.5"                                           // 203
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');                                        // 204
                                                                                                            // 205
    try {                                                                                                   // 206
      obj = JSON.parse(string);                                                                             // 207
    }                                                                                                       // 208
    catch (err) {                                                                                           // 209
      log.error("Couldn't parse JSON, skipping: " + string);                                                // 210
      log.error(err);                                                                                       // 211
      return undefined;                                                                                     // 212
    }                                                                                                       // 213
                                                                                                            // 214
    for (var key in obj)                                                                                    // 215
      if (obj[key] === '__undefined__')                                                                     // 216
        obj[key] = undefined;                                                                               // 217
    return obj;                                                                                             // 218
  } else {                                                                                                  // 219
    var float = parseFloat(string);                                                                         // 220
    if (!_.isNaN(float))                                                                                    // 221
      return float;                                                                                         // 222
    return string;                                                                                          // 223
  }                                                                                                         // 224
                                                                                                            // 225
  /*                                                                                                        // 226
  if (string == 'undefined')                                                                                // 227
    return undefined;                                                                                       // 228
  if (string == 'true')                                                                                     // 229
    return true;                                                                                            // 230
  if (string == 'false')                                                                                    // 231
    return false;                                                                                           // 232
  if (string.substr(0,1) == '[') {                                                                          // 233
    var out = [];                                                                                           // 234
    string = string.substr(1, string.length-2).split(',');                                                  // 235
    for (var i=0; i < string.length; i++)                                                                   // 236
      out.push(optionString(string[i].trim()));                                                             // 237
    return out;                                                                                             // 238
  }                                                                                                         // 239
  if (string.match(/^[0-9\.]+$/))                                                                           // 240
    return parseFloat(string);                                                                              // 241
  */                                                                                                        // 242
}                                                                                                           // 243
                                                                                                            // 244
handleOptions = function(data) {                                                                            // 245
  options = {};                                                                                             // 246
  for (var key in data) {                                                                                   // 247
    var value = data[key];                                                                                  // 248
    if (_.isString(value))                                                                                  // 249
      options[key] = optionString(value, key);                                                              // 250
    else                                                                                                    // 251
      options[key] = value;                                                                                 // 252
  }                                                                                                         // 253
  return options;                                                                                           // 254
}                                                                                                           // 255
                                                                                                            // 256
/* --- totally not done --- */                                                                              // 257
                                                                                                            // 258
FView.showTreeGet = function(renderNode) {                                                                  // 259
  var obj = renderNode._node._child._object;                                                                // 260
    if (obj.node)                                                                                           // 261
      obj.node = this.showTreeGet(obj.node);                                                                // 262
  return obj;                                                                                               // 263
}                                                                                                           // 264
FView.showTreeChildren = function(renderNode) {                                                             // 265
  var out = {}, i=0;                                                                                        // 266
  if (renderNode._node)                                                                                     // 267
    out['child'+(i++)] = this.showTreeGet(renderNode)                                                       // 268
  return out;                                                                                               // 269
}                                                                                                           // 270
FView.showTree = function() {                                                                               // 271
  console.log(this.showTreeChildren(mainCtx));                                                              // 272
}                                                                                                           // 273
                                                                                                            // 274
/* --- */                                                                                                   // 275
                                                                                                            // 276
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
  log.debug('Destroying ' + (fview._view ? fview._view.name : fview.kind) +                                 // 107
    ' (#' + fview.id + ') and children' +                                                                   // 108
    (isTemplateDestroy&&fview.destroyPrevented ? ' (destroyPrevented)':''));                                // 109
                                                                                                            // 110
  // XXX ADD TO DOCS                                                                                        // 111
  if (isTemplateDestroy) {                                                                                  // 112
                                                                                                            // 113
    /*                                                                                                      // 114
    if (fview.onDestroy() === '__original__')                                                               // 115
      for (var i=0; i < fview._callbacks.destroy.length; i++)                                               // 116
        fview._calbacks.destroy[i].call(fview);                                                             // 117
    else                                                                                                    // 118
      log.warn('#' + fview.id + ' - you set fview.onDestroy = function().  '                                // 119
        + 'This will work for now '                                                                         // 120
        + 'but is deprecated.  Please use fview.onDestoy(callback), which may '                             // 121
        + 'be used multiple times, and receives the `fview` as `this`.');                                   // 122
    */                                                                                                      // 123
                                                                                                            // 124
    if (fview.onDestroy)                                                                                    // 125
      fview.onDestroy();                                                                                    // 126
                                                                                                            // 127
    if (fview.destroyPrevented) {                                                                           // 128
      // log.debug('  #' + fview.id + ' - destroyPrevented');                                               // 129
      return;                                                                                               // 130
    }                                                                                                       // 131
  }                                                                                                         // 132
                                                                                                            // 133
  // First delete children (via Blaze to trigger Template destroy callback)                                 // 134
  if (fview.children)                                                                                       // 135
    for (var i=0; i < fview.children.length; i++)                                                           // 136
      Blaze.remove(fview.children[i].blazeView);                                                            // 137
                                                                                                            // 138
  fview.isDestroyed = true;                                                                                 // 139
  fview.node = null;                                                                                        // 140
  fview.view = null;                                                                                        // 141
  fview.modifier = null;                                                                                    // 142
  delete(meteorFamousViews[fview.id]);                                                                      // 143
                                                                                                            // 144
  // If we're part of a sequence, now is the time to remove ourselves                                       // 145
  if (fview.parent.sequence) {                                                                              // 146
    if (fview.sequence) {                                                                                   // 147
      // TODO, we're a child sequence, remove the child (TODO in sequencer.js)                              // 148
      // log.debug("child sequence");                                                                       // 149
    } else {                                                                                                // 150
      Engine.defer(function() {                                                                             // 151
        fview.parent.sequence.remove(fview);  // less flicker in a defer                                    // 152
      });                                                                                                   // 153
    }                                                                                                       // 154
  }                                                                                                         // 155
};                                                                                                          // 156
                                                                                                            // 157
MeteorFamousView.prototype.getSize = function() {                                                           // 158
  return this.node && this.node.getSize() || this.size || [true,true];                                      // 159
};                                                                                                          // 160
                                                                                                            // 161
throwError = function(startStr, object) {                                                                   // 162
  if (object instanceof Object)                                                                             // 163
    console.error(object);                                                                                  // 164
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or ' +                             // 165
      'DOM node, but got ' + object);                                                                       // 166
};                                                                                                          // 167
                                                                                                            // 168
FView.from = function(viewOrTplorEl) {                                                                      // 169
  if (viewOrTplorEl instanceof Blaze.View)                                                                  // 170
    return FView.fromBlazeView(viewOrTplorEl);                                                              // 171
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)                                                 // 172
    return FView.fromTemplate(viewOrTplorEl);                                                               // 173
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')                                     // 174
    return FView.fromElement(viewOrTplorEl);                                                                // 175
  else {                                                                                                    // 176
    throwError('FView.getData() expects BlazeView or TemplateInstance or ' +                                // 177
        'DOM node, but got ', viewOrTplorEl);                                                               // 178
  }                                                                                                         // 179
};                                                                                                          // 180
                                                                                                            // 181
FView.fromBlazeView = FView.dataFromView = function(view) {                                                 // 182
  while ((view=view.parentView) && !view.fview);                                                            // 183
  return view ? view.fview : undefined;                                                                     // 184
};                                                                                                          // 185
                                                                                                            // 186
FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {                                       // 187
  return this.dataFromView(tplInstance.view);                                                               // 188
};                                                                                                          // 189
                                                                                                            // 190
FView.fromElement = FView.dataFromElement = function(el) {                                                  // 191
  var view = Blaze.getView(el);                                                                             // 192
  return this.dataFromView(view);                                                                           // 193
};                                                                                                          // 194
                                                                                                            // 195
FView.byId = function(id) {                                                                                 // 196
  return meteorFamousViews[id];                                                                             // 197
};                                                                                                          // 198
                                                                                                            // 199
// Leave as alias?  Deprecate?                                                                              // 200
FView.dataFromCmp = FView.dataFromComponent;                                                                // 201
FView.dataFromTpl = FView.dataFromTemplate;                                                                 // 202
                                                                                                            // 203
FView.dataFromComponent = function(component) {                                                             // 204
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");      // 205
  return FView.fromBlazeView(component);                                                                    // 206
};                                                                                                          // 207
                                                                                                            // 208
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
        })(k));                                                                                             // 18
      }                                                                                                     // 19
    });                                                                                                     // 20
  }                                                                                                         // 21
}                                                                                                           // 22
                                                                                                            // 23
function autoHeight(callback) {                                                                             // 24
  var fview = this;                                                                                         // 25
  var div = fview.surface.content;                                                                          // 26
                                                                                                            // 27
  var height = div.scrollHeight;                                                                            // 28
  if (height && (!fview.size || (fview.size.length == 2 && fview.size[1] != height))) {                     // 29
    fview.size = [undefined, height];                                                                       // 30
    if (fview.modifier) {                                                                                   // 31
      fview.modifier.setSize(fview.size);                                                                   // 32
      fview.surface.setSize([undefined,undefined]);                                                         // 33
    } else {                                                                                                // 34
      fview.surface.setSize(fview.size);                                                                    // 35
    }                                                                                                       // 36
                                                                                                            // 37
    if (callback)                                                                                           // 38
      callback.call(fview, height);                                                                         // 39
  } else {                                                                                                  // 40
    // Ideally Engine.nextTick, but                                                                         // 41
    // https://github.com/Famous/famous/issues/342                                                          // 42
    // e.g. /issue10                                                                                        // 43
    window.setTimeout(function() {                                                                          // 44
      fview.autoHeight();                                                                                   // 45
    }, 10);  // FYI: 16.67ms = 1x 60fps animation frame                                                     // 46
  }                                                                                                         // 47
}                                                                                                           // 48
                                                                                                            // 49
function templateSurface(div, fview, renderedTemplate, tName, options) {                                    // 50
  // var div = document.createElement('div');                                                               // 51
  var autoSize = options.size && options.size[1] == 'auto';                                                 // 52
                                                                                                            // 53
  if (autoSize)                                                                                             // 54
    options.size = [0, 0];                                                                                  // 55
  else                                                                                                      // 56
    div.style.height='100%';                                                                                // 57
  div.style.width='100%';                                                                                   // 58
                                                                                                            // 59
  /*                                                                                                        // 60
  if (fview.uiHooks)                                                                                        // 61
    div._uihooks = fview.uiHooks;                                                                           // 62
  */                                                                                                        // 63
                                                                                                            // 64
//  UI.insert(renderedTemplate, div);                                                                       // 65
                                                                                                            // 66
//  we're now forced to always render in main func                                                          // 67
//  renderedTemplate.domrange.attach(div);                                                                  // 68
                                                                                                            // 69
  if (!options)                                                                                             // 70
    options = {};                                                                                           // 71
                                                                                                            // 72
  // If any HTML was generated, create a surface for it                                                     // 73
  if (options.view=='Surface' || div.innerHTML.trim().length) {                                             // 74
    fview.surfaceClassName = 't_'+tName.replace(/ /, '_');                                                  // 75
    if (options.classes)                                                                                    // 76
      throw new Error('Surface classes="x,y" is deprecated.  Use class="x y" instead.');                    // 77
                                                                                                            // 78
    var surfaceOptions = {                                                                                  // 79
      content: div,                                                                                         // 80
      size: fview.size                                                                                      // 81
    };                                                                                                      // 82
                                                                                                            // 83
    fview.surface = fview.view;                                                                             // 84
    fview.surface.setOptions(surfaceOptions);                                                               // 85
                                                                                                            // 86
    /*                                                                                                      // 87
    fview.surface = new famous.core.Surface(surfaceOptions);                                                // 88
    if (!fview.node)                                                                                        // 89
      // nothing, i.e. Surface & no modifier                                                                // 90
      fview.setNode(fview.surface);                                                                         // 91
    else if (!fview.sequencer)                                                                              // 92
      // add Surface as only child                                                                          // 93
      fview.node.add(fview.surface);                                                                        // 94
    else {                                                                                                  // 95
      fview.sequencer.sequence.push(fview.surface);                                                         // 96
    }                                                                                                       // 97
    */                                                                                                      // 98
                                                                                                            // 99
    var pipeChildrenTo = fview.parent.pipeChildrenTo;                                                       // 100
    if (pipeChildrenTo)                                                                                     // 101
      for (var i=0; i < pipeChildrenTo.length; i++)                                                         // 102
        fview.surface.pipe(pipeChildrenTo[i]);                                                              // 103
                                                                                                            // 104
    if (autoSize) {                                                                                         // 105
      fview.autoHeight = autoHeight;                                                                        // 106
      fview.autoHeight();                                                                                   // 107
      // Deprecated 2014-11-01                                                                              // 108
      log.warn(fview.surfaceClassName + ': size="[undefined,auto"] is ' +                                   // 109
        'deprecated.  Since Famo.us 0.3.0 ' +                                                               // 110
        'you can simply use size="[undefined,true]" and it will work as ' +                                 // 111
        'expected in all cases (including SequentialLayout, Scrollview, etc');                              // 112
    }                                                                                                       // 113
  }                                                                                                         // 114
}                                                                                                           // 115
                                                                                                            // 116
// Used by famousEach too                                                                                   // 117
parentViewName = function(blazeView) {                                                                      // 118
  while (blazeView &&                                                                                       // 119
      (blazeView.name == "with" || blazeView.name == "(contentBlock)"))                                     // 120
    blazeView = blazeView.parentView;                                                                       // 121
  return blazeView ? blazeView.name : '(root)';                                                             // 122
};                                                                                                          // 123
                                                                                                            // 124
parentTemplateName = function(blazeView) {                                                                  // 125
  while (blazeView &&                                                                                       // 126
      !blazeView.name.match(/^Template/) && !blazeView.name.match(/^body_content/))                         // 127
    blazeView = blazeView.parentView;                                                                       // 128
  return blazeView ? blazeView.name : '(none)';                                                             // 129
};                                                                                                          // 130
                                                                                                            // 131
// Need to fire manually at appropriate time,                                                               // 132
// for non-Surfaces which are never added to the DOM by meteor                                              // 133
runRenderedCallback = function(view) {                                                                      // 134
//  if (view._callbacks.rendered && view._callbacks.rendered.length)                                        // 135
  var needsRenderedCallback = true; // uh yeah, TODO :>                                                     // 136
  view.domrange = null; // TODO, check if it's a surface / real domrange                                    // 137
  if (needsRenderedCallback && ! view.isDestroyed &&                                                        // 138
      view._callbacks.rendered && view._callbacks.rendered.length) {                                        // 139
    Tracker.afterFlush(function callRendered() {                                                            // 140
      if (needsRenderedCallback && ! view.isDestroyed) {                                                    // 141
        needsRenderedCallback = false;                                                                      // 142
        Blaze._fireCallbacks(view, 'rendered');                                                             // 143
      }                                                                                                     // 144
    });                                                                                                     // 145
  }                                                                                                         // 146
};                                                                                                          // 147
                                                                                                            // 148
function famousCreated() {                                                                                  // 149
  var blazeView = this.view;                                                                                // 150
  var famousViewName = blazeView.name ? blazeView.name.substr(7) : "";                                      // 151
                                                                                                            // 152
  // don't re-use parent's data/attributes, don't mutate data object                                        // 153
  var inNewDataContext = blazeView.parentView && blazeView.parentView.__isTemplateWith;                     // 154
  var data = inNewDataContext ? _.clone(this.data) : {};                                                    // 155
                                                                                                            // 156
  // deprecate                                                                                              // 157
  if (!data.view && famousViewName === "")                                                                  // 158
    data.view = 'SequentialLayout';                                                                         // 159
  if (!data.view) data.view = famousViewName;                                                               // 160
  else if (!famousViewName) {                                                                               // 161
    famousViewName = data.view;                                                                             // 162
    blazeView.viewName = 'Famous.' + famousViewName;                                                        // 163
  }                                                                                                         // 164
                                                                                                            // 165
  // Deprecated 2014-08-17                                                                                  // 166
  if (data.size && _.isString(data.size) && data.size.substr(0,1) != '[')                                   // 167
    throw new Error('[famous-views] size="' + data.size + '" is deprecated, ' +                             // 168
      'please use size="['+ data.size + ']" instead');                                                      // 169
                                                                                                            // 170
  // See attribute parsing notes in README                                                                  // 171
  var options = handleOptions(data);                                                                        // 172
                                                                                                            // 173
  // These require special handling (but should still be moved elsewhere)                                   // 174
  if (data.direction)                                                                                       // 175
    options.direction = data.direction == "Y" ?                                                             // 176
      famous.utilities.Utility.Direction.Y :                                                                // 177
      famous.utilities.Utility.Direction.X;                                                                 // 178
  if (options.translate) {                                                                                  // 179
    options.transform =                                                                                     // 180
      Transform.translate.apply(null, options.translate);                                                   // 181
    delete options.translate;                                                                               // 182
  }                                                                                                         // 183
  // any other transforms added here later must act on existing transform matrix                            // 184
                                                                                                            // 185
  var fview = blazeView.fview = new MeteorFamousView(blazeView, options);                                   // 186
                                                                                                            // 187
  var pViewName = parentViewName(blazeView.parentView);                                                     // 188
  var pTplName = parentTemplateName(blazeView.parentView);                                                  // 189
  log.debug('New ' + famousViewName + " (#" + fview.id + ')' +                                              // 190
    (data.template ?                                                                                        // 191
      ', content from "' + data.template + '"' :                                                            // 192
      ', content from inline block') +                                                                      // 193
    ' (parent: ' + pViewName +                                                                              // 194
    (pViewName == pTplName ? '' : ', template: ' + pTplName) + ')');                                        // 195
                                                                                                            // 196
  /*                                                                                                        // 197
  if (FView.viewOptions[data.view]                                                                          // 198
      && FView.viewOptions[data.view].childUiHooks) {                                                       // 199
    // if childUiHooks specified, store them here too                                                       // 200
    fview.childUiHooks = FView.viewOptions[data.view].childUiHooks;                                         // 201
  } else if (fview.parent.childUiHooks) {                                                                   // 202
    if (data.view == 'Surface') {                                                                           // 203
      fview.uiHooks = fview.parent.childUiHooks;                                                            // 204
    } else {                                                                                                // 205
      // Track descedents                                                                                   // 206
    }                                                                                                       // 207
    console.log('child ' + data.view);                                                                      // 208
  }                                                                                                         // 209
  */                                                                                                        // 210
                                                                                                            // 211
  var view, node, notReallyAView=false /* TODO :) */;                                                       // 212
                                                                                                            // 213
  // currently modifiers come via 'view' arg, for now (and Surface)                                         // 214
  if (data.view /* != 'Surface' */) {                                                                       // 215
                                                                                                            // 216
    var registerable = FView._registerables[data.view];                                                     // 217
    if (!registerable)                                                                                      // 218
      throw new Error('Wanted view/modifier "' + data.view + '" but it ' +                                  // 219
        'doesn\'t exists.  Try FView.registerView/Modifier("'+ data.view +                                  // 220
        '", etc)');                                                                                         // 221
                                                                                                            // 222
    fview['_' + registerable.type] = registerable;        // fview._view                                    // 223
    node = registerable.create.call(fview, options);      // fview.node                                     // 224
    fview[registerable.type] = node;                      // fview.view                                     // 225
                                                                                                            // 226
    // PEM: TODO when node is a sequence container, its content should                                      // 227
    // be created before it. Hence, the sequence could be filled so                                         // 228
    // that instanciation of the container knows exactly what is the content                                // 229
    // manage.                                                                                              // 230
    if (node.sequenceFrom) {                                                                                // 231
      fview.sequence = new sequencer();                                                                     // 232
      node.sequenceFrom(fview.sequence._sequence);                                                          // 233
    }                                                                                                       // 234
                                                                                                            // 235
  }                                                                                                         // 236
                                                                                                            // 237
  // If no modifier used, default to Modifier if origin/translate/etc used                                  // 238
  if (!data.modifier && !fview.modifier &&                                                                  // 239
      (data.origin || data.translate || data.transform ||                                                   // 240
      (data.size && !node.size)))                                                                           // 241
    data.modifier = 'Modifier';                                                                             // 242
                                                                                                            // 243
  // Allow us to prepend a modifier in a single template call                                               // 244
  if (data.modifier) {                                                                                      // 245
                                                                                                            // 246
    fview._modifier = FView._registerables[data.modifier];                                                  // 247
    fview.modifier = fview._modifier.create.call(fview, options);                                           // 248
                                                                                                            // 249
    if (node) {                                                                                             // 250
      fview.setNode(fview.modifier).add(node);                                                              // 251
      fview.view = node;                                                                                    // 252
    } else                                                                                                  // 253
      fview.setNode(fview.modifier);                                                                        // 254
                                                                                                            // 255
    if (fview._modifier.postRender)                                                                         // 256
      fview._modifier.postRender();                                                                         // 257
                                                                                                            // 258
  } else if (node) {                                                                                        // 259
                                                                                                            // 260
    fview.setNode(node);                                                                                    // 261
                                                                                                            // 262
  }                                                                                                         // 263
                                                                                                            // 264
  // could do pipe=1 in template helper?                                                                    // 265
  if (fview.parent.pipeChildrenTo)                                                                          // 266
    fview.pipeChildrenTo = fview.parent.pipeChildrenTo;                                                     // 267
                                                                                                            // 268
  // think about what else this needs                                                                       // 269
  if (fview._view && fview._view.famousCreatedPost)                                                         // 270
    fview._view.famousCreatedPost.call(fview);                                                              // 271
                                                                                                            // 272
                                                                                                            // 273
  // Render contents (and children)                                                                         // 274
  var newBlazeView, template, scopedView;                                                                   // 275
  if (blazeView.templateContentBlock) {                                                                     // 276
    if (data.template)                                                                                      // 277
      throw new Error("A block helper {{#View}} cannot also specify template=X");                           // 278
    // Called like {{#famous}}inlineContents{{/famous}}                                                     // 279
    template = blazeView.templateContentBlock;                                                              // 280
  } else if (data.template) {                                                                               // 281
    template = Template[data.template];                                                                     // 282
    if (!template)                                                                                          // 283
      throw new Error('Famous called with template="' + data.template +                                     // 284
        '" but no such template exists');                                                                   // 285
  } else {                                                                                                  // 286
    // Called with inclusion operator but not template {{>famous}}                                          // 287
    throw new Error("No template='' specified");                                                            // 288
  }                                                                                                         // 289
                                                                                                            // 290
  /*                                                                                                        // 291
  newBlazeView = template.constructView();                                                                  // 292
  scopedView = Blaze.With(dataContext, function() { return newBlazeView; });                                // 293
  Blaze.materializeView(scopedView, blazeView);                                                             // 294
  */                                                                                                        // 295
                                                                                                            // 296
  /*                                                                                                        // 297
  newBlazeView = Blaze.render(function() {                                                                  // 298
    Blaze.With(dataContext, function() { return template.constructView(); })                                // 299
  }, div, null, blazeView);                                                                                 // 300
  */                                                                                                        // 301
                                                                                                            // 302
  // Avoid Blaze running rendered() before it's actually on the DOM                                         // 303
  // Delete must happen before Blaze.render() called.                                                       // 304
  /*                                                                                                        // 305
  var onRendered = data.view == 'Surface' && template.rendered;                                             // 306
  if (onRendered)                                                                                           // 307
    delete template.rendered;                                                                               // 308
  */                                                                                                        // 309
                                                                                                            // 310
  var div = document.createElement('div');                                                                  // 311
                                                                                                            // 312
  if (inNewDataContext) {                                                                                   // 313
    var dataContext = data.data ||                                                                          // 314
      Blaze._parentData(1) && Blaze._parentData(1, true) ||                                                 // 315
      {};                                                                                                   // 316
    newBlazeView = Blaze.renderWithData(template, dataContext, div, null, blazeView);                       // 317
  } else                                                                                                    // 318
    newBlazeView = Blaze.render(template, div, null, blazeView);                                            // 319
                                                                                                            // 320
  setupEvents(fview, template);                                                                             // 321
                                                                                                            // 322
  if (data.view == 'Surface') {                                                                             // 323
    templateSurface(div, fview, scopedView,                                                                 // 324
      data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',                      // 325
      options);                                                                                             // 326
  } else {                                                                                                  // 327
    // no longer necessary since we're forced to render to a div now                                        // 328
    // runRenderedCallback(newBlazeView);                                                                   // 329
  }                                                                                                         // 330
                                                                                                            // 331
  /*                                                                                                        // 332
  var template = options.template;                                                                          // 333
  if (template && Template[template].beforeAdd)                                                             // 334
    Template[template].beforeAdd.call(this);                                                                // 335
  */                                                                                                        // 336
                                                                                                            // 337
  /*                                                                                                        // 338
   * This is the final step where the fview is added to Famous Render Tree                                  // 339
   * By deferring the actual add we can prevent flicker from various causes                                 // 340
   */                                                                                                       // 341
                                                                                                            // 342
  var parent = fview.parent;                                                                                // 343
  Engine.defer(function() {                                                                                 // 344
    if (parent._view && parent._view.add)                                                                   // 345
      // views can explicitly handle how their children should be added                                     // 346
      parent._view.add.call(parent, fview, options);                                                        // 347
    else if (parent.sequence)                                                                               // 348
      // 'sequence' can be an array, sequencer or childSequencer, it doesn't matter                         // 349
      parent.sequence.push(fview);                                                                          // 350
    else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))                      // 351
      // compView->compView.  long part above is temp hack for template rerender #2010                      // 352
      parent.setNode(fview);                                                                                // 353
    else                                                                                                    // 354
      // default case, just use the add method                                                              // 355
      parent.node.add(fview);                                                                               // 356
  });                                                                                                       // 357
                                                                                                            // 358
  /*                                                                                                        // 359
   * Now that the Template has been rendered to the Famous Render Tree (and                                 // 360
   * also to the DOM in the case of a Surface), let's run any rendered()                                    // 361
   * callback that may have been defined.                                                                   // 362
   */                                                                                                       // 363
  /*                                                                                                        // 364
  if (onRendered)                                                                                           // 365
    onRendered.call(fview.blazeView._templateInstance);                                                     // 366
  */                                                                                                        // 367
}                                                                                                           // 368
                                                                                                            // 369
/*                                                                                                          // 370
 * This is called by Blaze when the View/Template is destroyed,                                             // 371
 * e.g. {{#if 0}}{{#Scrollview}}{{/if}}.  When this happens we need to:                                     // 372
 *                                                                                                          // 373
 * 1) Destroy children (Blaze won't do it since it's not in the DOM),                                       // 374
 *    and any "eaches" that may have been added from a famousEach.                                          // 375
 * 2) Call fview.destroy() which handles cleanup w.r.t. famous,                                             // 376
 *    which lives in meteorFamousView.js.                                                                   // 377
 *                                                                                                          // 378
 * It's possible we want to have the "template" destroyed but not the                                       // 379
 * fview in the render tree to do a graceful exit animation, etc.                                           // 380
 */                                                                                                         // 381
function famousDestroyed() {                                                                                // 382
  this.view.fview.destroy(true);                                                                            // 383
}                                                                                                           // 384
                                                                                                            // 385
// Keep this at the bottom; Firefox doesn't do function hoisting                                            // 386
                                                                                                            // 387
FView.famousView = new Template(                                                                            // 388
  'famous',           // viewName: "famous"                                                                 // 389
  function() {        // Blaze.View "renderFunc"                                                            // 390
    var blazeView = this;                                                                                   // 391
    var data = Blaze.getData(blazeView);                                                                    // 392
    var tpl = blazeView._templateInstance;                                                                  // 393
    var fview = blazeView.fview;                                                                            // 394
                                                                                                            // 395
    var changed = {};                                                                                       // 396
    var orig = {};                                                                                          // 397
    for (var key in data) {                                                                                 // 398
      var value = data[key];                                                                                // 399
      if (typeof value === "string")                                                                        // 400
        value = optionString(value, key, blazeView);                                                        // 401
      if (value === '__FVIEW::SKIP__')                                                                      // 402
        continue;                                                                                           // 403
      if (!EJSON.equals(value, tpl.data[key]) || !blazeView.hasRendered) {                                  // 404
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;                                           // 405
        changed[key] = tpl.data[key] = value;                                                               // 406
      }                                                                                                     // 407
    }                                                                                                       // 408
                                                                                                            // 409
    /*                                                                                                      // 410
     * Think about:                                                                                         // 411
     *                                                                                                      // 412
     * 1) Should the function get the old value or all old data too?                                        // 413
     * 2) Should the function get all the new data, but translated?                                         // 414
     *                                                                                                      // 415
     */                                                                                                     // 416
                                                                                                            // 417
    _.each(['modifier', 'view'], function(node) {                                                           // 418
                                                                                                            // 419
      // If the fview has a modifier or view                                                                // 420
      var what = '_' + node;                                                                                // 421
      if (fview[what]) {                                                                                    // 422
        if (fview[what].attrUpdate) {                                                                       // 423
          // If that mod/view wants to finely handle reactive updates                                       // 424
          for (var key in changed)                                                                          // 425
            fview[what].attrUpdate.call(fview,                                                              // 426
              key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);                              // 427
        } else if (fview[node].setOptions && blazeView.hasRendered) {                                       // 428
          // Otherwise if it has a setOptions                                                               // 429
          fview[node].setOptions(tpl.data);                                                                 // 430
        }                                                                                                   // 431
      }                                                                                                     // 432
                                                                                                            // 433
    });                                                                                                     // 434
                                                                                                            // 435
//    console.log(view);                                                                                    // 436
    blazeView.hasRendered = true;                                                                           // 437
    return null;                                                                                            // 438
  }                                                                                                         // 439
);                                                                                                          // 440
                                                                                                            // 441
Blaze.registerHelper('famous', FView.famousView);                                                           // 442
FView.famousView.created = famousCreated;                                                                   // 443
FView.famousView.destroyed = famousDestroyed;                                                               // 444
                                                                                                            // 445
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
    fview.sequence = fview.parent.sequence.child();                                                         // 25
  });                                                                                                       // 26
}                                                                                                           // 27
                                                                                                            // 28
function cleanupChildren(blazeView) {                                                                       // 29
  var children = blazeView.fview.children;                                                                  // 30
  for (var i=0; i < children.length; i++)                                                                   // 31
    Blaze.remove(children[i].blazeView);                                                                    // 32
}                                                                                                           // 33
                                                                                                            // 34
function famousIfDestroyed() {                                                                              // 35
  this.view.fview.destroy(true);                                                                            // 36
}                                                                                                           // 37
                                                                                                            // 38
FView.famousIfView = new Template('famousIf', function() {                                                  // 39
  var blazeView = this;                                                                                     // 40
  var condition = Blaze.getData(blazeView);                                                                 // 41
                                                                                                            // 42
  log.debug('famousIf' + " (#" + blazeView.fview.id + ')' +                                                 // 43
    ' is now ' + !!condition +                                                                              // 44
    ' (parent: ' + parentViewName(blazeView.parentView) + ',' +                                             // 45
    ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                        // 46
                                                                                                            // 47
  var dataContext = null /* this.data.data */ ||                                                            // 48
    Blaze._parentData(1) && Blaze._parentData(1, true) ||                                                   // 49
    Blaze._parentData(0) && Blaze._parentData(0, true) ||                                                   // 50
    {};                                                                                                     // 51
                                                                                                            // 52
  var unusedDiv = document.createElement('div');                                                            // 53
  var template = blazeView.templateContentBlock;                                                            // 54
                                                                                                            // 55
  Engine.defer(function() {                                                                                 // 56
    // Any time condition changes, remove all old children                                                  // 57
    cleanupChildren(blazeView);                                                                             // 58
                                                                                                            // 59
    var template = condition ?                                                                              // 60
      blazeView.templateContentBlock : blazeView.templateElseBlock;                                         // 61
                                                                                                            // 62
    if (template)                                                                                           // 63
      Blaze.renderWithData(template, dataContext, unusedDiv, null, blazeView);                              // 64
  });                                                                                                       // 65
});                                                                                                         // 66
                                                                                                            // 67
Blaze.registerHelper('famousIf', FView.famousIfView);                                                       // 68
FView.famousIfView.created = famousIfCreated;                                                               // 69
FView.famousIfView.destroyed = famousIfDestroyed;                                                           // 70
                                                                                                            // 71
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
    fview.node = fview.context = famous.core.Engine.createContext(container);                               // 82
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
  if (data.useParent)                                                                                       // 109
    return null;                                                                                            // 110
  else                                                                                                      // 111
    return HTML.DIV(divOptions);                                                                            // 112
});                                                                                                         // 113
                                                                                                            // 114
Blaze.Template.registerHelper('famousContext', famousContext);                                              // 115
Blaze.Template.registerHelper('FamousContext', famousContext); // alias                                     // 116
FView.famousContext = famousContext;                                                                        // 117
                                                                                                            // 118
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
var Modifier;                                                                                               // 26
FView.ready(function(require) {                                                                             // 27
  Modifier = famous.core.Modifier;                                                                          // 28
                                                                                                            // 29
  FView.registerModifier('identity', null, {                                                                // 30
    create: function(options) {                                                                             // 31
      return new Modifier(_.extend({                                                                        // 32
        transform : Transform.identity                                                                      // 33
      }, options));                                                                                         // 34
    }                                                                                                       // 35
  });                                                                                                       // 36
                                                                                                            // 37
  FView.registerModifier('inFront', null, {                                                                 // 38
    create: function(options) {                                                                             // 39
      return new Modifier(_.extend({                                                                        // 40
        transform : Transform.inFront                                                                       // 41
      }, options));                                                                                         // 42
    }                                                                                                       // 43
  });                                                                                                       // 44
                                                                                                            // 45
  /*                                                                                                        // 46
   * "Modifier" (the base class) should not be used for dynamic                                             // 47
   * updates (as per the docs deprecating setXXX methods).  As                                              // 48
   * such, we set up everything in `create` vs an `attrUpdate`                                              // 49
   * function.                                                                                              // 50
   */                                                                                                       // 51
  FView.registerModifier('Modifier', famous.core.Modifier);                                                 // 52
                                                                                                            // 53
  function modifierMethod(fview, method, value, options) {                                                  // 54
    if (typeof options.halt !== 'undefined' ?                                                               // 55
        options.halt : fview.modifierTransitionHalt)                                                        // 56
    fview.modifier.halt();                                                                                  // 57
                                                                                                            // 58
    fview.modifier[method](                                                                                 // 59
      value,                                                                                                // 60
      options.transition || fview.modifierTransition,                                                       // 61
      options.done || fview.modifierTransitionDone                                                          // 62
    );                                                                                                      // 63
  }                                                                                                         // 64
  function degreesToRadians(x) {                                                                            // 65
    return x * Math.PI / 180;                                                                               // 66
  }                                                                                                         // 67
  FView.registerModifier('StateModifier', famous.modifiers.StateModifier, {                                 // 68
                                                                                                            // 69
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 70
      // Allow for values like { value: 30, transition: {}, halt: true }                                    // 71
      var options = {};                                                                                     // 72
      if (typeof value === 'object' && value && typeof value.value !== 'undefined') {                       // 73
        options = value;                                                                                    // 74
        value = options.value;                                                                              // 75
      }                                                                                                     // 76
      if (typeof oldValue === 'object' && oldValue && typeof oldValue.value !== 'undefined')                // 77
        oldValue = oldValue.value;                                                                          // 78
      var amount;                                                                                           // 79
                                                                                                            // 80
      switch(key) {                                                                                         // 81
        case 'transform': case 'opacity': case 'align': case 'size':                                        // 82
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value, options);                   // 83
          break;                                                                                            // 84
                                                                                                            // 85
        // Below are helpful shortcuts for transforms                                                       // 86
                                                                                                            // 87
        case 'translate':                                                                                   // 88
          modifierMethod(this, 'setTransform',                                                              // 89
            Transform.translate.apply(null, value), options);                                               // 90
          break;                                                                                            // 91
                                                                                                            // 92
        case 'scaleX': case 'scaleY': case 'scaleZ':                                                        // 93
          amount = degreesToRadians((value || 0) - (oldValue || 0));                                        // 94
          var scale = [0,0,0];                                                                              // 95
          if (key == 'scaleX') scale[0] = amount;                                                           // 96
          else if (key == 'scaleY') scale[1] = amount;                                                      // 97
          else scale[2] = amount;                                                                           // 98
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 99
            this.modifier.getFinalTransform(),                                                              // 100
            Transform.scale.apply(null, scale)                                                              // 101
          ), options);                                                                                      // 102
          break;                                                                                            // 103
                                                                                                            // 104
        case 'skewX': case 'skewY':                                                                         // 105
          amount = (value || 0) - (oldValue || 0);                                                          // 106
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 107
            this.modifier.getFinalTransform(),                                                              // 108
            Transform[key](degreesToRadians(amount))                                                        // 109
          ), options);                                                                                      // 110
          break;                                                                                            // 111
                                                                                                            // 112
        case 'skewZ': // doesn't exist in famous                                                            // 113
          amount = (value || 0) - (oldValue || 0);                                                          // 114
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 115
            this.modifier.getFinalTransform(),                                                              // 116
            Transform.skew(0, 0, degreesToRadians(amount))                                                  // 117
          ), options);                                                                                      // 118
          break;                                                                                            // 119
                                                                                                            // 120
        case 'rotateX': case 'rotateY': case 'rotateZ':                                                     // 121
          // value might be undefined from Session with no SessionDefault                                   // 122
          var rotateBy = (value || 0) - (oldValue || 0);                                                    // 123
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 124
            this.modifier.getFinalTransform(),                                                              // 125
            Transform[key](degreesToRadians(rotateBy))                                                      // 126
          ), options);                                                                                      // 127
          break;                                                                                            // 128
      }                                                                                                     // 129
    }                                                                                                       // 130
  });                                                                                                       // 131
                                                                                                            // 132
                                                                                                            // 133
});                                                                                                         // 134
                                                                                                            // 135
/*                                                                                                          // 136
FView.modifiers.pageTransition = function(blazeView, options) {                                             // 137
  this.blazeView = blazeView;                                                                               // 138
  this.famous = new Modifier({                                                                              // 139
    transform : Transform.identity,                                                                         // 140
    opacity   : 1,                                                                                          // 141
    origin    : [-0.5, -0.5],                                                                               // 142
    size      : [100, 100]                                                                                  // 143
  });                                                                                                       // 144
};                                                                                                          // 145
                                                                                                            // 146
FView.modifiers.pageTransition.prototype.postRender = function() {                                          // 147
  this.famous.setOrigin([0,0], {duration : 5000});                                                          // 148
};                                                                                                          // 149
*/                                                                                                          // 150
                                                                                                            // 151
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
	FView.registerView('SequentialLayout', famous.views.SequentialLayout);                                     // 2
	FView.registerView('View', famous.core.View);                                                              // 3
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
	FView.registerView('ContainerSurface', famous.surfaces.ContainerSurface, {                                 // 2
                                                                                                            // 3
		add: function(child_fview, child_options) {                                                               // 4
			this.view.add(child_fview);                                                                              // 5
    },                                                                                                      // 6
                                                                                                            // 7
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 8
			if (key == 'overflow')                                                                                   // 9
				this.view.setProperties({ overflow: value });                                                           // 10
			else if (key == 'class')                                                                                 // 11
				this.view.setClasses(value.split(" "));                                                                 // 12
			else if (key == 'perspective')                                                                           // 13
				this.view.context.setPerspective(value);                                                                // 14
		}                                                                                                         // 15
	});                                                                                                        // 16
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
	FView.registerView('EdgeSwapper', famous.views.EdgeSwapper, {                                              // 2
		add: function(child_fview, child_options) {                                                               // 3
			if (!this.view)                                                                                          // 4
				return;  // when?                                                                                       // 5
                                                                                                            // 6
			if (this.currentShow)                                                                                    // 7
				this.previousShow = this.currentShow;                                                                   // 8
			this.currentShow = child_fview;                                                                          // 9
                                                                                                            // 10
			child_fview.preventDestroy();                                                                            // 11
                                                                                                            // 12
			var self = this;                                                                                         // 13
			this.view.show(child_fview, null, function() {                                                           // 14
				if (self.previousShow)                                                                                  // 15
					self.previousShow.destroy();                                                                           // 16
			});                                                                                                      // 17
		}                                                                                                         // 18
	});                                                                                                        // 19
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
	FView.registerView('Flipper', famous.views.Flipper, {                                                      // 2
		add: function(child_fview, child_options) {                                                               // 3
			var target = child_options.target;                                                                       // 4
			if (!target || (target != 'back' && target != 'front'))                                                  // 5
				throw new Error('Flipper must specify target="back/front"');                                            // 6
                                                                                                            // 7
			if (target == 'front')                                                                                   // 8
				this.view.setFront(child_fview);                                                                        // 9
			else                                                                                                     // 10
				this.view.setBack(child_fview);                                                                         // 11
		}                                                                                                         // 12
	});                                                                                                        // 13
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
	FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {                                // 2
		add: function(child_fview, child_options) {                                                               // 3
			var target = child_options.target;                                                                       // 4
			if (!target)                                                                                             // 5
				throw new Error('HeaderFooterLayout children must specify target="header/footer/content"');             // 6
			this.view[target].add(child_fview);                                                                      // 7
		}                                                                                                         // 8
	});                                                                                                        // 9
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
	FView.registerView('Lightbox', famous.views.Lightbox, {                                                    // 4
		add: function(child_fview, child_options) {                                                               // 5
			if (!this.view)                                                                                          // 6
				return;  // when?                                                                                       // 7
                                                                                                            // 8
			if (this.currentShow)                                                                                    // 9
				this.previousShow = this.currentShow;                                                                   // 10
			this.currentShow = child_fview;                                                                          // 11
                                                                                                            // 12
			child_fview.preventDestroy();                                                                            // 13
                                                                                                            // 14
			var self = this;                                                                                         // 15
			this.view.show(child_fview, null, function() {                                                           // 16
				if (self.previousShow)                                                                                  // 17
					self.previousShow.destroy();                                                                           // 18
			});                                                                                                      // 19
		},                                                                                                        // 20
                                                                                                            // 21
		attrUpdate: function(key, value, oldValue, data, firstTime) {                                             // 22
			if (key == 'transition') {                                                                               // 23
				var data = FView.transitions[value];                                                                    // 24
				if (data) {                                                                                             // 25
					for (key in data)                                                                                      // 26
						this.view[key](data[key]);                                                                            // 27
				} else {                                                                                                // 28
					log.error('No such transition ' + transition);                                                         // 29
				}				                                                                                                   // 30
			}                                                                                                        // 31
		}                                                                                                         // 32
	});                                                                                                        // 33
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
	opacity: {                                                                                                 // 5
		outOpacityFrom: function (progress) {                                                                     // 6
    	return progress;                                                                                       // 7
		},                                                                                                        // 8
    inOpacityFrom: function (progress) {                                                                    // 9
			return progress;                                                                                         // 10
    },                                                                                                      // 11
    outTransformFrom: transformIdentity, inTransformFrom: transformIdentity                                 // 12
	},                                                                                                         // 13
	slideWindow: {                                                                                             // 14
    outTransformFrom: function(progress) {                                                                  // 15
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);                   // 16
    },                                                                                                      // 17
    inTransformFrom: function(progress) {                                                                   // 18
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);                               // 19
    },                                                                                                      // 20
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity                                                 // 21
	},                                                                                                         // 22
	WIP: {                                                                                                     // 23
    outTransformFrom: function(progress) {                                                                  // 24
      return Transform.rotateY(Math.PI*progress);                                                           // 25
    },                                                                                                      // 26
    inTransformFrom: function(progress) {                                                                   // 27
      return Transform.rotateY(Math.PI + Math.PI*progress);                                                 // 28
    },                                                                                                      // 29
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity                                                 // 30
	}                                                                                                          // 31
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
	FView.registerView('RenderController', famous.views.RenderController, {                                    // 42
		add: function(child_fview, child_options) {                                                               // 43
			var fview = this;                                                                                        // 44
                                                                                                            // 45
			if (!fview.view)                                                                                         // 46
				return;  // when?                                                                                       // 47
                                                                                                            // 48
			if (fview._currentShow)                                                                                  // 49
				fview._previousShow = fview._currentShow;                                                               // 50
			fview._currentShow = child_fview;                                                                        // 51
                                                                                                            // 52
			child_fview.preventDestroy();                                                                            // 53
                                                                                                            // 54
			var transition = fview._transition || null;                                                              // 55
                                                                                                            // 56
			var origTransitionData = {};                                                                             // 57
			if (fview._transitionOnce !== 'undefined') {                                                             // 58
				origTransitionData.transition = transition;                                                             // 59
				transition = fview._transitionOnce;                                                                     // 60
				delete fview._transitionOnce;                                                                           // 61
			}                                                                                                        // 62
			if (fview._transitionModifierOnce) {                                                                     // 63
				origTransitionData.modifierName = fview._transitionModifier;                                            // 64
				var data = FView.transitionModifiers[fview._transitionModifierOnce];                                    // 65
				if (data) {                                                                                             // 66
					for (var key in data)                                                                                  // 67
						fview.view[key](data[key]);                                                                           // 68
				} else {                                                                                                // 69
					log.error('No such transition ' + fview._transitionModifierOnce);                                      // 70
				}                                                                                                       // 71
				delete fview._transitionModifierOnce;                                                                   // 72
			}                                                                                                        // 73
                                                                                                            // 74
			fview.view.show(child_fview, transition, function() {                                                    // 75
				// Now that transition is complete, we can destroy the old template                                     // 76
				if (fview._previousShow)                                                                                // 77
					fview._previousShow.destroy();                                                                         // 78
                                                                                                            // 79
				// If _transitionOnce was used, now we can restore the defaults                                         // 80
				if (origTransitionData.modifierName) {                                                                  // 81
					console.log('restore ' + origTransitionData.modifierName);                                             // 82
					var data = FView.transitionModifiers[origTransitionData.modifierName];                                 // 83
					for (var key in data)                                                                                  // 84
						fview.view[key](data[key]);                                                                           // 85
				}                                                                                                       // 86
				if (origTransitionData.transition)                                                                      // 87
					fview._transition = origTransitionData.transition;                                                     // 88
			});                                                                                                      // 89
		},                                                                                                        // 90
                                                                                                            // 91
		attrUpdate: function(key, value, oldValue, data, firstTime) {                                             // 92
			if (key == 'transition') {                                                                               // 93
				var data = FView.transitionModifiers[value];                                                            // 94
				if (data) {                                                                                             // 95
					this._transitionModifier = value;                                                                      // 96
					for (var key in data)                                                                                  // 97
						this.view[key](data[key]);                                                                            // 98
				} else {                                                                                                // 99
					log.error('No such transition ' + value);                                                              // 100
				}				                                                                                                   // 101
			}                                                                                                        // 102
		}                                                                                                         // 103
	});                                                                                                        // 104
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
	FView.registerView('Scrollview', famous.views.Scrollview, {                                                // 2
                                                                                                            // 3
		create: function(options) {                                                                               // 4
			var fview = this;                                                                                        // 5
			var scrollview = new fview._view.constructor(options);                                                   // 6
                                                                                                            // 7
			fview.properties = new ReactiveDict();                                                                   // 8
                                                                                                            // 9
			if (options.paginated) {                                                                                 // 10
				fview.properties.set('index', 0);                                                                       // 11
                                                                                                            // 12
				// famo.us pageChange event seems completely broken??                                                   // 13
				scrollview.on('pageChange', function(props) {                                                           // 14
					for (key in props)                                                                                     // 15
						fview.properties.set(key, props[key]);                                                                // 16
				});                                                                                                     // 17
                                                                                                            // 18
				// workaround for the above:                                                                            // 19
				// - fires when event doesn't fire                                                                      // 20
				// - will override wrong value before flush                                                             // 21
				scrollview.on('settle', function(props) {                                                               // 22
					fview.properties.set('index',                                                                          // 23
						fview.view.getCurrentIndex());                                                                        // 24
				});                                                                                                     // 25
			}                                                                                                        // 26
                                                                                                            // 27
			return scrollview;                                                                                       // 28
		},                                                                                                        // 29
                                                                                                            // 30
		famousCreatedPost: function() {                                                                           // 31
			this.pipeChildrenTo = this.parent.pipeChildrenTo                                                         // 32
				? [ this.view, this.parent.pipeChildrenTo[0] ]                                                          // 33
				: [ this.view ];                                                                                        // 34
		}                                                                                                         // 35
                                                                                                            // 36
	});                                                                                                        // 37
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
	FView.registerView('Surface', famous.core.Surface, {                                                       // 2
                                                                                                            // 3
		add: function(child_fview, child_options) {                                                               // 4
			var blazeView = this.blazeView;                                                                          // 5
                                                                                                            // 6
		  log.error("You tried to embed a " + child_fview._view.name + " inside a Surface"                        // 7
		    + ' (parent: ' + parentViewName(blazeView) + ','                                                      // 8
		    + ' template: ' + parentTemplateName(blazeView) + ').  '                                              // 9
		    + "Surfaces are endpoints in the Famous Render Tree and may not contain "                             // 10
		  	+ "children themselves.  See "                                                                         // 11
		    + "https://github.com/gadicc/meteor-famous-views/issues/78 for more info.");                          // 12
                                                                                                            // 13
			throw new Error("Cannot add View to Surface");                                                           // 14
		},                                                                                                        // 15
                                                                                                            // 16
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                           // 17
    	switch(key) {                                                                                          // 18
    		case 'size':                                                                                          // 19
    			// Let our modifier control our size                                                                 // 20
    			// Long term, rather specify modifierSize and surfaceSize args?                                      // 21
    			if (this._modifier && this._modifier.name == 'StateModifier')                                        // 22
						this.surface.setSize([undefined,undefined]);                                                          // 23
    			else {                                                                                               // 24
            this.surface.setSize(value);                                                                    // 25
          }                                                                                                 // 26
    			break;                                                                                               // 27
                                                                                                            // 28
        case 'class':                                                                                       // 29
        case 'classes':                                                                                     // 30
          if (Match.test(value, String))                                                                    // 31
            value = value == "" ? [] : value.split(" ");                                                    // 32
          else if (!Match.test(value, [String]))                                                            // 33
            throw new Error('Surface class= expects string or array of strings');                           // 34
          value.push(this.surfaceClassName);                                                                // 35
          this.view.setClasses(value);                                                                      // 36
          break;                                                                                            // 37
                                                                                                            // 38
        case 'style':                                                                                       // 39
        case 'properties':                                                                                  // 40
          if (Match.test(value, String)) {                                                                  // 41
            var parts = value.split(';'), pair;                                                             // 42
            value = {};                                                                                     // 43
            for (var i=0; i < parts.length; i++) {                                                          // 44
              pair = parts[i].split(':');                                                                   // 45
              if (pair.length > 1)                                                                          // 46
                value[pair[0].trim()] = pair[1].trim();                                                     // 47
            }                                                                                               // 48
          } else if (!Match.test(value, Object))                                                            // 49
            throw new Error('Surface properties= expects string or key-value dictionary');                  // 50
          this.view.setProperties(value);                                                                   // 51
          break;                                                                                            // 52
    	}                                                                                                      // 53
    }                                                                                                       // 54
                                                                                                            // 55
	});                                                                                                        // 56
});                                                                                                         // 57
                                                                                                            // 58
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['gadicohen:famous-views'] = {
  FView: FView
};

})();
