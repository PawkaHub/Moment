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
var Pince = Package['jag:pince'].Pince;
var Logger = Package['jag:pince'].Logger;
var MicroEvent = Package['jag:pince'].MicroEvent;
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
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var famousCmp, FView, log, Transform, optionString, handleOptions, options, MeteorFamousView, throwError, sequencer, parentViewName, parentTemplateName, runRenderedCallback, key;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/famous-views.js                                                           //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var mainCtx = null;                                                                                              // 1
                                                                                                                 // 2
// Could use something from --settings too                                                                       // 3
var isDev = ("localhost" === window.location.hostname);                                                          // 4
                                                                                                                 // 5
log = new Logger('famous-views');                                                                                // 6
Logger.setLevel('famous-views', isDev ? 'trace' : 'info');                                                       // 7
                                                                                                                 // 8
FView = famousCmp = {};                                                                                          // 9
                                                                                                                 // 10
var readyQueue = [];                                                                                             // 11
var readyDep = new Deps.Dependency;                                                                              // 12
FView.ready = function(func) {                                                                                   // 13
	if (func) {                                                                                                     // 14
    if (FView.isReady)                                                                                           // 15
      func();                                                                                                    // 16
    else                                                                                                         // 17
		  readyQueue.push(func);                                                                                       // 18
  } else {                                                                                                       // 19
		readyDep.depend();                                                                                             // 20
		return FView.isReady;                                                                                          // 21
	}                                                                                                               // 22
}                                                                                                                // 23
FView.runReadies = function() {                                                                                  // 24
	FView.isReady = true;                                                                                           // 25
	readyDep.changed();                                                                                             // 26
	while(readyQueue.length) {                                                                                      // 27
		(readyQueue.shift())();                                                                                        // 28
	}                                                                                                               // 29
}                                                                                                                // 30
                                                                                                                 // 31
// famous-views globals from Famous                                                                              // 32
Transform = null;                                                                                                // 33
                                                                                                                 // 34
if (typeof(famous) === 'undefined' && typeof(define) !== 'undefined')                                            // 35
define(function(require) {                                                                                       // 36
//  console.log(1);                                                                                              // 37
});                                                                                                              // 38
                                                                                                                 // 39
FView.startup = function() {                                                                                     // 40
  log.debug('Current logging default is "debug" (for localhost).  '                                              // 41
    + 'Change in your app with Logger.setLevel("famous-views", "info");');                                       // 42
  FView.startedUp = true;                                                                                        // 43
                                                                                                                 // 44
  famous.polyfills;                                                                                              // 45
  famous.core.famous;                                                                                            // 46
  Transform = famous.core.Transform;                                                                             // 47
                                                                                                                 // 48
  // Note, various views are registered here                                                                     // 49
  FView.runReadies();                                                                                            // 50
                                                                                                                 // 51
  // Required document.body                                                                                      // 52
  Meteor.startup(function() {                                                                                    // 53
                                                                                                                 // 54
    // Sanity check, disallow templates with same name as a View                                                 // 55
    var names = [];                                                                                              // 56
    for (var name in FView.views)                                                                                // 57
      if (Template[name])                                                                                        // 58
        names.push(name);                                                                                        // 59
    if (names.length)                                                                                            // 60
      throw new Error("You have created Template(s) with the same name "                                         // 61
        + "as these famous-views: " + names.join(', ')                                                           // 62
        + '.  Nothing will work until you rename them.');                                                        // 63
                                                                                                                 // 64
    if (FView.mainCtx)                                                                                           // 65
      mainCtx = FView.mainCtx;                                                                                   // 66
    else {                                                                                                       // 67
      if (FView.mainCtx !== false)                                                                               // 68
        log.debug('Creating a new main context.  If you already have '                                           // 69
          + 'your own, set FView.mainCtx = yourMainContext (or to false to get '                                 // 70
          + 'rid of this warning)');                                                                             // 71
      FView.mainCtx = mainCtx = famous.core.Engine.createContext();                                              // 72
    }                                                                                                            // 73
                                                                                                                 // 74
    if (Template.famousInit)                                                                                     // 75
      Blaze.render(Template.famousInit, document.body);                                                          // 76
  });                                                                                                            // 77
};                                                                                                               // 78
                                                                                                                 // 79
FView.isReady = false;                                                                                           // 80
                                                                                                                 // 81
// Imports from weak deps                                                                                        // 82
/*                                                                                                               // 83
if (Package['mjnetworks:famous'])                                                                                // 84
  // @famono ignore                                                                                              // 85
  famous = Package['mjnetworks:famous'].famous;                                                                  // 86
else if (Package['mjnetworks:mj-famous'])                                                                        // 87
  // @famono ignore                                                                                              // 88
  famous = Package['mjnetworks:mj-famous'].famous;                                                               // 89
*/                                                                                                               // 90
                                                                                                                 // 91
// Load as ealry as possible, and keep trying                                                                    // 92
if (typeof(famous) !== 'undefined') {                                                                            // 93
  log.debug("Starting up.  famous global found while loading package, great!");                                  // 94
  FView.startup();                                                                                               // 95
}                                                                                                                // 96
else                                                                                                             // 97
  Meteor.startup(function() {                                                                                    // 98
    if (typeof(famous) !== 'undefined') {                                                                        // 99
      log.debug("Starting up.  famous global found during Meteor.startup()");                                    // 100
    	FView.startup();                                                                                            // 101
    } else {                                                                                                     // 102
      log.debug("No famous global available in Meteor.startup().  Call FView.startup() when appropriate.");      // 103
    }                                                                                                            // 104
  });                                                                                                            // 105
                                                                                                                 // 106
optionString = function(string) {                                                                                // 107
  if (string == 'undefined')                                                                                     // 108
    return undefined;                                                                                            // 109
  if (string == 'true')                                                                                          // 110
    return true;                                                                                                 // 111
  if (string == 'false')                                                                                         // 112
    return false;                                                                                                // 113
  if (string === null)                                                                                           // 114
    return null;                                                                                                 // 115
                                                                                                                 // 116
  if (string[0] == '[' || string[0] == '{') {                                                                    // 117
    var obj;                                                                                                     // 118
    string = string.replace(/\bauto\b/g, '"auto"');                                                              // 119
    string = string.replace(/undefined/g, '"__undefined__"');                                                    // 120
    // JSON can't parse values like ".5" so convert them to "0.5"                                                // 121
    string = string.replace(/([\[\{,]+)(\W*)(\.[0-9])/g, '$1$20$3');                                             // 122
                                                                                                                 // 123
    try {                                                                                                        // 124
      obj = JSON.parse(string);                                                                                  // 125
    }                                                                                                            // 126
    catch (err) {                                                                                                // 127
      log.error("Couldn't parse JSON, skipping: " + string);                                                     // 128
      log.error(err);                                                                                            // 129
      return undefined;                                                                                          // 130
    }                                                                                                            // 131
                                                                                                                 // 132
    for (var key in obj)                                                                                         // 133
      if (obj[key] === '__undefined__')                                                                          // 134
        obj[key] = undefined;                                                                                    // 135
    return obj;                                                                                                  // 136
  } else {                                                                                                       // 137
    var float = parseFloat(string);                                                                              // 138
    if (!_.isNaN(float))                                                                                         // 139
      return float;                                                                                              // 140
    return string;                                                                                               // 141
  }                                                                                                              // 142
                                                                                                                 // 143
  /*                                                                                                             // 144
  if (string == 'undefined')                                                                                     // 145
    return undefined;                                                                                            // 146
  if (string == 'true')                                                                                          // 147
    return true;                                                                                                 // 148
  if (string == 'false')                                                                                         // 149
    return false;                                                                                                // 150
  if (string.substr(0,1) == '[') {                                                                               // 151
    var out = [];                                                                                                // 152
    string = string.substr(1, string.length-2).split(',');                                                       // 153
    for (var i=0; i < string.length; i++)                                                                        // 154
      out.push(optionString(string[i].trim()));                                                                  // 155
    return out;                                                                                                  // 156
  }                                                                                                              // 157
  if (string.match(/^[0-9\.]+$/))                                                                                // 158
    return parseFloat(string);                                                                                   // 159
  */                                                                                                             // 160
}                                                                                                                // 161
                                                                                                                 // 162
handleOptions = function(data) {                                                                                 // 163
  options = {};                                                                                                  // 164
  for (var key in data) {                                                                                        // 165
    var value = data[key];                                                                                       // 166
    if (_.isString(value))                                                                                       // 167
      options[key] = optionString(value);                                                                        // 168
    else                                                                                                         // 169
      options[key] = value;                                                                                      // 170
  }                                                                                                              // 171
  return options;                                                                                                // 172
}                                                                                                                // 173
                                                                                                                 // 174
/* --- totally not done --- */                                                                                   // 175
                                                                                                                 // 176
FView.showTreeGet = function(renderNode) {                                                                       // 177
  var obj = renderNode._node._child._object;                                                                     // 178
    if (obj.node)                                                                                                // 179
      obj.node = this.showTreeGet(obj.node);                                                                     // 180
  return obj;                                                                                                    // 181
}                                                                                                                // 182
FView.showTreeChildren = function(renderNode) {                                                                  // 183
  var out = {}, i=0;                                                                                             // 184
  if (renderNode._node)                                                                                          // 185
    out['child'+(i++)] = this.showTreeGet(renderNode)                                                            // 186
  return out;                                                                                                    // 187
}                                                                                                                // 188
FView.showTree = function() {                                                                                    // 189
  console.log(this.showTreeChildren(mainCtx));                                                                   // 190
}                                                                                                                // 191
                                                                                                                 // 192
/* --- */                                                                                                        // 193
                                                                                                                 // 194
                                                                                                                 // 195
                                                                                                                 // 196
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/meteorFamousView.js                                                       //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
/*                                                                                                               // 1
 * Templates are always added to a MeteorFamousView ("fview"), in turn is                                        // 2
 * added to it's parent fview or a context.  This allows us to handle                                            // 3
 * situations where a template is later removed (since nodes cannot ever                                         // 4
 * be manually removed from the render tree).                                                                    // 5
 *                                                                                                               // 6
 * http://stackoverflow.com/questions/23087980/how-to-remove-nodes-from-the-ren                                  // 7
 */                                                                                                              // 8
                                                                                                                 // 9
var meteorFamousViews = {};                                                                                      // 10
var meteorFamousViewsCount = 0;                                                                                  // 11
                                                                                                                 // 12
MeteorFamousView = function(blazeView, options, noAdd) {                                                         // 13
  this.id = options.id || ++meteorFamousViewsCount;                                                              // 14
  meteorFamousViews[this.id] = this;                                                                             // 15
                                                                                                                 // 16
  this.blazeView = blazeView;                                                                                    // 17
  this.children = [];                                                                                            // 18
  if (noAdd)                                                                                                     // 19
    return;                                                                                                      // 20
                                                                                                                 // 21
  var parent = blazeView;                                                                                        // 22
  while ((parent=parent.parentView) && !parent.fview);                                                           // 23
  parent = parent ? parent.fview : { node: FView.mainCtx };                                                      // 24
                                                                                                                 // 25
  this.parent = parent;                                                                                          // 26
                                                                                                                 // 27
  /*                                                                                                             // 28
  if (options) {                                                                                                 // 29
    if (options.size) {                                                                                          // 30
      this.size = options.size;                                                                                  // 31
    }                                                                                                            // 32
  }                                                                                                              // 33
  */                                                                                                             // 34
                                                                                                                 // 35
  if (parent.children) // i.e. not main context                                                                  // 36
    parent.children.push(this);                                                                                  // 37
                                                                                                                 // 38
  if (parent._view && parent._view.add)                                                                          // 39
  	// views can explicitly handle how their children should be added                                             // 40
  	parent._view.add.call(parent, this, options);                                                                 // 41
  else if (parent.sequencer)                                                                                     // 42
  	// if the node has a sequencer, add by pushing to the sequence array                                          // 43
    parent.sequencer.sequence.push(this);                                                                        // 44
  else if (!parent.node || (parent.node._object && parent.node._object.isDestroyed))                             // 45
    // compView->compView.  long part above is temp hack for template rerender #2010                             // 46
    parent.setNode(this);                                                                                        // 47
  else                                                                                                           // 48
  	// default case, just use the add method                                                                      // 49
    parent.node.add(this);                                                                                       // 50
}                                                                                                                // 51
                                                                                                                 // 52
MeteorFamousView.prototype.render = function() {                                                                 // 53
  if (this.isDestroyed)                                                                                          // 54
    return [];                                                                                                   // 55
  if (this.node)                                                                                                 // 56
    return this.node.render();                                                                                   // 57
  console.log('render called before anything set');                                                              // 58
  return [];                                                                                                     // 59
}                                                                                                                // 60
                                                                                                                 // 61
MeteorFamousView.prototype.setNode = function(node) {                                                            // 62
  // surface or modifier/view                                                                                    // 63
  this.node = new famous.core.RenderNode(node);                                                                  // 64
  return this.node;                                                                                              // 65
}                                                                                                                // 66
                                                                                                                 // 67
MeteorFamousView.prototype.preventDestroy = function() {                                                         // 68
	this.destroyPrevented = true;	                                                                                  // 69
}                                                                                                                // 70
                                                                                                                 // 71
MeteorFamousView.prototype.destroy = function() {                                                                // 72
  //log.debug('Destroyed ' + this._view.name + ' (#' + this.id + ')');                                           // 73
                                                                                                                 // 74
  if (this.parent && this.parent.sequencePurge)                                                                  // 75
    this.parent.sequencePurge();                                                                                 // 76
                                                                                                                 // 77
  this.isDestroyed = true;                                                                                       // 78
  this.node = null;                                                                                              // 79
  this.view = null;                                                                                              // 80
  this.modifier = null;                                                                                          // 81
  delete(meteorFamousViews[this.id]);                                                                            // 82
}                                                                                                                // 83
                                                                                                                 // 84
MeteorFamousView.prototype.sequencePurge = function() {                                                          // 85
  if (!this.sequencer)                                                                                           // 86
    return;                                                                                                      // 87
                                                                                                                 // 88
  var sequence = this.sequencer.sequence,                                                                        // 89
    length = sequence.length;                                                                                    // 90
                                                                                                                 // 91
  for (var i=0; i < length; i++)                                                                                 // 92
    if (sequence[i].isDestroyed) {                                                                               // 93
      sequence.splice(i--, 1);                                                                                   // 94
      length--;                                                                                                  // 95
    }                                                                                                            // 96
}                                                                                                                // 97
                                                                                                                 // 98
MeteorFamousView.prototype.getSize = function() {                                                                // 99
  return this.node && this.node.getSize() || this.size || [true,true];                                           // 100
}                                                                                                                // 101
                                                                                                                 // 102
throwError = function(startStr, object) {                                                                        // 103
  if (object instanceof Object)                                                                                  // 104
    console.error(object);                                                                                       // 105
  throw new Error('FView.getData() expects BlazeView or TemplateInstance or '                                    // 106
      + 'DOM node, but got ' + object);                                                                          // 107
}                                                                                                                // 108
                                                                                                                 // 109
FView.from = function(viewOrTplorEl) {                                                                           // 110
  if (viewOrTplorEl instanceof Blaze.View)                                                                       // 111
    return FView.fromBlazeView(viewOrTplorEl);                                                                   // 112
  else if (viewOrTplorEl instanceof Blaze.TemplateInstance)                                                      // 113
    return FView.fromTemplate(viewOrTplorEl);                                                                    // 114
  else if (viewOrTplorEl && typeof viewOrTplorEl.nodeType === 'number')                                          // 115
    return FView.fromElement(viewOrTplorEl);                                                                     // 116
  else {                                                                                                         // 117
    throwError('FView.getData() expects BlazeView or TemplateInstance or '                                       // 118
        + 'DOM node, but got ', viewOrTplorEl);                                                                  // 119
  }                                                                                                              // 120
}                                                                                                                // 121
                                                                                                                 // 122
FView.fromBlazeView = FView.dataFromView = function(view) {                                                      // 123
  while ((view=view.parentView) && !view.fview);                                                                 // 124
  return view ? view.fview : undefined;                                                                          // 125
}                                                                                                                // 126
                                                                                                                 // 127
FView.fromTemplate = FView.dataFromTemplate = function(tplInstance) {                                            // 128
  return this.dataFromView(tplInstance.view);                                                                    // 129
}                                                                                                                // 130
                                                                                                                 // 131
FView.fromElement = FView.dataFromElement = function(el) {                                                       // 132
  var view = Blaze.getView(el);                                                                                  // 133
  return this.dataFromView(view);                                                                                // 134
}                                                                                                                // 135
                                                                                                                 // 136
FView.byId = function(id) {                                                                                      // 137
  return meteorFamousViews[id];                                                                                  // 138
}                                                                                                                // 139
                                                                                                                 // 140
// Leave as alias?  Deprecate?                                                                                   // 141
FView.dataFromCmp = FView.dataFromComponent;                                                                     // 142
FView.dataFromTpl = FView.dataFromTemplate;                                                                      // 143
                                                                                                                 // 144
FView.dataFromComponent = function(component) {                                                                  // 145
  log.warn("FView.dataFromComponent has been deprecated.  Please use 'FView.fromBlazeView' instead.");           // 146
  return FView.fromBlazeView(component);                                                                         // 147
}                                                                                                                // 148
                                                                                                                 // 149
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/sequencer.js                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
/* Sequencer and childSequence */                                                                                // 1
                                                                                                                 // 2
sequencer = function() {                                                                                         // 3
  this.sequence = [];                                                                                            // 4
  this.children = [];                                                                                            // 5
}                                                                                                                // 6
                                                                                                                 // 7
sequencer.prototype.child = function() {                                                                         // 8
  var child = new childSequence(this);                                                                           // 9
  this.children.push(child);                                                                                     // 10
  return child;                                                                                                  // 11
}                                                                                                                // 12
                                                                                                                 // 13
function childSequence(parent, childNo, startIndex) {                                                            // 14
    this.parent = parent;                                                                                        // 15
    this.childNo = parent.children.length;                                                                       // 16
    this.startIndex = parent.sequence.length;                                                                    // 17
    this.sequence = [];                                                                                          // 18
}                                                                                                                // 19
                                                                                                                 // 20
childSequence.prototype.push = function(value) {                                                                 // 21
  this.parent.sequence.splice(this.startIndex+this.sequence.length-1, 0, value);                                 // 22
  for (var i=this.childNo+1; i < this.parent.children.length; i++) {                                             // 23
    this.parent.children[i].startIndex++;                                                                        // 24
  }                                                                                                              // 25
  return this.sequence.push(value);                                                                              // 26
}                                                                                                                // 27
                                                                                                                 // 28
childSequence.prototype.splice = function(index, howMany /*, arguments */) {                                     // 29
  var diff, max = this.sequence.length - index;                                                                  // 30
  if (howMany > max) howMany = max;                                                                              // 31
  diff = (arguments.length - 2) - howMany; // inserts - howMany                                                  // 32
                                                                                                                 // 33
  for (var i=this.childNo+1; i < this.parent.children.length; i++)                                               // 34
    this.parent.children[i].startIndex += diff;                                                                  // 35
                                                                                                                 // 36
  this.sequence.splice.apply(this.sequence, arguments);                                                          // 37
  arguments[0] += this.startIndex;  // add startIndex and re-use args                                            // 38
  return this.parent.sequence.splice.apply(this.parent.sequence, arguments);                                     // 39
}                                                                                                                // 40
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/famous.js                                                                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
/* Extend Meteor Template framework for .famousEvents() */                                                       // 1
Template.prototype.famousEvents = function (eventMap) {                                                          // 2
  var template = this;                                                                                           // 3
  template.__famousEventMaps = (template.__famousEventMaps || []);                                               // 4
  template.__famousEventMaps.push(eventMap);                                                                     // 5
};                                                                                                               // 6
                                                                                                                 // 7
function setupEvents(fview, template) {                                                                          // 8
  if (template.__famousEventMaps) {                                                                              // 9
    _.each(template.__famousEventMaps, function(eventMap) {                                                      // 10
      for (var k in eventMap) {                                                                                  // 11
        var target = fview.surface || fview.view._eventInput;                                                    // 12
        target.on(k, function() {                                                                                // 13
          eventMap[k].call(null, {type:k}, fview);                                                               // 14
        });                                                                                                      // 15
      }                                                                                                          // 16
    });                                                                                                          // 17
  }                                                                                                              // 18
}                                                                                                                // 19
                                                                                                                 // 20
function autoHeight(fview, div) {                                                                                // 21
  var height = div.scrollHeight;                                                                                 // 22
  if (height && (!fview.size || (fview.size.length == 2 && fview.size[1] != height))) {                          // 23
    fview.size = [undefined, height];                                                                            // 24
    if (fview.modifier) {                                                                                        // 25
      fview.modifier.setSize(fview.size);                                                                        // 26
      fview.surface.setSize([undefined,undefined]);                                                              // 27
    } else {                                                                                                     // 28
      fview.surface.setSize(fview.size);                                                                         // 29
    }                                                                                                            // 30
  } else {                                                                                                       // 31
    Meteor.setTimeout(function() {                                                                               // 32
      autoHeight(fview, div);                                                                                    // 33
    }, 10);                                                                                                      // 34
  }                                                                                                              // 35
}                                                                                                                // 36
                                                                                                                 // 37
function templateSurface(div, fview, renderedTemplate, tName, options) {                                         // 38
  // var div = document.createElement('div');                                                                    // 39
  var autoSize = options.size && options.size[1] == 'auto';                                                      // 40
                                                                                                                 // 41
  if (autoSize)                                                                                                  // 42
    options.size = [0, 0];                                                                                       // 43
  else                                                                                                           // 44
    div.style.height='100%';                                                                                     // 45
  div.style.width='100%';                                                                                        // 46
                                                                                                                 // 47
  /*                                                                                                             // 48
  if (fview.uiHooks)                                                                                             // 49
    div._uihooks = fview.uiHooks;                                                                                // 50
  */                                                                                                             // 51
                                                                                                                 // 52
//  UI.insert(renderedTemplate, div);                                                                            // 53
                                                                                                                 // 54
//  we're now forced to always render in main func                                                               // 55
//  renderedTemplate.domrange.attach(div);                                                                       // 56
                                                                                                                 // 57
  if (!options)                                                                                                  // 58
    options = {};                                                                                                // 59
                                                                                                                 // 60
  // If any HTML was generated, create a surface for it                                                          // 61
  if (options.view=='Surface' || div.innerHTML.trim().length) {                                                  // 62
    var surfaceOptions = { classes: [ 't_'+tName.replace(/ /, '_') ] };                                          // 63
    if (options.classes)                                                                                         // 64
      surfaceOptions.classes = _.union(surfaceOptions.classes,                                                   // 65
        _.isArray(options.classes) ? options.classes : options.classes.split(','));                              // 66
    if (options.class)                                                                                           // 67
      surfaceOptions.classes = _.union(surfaceOptions.classes,                                                   // 68
        _.isArray(options.class) ? options.class : options.class.split(' '));                                    // 69
                                                                                                                 // 70
    surfaceOptions.content = div;                                                                                // 71
    surfaceOptions.size = fview.size;                                                                            // 72
                                                                                                                 // 73
    fview.surface = fview.view;                                                                                  // 74
    fview.surface.setOptions(surfaceOptions);                                                                    // 75
                                                                                                                 // 76
    /*                                                                                                           // 77
    fview.surface = new famous.core.Surface(surfaceOptions);                                                     // 78
    if (!fview.node)                                                                                             // 79
      // nothing, i.e. Surface & no modifier                                                                     // 80
      fview.setNode(fview.surface);                                                                              // 81
    else if (!fview.sequencer)                                                                                   // 82
      // add Surface as only child                                                                               // 83
      fview.node.add(fview.surface);                                                                             // 84
    else {                                                                                                       // 85
      fview.sequencer.sequence.push(fview.surface);                                                              // 86
    }                                                                                                            // 87
    */                                                                                                           // 88
                                                                                                                 // 89
    var pipeChildrenTo = fview.parent.pipeChildrenTo;                                                            // 90
    if (pipeChildrenTo)                                                                                          // 91
      for (var i=0; i < pipeChildrenTo.length; i++)                                                              // 92
        fview.surface.pipe(pipeChildrenTo[i]);                                                                   // 93
                                                                                                                 // 94
    if (autoSize)                                                                                                // 95
      autoHeight(fview, div);                                                                                    // 96
  }                                                                                                              // 97
}                                                                                                                // 98
                                                                                                                 // 99
// Used by famousEach too                                                                                        // 100
parentViewName = function(blazeView) {                                                                           // 101
  while (blazeView.name == "with" || blazeView.name == "(contentBlock)")                                         // 102
    blazeView = blazeView.parentView;                                                                            // 103
  return blazeView.name;                                                                                         // 104
}                                                                                                                // 105
parentTemplateName = function(blazeView) {                                                                       // 106
  while (blazeView && !blazeView.name.match(/^Template/))                                                        // 107
    blazeView = blazeView.parentView;                                                                            // 108
  return blazeView.name;                                                                                         // 109
}                                                                                                                // 110
                                                                                                                 // 111
// Need to fire manually at appropriate time,                                                                    // 112
// for non-Surfaces which are never added to the DOM by meteor                                                   // 113
runRenderedCallback = function(view) {                                                                           // 114
//  if (view._callbacks.rendered && view._callbacks.rendered.length)                                             // 115
  var needsRenderedCallback = true; // uh yeah, TODO :>                                                          // 116
  view.domrange = null; // TODO, check if it's a surface / real domrange                                         // 117
  if (needsRenderedCallback && ! view.isDestroyed &&                                                             // 118
      view._callbacks.rendered && view._callbacks.rendered.length) {                                             // 119
    Deps.afterFlush(function callRendered() {                                                                    // 120
      if (needsRenderedCallback && ! view.isDestroyed) {                                                         // 121
        needsRenderedCallback = false;                                                                           // 122
        Blaze._fireCallbacks(view, 'rendered');                                                                  // 123
      }                                                                                                          // 124
    });                                                                                                          // 125
  }                                                                                                              // 126
}                                                                                                                // 127
                                                                                                                 // 128
function famousCreated() {                                                                                       // 129
  var blazeView = this.view;                                                                                     // 130
  var famousViewName = blazeView.name ? blazeView.name.substr(7) : "";                                           // 131
                                                                                                                 // 132
  this.data = this.data || {};                                                                                   // 133
  var dataContext = this.data.data                                                                               // 134
    || Blaze._parentData(1) && Blaze._parentData(1, true)                                                        // 135
    || Blaze._parentData(0) && Blaze._parentData(0, true)                                                        // 136
    || {};                                                                                                       // 137
                                                                                                                 // 138
  // deprecate                                                                                                   // 139
  if (!this.data.view && famousViewName === "")                                                                  // 140
    this.data.view = 'SequentialLayout';                                                                         // 141
  if (!this.data.view) this.data.view = famousViewName;                                                          // 142
  else if (!famousViewName) {                                                                                    // 143
    famousViewName = this.data.view;                                                                             // 144
    blazeView.viewName = 'Famous.' + famousViewName;                                                             // 145
  }                                                                                                              // 146
                                                                                                                 // 147
  // Deprecated 2014-08-17                                                                                       // 148
  if (this.data.size && _.isString(this.data.size) && this.data.size.substr(0,1) != '[')                         // 149
    throw new Error('[famous-views] size="' + this.data.size + '" is deprecated, please use '                    // 150
      + 'size="['+ this.data.size + ']" instead');                                                               // 151
                                                                                                                 // 152
  // See attribute parsing notes in README                                                                       // 153
  var options = handleOptions(this.data);                                                                        // 154
                                                                                                                 // 155
  // These require special handling (but should still be moved elsewhere)                                        // 156
  if (this.data.direction)                                                                                       // 157
    options.direction = this.data.direction == "Y"                                                               // 158
      ? famous.utilities.Utility.Direction.Y                                                                     // 159
      : famous.utilities.Utility.Direction.X;                                                                    // 160
  if (options.translate) {                                                                                       // 161
    options.transform =                                                                                          // 162
      Transform.translate.apply(null, options.translate);                                                        // 163
    delete options.translate;                                                                                    // 164
  }                                                                                                              // 165
  // any other transforms added here later must act on existing transform matrix                                 // 166
                                                                                                                 // 167
  if (!this.data.modifier && (this.data.origin || this.data.size || this.data.translate || this.data.transform)) // 168
    this.data.modifier = 'StateModifier';                                                                        // 169
                                                                                                                 // 170
  var fview = blazeView.fview = new MeteorFamousView(blazeView, options);                                        // 171
  fview._view = FView.views[this.data.view] || { name: this.data.view };                                         // 172
                                                                                                                 // 173
  var pViewName = parentViewName(blazeView.parentView);                                                          // 174
  var pTplName = parentTemplateName(blazeView.parentView);                                                       // 175
  log.debug('New ' + famousViewName + " (#" + fview.id + ')'                                                     // 176
    + (this.data.template                                                                                        // 177
      ? ', content from "' + this.data.template + '"'                                                            // 178
      : ', content from inline block')                                                                           // 179
    + ' (parent: ' + pViewName                                                                                   // 180
    + (pViewName == pTplName                                                                                     // 181
      ? ''                                                                                                       // 182
      : ', template: ' + pTplName)                                                                               // 183
    + ')');                                                                                                      // 184
                                                                                                                 // 185
  /*                                                                                                             // 186
  if (FView.viewOptions[this.data.view]                                                                          // 187
      && FView.viewOptions[this.data.view].childUiHooks) {                                                       // 188
    // if childUiHooks specified, store them here too                                                            // 189
    fview.childUiHooks = FView.viewOptions[this.data.view].childUiHooks;                                         // 190
  } else if (fview.parent.childUiHooks) {                                                                        // 191
    if (this.data.view == 'Surface') {                                                                           // 192
      fview.uiHooks = fview.parent.childUiHooks;                                                                 // 193
    } else {                                                                                                     // 194
      // Track descedents                                                                                        // 195
    }                                                                                                            // 196
    console.log('child ' + this.data.view);                                                                      // 197
  }                                                                                                              // 198
  */                                                                                                             // 199
                                                                                                                 // 200
  var view, node;                                                                                                // 201
                                                                                                                 // 202
  if (this.data.view /* != 'Surface' */) {                                                                       // 203
                                                                                                                 // 204
    view = FView.getView(this.data.view);                                                                        // 205
    node = new view(options);                                                                                    // 206
                                                                                                                 // 207
    if (node.sequenceFrom) {                                                                                     // 208
      fview.sequencer = new sequencer();                                                                         // 209
      node.sequenceFrom(fview.sequencer.sequence);                                                               // 210
    }                                                                                                            // 211
                                                                                                                 // 212
  }                                                                                                              // 213
                                                                                                                 // 214
  if (this.data.modifier) {                                                                                      // 215
                                                                                                                 // 216
    fview._modifier = FView.modifiers[this.data.modifier];                                                       // 217
    fview.modifier = fview._modifier.create.call(fview, options);                                                // 218
                                                                                                                 // 219
    if (node) {                                                                                                  // 220
      fview.setNode(fview.modifier).add(node);                                                                   // 221
      fview.view = node;                                                                                         // 222
    } else                                                                                                       // 223
      fview.setNode(fview.modifier);                                                                             // 224
                                                                                                                 // 225
    if (fview._modifier.postRender)                                                                              // 226
      fview._modifier.postRender();                                                                              // 227
                                                                                                                 // 228
  } else if (node) {                                                                                             // 229
                                                                                                                 // 230
    fview.setNode(node);                                                                                         // 231
    fview.view = node;                                                                                           // 232
                                                                                                                 // 233
  }                                                                                                              // 234
                                                                                                                 // 235
  // could do pipe=1 in template helper?                                                                         // 236
  if (fview.parent.pipeChildrenTo)                                                                               // 237
    fview.pipeChildrenTo = fview.parent.pipeChildrenTo;                                                          // 238
                                                                                                                 // 239
  // think about what else this needs                                                                            // 240
  if (fview._view && fview._view.famousCreatedPost)                                                              // 241
    fview._view.famousCreatedPost.call(fview);                                                                   // 242
                                                                                                                 // 243
                                                                                                                 // 244
  // Render contents (and children)                                                                              // 245
  var newBlazeView, template, scopedView;                                                                        // 246
  if (blazeView.templateContentBlock) {                                                                          // 247
    if (this.data.template)                                                                                      // 248
      throw new Error("A block helper {{#View}} cannot also specify template=X");                                // 249
    // Called like {{#famous}}inlineContents{{/famous}}                                                          // 250
    template = blazeView.templateContentBlock;                                                                   // 251
  } else if (this.data.template) {                                                                               // 252
    template = Template[this.data.template];                                                                     // 253
    if (!template)                                                                                               // 254
      throw new Error('Famous called with template="' + this.data.template                                       // 255
        + '" but no such template exists');                                                                      // 256
  } else {                                                                                                       // 257
    // Called with inclusion operator but not template {{>famous}}                                               // 258
    throw new Error("No template='' specified");                                                                 // 259
  }                                                                                                              // 260
                                                                                                                 // 261
  /*                                                                                                             // 262
  newBlazeView = template.constructView();                                                                       // 263
  scopedView = Blaze.With(dataContext, function() { return newBlazeView; });                                     // 264
  Blaze.materializeView(scopedView, blazeView);                                                                  // 265
  */                                                                                                             // 266
                                                                                                                 // 267
  var div = document.createElement('div');                                                                       // 268
  /*                                                                                                             // 269
  newBlazeView = Blaze.render(function() {                                                                       // 270
    Blaze.With(dataContext, function() { return template.constructView(); })                                     // 271
  }, div, null, blazeView);                                                                                      // 272
  */                                                                                                             // 273
  newBlazeView = Blaze.renderWithData(template, dataContext, div, null, blazeView);                              // 274
                                                                                                                 // 275
  if (this.data.view == 'Surface') {                                                                             // 276
    templateSurface(div, fview, scopedView,                                                                      // 277
      this.data.template || parentTemplateName(blazeView.parentView).substr(9) + '_inline',                      // 278
      options);                                                                                                  // 279
    setupEvents(fview, template);                                                                                // 280
  } else {                                                                                                       // 281
    // no longer necessary since we're forced to render to a div now                                             // 282
    // runRenderedCallback(newBlazeView);                                                                        // 283
  }                                                                                                              // 284
}                                                                                                                // 285
                                                                                                                 // 286
/*                                                                                                               // 287
 * This is called by Blaze when the View/Template is destroyed,                                                  // 288
 * e.g. {{#if 0}}{{#Scrollview}}{{/if}}.  When this happens we need to:                                          // 289
 *                                                                                                               // 290
 * 1) Destroy children (Blaze won't do it since it's not in the DOM),                                            // 291
 *    and any "eaches" that may have been added from a famousEach.                                               // 292
 * 2) Call fview.destroy() which handles cleanup w.r.t. famous,                                                  // 293
 *    which lives in meteorFamousView.js.                                                                        // 294
 *                                                                                                               // 295
 * It's possible we want to have the "template" destroyed but not the                                            // 296
 * fview in the render tree to do a graceful exit animation, etc.                                                // 297
 */                                                                                                              // 298
function famousDestroyed() {                                                                                     // 299
  var blazeView = this.view;                                                                                     // 300
  var fview = blazeView.fview;                                                                                   // 301
  log.debug('Destroying ' + fview._view.name + ' (#' + fview.id + ') and children');                             // 302
                                                                                                                 // 303
  if (fview.children)                                                                                            // 304
    for (var i=0; i < fview.children.length; i++)                                                                // 305
      Blaze.remove(fview.children[i].blazeView);                                                                 // 306
                                                                                                                 // 307
  if (fview.eaches)                                                                                              // 308
    for (var i=0; i < fview.eaches.length; i++)                                                                  // 309
      Blaze.remove(fview.eaches[i]);                                                                             // 310
                                                                                                                 // 311
  // XXX ADD TO DOCS                                                                                             // 312
  if (fview.onDestroy)                                                                                           // 313
    fview.onDestroy();                                                                                           // 314
  if (!fview.destroyPrevented) {                                                                                 // 315
    fview.destroy();                                                                                             // 316
  }                                                                                                              // 317
}                                                                                                                // 318
                                                                                                                 // 319
// Keep this at the bottom; Firefox doesn't do function hoisting                                                 // 320
                                                                                                                 // 321
FView.famousView = new Template(                                                                                 // 322
  'famous',           // viewName: "famous"                                                                      // 323
  function() {        // Blaze.View "renderFunc"                                                                 // 324
    var blazeView = this;                                                                                        // 325
    var data = Blaze.getData(blazeView);                                                                         // 326
    var tpl = blazeView._templateInstance;                                                                       // 327
    var fview = blazeView.fview;                                                                                 // 328
                                                                                                                 // 329
    var changed = {};                                                                                            // 330
    var orig = {};                                                                                               // 331
    for (var key in data) {                                                                                      // 332
      var value = data[key];                                                                                     // 333
      if (typeof value === "string")                                                                             // 334
        value = optionString(value);                                                                             // 335
      if (value != tpl.data[key] || !blazeView.hasRendered) {                                                    // 336
        orig[key] = blazeView.hasRendered ? tpl.data[key] : null;                                                // 337
        changed[key] = tpl.data[key] = value;                                                                    // 338
      }                                                                                                          // 339
    }                                                                                                            // 340
                                                                                                                 // 341
    /*                                                                                                           // 342
     * Think about:                                                                                              // 343
     *                                                                                                           // 344
     * 1) Should the function get the old value or all old data too?                                             // 345
     * 2) Should the function get all the new data, but translated?                                              // 346
     *                                                                                                           // 347
     */                                                                                                          // 348
                                                                                                                 // 349
    _.each(['modifier', 'view'], function(node) {                                                                // 350
                                                                                                                 // 351
      // If the fview has a modifier or view                                                                     // 352
      var what = '_' + node;                                                                                     // 353
      if (fview[what]) {                                                                                         // 354
        if (fview[what].attrUpdate) {                                                                            // 355
          // If that mod/view wants to finely handle reactive updates                                            // 356
          for (var key in changed)                                                                               // 357
            fview[what].attrUpdate.call(fview,                                                                   // 358
              key, changed[key], orig[key], tpl.data, !blazeView.hasRendered);                                   // 359
        } else if (fview[node].setOptions && blazeView.hasRendered) {                                            // 360
          // Otherwise if it has a setOptions                                                                    // 361
          fview[node].setOptions(tpl.data);                                                                      // 362
        }                                                                                                        // 363
      }                                                                                                          // 364
                                                                                                                 // 365
    });                                                                                                          // 366
                                                                                                                 // 367
//    console.log(view);                                                                                         // 368
    blazeView.hasRendered = true;                                                                                // 369
    return null;                                                                                                 // 370
  }                                                                                                              // 371
);                                                                                                               // 372
                                                                                                                 // 373
Blaze.registerHelper('famous', FView.famousView);                                                                // 374
FView.famousView.created = famousCreated;                                                                        // 375
FView.famousView.destroyed = famousDestroyed;                                                                    // 376
                                                                                                                 // 377
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/famousEach.js                                                             //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
function famousEachRender(eachView, template, argFunc) {                                                         // 1
  var fview = eachView.fview;                                                                                    // 2
  var sequence = fview.sequence;                                                                                 // 3
  var children = fview.children = [];                                                                            // 4
  var size = fview.size;                                                                                         // 5
                                                                                                                 // 6
  // For Blaze.currentView (see blaze/builtins.js#each)                                                          // 7
  eachView.argVar = new Blaze.ReactiveVar;                                                                       // 8
  eachView.autorun(function () {                                                                                 // 9
    eachView.argVar.set(argFunc());                                                                              // 10
  }, eachView.parentView);                                                                                       // 11
                                                                                                                 // 12
  eachView.stopHandle = ObserveSequence.observe(function () {                                                    // 13
      return eachView.argVar.get();                                                                              // 14
    }, {                                                                                                         // 15
      addedAt: function (id, item, index) {                                                                      // 16
        Deps.nonreactive(function () {                                                                           // 17
          var newItemView = Blaze.With(item, function() {                                                        // 18
            return template.constructView();                                                                     // 19
          });                                                                                                    // 20
                                                                                                                 // 21
          /*                                                                                                     // 22
           * This is the repeated block inside famousEach, but not the actual node/                              // 23
           * view/surface that gets created on render as this block's children                                   // 24
           */                                                                                                    // 25
          newItemView.fview = new MeteorFamousView(null, {}, true /* noAdd */);                                  // 26
                                                                                                                 // 27
          if (fview.parent.pipeChildrenTo)                                                                       // 28
            newItemView.fview.pipeChildrenTo                                                                     // 29
              = fview.parent.pipeChildrenTo;                                                                     // 30
                                                                                                                 // 31
          children.splice(index, 0, newItemView);                                                                // 32
          sequence.splice(index, 0, newItemView.fview);                                                          // 33
                                                                                                                 // 34
          var unusedDiv = document.createElement('div');                                                         // 35
          Blaze.render(newItemView, unusedDiv, eachView);                                                        // 36
                                                                                                                 // 37
          //Blaze.materializeView(newItemView, eachView);                                                        // 38
          //runRenderedCallback(newItemView);  // now called by Blaze.render                                     // 39
        });                                                                                                      // 40
      },                                                                                                         // 41
      removedAt: function (id, item, index) {                                                                    // 42
        Deps.nonreactive(function () {                                                                           // 43
        	var blazeView = children[index];                                                                        // 44
        	// XXX see when/why this got so convoluted                                                              // 45
        	var fview = blazeView.fview.children[0];                                                                // 46
                                                                                                                 // 47
        	if (fview.destroyPrevented) {                                                                           // 48
                                                                                                                 // 49
        		// Keep a reference to this exact child, since index might change                                      // 50
        		var thisChild = sequence.sequence[index];                                                              // 51
        		var origIndex = index;                                                                                 // 52
                                                                                                                 // 53
        		fview.destroy = function() {                                                                           // 54
        			var index = origIndex;                                                                                // 55
                                                                                                                 // 56
        			// If we're not in the original position, find our new index                                          // 57
        			if (sequence.sequence[index] !== thisChild) {                                                         // 58
        				for (var i=0; i < children.length; i++) {                                                            // 59
        					if (sequence.sequence[i] === thisChild) {                                                           // 60
        						index = i;                                                                                         // 61
        						break;                                                                                             // 62
        					}                                                                                                   // 63
        				}                                                                                                    // 64
        			}                                                                                                     // 65
                                                                                                                 // 66
      				if (sequence.sequence[index] !== thisChild) {                                                          // 67
      					log.error("Could not find original child in index!", thisChild);                                      // 68
      				} else {                                                                                               // 69
			          sequence.splice(index, 1);                                                                          // 70
			        }                                                                                                     // 71
                                                                                                                 // 72
		          // Call the original destroy() method that this overrides                                            // 73
        			MeteorFamousView.prototype.destroy.apply(this, arguments);                                            // 74
        		}                                                                                                      // 75
                                                                                                                 // 76
        		// Blaze children/indexes must always be in sync with observe                                          // 77
		        children.splice(index, 1);                                                                             // 78
                                                                                                                 // 79
        	} else {                                                                                                // 80
                                                                                                                 // 81
        		// If !destroyPrevented, just remove immediately                                                       // 82
	          children.splice(index, 1);                                                                            // 83
	          sequence.splice(index, 1);                                                                            // 84
                                                                                                                 // 85
        	}                                                                                                       // 86
                                                                                                                 // 87
        	// Destroys the blaze template/view.  Calls .onDestroy(),                                               // 88
        	// and also .destroy() if .preventDestroy() not called                                                  // 89
          Blaze.remove(blazeView);                                                                               // 90
        });                                                                                                      // 91
      },                                                                                                         // 92
      changedAt: function (id, newItem, oldItem, index) {                                                        // 93
        Deps.nonreactive(function () {                                                                           // 94
          children[index].dataVar.set(newItem);                                                                  // 95
        });                                                                                                      // 96
      },                                                                                                         // 97
      movedTo: function (id, doc, fromIndex, toIndex) {                                                          // 98
        Deps.nonreactive(function () {                                                                           // 99
          var item = sequence.splice(fromIndex, 1)[0];                                                           // 100
          sequence.splice(toIndex, 0, item);                                                                     // 101
                                                                                                                 // 102
          item = children.splice(fromIndex, 1)[0];                                                               // 103
          children.splice(toIndex, 0, item);                                                                     // 104
        });                                                                                                      // 105
      }                                                                                                          // 106
    });                                                                                                          // 107
}                                                                                                                // 108
                                                                                                                 // 109
function famousEachCreated() {                                                                                   // 110
  var blazeView = this.view;                                                                                     // 111
  var fview = blazeView.fview = {};                                                                              // 112
                                                                                                                 // 113
  log.debug('New famousEach'                                                                                     // 114
    + ' (parent: ' + parentViewName(blazeView.parentView) + ','                                                  // 115
    + ' template: ' + parentTemplateName(blazeView.parentView) + ')');                                           // 116
                                                                                                                 // 117
  // famousEach specific: don't create new MeteorFamousView                                                      // 118
  var parent = blazeView;                                                                                        // 119
  while ((parent=parent.parentView) && !parent.fview);                                                           // 120
                                                                                                                 // 121
  fview.parent = parent ? parent.fview : { node: mainCtx };                                                      // 122
  fview.sequence = fview.parent.sequencer.child();                                                               // 123
                                                                                                                 // 124
  if (!parent.fview.eaches)                                                                                      // 125
    parent.fview.eaches = [];                                                                                    // 126
  parent.fview.eaches.push(blazeView);                                                                           // 127
                                                                                                                 // 128
  // Contents of {{#famousEach}}block{{/famousEach}}                                                             // 129
  if (blazeView.templateContentBlock)                                                                            // 130
    famousEachRender(blazeView, blazeView.templateContentBlock, function() {                                     // 131
      return Blaze.getData(blazeView);                                                                           // 132
    });                                                                                                          // 133
}                                                                                                                // 134
                                                                                                                 // 135
function famousEachDestroyed() {                                                                                 // 136
  var blazeView = this.view;                                                                                     // 137
  var fview = blazeView.fview;                                                                                   // 138
                                                                                                                 // 139
  log.debug('Destroying FamousEach...');                                                                         // 140
                                                                                                                 // 141
  if (blazeView.stopHandle)                                                                                      // 142
    blazeView.stopHandle.stop();                                                                                 // 143
                                                                                                                 // 144
  for (var i=0; i < fview.children.length; i++)                                                                  // 145
    Blaze.remove(fview.children[i]);                                                                             // 146
}                                                                                                                // 147
                                                                                                                 // 148
// Keep this at the bottom; Firefox doesn't do function hoisting                                                 // 149
                                                                                                                 // 150
FView.famousEachView = new Template(                                                                             // 151
  'famousEach',       // viewName: "famousEach"                                                                  // 152
  function() {        // Blaze.View "renderFunc"                                                                 // 153
    var view = this;  // Blaze.View, viewName "famousEach"                                                       // 154
    // console.log(view);                                                                                        // 155
    return null;                                                                                                 // 156
  }                                                                                                              // 157
);                                                                                                               // 158
                                                                                                                 // 159
Blaze.registerHelper('famousEach', FView.famousEachView);                                                        // 160
FView.famousEachView.created = famousEachCreated;                                                                // 161
FView.famousEachView.destroyed = famousEachDestroyed;                                                            // 162
                                                                                                                 // 163
/*                                                                                                               // 164
FView.Each = function (argFunc, contentFunc, elseFunc) {                                                         // 165
  var eachView = Blaze.View('Feach', function() {                                                                // 166
    return null;                                                                                                 // 167
  });                                                                                                            // 168
                                                                                                                 // 169
  eachView.onCreated(function() {                                                                                // 170
    // For Blaze.currentView (see blaze/builtins.js#each)                                                        // 171
    eachView.autorun(function () {                                                                               // 172
      eachView.argVar.set(argFunc());                                                                            // 173
    }, eachView.parentView);                                                                                     // 174
                                                                                                                 // 175
                                                                                                                 // 176
  });                                                                                                            // 177
                                                                                                                 // 178
  return eachView;                                                                                               // 179
}                                                                                                                // 180
Blaze.registerHelper('famousEach', FView.Each);                                                                  // 181
*/                                                                                                               // 182
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/modifiers.js                                                              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.modifiers = {};                                                                                            // 1
                                                                                                                 // 2
function defaultCreate(options) {                                                                                // 3
  return new this._modifier.modifier(options);                                                                   // 4
}                                                                                                                // 5
                                                                                                                 // 6
FView.registerModifier = function(name, modifier, options) {                                                     // 7
  if (!FView.modifiers[name])                                                                                    // 8
    FView.modifiers[name] = _.extend(                                                                            // 9
      { create: defaultCreate },                                                                                 // 10
      options,                                                                                                   // 11
      { name: name, modifier: modifier }                                                                         // 12
    );                                                                                                           // 13
}                                                                                                                // 14
                                                                                                                 // 15
FView.ready(function(require) {                                                                                  // 16
                                                                                                                 // 17
  FView.registerModifier('modifier', famous.core.Modifier);                                                      // 18
                                                                                                                 // 19
  FView.registerModifier('identity', null, {                                                                     // 20
    create: function(options) {                                                                                  // 21
      return new Modifier(_.extend({                                                                             // 22
        transform : Transform.identity                                                                           // 23
      }, options));                                                                                              // 24
    }                                                                                                            // 25
  });                                                                                                            // 26
                                                                                                                 // 27
  FView.registerModifier('inFront', null, {                                                                      // 28
    create: function(options) {                                                                                  // 29
      return new Modifier(_.extend({                                                                             // 30
        transform : Transform.inFront                                                                            // 31
      }, options));                                                                                              // 32
    }                                                                                                            // 33
  });                                                                                                            // 34
                                                                                                                 // 35
  function modifierMethod(fview, method, value) {                                                                // 36
    if (fview.modifierTransitionHalt)                                                                            // 37
      fview.modifier.halt();                                                                                     // 38
                                                                                                                 // 39
    fview.modifier[method](value,                                                                                // 40
      fview.modifierTransition, fview.modifierTransitionDone);                                                   // 41
  }                                                                                                              // 42
  function degreesToRadians(x) {                                                                                 // 43
    return x * Math.PI / 180;                                                                                    // 44
  }                                                                                                              // 45
  FView.registerModifier('StateModifier', famous.modifiers.StateModifier, {                                      // 46
                                                                                                                 // 47
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                                // 48
      switch(key) {                                                                                              // 49
        case 'transform': case 'opacity': case 'align': case 'size':                                             // 50
          modifierMethod(this, 'set'+key[0].toUpperCase()+key.substr(1), value);                                 // 51
          break;                                                                                                 // 52
                                                                                                                 // 53
        // Below are helpful shortcuts for transforms                                                            // 54
                                                                                                                 // 55
        case 'translate':                                                                                        // 56
          modifierMethod(this, 'setTransform',                                                                   // 57
            Transform.translate.apply(null, value));                                                             // 58
          break;                                                                                                 // 59
                                                                                                                 // 60
        case 'skewX': case 'skewY':                                                                              // 61
          var skewBy = (value || 0) - (oldValue || 0);                                                           // 62
          modifierMethod(this, 'setTransform', Transform.multiply(                                               // 63
            this.modifier.getTransform(),                                                                        // 64
            Transform[key](degreesToRadians(skewBy))                                                             // 65
          ));                                                                                                    // 66
          break;                                                                                                 // 67
                                                                                                                 // 68
        case 'skewZ': // doesn't exist in famous                                                                 // 69
          var skewBy = (value || 0) - (oldValue || 0);                                                           // 70
          modifierMethod(this, 'setTransform', Transform.multiply(                                               // 71
            this.modifier.getTransform(),                                                                        // 72
            Transform.skew(0, 0, degreesToRadians(skewBy))                                                       // 73
          ));                                                                                                    // 74
          break;                                                                                                 // 75
                                                                                                                 // 76
        case 'rotateX': case 'rotateY': case 'rotateZ':                                                          // 77
          // value might be undefined from Session with no SessionDefault                                        // 78
          var rotateBy = (value || 0) - (oldValue || 0);                                                         // 79
          modifierMethod(this, 'setTransform', Transform.multiply(                                               // 80
            this.modifier.getTransform(),                                                                        // 81
            Transform[key](degreesToRadians(rotateBy))                                                           // 82
          ));                                                                                                    // 83
          break;                                                                                                 // 84
      }                                                                                                          // 85
    }                                                                                                            // 86
                                                                                                                 // 87
  });                                                                                                            // 88
                                                                                                                 // 89
                                                                                                                 // 90
});                                                                                                              // 91
                                                                                                                 // 92
/*                                                                                                               // 93
FView.modifiers.pageTransition = function(blazeView, options) {                                                  // 94
  this.blazeView = blazeView;                                                                                    // 95
  this.famous = new Modifier({                                                                                   // 96
    transform : Transform.identity,                                                                              // 97
    opacity   : 1,                                                                                               // 98
    origin    : [-0.5, -0.5],                                                                                    // 99
    size      : [100, 100]                                                                                       // 100
  });                                                                                                            // 101
};                                                                                                               // 102
                                                                                                                 // 103
FView.modifiers.pageTransition.prototype.postRender = function() {                                               // 104
  this.famous.setOrigin([0,0], {duration : 5000});                                                               // 105
};                                                                                                               // 106
*/                                                                                                               // 107
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views.js                                                                  //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.views = {};                                                                                                // 1
                                                                                                                 // 2
/* Available in JS via `FView.views.Scrollview` and in templates via                                             // 3
	`{{#famous view='Scrollview'}}` or just `{{#Scrollview}}`. */                                                   // 4
FView.registerView = function(name, famousView, options) {                                                       // 5
	if (FView.views[name])                                                                                          // 6
		return;                                                                                                        // 7
                                                                                                                 // 8
  /*                                                                                                             // 9
  var tpl = _.clone(FView.famousView);                                                                           // 10
  tpl.viewName = 'Famous.' + name;                                                                               // 11
  console.log(tpl);                                                                                              // 12
  */                                                                                                             // 13
                                                                                                                 // 14
  var fview = FView.famousView;                                                                                  // 15
  var tpl = new Template('Famous.' + name, fview.renderFunction);                                                // 16
  tpl.created = fview.created;                                                                                   // 17
  tpl.destroyed = fview.destroyed;                                                                               // 18
  Blaze.registerHelper(name, tpl);                                                                               // 19
                                                                                                                 // 20
	FView.views[name]                                                                                               // 21
		= _.extend(options || {}, { name: name, class: famousView });                                                  // 22
}                                                                                                                // 23
                                                                                                                 // 24
/* Do we still need this?  Most people explicitly register views with                                            // 25
   registerView() these days, to get the template helper */                                                      // 26
FView.getView = function(name)  {                                                                                // 27
	// @famono silent                                                                                               // 28
  if (FView.views[name])                                                                                         // 29
    return FView.views[name].class;                                                                              // 30
  if (typeof Famous !== 'undefined' && Famous[name])                                                             // 31
    return Famous[name];                                                                                         // 32
  if (typeof Famous !== 'undefined' && famous.Views && Famous.Views[name])                                       // 33
    return Famous.Views[name];                                                                                   // 34
  if (typeof famous !== 'undefined' && famous.views && famous.views[name])                                       // 35
    return famous.views[name];                                                                                   // 36
  else                                                                                                           // 37
    throw new Error('Wanted view "' + name + '" but it doesn\'t exists.'                                         // 38
      + ' Try FView.registerView("'+name+'", require(...))');                                                    // 39
}                                                                                                                // 40
                                                                                                                 // 41
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/_simple.js                                                          //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('SequentialLayout', famous.views.SequentialLayout);                                          // 2
	FView.registerView('View', famous.core.View);                                                                   // 3
});                                                                                                              // 4
                                                                                                                 // 5
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/ContainerSurface.js                                                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('ContainerSurface', famous.surfaces.ContainerSurface, {                                      // 2
                                                                                                                 // 3
		add: function(child_fview, child_options) {                                                                    // 4
			this.view.add(child_fview);                                                                                   // 5
    },                                                                                                           // 6
                                                                                                                 // 7
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                                // 8
			if (key == 'overflow')                                                                                        // 9
				this.view.setProperties({ overflow: value });                                                                // 10
			else if (key == 'class')                                                                                      // 11
				this.view.setClasses(value.split(" "));                                                                      // 12
		}                                                                                                              // 13
                                                                                                                 // 14
	});                                                                                                             // 15
});                                                                                                              // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/EdgeSwapper.js                                                      //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('EdgeSwapper', famous.views.EdgeSwapper, {                                                   // 2
		add: function(child_fview, child_options) {                                                                    // 3
			if (!this.view)                                                                                               // 4
				return;  // when?                                                                                            // 5
                                                                                                                 // 6
			if (this.currentShow)                                                                                         // 7
				this.previousShow = this.currentShow;                                                                        // 8
			this.currentShow = child_fview;                                                                               // 9
                                                                                                                 // 10
			child_fview.preventDestroy();                                                                                 // 11
                                                                                                                 // 12
			var self = this;                                                                                              // 13
			this.view.show(child_fview, null, function() {                                                                // 14
				if (self.previousShow)                                                                                       // 15
					self.previousShow.destroy();                                                                                // 16
			});                                                                                                           // 17
		}                                                                                                              // 18
	});                                                                                                             // 19
});                                                                                                              // 20
                                                                                                                 // 21
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/Flipper.js                                                          //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('Flipper', famous.views.Flipper, {                                                           // 2
		add: function(child_fview, child_options) {                                                                    // 3
			var target = child_options.target;                                                                            // 4
			if (!target || (target != 'back' && target != 'front'))                                                       // 5
				throw new Error('Flipper must specify target="back/front"');                                                 // 6
                                                                                                                 // 7
			if (target == 'front')                                                                                        // 8
				this.view.setFront(child_fview);                                                                             // 9
			else                                                                                                          // 10
				this.view.setBack(child_fview);                                                                              // 11
		}                                                                                                              // 12
	});                                                                                                             // 13
});                                                                                                              // 14
                                                                                                                 // 15
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/HeaderFooterLayout.js                                               //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {                                     // 2
		add: function(child_fview, child_options) {                                                                    // 3
			var target = child_options.target;                                                                            // 4
			if (!target)                                                                                                  // 5
				throw new Error('HeaderFooterLayout children must specify target="header/footer/content"');                  // 6
			this.view[target].add(child_fview);                                                                           // 7
		}                                                                                                              // 8
	});                                                                                                             // 9
});                                                                                                              // 10
                                                                                                                 // 11
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/RenderController.js                                                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.transitions = {                                                                                            // 1
	opacity: {                                                                                                      // 2
    outTransformFrom: function(progress) {                                                                       // 3
      return Transform.Identity;                                                                                 // 4
    },                                                                                                           // 5
    inTransformFrom: function(progress) {                                                                        // 6
      return Transform.Identity;                                                                                 // 7
    }                                                                                                            // 8
	},                                                                                                              // 9
	slideWindow: {                                                                                                  // 10
    outTransformFrom: function(progress) {                                                                       // 11
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);                        // 12
    },                                                                                                           // 13
    inTransformFrom: function(progress) {                                                                        // 14
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);                                    // 15
    }                                                                                                            // 16
	},                                                                                                              // 17
	WIP: {                                                                                                          // 18
    outTransformFrom: function(progress) {                                                                       // 19
      return Transform.rotateY(Math.PI*progress);                                                                // 20
    },                                                                                                           // 21
    inTransformFrom: function(progress) {                                                                        // 22
      return Transform.rotateY(Math.PI + Math.PI*progress);                                                      // 23
    }                                                                                                            // 24
	}                                                                                                               // 25
};                                                                                                               // 26
                                                                                                                 // 27
// Other option is to allow a slideDirection attribute.  Think about this.                                       // 28
FView.transitions.slideWindowLeft = FView.transitions.slideWindow;                                               // 29
FView.transitions.slideWindowRight = {                                                                           // 30
    outTransformFrom: FView.transitions.slideWindow.inTransformFrom,                                             // 31
    inTransformFrom: FView.transitions.slideWindow.outTransformFrom                                              // 32
};                                                                                                               // 33
                                                                                                                 // 34
FView.ready(function(require) {                                                                                  // 35
	FView.registerView('RenderController', famous.views.RenderController, {                                         // 36
		add: function(child_fview, child_options) {                                                                    // 37
			if (!this.view)                                                                                               // 38
				return;  // when?                                                                                            // 39
                                                                                                                 // 40
			if (this.currentShow)                                                                                         // 41
				this.previousShow = this.currentShow;                                                                        // 42
			this.currentShow = child_fview;                                                                               // 43
                                                                                                                 // 44
			var transition = child_options.transition;                                                                    // 45
			if (transition) {                                                                                             // 46
				var data = FView.transitions[transition];                                                                    // 47
				if (data) {                                                                                                  // 48
					for (key in data)                                                                                           // 49
						this.view[key](data[key]);                                                                                 // 50
				} else {                                                                                                     // 51
					log.error('No such transition ' + transition);                                                              // 52
				}                                                                                                            // 53
			}                                                                                                             // 54
                                                                                                                 // 55
			child_fview.preventDestroy();                                                                                 // 56
                                                                                                                 // 57
			var self = this;                                                                                              // 58
			this.view.show(child_fview, null, function() {                                                                // 59
				if (self.previousShow)                                                                                       // 60
					self.previousShow.destroy();                                                                                // 61
			});                                                                                                           // 62
		},                                                                                                             // 63
                                                                                                                 // 64
		attrUpdate: function(key, value, oldValue, data, firstTime) {                                                  // 65
			if (key == 'transition') {                                                                                    // 66
				var data = FView.transitions[value];                                                                         // 67
				if (data) {                                                                                                  // 68
					for (key in data)                                                                                           // 69
						this.view[key](data[key]);                                                                                 // 70
				} else {                                                                                                     // 71
					log.error('No such transition ' + transition);                                                              // 72
				}				                                                                                                        // 73
			}                                                                                                             // 74
		}                                                                                                              // 75
	});                                                                                                             // 76
});                                                                                                              // 77
                                                                                                                 // 78
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/Scrollview.js                                                       //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('Scrollview', famous.views.Scrollview, {                                                     // 2
		famousCreatedPost: function() {                                                                                // 3
			this.pipeChildrenTo = this.parent.pipeChildrenTo                                                              // 4
				? [ this.view, this.parent.pipeChildrenTo[0] ]                                                               // 5
				: [ this.view ];                                                                                             // 6
		}                                                                                                              // 7
	});                                                                                                             // 8
});                                                                                                              // 9
                                                                                                                 // 10
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/gadicohen:famous-views/lib/views/Surface.js                                                          //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
FView.ready(function(require) {                                                                                  // 1
	FView.registerView('Surface', famous.core.Surface, {                                                            // 2
                                                                                                                 // 3
    attrUpdate: function(key, value, oldValue, data, firstTime) {                                                // 4
    	switch(key) {                                                                                               // 5
    		case 'size':                                                                                               // 6
    			// Let our modifier control our size                                                                      // 7
    			// Long term, rather specify modifierSize and surfaceSize args?                                           // 8
    			if (this._modifier.name == 'StateModifier')                                                               // 9
						this.surface.setSize([undefined,undefined]);                                                               // 10
    			else                                                                                                      // 11
  					this.surface.setSize(value);                                                                              // 12
    			break;                                                                                                    // 13
    	}                                                                                                           // 14
    }                                                                                                            // 15
                                                                                                                 // 16
	});                                                                                                             // 17
});                                                                                                              // 18
                                                                                                                 // 19
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['gadicohen:famous-views'] = {
  famousCmp: famousCmp,
  FView: FView
};

})();
