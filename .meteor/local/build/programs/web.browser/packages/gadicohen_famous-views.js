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
var FView, log, Transform, optionString, handleOptions, options, MeteorFamousView, throwError, sequencer, parentViewName, parentTemplateName, runRenderedCallback, key;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/gadicohen:famous-views/lib/famous-views.js                                                      //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var mainCtx = null;                                                                                         // 1
                                                                                                            // 2
// Could use something from --settings too                                                                  // 3
var isDev = ("localhost" === window.location.hostname);                                                     // 4
                                                                                                            // 5
log = new Logger('famous-views');                                                                           // 6
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');                                                  // 7
                                                                                                            // 8
FView = {};                                                                                                 // 9
FView.log = log; // allow other fview-* packages to use this too                                            // 10
                                                                                                            // 11
var readyQueue = [];                                                                                        // 12
var readyDep = new Tracker.Dependency;                                                                      // 13
FView.ready = function(func) {                                                                              // 14
	if (func) {                                                                                                // 15
    if (FView.isReady)                                                                                      // 16
      func();                                                                                               // 17
    else                                                                                                    // 18
		  readyQueue.push(func);                                                                                  // 19
  } else {                                                                                                  // 20
		readyDep.depend();                                                                                        // 21
		return FView.isReady;                                                                                     // 22
	}                                                                                                          // 23
}                                                                                                           // 24
FView.runReadies = function() {                                                                             // 25
	FView.isReady = true;                                                                                      // 26
	readyDep.changed();                                                                                        // 27
	while(readyQueue.length) {                                                                                 // 28
		(readyQueue.shift())();                                                                                   // 29
	}                                                                                                          // 30
}                                                                                                           // 31
                                                                                                            // 32
// famous-views globals from Famous                                                                         // 33
Transform = null;                                                                                           // 34
                                                                                                            // 35
if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')                                       // 36
define(function(require) {                                                                                  // 37
//  console.log(1);                                                                                         // 38
});                                                                                                         // 39
                                                                                                            // 40
FView.startup = function() {                                                                                // 41
  log.debug('Current logging default is "debug" (for localhost).  '                                         // 42
    + 'Change in your app with Logger.setLevel("famous-views", "info");');                                  // 43
  FView.startedUp = true;                                                                                   // 44
                                                                                                            // 45
  Transform = famous.core.Transform;                                                                        // 46
                                                                                                            // 47
  // Required document.body                                                                                 // 48
  Meteor.startup(function() {                                                                               // 49
                                                                                                            // 50
    // Sanity check, disallow templates with same name as a View                                            // 51
    var names = [];                                                                                         // 52
    for (var name in FView.views)                                                                           // 53
      if (Template[name])                                                                                   // 54
        names.push(name);                                                                                   // 55
    if (names.length)                                                                                       // 56
      throw new Error("You have created Template(s) with the same name "                                    // 57
        + "as these famous-views: " + names.join(', ')                                                      // 58
        + '.  Nothing will work until you rename them.');                                                   // 59
                                                                                                            // 60
    if (FView.mainCtx)                                                                                      // 61
      mainCtx = FView.mainCtx;                                                                              // 62
    else {                                                                                                  // 63
      if (typeof FView.mainCtx === 'undefined')                                                             // 64
        log.debug('Creating a new main context.  If you already have '                                      // 65
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '                            // 66
          + 'rid of this warning, or null to not set a mainContext)');                                      // 67
      if (FView.mainCtx !== null)                                                                           // 68
        FView.mainCtx = mainCtx = famous.core.Engine.createContext();                                       // 69
    }                                                                                                       // 70
                                                                                                            // 71
    // Note, various views are registered here                                                              // 72
    FView.runReadies();                                                                                     // 73
                                                                                                            // 74
    if (Template.famousInit)                                                                                // 75
      Blaze.render(Template.famousInit, document.body);                                                     // 76
  });                                                                                                       // 77
};                                                                                                          // 78
                                                                                                            // 79
FView.isReady = false;                                                                                      // 80
                                                                                                            // 81
// Imports from weak deps                                                                                   // 82
/*                                                                                                          // 83
if (Package['mjnetworks:famous'])                                                                           // 84
  // @famono ignore                                                                                         // 85
  famous = Package['mjnetworks:famous'].famous;                                                             // 86
else if (Package['mjnetworks:mj-famous'])                                                                   // 87
  // @famono ignore                                                                                         // 88
  famous = Package['mjnetworks:mj-famous'].famous;                                                          // 89
*/                                                                                                          // 90
                                                                                                            // 91
// Load as ealry as possible, and keep trying                                                               // 92
if (typeof(famous) !== 'undefined') {                                                                       // 93
  log.debug("Starting up.  famous global found while loading package, great!");                             // 94
  FView.startup();                                                                                          // 95
}                                                                                                           // 96
else                                                                                                        // 97
  Meteor.startup(function() {                                                                               // 98
    if (typeof(famous) !== 'undefined') {                                                                   // 99
      log.debug("Starting up.  famous global found during Meteor.startup()");                               // 100
    	FView.startup();                                                                                       // 101
    } else {                                                                                                // 102
      log.debug("No famous global available in Meteor.startup().  Call FView.startup() when appropriate."); // 103
    }                                                                                                       // 104
  });                                                                                                       // 105
                                                                                                            // 106
var optionEval = function(string, key) {                                                                    // 107
  if (FView.attrEvalAllowedKeys && (FView.attrEvalAllowedKeys == '*'                                        // 108
      || FView.attrEvalAllowedKeys.indexOf(key) > -1))                                                      // 109
    return eval(string.substr(5));  // strip "eval:"                                                        // 110
  else                                                                                                      // 111
    throw new Error("[famous-views] Blocked " + key + '="' + string + '".  Set '                            // 112
      + 'FView.attrEvalAllowedKeys = "*" or FView.attrEvalAllowedKeys = ["'                                 // 113
      + key + '"] and make sure you understand the security implications. '                                 // 114
      + 'Particularly, make sure none of your helper functions return a string '                            // 115
      + 'that can be influenced by client-side input');                                                     // 116
}                                                                                                           // 117
                                                                                                            // 118
var optionBlaze = function(string, key, blazeView) {                                                        // 119
  // temporary, for options that get called (wrongly!) from init as well                                    // 120
  // or maybe that is the right place and render is the wrong place :)                                      // 121
  if (!blazeView)                                                                                           // 122
    return '__FVIEW::SKIP__';                                                                               // 123
                                                                                                            // 124
  var args = string.substr(2, string.length-4).split(" ");                                                  // 125
  var view = blazeView, value;                                                                              // 126
  while (view.name.substr(0,9) !== 'Template.')                                                             // 127
    view = view.parentView;                                                                                 // 128
  value = view.lookup(args.splice(0,1)[0]);                                                                 // 129
                                                                                                            // 130
  // Scalar value from data context                                                                         // 131
  if (typeof value !== 'function')                                                                          // 132
    return value;                                                                                           // 133
                                                                                                            // 134
  // Reactive value from helper                                                                             // 135
  _.defer(function() {                                                                                      // 136
    blazeView.autorun(function() {                                                                          // 137
      var run = value.apply(null, args);                                                                    // 138
      blazeView.fview._view.attrUpdate.call(blazeView.fview, key, run);                                     // 139
    });                                                                                                     // 140
  });                                                                                                       // 141
                                                                                                            // 142
  return '__FVIEW::SKIP__';                                                                                 // 143
}                                                                                                           // 144
                                                                                                            // 145
optionString = function(string, key, blazeView) {                                                           // 146
  if (string.substr(0,5) == 'eval:')                                                                        // 147
    return optionEval(string, key);                                                                         // 148
  if (string == 'undefined')                                                                                // 149
    return undefined;                                                                                       // 150
  if (string == 'true')                                                                                     // 151
    return true;                                                                                            // 152
  if (string == 'false')                                                                                    // 153
    return false;                                                                                           // 154
  if (string === null)                                                                                      // 155
    return null;                                                                                            // 156
                                                                                                            // 157
  if (string.substr(0,2) === '{{')                                                                          // 158
    return optionBlaze(string, key, blazeView);                                                             // 159
                                                                                                            // 160
  if (string[0] == '[' || string[0] == '{') {                                                               // 161
    var obj;                                                                                                // 162
    string = string.replace(/\bauto\b/g, '"auto"');                                                         // 163
    string = string.replace(/undefined/g, '"__undefined__"');                                               // 164
    // JSON can't parse values like ".5" so convert them to "0.5"                                           // 165
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');                                        // 166
                                                                                                            // 167
    try {                                                                                                   // 168
      obj = JSON.parse(string);                                                                             // 169
    }                                                                                                       // 170
    catch (err) {                                                                                           // 171
      log.error("Couldn't parse JSON, skipping: " + string);                                                // 172
      log.error(err);                                                                                       // 173
      return undefined;                                                                                     // 174
    }                                                                                                       // 175
                                                                                                            // 176
    for (var key in obj)                                                                                    // 177
      if (obj[key] === '__undefined__')                                                                     // 178
        obj[key] = undefined;                                                                               // 179
    return obj;                                                                                             // 180
  } else {                                                                                                  // 181
    var float = parseFloat(string);                                                                         // 182
    if (!_.isNaN(float))                                                                                    // 183
      return float;                                                                                         // 184
    return string;                                                                                          // 185
  }                                                                                                         // 186
                                                                                                            // 187
  /*                                                                                                        // 188
  if (string == 'undefined')                                                                                // 189
    return undefined;                                                                                       // 190
  if (string == 'true')                                                                                     // 191
    return true;                                                                                            // 192
  if (string == 'false')                                                                                    // 193
    return false;                                                                                           // 194
  if (string.substr(0,1) == '[') {                                                                          // 195
    var out = [];                                                                                           // 196
    string = string.substr(1, string.length-2).split(',');                                                  // 197
    for (var i=0; i < string.length; i++)                                                                   // 198
      out.push(optionString(string[i].trim()));                                                             // 199
    return out;                                                                                             // 200
  }                                                                                                         // 201
  if (string.match(/^[0-9\.]+$/))                                                                           // 202
    return parseFloat(string);                                                                              // 203
  */                                                                                                        // 204
}                                                                                                           // 205
                                                                                                            // 206
handleOptions = function(data) {                                                                            // 207
  options = {};                                                                                             // 208
  for (var key in data) {                                                                                   // 209
    var value = data[key];                                                                                  // 210
    if (_.isString(value))                                                                                  // 211
      options[key] = optionString(value, key);                                                              // 212
    else                                                                                                    // 213
      options[key] = value;                                                                                 // 214
  }                                                                                                         // 215
  return options;                                                                                           // 216
}                                                                                                           // 217
                                                                                                            // 218
/* --- totally not done --- */                                                                              // 219
                                                                                                            // 220
FView.showTreeGet = function(renderNode) {                                                                  // 221
  var obj = renderNode._node._child._object;                                                                // 222
    if (obj.node)                                                                                           // 223
      obj.node = this.showTreeGet(obj.node);                                                                // 224
  return obj;                                                                                               // 225
}                                                                                                           // 226
FView.showTreeChildren = function(renderNode) {                                                             // 227
  var out = {}, i=0;                                                                                        // 228
  if (renderNode._node)                                                                                     // 229
    out['child'+(i++)] = this.showTreeGet(renderNode)                                                       // 230
  return out;                                                                                               // 231
}                                                                                                           // 232
FView.showTree = function() {                                                                               // 233
  console.log(this.showTreeChildren(mainCtx));                                                              // 234
}                                                                                                           // 235
                                                                                                            // 236
/* --- */                                                                                                   // 237
                                                                                                            // 238
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
  parent = parent ? parent.fview : { node: FView.mainCtx, children: [] };                                   // 27
                                                                                                            // 28
  this.parent = parent;                                                                                     // 29
                                                                                                            // 30
  // Keep track of fview children, since Meteor only tracks children in DOM                                 // 31
  parent.children.push(this);                                                                               // 32
                                                                                                            // 33
  // Adding to famous parent node, once done here, is now in famous.js                                      // 34
}                                                                                                           // 35
                                                                                                            // 36
MeteorFamousView.prototype.render = function() {                                                            // 37
  if (this.isDestroyed)                                                                                     // 38
    return [];                                                                                              // 39
  if (this.node)                                                                                            // 40
    return this.node.render();                                                                              // 41
  console.log('render called before anything set');                                                         // 42
  return [];                                                                                                // 43
}                                                                                                           // 44
                                                                                                            // 45
MeteorFamousView.prototype.setNode = function(node) {                                                       // 46
  // surface or modifier/view                                                                               // 47
  this.node = new famous.core.RenderNode(node);                                                             // 48
  return this.node;                                                                                         // 49
}                                                                                                           // 50
                                                                                                            // 51
/*                                                                                                          // 52
  Replace fview.onDestroy = function() with fview.on('destroy', function)                                   // 53
  which can be called multiple times.  The old way will still work                                          // 54
  but will show a deprecation warning.                                                                      // 55
                                                                                                            // 56
MeteorFamousView.prototype.onDestroy = function() {                                                         // 57
  return '__original__';                                                                                    // 58
}                                                                                                           // 59
*/                                                                                                          // 60
                                                                                                            // 61
MeteorFamousView.prototype.preventDestroy = function() {                                                    // 62
	this.destroyPrevented = true;	                                                                             // 63
}                                                                                                           // 64
                                                                                                            // 65
MeteorFamousView.prototype.destroy = function(isTemplateDestroy) {                                          // 66
  var fview = this;                                                                                         // 67
  log.debug('Destroying ' + (fview._view ? fview._view.name : fview.kind)                                   // 68
    + ' (#' + fview.id + ') and children'                                                                   // 69
    + (isTemplateDestroy&&fview.destroyPrevented ? ' (destroyPrevented)':''));                              // 70
                                                                                                            // 71
  // XXX ADD TO DOCS                                                                                        // 72
  if (isTemplateDestroy) {                                                                                  // 73
                                                                                                            // 74
    /*                                                                                                      // 75
    if (fview.onDestroy() === '__original__')                                                               // 76
      for (var i=0; i < fview._callbacks.destroy.length; i++)                                               // 77
        fview._calbacks.destroy[i].call(fview);                                                             // 78
    else                                                                                                    // 79
      log.warn('#' + fview.id + ' - you set fview.onDestroy = function().  '                                // 80
        + 'This will work for now '                                                                         // 81
        + 'but is deprecated.  Please use fview.onDestoy(callback), which may '                             // 82
        + 'be used multiple times, and receives the `fview` as `this`.');                                   // 83
    */                                                                                                      // 84
                                                                                                            // 85
    if (fview.onDestroy)                                                                                    // 86
      fview.onDestroy();                                                                                    // 87
                                                                                                            // 88
    if (fview.destroyPrevented) {                                                                           // 89
      // log.debug('  #' + fview.id + ' - destroyPrevented');                                               // 90
      return;                                                                                               // 91
    }                                                                                                       // 92
  }                                                                                                         // 93
                                                                                                            // 94
  // First delete children (via Blaze to trigger Template destroy callback)                                 // 95
  if (fview.children)                                                                                       // 96
    for (var i=0; i < fview.children.length; i++)                                                           // 97
      Blaze.remove(fview.children[i].blazeView);                                                            // 98
                                                                                                            // 99
  fview.isDestroyed = true;                                                                                 // 100
  fview.node = null;                                                                                        // 101
  fview.view = null;                                                                                        // 102
  fview.modifier = null;                                                                                    // 103
  delete(meteorFamousViews[fview.id]);                                                                      // 104
                                                                                                            // 105
  // If we're part of a sequence, now is the time to remove ourselves                                       // 106
  if (fview.parent.sequence) {                                                                              // 107
    if (fview.sequence) {                                                                                   // 108
      // TODO, we're a child sequence, remove the child (TODO in sequencer.js)                              // 109
      // log.debug("child sequence");                                                                       // 110
    } else {                                                                                                // 111
      _.defer(function() {                                                                                  // 112
        fview.parent.sequence.remove(fview);  // less flicker in a defer                                    // 113
      });                                                                                                   // 114
    }                                                                                                       // 115
  }                                                                                                         // 116
}                                                                                                           // 117
                                                                                                            // 118
MeteorFamousView.prototype.getSize = function() {                                                           // 119
  return this.node && this.node.getSize() || this.size || [true,true];                                      // 120
}                                                                                                           // 121
                                                                                                            // 122
throwError = function(startStr, object) {                                                                   // 123
  if (object instanceof Object)                                                                             // 124
    console.error(object);                                                                                  // 125
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or '                               // 126
      + 'DOM node, but got ' + object);                                                                     // 127
}                                                                                                           // 128
                                                                                                            // 129
FView.from = function(viewOrTplorEl) {                                                                      // 130
  if (viewOrTplorEl instanceof Blaze.View)                                                                  // 131
    return FView.fromBlazeView(viewOrTplorEl);                                                              // 132
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)                                                 // 133
    return FView.fromTemplate(viewOrTplorEl);                                                               // 134
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')                                     // 135
    return FView.fromElement(viewOrTplorEl);                                                                // 136
  else {                                                                                                    // 137
    throwError('FView.getData() expects BlazeView or TemplateInstance or '                                  // 138
        + 'DOM node, but got ', viewOrTplorEl);                                                             // 139
  }                                                                                                         // 140
}                                                                                                           // 141
                                                                                                            // 142
FView.fromBlazeView = FView.dataFromView = function(view) {                                                 // 143
  while ((view=view.parentView) && !view.fview);                                                            // 144
  return view ? view.fview : undefined;                                                                     // 145
}                                                                                                           // 146
                                                                                                            // 147
FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {                                       // 148
  return this.dataFromView(tplInstance.view);                                                               // 149
}                                                                                                           // 150
                                                                                                            // 151
FView.fromElement = FView.dataFromElement = function(el) {                                                  // 152
  var view = Blaze.getView(el);                                                                             // 153
  return this.dataFromView(view);                                                                           // 154
}                                                                                                           // 155
                                                                                                            // 156
FView.byId = function(id) {                                                                                 // 157
  return meteorFamousViews[id];                                                                             // 158
}                                                                                                           // 159
                                                                                                            // 160
// Leave as alias?  Deprecate?                                                                              // 161
FView.dataFromCmp = FView.dataFromComponent;                                                                // 162
FView.dataFromTpl = FView.dataFromTemplate;                                                                 // 163
                                                                                                            // 164
FView.dataFromComponent = function(component) {                                                             // 165
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");      // 166
  return FView.fromBlazeView(component);                                                                    // 167
}                                                                                                           // 168
                                                                                                            // 169
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
  arguments[0] += this.startIndex;  // add startIndex and re-use args                                       // 62
  return this.parent.splice.apply(this.parent, arguments);                                                  // 63
};                                                                                                          // 64
                                                                                                            // 65
/*                                                                                                          // 66
 * Currently we don't keep track of our children and descedent children separately,                         // 67
 * so grandChild.push(x) && parent.remove(x) would break everything.  That's                                // 68
 * because x lands up in our top-level list, and there's nothing to stop us                                 // 69
 * from removing it from the wrong place (and breaking all indexes).  Although as                           // 70
 * long as we don't mistakenly do this in our code, the only way this can happen                            // 71
 * is if x exists in both the grandParent and grandChild (not supported).                                   // 72
 */                                                                                                         // 73
sequencer.prototype.remove = function(value /*, suspectedIndex */) {                                        // 74
  var index;                                                                                                // 75
  for (index=0; index < this._sequence.length; index++)                                                     // 76
    if (this._sequence[index] === value)                                                                    // 77
      return this.splice(index, 1);                                                                         // 78
};                                                                                                          // 79
                                                                                                            // 80
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
    window.setTimeout(function() {                                                                          // 41
      fview.autoHeight();                                                                                   // 42
    }, 10);  // FYI: 16.67ms = 1x 60fps animation frame                                                     // 43
  }                                                                                                         // 44
}                                                                                                           // 45
                                                                                                            // 46
function templateSurface(div, fview, renderedTemplate, tName, options) {                                    // 47
  // var div = document.createElement('div');                                                               // 48
  var autoSize = options.size && options.size[1] == 'auto';                                                 // 49
                                                                                                            // 50
  if (autoSize)                                                                                             // 51
    options.size = [0, 0];                                                                                  // 52
  else                                                                                                      // 53
    div.style.height='100%';                                                                                // 54
  div.style.width='100%';                                                                                   // 55
                                                                                                            // 56
  /*                                                                                                        // 57
  if (fview.uiHooks)                                                                                        // 58
    div._uihooks = fview.uiHooks;                                                                           // 59
  */                                                                                                        // 60
                                                                                                            // 61
//  UI.insert(renderedTemplate, div);                                                                       // 62
                                                                                                            // 63
//  we're now forced to always render in main func                                                          // 64
//  renderedTemplate.domrange.attach(div);                                                                  // 65
                                                                                                            // 66
  if (!options)                                                                                             // 67
    options = {};                                                                                           // 68
                                                                                                            // 69
  // If any HTML was generated, create a surface for it                                                     // 70
  if (options.view=='Surface' || div.innerHTML.trim().length) {                                             // 71
    fview.surfaceClassName = 't_'+tName.replace(/ /, '_');                                                  // 72
    if (options.classes)                                                                                    // 73
      throw new Error('Surface classes="x,y" is deprecated.  Use class="x y" instead.');                    // 74
                                                                                                            // 75
    var surfaceOptions = {                                                                                  // 76
      content: div,                                                                                         // 77
      size: fview.size                                                                                      // 78
    };                                                                                                      // 79
                                                                                                            // 80
    fview.surface = fview.view;                                                                             // 81
    fview.surface.setOptions(surfaceOptions);                                                               // 82
                                                                                                            // 83
    /*                                                                                                      // 84
    fview.surface = new famous.core.Surface(surfaceOptions);                                                // 85
    if (!fview.node)                                                                                        // 86
      // nothing, i.e. Surface & no modifier                                                                // 87
      fview.setNode(fview.surface);                                                                         // 88
    else if (!fview.sequencer)                                                                              // 89
      // add Surface as only child                                                                          // 90
      fview.node.add(fview.surface);                                                                        // 91
    else {                                                                                                  // 92
      fview.sequencer.sequence.push(fview.surface);                                                         // 93
    }                                                                                                       // 94
    */                                                                                                      // 95
                                                                                                            // 96
    var pipeChildrenTo = fview.parent.pipeChildrenTo;                                                       // 97
    if (pipeChildrenTo)                                                                                     // 98
      for (var i=0; i < pipeChildrenTo.length; i++)                                                         // 99
        fview.surface.pipe(pipeChildrenTo[i]);                                                              // 100
                                                                                                            // 101
    if (autoSize) {                                                                                         // 102
      fview.autoHeight = autoHeight;                                                                        // 103
      fview.autoHeight();                                                                                   // 104
      // Deprecated 2014-11-01                                                                              // 105
      log.warn(fview.surfaceClassName + ': size="[undefined,auto"] is deprecated.'                          // 106
        + 'Since Famo.us 0.3.0 '                                                                            // 107
        + 'you can simply use size="[undefined,true]" and it will work as '                                 // 108
        + 'expected in all cases (including SequentialLayout, Scrollview, etc');                            // 109
    }                                                                                                       // 110
  }                                                                                                         // 111
}                                                                                                           // 112
                                                                                                            // 113
// Used by famousEach too                                                                                   // 114
parentViewName = function(blazeView) {                                                                      // 115
  while (blazeView.name == "with" || blazeView.name == "(contentBlock)")                                    // 116
    blazeView = blazeView.parentView;                                                                       // 117
  return blazeView.name;                                                                                    // 118
}                                                                                                           // 119
parentTemplateName = function(blazeView) {                                                                  // 120
  while (blazeView && !blazeView.name.match(/^Template/))                                                   // 121
    blazeView = blazeView.parentView;                                                                       // 122
  return blazeView.name;                                                                                    // 123
}                                                                                                           // 124
                                                                                                            // 125
// Need to fire manually at appropriate time,                                                               // 126
// for non-Surfaces which are never added to the DOM by meteor                                              // 127
runRenderedCallback = function(view) {                                                                      // 128
//  if (view._callbacks.rendered && view._callbacks.rendered.length)                                        // 129
  var needsRenderedCallback = true; // uh yeah, TODO :>                                                     // 130
  view.domrange = null; // TODO, check if it's a surface / real domrange                                    // 131
  if (needsRenderedCallback && ! view.isDestroyed &&                                                        // 132
      view._callbacks.rendered && view._callbacks.rendered.length) {                                        // 133
    Tracker.afterFlush(function callRendered() {                                                            // 134
      if (needsRenderedCallback && ! view.isDestroyed) {                                                    // 135
        needsRenderedCallback = false;                                                                      // 136
        Blaze._fireCallbacks(view, 'rendered');                                                             // 137
      }                                                                                                     // 138
    });                                                                                                     // 139
  }                                                                                                         // 140
}                                                                                                           // 141
                                                                                                            // 142
function famousCreated() {                                                                                  // 143
  var blazeView = this.view;                                                                                // 144
  var famousViewName = blazeView.name ? blazeView.name.substr(7) : "";                                      // 145
                                                                                                            // 146
  // don't re-use parent's data/attributes, don't mutate data object                                        // 147
  var inNewDataContext = blazeView.parentView && blazeView.parentView.__isTemplateWith;                     // 148
  var data = inNewDataContext ? _.clone(this.data) : {};                                                    // 149
                                                                                                            // 150
  // deprecate                                                                                              // 151
  if (!data.view && famousViewName === "")                                                                  // 152
    data.view = 'SequentialLayout';                                                                         // 153
  if (!data.view) data.view = famousViewName;                                                               // 154
  else if (!famousViewName) {                                                                               // 155
    famousViewName = data.view;                                                                             // 156
    blazeView.viewName = 'Famous.' + famousViewName;                                                        // 157
  }                                                                                                         // 158
                                                                                                            // 159
  // Deprecated 2014-08-17                                                                                  // 160
  if (data.size && _.isString(data.size) && data.size.substr(0,1) != '[')                                   // 161
    throw new Error('[famous-views] size="' + data.size + '" is deprecated, please use '                    // 162
      + 'size="['+ data.size + ']" instead');                                                               // 163
                                                                                                            // 164
  // See attribute parsing notes in README                                                                  // 165
  var options = handleOptions(data);                                                                        // 166
                                                                                                            // 167
  // These require special handling (but should still be moved elsewhere)                                   // 168
  if (data.direction)                                                                                       // 169
    options.direction = data.direction == "Y"                                                               // 170
      ? famous.utilities.Utility.Direction.Y                                                                // 171
      : famous.utilities.Utility.Direction.X;                                                               // 172
  if (options.translate) {                                                                                  // 173
    options.transform =                                                                                     // 174
      Transform.translate.apply(null, options.translate);                                                   // 175
    delete options.translate;                                                                               // 176
  }                                                                                                         // 177
  // any other transforms added here later must act on existing transform matrix                            // 178
                                                                                                            // 179
  var fview = blazeView.fview = new MeteorFamousView(blazeView, options);                                   // 180
                                                                                                            // 181
  var pViewName = parentViewName(blazeView.parentView);                                                     // 182
  var pTplName = parentTemplateName(blazeView.parentView);                                                  // 183
  log.debug('New ' + famousViewName + " (#" + fview.id + ')'                                                // 184
    + (data.template                                                                                        // 185
      ? ', content from "' + data.template + '"'                                                            // 186
      : ', content from inline block')                                                                      // 187
    + ' (parent: ' + pViewName                                                                              // 188
    + (pViewName == pTplName                                                                                // 189
      ? ''                                                                                                  // 190
      : ', template: ' + pTplName)                                                                          // 191
    + ')');                                                                                                 // 192
                                                                                                            // 193
  /*                                                                                                        // 194
  if (FView.viewOptions[data.view]                                                                          // 195
      && FView.viewOptions[data.view].childUiHooks) {                                                       // 196
    // if childUiHooks specified, store them here too                                                       // 197
    fview.childUiHooks = FView.viewOptions[data.view].childUiHooks;                                         // 198
  } else if (fview.parent.childUiHooks) {                                                                   // 199
    if (data.view == 'Surface') {                                                                           // 200
      fview.uiHooks = fview.parent.childUiHooks;                                                            // 201
    } else {                                                                                                // 202
      // Track descedents                                                                                   // 203
    }                                                                                                       // 204
    console.log('child ' + data.view);                                                                      // 205
  }                                                                                                         // 206
  */                                                                                                        // 207
                                                                                                            // 208
  var view, node, notReallyAView=false /* TODO :) */;                                                       // 209
                                                                                                            // 210
  // currently modifiers come via 'view' arg, for now (and Surface)                                         // 211
  if (data.view /* != 'Surface' */) {                                                                       // 212
                                                                                                            // 213
    var registerable = FView._registerables[data.view];                                                     // 214
    if (!registerable)                                                                                      // 215
      throw new Error('Wanted view/modifier "' + data.view + '" but it doesn\'t exists.'                    // 216
        + ' Try FView.registerView/Modifier("'+ data.view +'", etc)');                                      // 217
                                                                                                            // 218
    fview['_' + registerable.type] = registerable;        // fview._view                                    // 219
    node = registerable.create.call(fview, options);      // fview.node                                     // 220
    fview[registerable.type] = node;                      // fview.view                                     // 221
                                                                                                            // 222
    if (node.sequenceFrom) {                                                                                // 223
      fview.sequence = new sequencer();                                                                     // 224
      node.sequenceFrom(fview.sequence._sequence);                                                          // 225
    }                                                                                                       // 226
                                                                                                            // 227
  }                                                                                                         // 228
                                                                                                            // 229
  // If no modifier used, default to Modifier if origin/translate/etc used                                  // 230
  if (!data.modifier && !fview.modifier &&                                                                  // 231
      (data.origin || data.translate || data.transform                                                      // 232
      || (data.size && !node.size)))                                                                        // 233
    data.modifier = 'Modifier';                                                                             // 234
                                                                                                            // 235
  // Allow us to prepend a modifier in a single template call                                               // 236
  if (data.modifier) {                                                                                      // 237
                                                                                                            // 238
    fview._modifier = FView._registerables[data.modifier];                                                  // 239
    fview.modifier = fview._modifier.create.call(fview, options);                                           // 240
                                                                                                            // 241
    if (node) {                                                                                             // 242
      fview.setNode(fview.modifier).add(node);                                                              // 243
      fview.view = node;                                                                                    // 244
    } else                                                                                                  // 245
      fview.setNode(fview.modifier);                                                                        // 246
                                                                                                            // 247
    if (fview._modifier.postRender)                                                                         // 248
      fview._modifier.postRender();                                                                         // 249
                                                                                                            // 250
  } else if (node) {                                                                                        // 251
                                                                                                            // 252
    fview.setNode(node);                                                                                    // 253
                                                                                                            // 254
  }                                                                                                         // 255
                                                                                                            // 256
  // could do pipe=1 in template helper?                                                                    // 257
  if (fview.parent.pipeChildrenTo)                                                                          // 258
    fview.pipeChildrenTo = fview.parent.pipeChildrenTo;                                                     // 259
                                                                                                            // 260
  // think about what else this needs                                                                       // 261
  if (fview._view && fview._view.famousCreatedPost)                                                         // 262
    fview._view.famousCreatedPost.call(fview);                                                              // 263
                                                                                                            // 264
                                                                                                            // 265
  // Render contents (and children)                                                                         // 266
  var newBlazeView, template, scopedView;                                                                   // 267
  if (blazeView.templateContentBlock) {                                                                     // 268
    if (data.template)                                                                                      // 269
      throw new Error("A block helper {{#View}} cannot also specify template=X");                           // 270
    // Called like {{#famous}}inlineContents{{/famous}}                                                     // 271
    template = blazeView.templateContentBlock;                                                              // 272
  } else if (data.template) {                                                                               // 273
    template = Template[data.template];                                                                     // 274
    if (!template)                                                                                          // 275
      throw new Error('Famous called with template="' + data.template                                       // 276
        + '" but no such template exists');                                                                 // 277
  } else {                                                                                                  // 278
    // Called with inclusion operator but not template {{>famous}}                                          // 279
    throw new Error("No template='' specified");                                                            // 280
  }                                                                                                         // 281
                                                                                                            // 282
  /*                                                                                                        // 283
  newBlazeView = template.constructView();                                                                  // 284
  scopedView = Blaze.With(dataContext, function() { return newBlazeView; });                                // 285
  Blaze.materializeView(scopedView, blazeView);                                                             // 286
  */                                                                                                        // 287
                                                                                                            // 288
  /*                                                                                                        // 289
  newBlazeView = Blaze.render(function() {                                                                  // 290
    Blaze.With(dataContext, function() { return template.constructView(); })                                // 291
  }, div, null, blazeView);                                                                                 // 292
  */                                                                                                        // 293
                                                                                                            // 294
  // Avoid Blaze running rendered() before it's actually on the DOM                                         // 295
  // Delete must happen before Blaze.render() called.                                                       // 296
  /*                                                                                                        // 297
  var onRendered = data.view == 'Surface' && template.rendered;                                             // 298
  if (onRendered)                                                                                           // 299
    delete template.rendered;                                                                               // 300
  */                                                                                                        // 301
                                                                                                            // 302
  var div = document.createElement('div');                                                                  // 303
                                                                                                            // 304
  if (inNewDataContext) {                                                                                   // 305
    var dataContext = data.data                                                                             // 306
      || Blaze._parentData(1) && Blaze._parentData(1, true)                                                 // 307
      || {};                                                                                                // 308
    newBlazeView = Blaze.renderWithData(template, dataContext, div, null, blazeView);                       // 309
  } else                                                                                                    // 310
    newBlazeView = Blaze.render(template, div, null, blazeView);                                            // 311
                                                                                                            // 312
  setupEvents(fview, template);                                                                             // 313
                                                                                                            // 314
  if (data.view == 'Surface') {                                                                             // 315
    templateSurface(div, fview, scopedView,                                                                 // 316
      data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',                      // 317
      options);                                                                                             // 318
  } else {                                                                                                  // 319
    // no longer necessary since we're forced to render to a div now                                        // 320
    // runRenderedCallback(newBlazeView);                                                                   // 321
  }                                                                                                         // 322
                                                                                                            // 323
  /*                                                                                                        // 324
  var template = options.template;                                                                          // 325
  if (template && Template[template].beforeAdd)                                                             // 326
  	Template[template].beforeAdd.call(this);                                                                 // 327
  */                                                                                                        // 328
                                                                                                            // 329
  /*                                                                                                        // 330
   * This is the final step where the fview is added to Famous Render Tree                                  // 331
   * By deferring the actual add we can prevent flicker from various causes                                 // 332
   */                                                                                                       // 333
                                                                                                            // 334
  var parent = fview.parent;                                                                                // 335
  _.defer(function() {                                                                                      // 336
    if (parent._view && parent._view.add)                                                                   // 337
      // views can explicitly handle how their children should be added                                     // 338
      parent._view.add.call(parent, fview, options);                                                        // 339
    else if (parent.sequence)                                                                               // 340
      // 'sequence' can be an array, sequencer or childSequencer, it doesn't matter                         // 341
      parent.sequence.push(fview);                                                                          // 342
    else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))                      // 343
      // compView->compView.  long part above is temp hack for template rerender #2010                      // 344
      parent.setNode(fview);                                                                                // 345
    else                                                                                                    // 346
      // default case, just use the add method                                                              // 347
      parent.node.add(fview);                                                                               // 348
  });                                                                                                       // 349
                                                                                                            // 350
  /*                                                                                                        // 351
   * Now that the Template has been rendered to the Famous Render Tree (and                                 // 352
   * also to the DOM in the case of a Surface), let's run any rendered()                                    // 353
   * callback that may have been defined.                                                                   // 354
   */                                                                                                       // 355
  /*                                                                                                        // 356
  if (onRendered)                                                                                           // 357
    onRendered.call(fview.blazeView._templateInstance);                                                     // 358
  */                                                                                                        // 359
}                                                                                                           // 360
                                                                                                            // 361
/*                                                                                                          // 362
 * This is called by Blaze when the View/Template is destroyed,                                             // 363
 * e.g. {{#if 0}}{{#Scrollview}}{{/if}}.  When this happens we need to:                                     // 364
 *                                                                                                          // 365
 * 1) Destroy children (Blaze won't do it since it's not in the DOM),                                       // 366
 *    and any "eaches" that may have been added from a famousEach.                                          // 367
 * 2) Call fview.destroy() which handles cleanup w.r.t. famous,                                             // 368
 *    which lives in meteorFamousView.js.                                                                   // 369
 *                                                                                                          // 370
 * It's possible we want to have the "template" destroyed but not the                                       // 371
 * fview in the render tree to do a graceful exit animation, etc.                                           // 372
 */                                                                                                         // 373
function famousDestroyed() {                                                                                // 374
  this.view.fview.destroy(true);                                                                            // 375
}                                                                                                           // 376
                                                                                                            // 377
// Keep this at the bottom; Firefox doesn't do function hoisting                                            // 378
                                                                                                            // 379
FView.famousView = new Template(                                                                            // 380
  'famous',           // viewName: "famous"                                                                 // 381
  function() {        // Blaze.View "renderFunc"                                                            // 382
    var blazeView = this;                                                                                   // 383
    var data = Blaze.getData(blazeView);                                                                    // 384
    var tpl = blazeView._templateInstance;                                                                  // 385
    var fview = blazeView.fview;                                                                            // 386
                                                                                                            // 387
    var changed = {};                                                                                       // 388
    var orig = {};                                                                                          // 389
    for (var key in data) {                                                                                 // 390
      var value = data[key];                                                                                // 391
      if (typeof value === "string")                                                                        // 392
        value = optionString(value, key, blazeView);                                                        // 393
      if (value === '__FVIEW::SKIP__')                                                                      // 394
        continue;                                                                                           // 395
      if (!EJSON.equals(value, tpl.data[key]) || !blazeView.hasRendered) {                                  // 396
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;                                           // 397
        changed[key] = tpl.data[key] = value;                                                               // 398
      }                                                                                                     // 399
    }                                                                                                       // 400
                                                                                                            // 401
    /*                                                                                                      // 402
     * Think about:                                                                                         // 403
     *                                                                                                      // 404
     * 1) Should the function get the old value or all old data too?                                        // 405
     * 2) Should the function get all the new data, but translated?                                         // 406
     *                                                                                                      // 407
     */                                                                                                     // 408
                                                                                                            // 409
    _.each(['modifier', 'view'], function(node) {                                                           // 410
                                                                                                            // 411
      // If the fview has a modifier or view                                                                // 412
      var what = '_' + node;                                                                                // 413
      if (fview[what]) {                                                                                    // 414
        if (fview[what].attrUpdate) {                                                                       // 415
          // If that mod/view wants to finely handle reactive updates                                       // 416
          for (var key in changed)                                                                          // 417
            fview[what].attrUpdate.call(fview,                                                              // 418
              key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);                              // 419
        } else if (fview[node].setOptions && blazeView.hasRendered) {                                       // 420
          // Otherwise if it has a setOptions                                                               // 421
          fview[node].setOptions(tpl.data);                                                                 // 422
        }                                                                                                   // 423
      }                                                                                                     // 424
                                                                                                            // 425
    });                                                                                                     // 426
                                                                                                            // 427
//    console.log(view);                                                                                    // 428
    blazeView.hasRendered = true;                                                                           // 429
    return null;                                                                                            // 430
  }                                                                                                         // 431
);                                                                                                          // 432
                                                                                                            // 433
Blaze.registerHelper('famous', FView.famousView);                                                           // 434
FView.famousView.created = famousCreated;                                                                   // 435
FView.famousView.destroyed = famousDestroyed;                                                               // 436
                                                                                                            // 437
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
  eachView.argVar = new Blaze.ReactiveVar;                                                                  // 7
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
            newItemView.fview.pipeChildrenTo                                                                // 30
              = fview.parent.pipeChildrenTo;                                                                // 31
                                                                                                            // 32
          // Maintain ordering with other deferred operations                                               // 33
          _.defer(function() {                                                                              // 34
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
        _.defer(function() {                                                                                // 47
          Blaze.remove(children[index].blazeView);                                                          // 48
          children.splice(index, 1);                                                                        // 49
        });                                                                                                 // 50
      },                                                                                                    // 51
      changedAt: function (id, newItem, oldItem, index) {                                                   // 52
        _.defer(function() {                                                                                // 53
          children[index].blazeView.dataVar.set(newItem);                                                   // 54
        });                                                                                                 // 55
      },                                                                                                    // 56
      movedTo: function (id, doc, fromIndex, toIndex) {                                                     // 57
        _.defer(function () {                                                                               // 58
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
  log.debug('New famousEach' + " (#" + fview.id + ')'                                                       // 74
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','                                             // 75
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                      // 76
                                                                                                            // 77
                                                                                                            // 78
  // Maintain order with other deferred operations                                                          // 79
  _.defer(function() {                                                                                      // 80
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
  log.debug('New famousIf' + " (#" + fview.id + ')'                                                         // 17
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','                                             // 18
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                      // 19
                                                                                                            // 20
  fview.kind = 'famousIf';                                                                                  // 21
                                                                                                            // 22
  // Maintain ordering with other deferred operations                                                       // 23
  _.defer(function() {                                                                                      // 24
    fview.sequence = fview.parent.sequence.child();                                                         // 25
  });                                                                                                       // 26
}                                                                                                           // 27
                                                                                                            // 28
function cleanupChildren(blazeView) {                                                                       // 29
	var children = blazeView.fview.children;                                                                   // 30
	for (var i=0; i < children.length; i++)                                                                    // 31
  	Blaze.remove(children[i].blazeView);                                                                     // 32
}                                                                                                           // 33
                                                                                                            // 34
function famousIfDestroyed() {                                                                              // 35
  this.view.fview.destroy(true);                                                                            // 36
}                                                                                                           // 37
                                                                                                            // 38
FView.famousIfView = new Template('famousIf', function() {                                                  // 39
	var blazeView = this;                                                                                      // 40
	var condition = Blaze.getData(blazeView);                                                                  // 41
                                                                                                            // 42
  log.debug('famousIf' + " (#" + blazeView.fview.id + ')'                                                   // 43
    + ' is now ' + !!condition                                                                              // 44
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','                                             // 45
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                      // 46
                                                                                                            // 47
  var dataContext = null /* this.data.data */                                                               // 48
    || Blaze._parentData(1) && Blaze._parentData(1, true)                                                   // 49
    || Blaze._parentData(0) && Blaze._parentData(0, true)                                                   // 50
    || {};                                                                                                  // 51
                                                                                                            // 52
  var unusedDiv = document.createElement('div');                                                            // 53
  var template = blazeView.templateContentBlock;                                                            // 54
                                                                                                            // 55
  _.defer(function() {                                                                                      // 56
    // Any time condition changes, remove all old children                                                  // 57
    cleanupChildren(blazeView);                                                                             // 58
                                                                                                            // 59
    var template = condition                                                                                // 60
      ? blazeView.templateContentBlock : blazeView.templateElseBlock;                                       // 61
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
var famousContext = new Template('famousContext', function() {                                              // 1
	var data = this.templateInstance().data || {};                                                             // 2
  var dataContext = data.data                                                                               // 3
    || Blaze._parentData(1) && Blaze._parentData(1, true)                                                   // 4
    || Blaze._parentData(0) && Blaze._parentData(0, true)                                                   // 5
    || {};                                                                                                  // 6
                                                                                                            // 7
	var fview = this.fview = new MeteorFamousView(this, data, true/*noAdd*/);                                  // 8
	fview.children = [];                                                                                       // 9
                                                                                                            // 10
  var pViewName = parentViewName(this.parentView);                                                          // 11
  var pTplName = parentTemplateName(this.parentView);                                                       // 12
  log.debug('New famousContext (#' + fview.id + ')'                                                         // 13
    + (data.template                                                                                        // 14
      ? ', content from "' + data.template + '"'                                                            // 15
      : ', content from inline block')                                                                      // 16
    + ' (parent: ' + pViewName                                                                              // 17
    + (pViewName == pTplName                                                                                // 18
      ? ''                                                                                                  // 19
      : ', template: ' + pTplName)                                                                          // 20
    + ')');                                                                                                 // 21
                                                                                                            // 22
  /*                                                                                                        // 23
	this.onViewReady(function() {                                                                              // 24
		var div = this._domrange.members[0];                                                                      // 25
		this.fview.node = this.fview.context = famous.core.Engine.createContext(div);                             // 26
		Blaze.render(this.templateContentBlock, div, null, this);                                                 // 27
	});                                                                                                        // 28
	return HTML.DIV({class:'famous-context'});                                                                 // 29
	*/                                                                                                         // 30
                                                                                                            // 31
	this.onViewReady(function () {                                                                             // 32
		var container = this._domrange.parentElement;                                                             // 33
		var template = data.template ? Template[data.template] : this.templateContentBlock;                       // 34
		fview.node = fview.context = famous.core.Engine.createContext(container);                                 // 35
		Blaze.renderWithData(template, dataContext, container, null, this);                                       // 36
	});                                                                                                        // 37
	return null;                                                                                               // 38
});                                                                                                         // 39
                                                                                                            // 40
Blaze.Template.registerHelper('famousContext', famousContext);                                              // 41
Blaze.Template.registerHelper('FamousContext', famousContext);  // alias                                    // 42
                                                                                                            // 43
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
}                                                                                                           // 24
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
    if (typeof options.halt !== 'undefined'                                                                 // 55
        ? options.halt : fview.modifierTransitionHalt)                                                      // 56
      fview.modifier.halt();                                                                                // 57
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
                                                                                                            // 79
      switch(key) {                                                                                         // 80
        case 'transform': case 'opacity': case 'align': case 'size':                                        // 81
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value, options);                   // 82
          break;                                                                                            // 83
                                                                                                            // 84
        // Below are helpful shortcuts for transforms                                                       // 85
                                                                                                            // 86
        case 'translate':                                                                                   // 87
          modifierMethod(this, 'setTransform',                                                              // 88
            Transform.translate.apply(null, value), options);                                               // 89
          break;                                                                                            // 90
                                                                                                            // 91
        case 'scaleX': case 'scaleY': case 'scaleZ':                                                        // 92
          var amount = degreesToRadians((value || 0) - (oldValue || 0));                                    // 93
          var scale = [0,0,0];                                                                              // 94
          if (key == 'scaleX') scale[0] = amount;                                                           // 95
          else if (key == 'scaleY') scale[1] = amount;                                                      // 96
          else scale[2] = amount;                                                                           // 97
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 98
            this.modifier.getFinalTransform(),                                                              // 99
            Transform.scale.apply(null, scale)                                                              // 100
          ), options);                                                                                      // 101
          break;                                                                                            // 102
                                                                                                            // 103
        case 'skewX': case 'skewY':                                                                         // 104
          var skewBy = (value || 0) - (oldValue || 0);                                                      // 105
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 106
            this.modifier.getFinalTransform(),                                                              // 107
            Transform[key](degreesToRadians(skewBy))                                                        // 108
          ), options);                                                                                      // 109
          break;                                                                                            // 110
                                                                                                            // 111
        case 'skewZ': // doesn't exist in famous                                                            // 112
          var skewBy = (value || 0) - (oldValue || 0);                                                      // 113
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 114
            this.modifier.getFinalTransform(),                                                              // 115
            Transform.skew(0, 0, degreesToRadians(skewBy))                                                  // 116
          ), options);                                                                                      // 117
          break;                                                                                            // 118
                                                                                                            // 119
        case 'rotateX': case 'rotateY': case 'rotateZ':                                                     // 120
          // value might be undefined from Session with no SessionDefault                                   // 121
          var rotateBy = (value || 0) - (oldValue || 0);                                                    // 122
          modifierMethod(this, 'setTransform', Transform.multiply(                                          // 123
            this.modifier.getFinalTransform(),                                                              // 124
            Transform[key](degreesToRadians(rotateBy))                                                      // 125
          ), options);                                                                                      // 126
          break;                                                                                            // 127
      }                                                                                                     // 128
    }                                                                                                       // 129
  });                                                                                                       // 130
                                                                                                            // 131
                                                                                                            // 132
});                                                                                                         // 133
                                                                                                            // 134
/*                                                                                                          // 135
FView.modifiers.pageTransition = function(blazeView, options) {                                             // 136
  this.blazeView = blazeView;                                                                               // 137
  this.famous = new Modifier({                                                                              // 138
    transform : Transform.identity,                                                                         // 139
    opacity   : 1,                                                                                          // 140
    origin    : [-0.5, -0.5],                                                                               // 141
    size      : [100, 100]                                                                                  // 142
  });                                                                                                       // 143
};                                                                                                          // 144
                                                                                                            // 145
FView.modifiers.pageTransition.prototype.postRender = function() {                                          // 146
  this.famous.setOrigin([0,0], {duration : 5000});                                                          // 147
};                                                                                                          // 148
*/                                                                                                          // 149
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
	`{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */                                              // 4
FView.registerView = function(name, famousView, options) {                                                  // 5
	if (FView._registerables[name])                                                                            // 6
		return;                                                                                                   // 7
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
	FView._registerables[name] = _.extend(                                                                     // 21
    { create: defaultCreate },                                                                              // 22
    options || {},                                                                                          // 23
    { name: name, constructor: famousView, type: 'view' }                                                   // 24
  );                                                                                                        // 25
}                                                                                                           // 26
                                                                                                            // 27
function defaultCreate(options) {                                                                           // 28
  return new this._view.constructor(options);                                                               // 29
}                                                                                                           // 30
                                                                                                            // 31
/* Do we still need this?  Most people explicitly register views with                                       // 32
   registerView() these days, to get the template helper */                                                 // 33
/*                                                                                                          // 34
FView.getView = function(name)  {                                                                           // 35
	// @famono silent                                                                                          // 36
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
