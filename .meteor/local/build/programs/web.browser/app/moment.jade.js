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
      return [ null, null, null, null, null, Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("background"),
          size: Spacebars.call("[undefined,undefined]"),
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,0,0]"),
          opacity: Spacebars.call("1"),
          properties: Spacebars.call(view.lookup("backgroundStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("CanvasSurface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("overlay"),
          size: Spacebars.call("[undefined,undefined]"),
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,0,0]"),
          opacity: Spacebars.call("0.4"),
          properties: Spacebars.call(view.lookup("overlayStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("intro"),
          size: Spacebars.call("[200,200]"),
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,0,0]"),
          opacity: Spacebars.call("1"),
          properties: Spacebars.call(view.lookup("introStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("question"),
          size: Spacebars.call("[200,80]"),
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,0,0]"),
          opacity: Spacebars.call("1"),
          properties: Spacebars.call(view.lookup("questionStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("momentButton"),
          size: Spacebars.call("[200,40]"),
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,0,0]"),
          opacity: Spacebars.call("1"),
          properties: Spacebars.call(view.lookup("momentButtonStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("ppLogo"),
          size: Spacebars.call("[100,100]"),
          origin: Spacebars.call("[0,1]"),
          align: Spacebars.call("[0,1]"),
          translate: Spacebars.call("[20,-20,0]"),
          opacity: Spacebars.call("0.14"),
          properties: Spacebars.call(view.lookup("ppLogoStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("timer"),
          size: Spacebars.call("[60,60]"),
          origin: Spacebars.call("[0.5,1]"),
          align: Spacebars.call("[0.5,0.5]"),
          translate: Spacebars.call("[0,100,0]"),
          opacity: Spacebars.call("1"),
          properties: Spacebars.call(view.lookup("timerStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), Blaze._TemplateWith(function() {
        return {
          template: Spacebars.call("timelineToggle"),
          size: Spacebars.call("[60,60]"),
          origin: Spacebars.call("[0,0]"),
          align: Spacebars.call("[0,0]"),
          translate: Spacebars.call("[20,20,100]"),
          opacity: Spacebars.call("0.14"),
          properties: Spacebars.call(view.lookup("timelineToggleStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"));
      }), null ];
    });
  });
}));

Template.__checkName("timelineSearchHolder");
Template["timelineSearchHolder"] = new Template("Template.timelineSearchHolder", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      template: Spacebars.call("timelineSearch"),
      size: Spacebars.call("[undefined,100]"),
      origin: Spacebars.call("[0.5,0]"),
      align: Spacebars.call("[0.5,0]"),
      translate: Spacebars.call("[0,0,8]"),
      properties: Spacebars.call(view.lookup("timelineSearchStyles")),
      placeholder: Spacebars.call("Hello Search"),
      opacity: Spacebars.call("0.8")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("InputSurface"));
  });
}));

Template.__checkName("timelineSearch");
Template["timelineSearch"] = new Template("Template.timelineSearch", (function() {
  var view = this;
  return "";
}));

Template.__checkName("timelineMinuteScroller");
Template["timelineMinuteScroller"] = new Template("Template.timelineMinuteScroller", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[undefined,undefined]"),
      origin: Spacebars.call("[0,0]"),
      align: Spacebars.call("[0,0]"),
      translate: Spacebars.call("[0,100,1]"),
      opacity: Spacebars.call("0.9")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Scrollview"), function() {
      return Blaze._TemplateWith(function() {
        return Spacebars.call(view.lookup("minutes"));
      }, function() {
        return Spacebars.include(view.lookupTemplate("famousEach"), function() {
          return Blaze._TemplateWith(function() {
            return {
              size: Spacebars.call("[undefined,1160]")
            };
          }, function() {
            return Spacebars.include(view.lookupTemplate("StateModifier"), function() {
              return [ Blaze._TemplateWith(function() {
                return {
                  id: Spacebars.call(view.lookup("timelineMinuteIndex")),
                  template: Spacebars.call("timelineMinute"),
                  origin: Spacebars.call("[0,0]"),
                  align: Spacebars.call("[0,0]"),
                  size: Spacebars.call("[undefined,undefined]"),
                  properties: Spacebars.call(view.lookup("timelineMinuteStyles")),
                  opacity: Spacebars.call("0.8")
                };
              }, function() {
                return Spacebars.include(view.lookupTemplate("Surface"));
              }), Blaze._TemplateWith(function() {
                return {
                  id: Spacebars.call(view.lookup("timelineMinuteTitleIndex")),
                  template: Spacebars.call("timelineMinuteTitle"),
                  origin: Spacebars.call("[0,0]"),
                  align: Spacebars.call("[0,0]"),
                  translate: Spacebars.call("[0,100,1]"),
                  size: Spacebars.call("[undefined,40]"),
                  properties: Spacebars.call(view.lookup("timelineMinuteTitleStyles")),
                  opacity: Spacebars.call("0.8")
                };
              }, function() {
                return Spacebars.include(view.lookupTemplate("Surface"));
              }), Blaze._TemplateWith(function() {
                return {
                  template: Spacebars.call("timelineMinuteTime"),
                  origin: Spacebars.call("[0,0]"),
                  align: Spacebars.call("[0,0]"),
                  translate: Spacebars.call("[0,40,1]"),
                  size: Spacebars.call("[undefined,40]"),
                  properties: Spacebars.call(view.lookup("timelineMinuteTimeStyles")),
                  opacity: Spacebars.call("0.8")
                };
              }, function() {
                return Spacebars.include(view.lookupTemplate("Surface"));
              }), Blaze._TemplateWith(function() {
                return {
                  dimensions: Spacebars.call("[4,5]"),
                  gutterSize: Spacebars.call("[10,10]"),
                  size: Spacebars.call("[1320,940]"),
                  translate: Spacebars.call("[0,-40,1]"),
                  origin: Spacebars.call("[0.5,1]"),
                  align: Spacebars.call("[0.5,1]")
                };
              }, function() {
                return Spacebars.include(view.lookupTemplate("GridLayout"), function() {
                  return [ Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }), Blaze._TemplateWith(function() {
                    return {
                      template: Spacebars.call("timelineMoment"),
                      size: Spacebars.call("[320,180]"),
                      origin: Spacebars.call("[0.5,0.5]"),
                      align: Spacebars.call("[0.5,0.5]"),
                      translate: Spacebars.call("[0,0]"),
                      properties: Spacebars.call(view.lookup("timelineMomentStyles"))
                    };
                  }, function() {
                    return Spacebars.include(view.lookupTemplate("ContainerSurface"));
                  }) ];
                });
              }) ];
            });
          });
        });
      });
    });
  });
}));

Template.__checkName("timelineDayScroller");
Template["timelineDayScroller"] = new Template("Template.timelineDayScroller", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[270,undefined]"),
      origin: Spacebars.call("[1,0]"),
      align: Spacebars.call("[1,0.5]"),
      translate: Spacebars.call("[0,0,9]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Scrollview"), function() {
      return Blaze._TemplateWith(function() {
        return Spacebars.call(view.lookup("days"));
      }, function() {
        return Spacebars.include(view.lookupTemplate("famousEach"), function() {
          return Blaze._TemplateWith(function() {
            return {
              template: Spacebars.call("timelineDay"),
              size: Spacebars.call("[undefined,40]"),
              origin: Spacebars.call("[0,0.5]"),
              align: Spacebars.call("[0,0]"),
              properties: Spacebars.call(view.lookup("timelineDayStyles"))
            };
          }, function() {
            return Spacebars.include(view.lookupTemplate("Surface"));
          });
        });
      });
    });
  });
}));

Template.__checkName("timelineMonthScroller");
Template["timelineMonthScroller"] = new Template("Template.timelineMonthScroller", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[170,undefined]"),
      origin: Spacebars.call("[1,0]"),
      align: Spacebars.call("[1,0.5]"),
      translate: Spacebars.call("[0,0,9]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Scrollview"), function() {
      return Blaze._TemplateWith(function() {
        return Spacebars.call(view.lookup("months"));
      }, function() {
        return Spacebars.include(view.lookupTemplate("famousEach"), function() {
          return Blaze._TemplateWith(function() {
            return {
              template: Spacebars.call("timelineMonth"),
              size: Spacebars.call("[undefined,40]"),
              origin: Spacebars.call("[0,0.5]"),
              align: Spacebars.call("[0,0]"),
              properties: Spacebars.call(view.lookup("timelineMonthStyles"))
            };
          }, function() {
            return Spacebars.include(view.lookupTemplate("Surface"));
          });
        });
      });
    });
  });
}));

Template.__checkName("timelineYearScroller");
Template["timelineYearScroller"] = new Template("Template.timelineYearScroller", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[80,undefined]"),
      origin: Spacebars.call("[1,0]"),
      align: Spacebars.call("[1,0.5]"),
      translate: Spacebars.call("[0,0,9]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("Scrollview"), function() {
      return Blaze._TemplateWith(function() {
        return Spacebars.call(view.lookup("years"));
      }, function() {
        return Spacebars.include(view.lookupTemplate("famousEach"), function() {
          return Blaze._TemplateWith(function() {
            return {
              template: Spacebars.call("timelineYear"),
              size: Spacebars.call("[undefined,40]"),
              origin: Spacebars.call("[0,0.5]"),
              align: Spacebars.call("[0,0]"),
              properties: Spacebars.call(view.lookup("timelineYearStyles"))
            };
          }, function() {
            return Spacebars.include(view.lookupTemplate("Surface"));
          });
        });
      });
    });
  });
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
  return HTML.Raw('<div class="header">Moment</div>');
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

Template.__checkName("timelineOverlay");
Template["timelineOverlay"] = new Template("Template.timelineOverlay", (function() {
  var view = this;
  return "timelineOverlay";
}));

Template.__checkName("timelineMinuteTime");
Template["timelineMinuteTime"] = new Template("Template.timelineMinuteTime", (function() {
  var view = this;
  return HTML.Raw('<div class="minuteTime">TIMELINE MINUTE TIME MOMENT</div>');
}));

Template.__checkName("timelineMinuteTitle");
Template["timelineMinuteTitle"] = new Template("Template.timelineMinuteTitle", (function() {
  var view = this;
  return HTML.Raw('<div class="minuteTitle">QUESTION OF THE DAY/RANDOM QUOTE</div>');
}));

Template.__checkName("timelineMinute");
Template["timelineMinute"] = new Template("Template.timelineMinute", (function() {
  var view = this;
  return [ HTML.DIV({
    "class": "minute"
  }, Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("minute"), "index"));
  })) ];
}));

Template.__checkName("timelineMoment");
Template["timelineMoment"] = new Template("Template.timelineMoment", (function() {
  var view = this;
  return Blaze._TemplateWith(function() {
    return {
      size: Spacebars.call("[undefined,undefined]"),
      origin: Spacebars.call("[0.5,0.5]"),
      align: Spacebars.call("[0.5,0.5]")
    };
  }, function() {
    return Spacebars.include(view.lookupTemplate("StateModifier"), function() {
      return Blaze._TemplateWith(function() {
        return {
          origin: Spacebars.call("[0.5,0.5]"),
          align: Spacebars.call("[0.5,0.5]"),
          properties: Spacebars.call(view.lookup("timelineMomentImageStyles"))
        };
      }, function() {
        return Spacebars.include(view.lookupTemplate("Surface"), function() {
          return HTML.UL(HTML.LI("Hello Moment!"), "\n", HTML.LI(Blaze.View(function() {
            return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "archiveCreatedAt"));
          })), "\n", HTML.LI(Blaze.View(function() {
            return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "tokboxArchiveId"));
          })), "\n", HTML.LI(Blaze.View(function() {
            return Spacebars.mustache(Spacebars.dot(view.lookup("moment"), "tokboxArchiveName"));
          })), "\n", null, "\n", null, "\n", null);
        });
      });
    });
  });
}));

Template.__checkName("timelineMomentEmptyText");
Template["timelineMomentEmptyText"] = new Template("Template.timelineMomentEmptyText", (function() {
  var view = this;
  return "";
}));

Template.__checkName("timelineDay");
Template["timelineDay"] = new Template("Template.timelineDay", (function() {
  var view = this;
  return [ HTML.P(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("day"), "formattedDay"));
  })) ];
}));

Template.__checkName("timelineMonth");
Template["timelineMonth"] = new Template("Template.timelineMonth", (function() {
  var view = this;
  return [ HTML.P(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("month"), "formattedMonth"));
  })) ];
}));

Template.__checkName("timelineYear");
Template["timelineYear"] = new Template("Template.timelineYear", (function() {
  var view = this;
  return [ HTML.P(Blaze.View(function() {
    return Spacebars.mustache(Spacebars.dot(view.lookup("year"), "formattedYear"));
  })) ];
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
