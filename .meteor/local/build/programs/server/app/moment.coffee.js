(function(){__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {
  return this.route('about', {
    path: '/'
  });
});

this.Publisher = new Mongo.Collection('publisher');

this.Questions = new Mongo.Collection('questions');

this.Moments = new Mongo.Collection('moments');

this.Seconds = new Mongo.Collection('seconds');

this.openTokApiKey = '45020262';

this.momentTimer = 60;

this.log = function() {
  log.history = log.history || [];
  log.history.push(arguments);
  if (this.console) {
    return console.log(Array.prototype.slice.call(arguments));
  }
};

if (Meteor.isClient) {
  Meteor.startup(function() {
    Guests.add();
    Meteor.call('createOpenTokSession', function(err, result) {
      if (err) {
        return log('createOpenTokSession err', err);
      } else {
        log('createOpenTokSession result', result);
        this.session = OT.initSession(result.apiKey, result.session);
        log('session', session);
        session.on('streamCreated', function(event) {
          log('Another streamCreated!', event);
          if (window.publisher) {
            session.unpublish(window.publisher);
          }
          window.subscriber = session.subscribe(event.stream, 'video', {
            insertMode: 'replace',
            resolution: '1280x720'
          }, function(err) {
            if (err) {
              return log('Subscribe err', err);
            } else {
              return log('Subscribed to stream!');
            }
          });
          return layout();
        });
        session.on('streamDestroyed', function(event) {
          event.preventDefault();
          return log('Another streamDestroyed!', event);
        });
        return session.connect(result.token, function(err) {
          if (err) {
            return log('session connect err', err);
          } else {
            log('Connected to session!');
            if (session.capabilities.publish === 1) {
              return log('User is capable of publishing!', session.capabilities);
            } else {
              return log('You are not able to publish a stream');
            }
          }
        });
      }
    });
    this.Transform = famous.core.Transform;
    this.Transitionable = famous.transitions.Transitionable;
    this.SpringTransition = famous.transitions.SpringTransition;
    this.SnapTransition = famous.transitions.SnapTransition;
    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('snap', SpringTransition);
    Session.setDefault('backgroundTranslation', 0);
    Session.setDefault('overlayTranslation', 0);
    Session.setDefault('introTranslation', 0);
    Session.setDefault('momentButtonTranslation', 0);
    Session.setDefault('ppLogoTranslation', -10);
    Session.setDefault('timerTranslation', 300);
    Session.setDefault('questionTranslation', -200);
    Session.setDefault('timelineToggleTranslation', -10);
    Session.setDefault('canSubscribeToStream', false);
    Session.setDefault('userCanPublish', false);
    Session.setDefault('userIsPublishing', false);
    Session.setDefault('timer', momentTimer);
    Session.setDefault('now', TimeSync.serverTime());
    Template.registerHelper('minutes', function() {
      var epoch, minute, minutes, minutesInADay;
      epoch = Session.get('epoch');
      minutesInADay = 1440;
      minutes = [];
      while (minutes.length < minutesInADay) {
        minute = moment(epoch);
        minute.set('minute', minutes.length);
        minutes.push(minute.format('h:mm A'));
      }
      log('minutes', minutes);
      return minutes;
    });
    Template.registerHelper('days', function() {
      var currentDay, day, days, daysInAMonth, epoch;
      epoch = Session.get('epoch');
      day = moment(epoch);
      currentDay = day.day();
      daysInAMonth = 31;
      days = [];
      while (days.length < daysInAMonth) {
        log('currentDay', currentDay);
        day.set('day', currentDay--);
        log('day', day);
        days.push(day.format('dddd'));
      }
      return days;
    });
    Template.registerHelper('months', function() {
      var currentMonth, epoch, month, months, monthsInAYear;
      epoch = Session.get('epoch');
      month = moment(epoch);
      currentMonth = month.month();
      monthsInAYear = 12;
      months = [];
      while (months.length < monthsInAYear) {
        log('currentMonth', currentMonth);
        month.set('month', currentMonth--);
        log('month', month);
        months.push(month.format('MMMM'));
      }
      log('months', months);
      return months;
    });
    Template.registerHelper('years', function() {
      var currentYear, epoch, year, years, yearsSinceEpoch;
      epoch = Session.get('epoch');
      year = moment(epoch);
      currentYear = year.year();
      years = [];
      yearsSinceEpoch = 10;
      while (years.length < yearsSinceEpoch) {
        log('currentYear', currentYear);
        year.set('year', currentYear--);
        log('year', year);
        years.push(year.format('YYYY'));
      }
      log('years', years);
      return years;
    });
    Template.about.helpers({
      backgroundStyles: function() {
        var styles;
        return styles = {
          backgroundColor: '#f5f5f5',
          backgroundImage: 'url(img/performers/01.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 50%',
          backgroundSize: 'cover'
        };
      },
      overlayStyles: function() {
        var styles;
        return styles = {
          backgroundColor: '#000000'
        };
      },
      introStyles: function() {
        var styles;
        return styles = {
          textAlign: 'center',
          color: '#ffffff'
        };
      },
      momentButtonStyles: function() {
        var styles;
        return styles = {
          border: '1px solid #ffffff',
          textAlign: 'center',
          color: '#ffffff',
          lineHeight: '40px'
        };
      },
      ppLogoStyles: function() {
        var styles;
        return styles = {};
      },
      timerStyles: function() {
        return {
          textAlign: 'center',
          color: '#ffffff'
        };
      },
      questionStyles: function() {
        return {
          textAlign: 'center',
          color: '#ffffff'
        };
      },
      timelineToggleStyles: function() {
        return {
          backgroundColor: '#ffffff',
          borderRadius: '50%'
        };
      },
      timelineMomentStyles: function() {
        return {
          textAlign: 'center',
          color: '#ffffff'
        };
      },
      timelineDayStyles: function() {
        return {
          color: '#ffffff'
        };
      },
      timelineMonthStyles: function() {
        return {
          color: '#ffffff'
        };
      },
      timelineYearStyles: function() {
        return {
          color: '#ffffff'
        };
      }
    });
    Template.background.rendered = function() {
      var fview, target, videoWrapper;
      fview = FView.from(this);
      log('Set videoWrapper layout!');
      videoWrapper = this.find('#videoWrapper');
      log('videoWrapper', videoWrapper);
      window.layout = TB.initLayoutContainer(videoWrapper, {
        bigFixedRatio: false
      }).layout;
      log('layout', layout);
      window.onresize = function() {
        var resizeTimeout;
        clearTimeout(resizeTimeout);
        return resizeTimeout = setTimeout(function() {
          log('Layouting');
          return layout();
        }, 20);
      };
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('backgroundTranslation', 0)) {
          Session.set('backgroundTranslation', 300);
        } else {
          Session.set('backgroundTranslation', 0);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('backgroundTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.overlay.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('overlayTranslation', 0)) {
          Session.set('overlayTranslation', 500);
        } else {
          Session.set('overlayTranslation', 0);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('overlayTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.intro.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('introTranslation', 0)) {
          Session.set('introTranslation', 150);
        } else {
          Session.set('introTranslation', 0);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('introTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.momentButton.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (session.capabilities.publish === 1) {
          log('User can publish!');
          window.publisher = OT.initPublisher('video', {
            insertMode: 'replace',
            resolution: '1280x720'
          });
          publisher.on({
            streamCreated: function(event) {
              log('publishStream created!', event);
              return Meteor.call('createMoment', function(err, result) {
                var clock, interval, timeLeft;
                if (err) {
                  return log('createMoment err', err);
                } else {
                  log('createMoment result', result);
                  clock = momentTimer;
                  timeLeft = function() {
                    if (clock > 0) {
                      clock--;
                      Session.set('timer', clock);
                      log(clock);
                      if (clock === 0) {
                        log("That's All Folks, let's cancel this clientside session");
                        return session.unpublish(publisher);
                      }
                    } else {
                      log("Uhhh else");
                      return Meteor.clearInterval(interval);
                    }
                  };
                  return interval = Meteor.setInterval(timeLeft, 1000);
                }
              });
            },
            streamDestroyed: function(event) {
              event.preventDefault();
              log('publishStream destroyed!', event);
              return Meteor.setTimeout(function() {
                return Session.set('timer', momentTimer);
              }, 1000);
            }
          });
          session.publish(publisher);
          layout();
        } else {
          log('Nope!');
        }
        if (Session.equals('momentButtonTranslation', 0)) {
          Session.set('momentButtonTranslation', 200);
        } else {
          Session.set('momentButtonTranslation', 0);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('momentButtonTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.ppLogo.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('ppLogoTranslation', -10)) {
          Session.set('ppLogoTranslation', -100);
        } else {
          Session.set('ppLogoTranslation', -10);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(Session.get('ppLogoTranslation'), -10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timer.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('timerTranslation', 300)) {
          Session.set('timerTranslation', 100);
        } else {
          Session.set('timerTranslation', 300);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('timerTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timer.helpers({
      timer: function() {
        return Session.get('timer');
      }
    });
    Template.question.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('questionTranslation', -200)) {
          Session.set('questionTranslation', 0);
        } else {
          Session.set('questionTranslation', -200);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('questionTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timelineToggle.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        if (Session.equals('timelineToggleTranslation', -10)) {
          Session.set('timelineToggleTranslation', -100);
        } else {
          Session.set('timelineToggleTranslation', -10);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(Session.get('timelineToggleTranslation'), 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Session.setDefault('currentSecond', 0);
    Session.setDefault('currentMinute', 0);
    Session.setDefault('currentHour', 0);
    Session.setDefault('currentDay', 0);
    Session.setDefault('currentMonth', 0);
    Session.setDefault('currentYear', 0);
    Session.setDefault('epoch', '2010-01-01 00:00');
    Session.setDefault('epochSecond', moment(Session.get('epoch')).second());
    Session.setDefault('epochMinute', moment(Session.get('epoch')).minute());
    Session.setDefault('epochHour', moment(Session.get('epoch')).hour());
    Session.setDefault('epochDay', moment(Session.get('epoch')).day());
    Session.setDefault('epochMonth', moment(Session.get('epoch')).month());
    Session.setDefault('epochYear', moment(Session.get('epoch')).year());
    Template.timelineMoment.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(10, 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timelineMoment.helpers({
      second: function() {
        var index, instance;
        instance = Template.instance();
        index = instance.data;
        if (typeof index === 'object') {
          return 0;
        } else {
          return index;
        }
      },
      minute: function() {
        return this;
      },
      hour: function() {
        var index, instance;
        instance = Template.instance();
        index = instance.data;
        if (typeof index === 'object') {
          return 0;
        } else {
          return index;
        }
      }
    });
    Template.timelineDay.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(10, 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timelineDay.helpers({
      day: function() {
        var index, instance;
        instance = Template.instance();
        index = instance.data;
        if (typeof index === 'object') {
          return 0;
        } else {
          return index;
        }
      }
    });
    Template.timelineMonth.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(10, 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timelineMonth.helpers({
      month: function() {
        var index, instance;
        instance = Template.instance();
        index = instance.data;
        if (typeof index === 'object') {
          return 0;
        } else {
          return index;
        }
      }
    });
    Template.timelineYear.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(10, 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    return Template.timelineYear.helpers({
      year: function() {
        var index, instance;
        instance = Template.instance();
        index = instance.data;
        if (typeof index === 'object') {
          return 0;
        } else {
          return index;
        }
      }
    });
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    createOpenTokSession: function() {
      var openTokSessionOptions, payload, token;
      log('Meteor.userId()', Meteor.userId());
      openTokSessionOptions = {
        role: 'publisher',
        data: 'userId:' + Meteor.userId(),
        expireTime: Math.round(new Date().getTime() / 1000) + 86400
      };
      token = openTokClient.generateToken(openTokSession, openTokSessionOptions);
      log('token', token);
      payload = {
        apiKey: openTokApiKey,
        session: openTokSession,
        token: token
      };
      return payload;
    },
    createMoment: function() {
      var archive, clock, interval, openTokArchiveOptions, timeLeft;
      log('Server createMoment called!');
      openTokArchiveOptions = {
        name: 'moment:' + Meteor.userId()
      };
      archive = openTokClient.startArchive(openTokSession, openTokArchiveOptions);
      clock = momentTimer;
      timeLeft = function() {
        if (clock > 1) {
          clock--;
          log(clock);
          if (clock === 1) {
            if (archive.status !== 'stopped') {
              archive = openTokClient.stopArchive(archive.id);
            }
            log('That\'s All Folks, let\'s cancel this server session archive', archive);
            return Meteor.clearInterval(interval);
          }
        }
      };
      interval = Meteor.setInterval(timeLeft, 1000);
      log('Sigh archive', archive);
      return archive;
    },
    stopMoment: function(archiveId) {
      var archive;
      log('Server stopMoment called!');
      log('archive?', archiveId);
      archive = openTokClient.stopArchive(archiveId);
      return archive;
    }
  });
  Meteor.startup(function() {
    var epoch, now, openTokOptions;
    log('Server!');
    Accounts.removeOldGuests();
    this.openTokSecret = 'ce949e452e117eef38d2661e9e1824f8faddff40';
    this.openTokClient = new OpenTokClient(openTokApiKey, openTokSecret);
    log('createOpenTokSession!');
    openTokOptions = {
      mediaMode: 'routed',
      location: '127.0.0.1'
    };
    this.openTokSession = openTokClient.createSession(openTokOptions);
    log('openTokSession', openTokSession);
    epoch = moment('2010-01-01 00:00');
    log('Server epoch!', epoch);
    now = moment();
    return log('Server now!', now);
  });
}

})();

//# sourceMappingURL=moment.coffee.js.map
