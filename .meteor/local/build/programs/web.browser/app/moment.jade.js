(function(){
Template.body.addContent((function() {
  var view = this;
  return "";
}));
Meteor.startup(Template.body.renderToDocument);

Template.__checkName("layout");
Template["layout"] = new Template("Template.layout", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      target: Spacebars.call("content"),
      size: Spacebars.call("[undefined,undefined]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("RenderController"), function() {
      return Spacebars.include(view.lookupTemplate("yield"));
    });
  });
}));

Template.__checkName("about");
Template["about"] = new Template("Template.about", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[undefined,undefined]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("View"), function() {
      return [ Spacebars.include(view.lookupTemplate("timelineMinuteScroller")), "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null, "\n", null ];
    });
  });
}));

Template.__checkName("timelineMinuteScroller");
Template["timelineMinuteScroller"] = new Template("Template.timelineMinuteScroller", (function() {
  var view = this;
  return [ Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[undefined,undefined]"),
      origin: Spacebars.call("[0,0]"),
      align: Spacebars.call("[0,0.5]"),
      translate: Spacebars.call("[0,0,0]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Scrollview"), function() {
      return Blaze._TemplateWith(function() {
        return Spacebars.call(view.lookup("minutes"));
      }, function() {
        return Spacebars.include(view.lookupTemplate("famousEach"), function() {
          return Blaze._TemplateWith(function() {
            return {
              template: Spacebars.call("timelineMinute"),
              size: Spacebars.call("[undefined,100]"),
              properties: Spacebars.call(view.lookup("timelineMinuteStyles"))
            };
          }, function() {
            return Spacebars.include(view.lookupTemplate("Surface"));
          });
        });
      });
    });
  }) ];
}));

Template.__checkName("background");
Template["background"] = new Template("Template.background", (function() {
  var view = this;
  return HTML.Raw('<div id="videoWrapper" class="bigClass"><div id="video"></div></div>');
}));

Template.__checkName("overlay");
Template["overlay"] = new Template("Template.overlay", (function() {
  var view = this;
  return "";
}));

Template.__checkName("intro");
Template["intro"] = new Template("Template.intro", (function() {
  var view = this;
  return "Moment";
}));

Template.__checkName("momentButton");
Template["momentButton"] = new Template("Template.momentButton", (function() {
  var view = this;
  return "Share Your Moment";
}));

Template.__checkName("timer");
Template["timer"] = new Template("Template.timer", (function() {
  var view = this;
  return Blaze.View(function() {
    return Spacebars.mustache(view.lookup("timer"));
  });
}));

Template.__checkName("question");
Template["question"] = new Template("Template.question", (function() {
  var view = this;
  return "Question of the Day";
}));

Template.__checkName("timelineScroller");
Template["timelineScroller"] = new Template("Template.timelineScroller", (function() {
  var view = this;
  return "timelineScroller";
}));

Template.__checkName("timelineToggle");
Template["timelineToggle"] = new Template("Template.timelineToggle", (function() {
  var view = this;
  return Blaze.View(function() {
    return Spacebars.mustache(view.lookup("currentEpoch"));
  });
}));

Template.__checkName("timelineMinute");
Template["timelineMinute"] = new Template("Template.timelineMinute", (function() {
  var view = this;
  return [ HTML.P(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("minute"), "formattedMinute"));
  })) ];
}));

Template.__checkName("timelineMoment");
Template["timelineMoment"] = new Template("Template.timelineMoment", (function() {
  var view = this;
  return HTML.UL(HTML.LI(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "archiveCreatedAt"));
  })), "\n", HTML.LI(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "tokboxArchiveId"));
  })), "\n", HTML.LI(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "tokboxArchiveName"));
  })), "\n\n\n");
}));

Template.__checkName("timelineDay");
Template["timelineDay"] = new Template("Template.timelineDay", (function() {
  var view = this;
  return Blaze.View(function() {
    return Spacebars.mustache(view.lookup("day"));
  });
}));

Template.__checkName("timelineMonth");
Template["timelineMonth"] = new Template("Template.timelineMonth", (function() {
  var view = this;
  return Blaze.View(function() {
    return Spacebars.mustache(view.lookup("month"));
  });
}));

Template.__checkName("timelineYear");
Template["timelineYear"] = new Template("Template.timelineYear", (function() {
  var view = this;
  return Blaze.View(function() {
    return Spacebars.mustache(view.lookup("year"));
  });
}));

Template.__checkName("ppLogo");
Template["ppLogo"] = new Template("Template.ppLogo", (function() {
  var view = this;
  return HTML.SVG({
    id: "ppLogo",
    "class": "icon",
    viewbox: "0 0 100 100"
  }, HTML.DEFS(HTML.PATTERN({
    id: "ppImageFill",
    patternunits: "userSpaceOnUse",
    width: "300",
    height: "100"
  }, HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/nebula.png",
    x: "-100",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/starry.jpg",
    x: "-120",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/mayan.jpeg",
    x: "-70",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/rain.png",
    x: "-135",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/owl.jpg",
    x: "-80",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/earth.png",
    x: "-80",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/samurai.png",
    x: "-140",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/cave.jpg",
    x: "-120",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/skullkid.jpg",
    x: "-120",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/deer.jpg",
    x: "-90",
    y: "0",
    width: "300",
    height: "100"
  }), "\n", HTML.IMAGE({
    "class": "ppImageFillImage",
    "xlink:href": "img/performers/01.jpg",
    x: "-90",
    y: "0",
    width: "300",
    height: "100"
  }))), "\n", HTML.DEFS({
    id: "pFirstDef"
  }, HTML.PATH({
    id: "pFirst",
    d: "M68.791,3.982H34.513v58v3.824v30.211h20.72V65.935v-0.128h13.558C86.059,65.807,100,51.912,100,34.703C100,17.622,86.059,3.982,68.791,3.982z"
  })), "\n", HTML.CLIPPATH({
    id: "pFirstMask"
  }, HTML.USE({
    "xlink:href": "#pFirst",
    overflow: "visible"
  })), "\n", HTML.RECT({
    id: "pFirstFill",
    x: "32.301",
    y: "1.77",
    "clip-path": "url(#pFirstMask)",
    width: "69.911",
    height: "96.46"
  }), "\n", HTML.DEFS({
    id: "pLastDef"
  }, HTML.PATH({
    id: "pLast",
    d: "M34.278,3.982H0v58v3.824v30.211h20.72V65.935v-0.128h13.558c17.267,0,31.208-13.895,31.208-31.104C65.486,17.622,51.545,3.982,34.278,3.982z"
  })), "\n", HTML.CLIPPATH({
    id: "pLastMask"
  }, HTML.USE({
    "xlink:href": "#pLast",
    overflow: "visible"
  })), "\n", HTML.RECT({
    id: "pLastFill",
    x: "-2.212",
    y: "1.77",
    "clip-path": "url(#pLastMask)",
    width: "69.912",
    height: "96.46"
  }));
}));

})();
