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

this.Archives = new Mongo.Collection('archives');

this.Seconds = new Mongo.Collection('seconds');

this.openTokApiKey = '45020262';

this.momentTimer = 5;

this.log = function() {
  log.history = log.history || [];
  log.history.push(arguments);
  if (this.console) {
    return console.log(Array.prototype.slice.call(arguments));
  }
};

if (Meteor.isClient) {
  Meteor.startup(function() {
    Logger.setLevel('famous-views', 'info');
    Guests.add();
    Meteor.call('createOpenTokSession', function(err, result) {
      if (err) {
        return log('createOpenTokSession err', err);
      } else {
        this.session = OT.initSession(result.apiKey, result.session);
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
            if (session.capabilities.publish === 1) {

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
      var epoch, minute, minutes, minutesInADay, momentMinute;
      epoch = TimeSync.serverTime();
      minutesInADay = 1440;
      minutes = [];
      while (minutes.length < minutesInADay) {
        momentMinute = moment(epoch);
        minute = {
          index: minutes.length,
          momentMinute: momentMinute
        };
        minute.momentMinute.set('minute', minutes.length);
        minute.formattedMinute = minute.momentMinute.format('h:mm A');
        minutes.push(minute);
      }
      return minutes;
    });
    Template.registerHelper('days', function() {
      var currentDay, day, days, daysInAMonth, epoch, momentDay;
      epoch = TimeSync.serverTime();
      day = moment(epoch);
      currentDay = day.day();
      daysInAMonth = 31;
      days = [];
      while (days.length < daysInAMonth) {
        momentDay = moment(epoch);
        day = {
          index: days.length,
          momentDay: momentDay
        };
        day.momentDay.set('day', currentDay--);
        day.formattedDay = day.momentDay.format('dddd');
        days.push(day);
      }
      return days;
    });
    Template.registerHelper('months', function() {
      var currentMonth, epoch, momentMonth, month, months, monthsInAYear;
      epoch = TimeSync.serverTime();
      month = moment(epoch);
      currentMonth = month.month();
      monthsInAYear = 40;
      months = [];
      while (months.length < monthsInAYear) {
        momentMonth = moment(epoch);
        month = {
          index: months.length,
          momentMonth: momentMonth
        };
        month.momentMonth.set('month', currentMonth--);
        month.formattedMonth = month.momentMonth.format('MMMM');
        months.push(month);
      }
      return months;
    });
    Template.registerHelper('years', function() {
      var currentYear, epoch, momentYear, year, years, yearsSinceEpoch;
      epoch = TimeSync.serverTime();
      year = moment(epoch);
      currentYear = year.year();
      years = [];
      yearsSinceEpoch = 40;
      while (years.length < yearsSinceEpoch) {
        momentYear = moment(epoch);
        year = {
          index: years.length,
          momentYear: momentYear
        };
        year.momentYear.set('year', currentYear--);
        year.formattedYear = year.momentYear.format('YYYY');
        years.push(year);
      }
      return years;
    });
    Template.registerHelper('timelineMoments', function() {
      var data, instance;
      instance = Template.instance();
      data = instance.data;
      return Moments.find();
    });
    Template.registerHelper('currentEpoch', function() {
      return TimeSync.serverTime();
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
          borderRadius: '50%',
          textAlign: 'center',
          color: '#ffffff'
        };
      },
      timelineMomentStyles: function() {
        return {
          textAlign: 'center',
          color: '#ffffff'
        };
      }
    });
    Template.about.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      target.on('start', function() {
        return log('STARTING!!!!!!');
      });
      target.on('update', function() {
        return log('UPDATING!!!!');
      });
      return target.on('end', function() {
        return log('ENDING!!!!!!!');
      });
    };
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
                var archive, clock, interval, timeLeft;
                if (err) {
                  return log('createMoment err', err);
                } else {
                  log('createMoment result', result);
                  archive = {
                    archiveCreatedAt: result.createdAt,
                    duration: result.duration,
                    tokboxArchiveId: result.id,
                    tokboxArchiveName: result.name,
                    tokboxPartnerId: result.partnerId,
                    tokboxSessionId: result.sessionId,
                    archiveSize: result.size,
                    archiveUpdatedAt: result.updatedAt
                  };
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
    Template.timelineMinuteScroller.rendered = function() {
      var fview, scrollView, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      scrollView = fview.children[0].view._eventInput;
      window.timelineMinuteScroller = fview.children[0].view;
      window.timelineMinuteSequence = window.timelineMinuteScroller._node;
      window.timelineMinuteSequence._.loop = true;
      scrollView.on('start', function(e) {});
      scrollView.on('update', function(e) {});
      scrollView.on('end', function(e) {});
      return this.autorun(function(computation) {
        var amountMidPoint, currentMinute, i, instance, previousMinute, scrollDistance, scrollStart, totalAmount, _i, _j, _k, _l;
        currentMinute = Session.get('currentMinute');
        previousMinute = window.timelineMinuteScroller.getCurrentIndex();
        totalAmount = window.timelineMinuteScroller._node._.array.length;
        amountMidPoint = totalAmount / 2;
        log('=====================================================================');
        log('previousMinute', previousMinute);
        log('currentMinute', currentMinute);
        scrollStart = 0;
        if (previousMinute > amountMidPoint && currentMinute < amountMidPoint) {
          scrollDistance = totalAmount + currentMinute - previousMinute;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _i = 0; 0 <= scrollDistance ? _i <= scrollDistance : _i >= scrollDistance; i = 0 <= scrollDistance ? ++_i : --_i) {
            window.timelineMinuteScroller.goToNextPage();
          }
        } else if (previousMinute < amountMidPoint && currentMinute > amountMidPoint) {
          scrollDistance = totalAmount + previousMinute - currentMinute;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _j = 0; 0 <= scrollDistance ? _j <= scrollDistance : _j >= scrollDistance; i = 0 <= scrollDistance ? ++_j : --_j) {
            window.timelineMinuteScroller.goToPreviousPage();
          }
        } else {
          scrollDistance = previousMinute - currentMinute;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          if (previousMinute < currentMinute) {
            for (i = _k = 0; 0 <= scrollDistance ? _k <= scrollDistance : _k >= scrollDistance; i = 0 <= scrollDistance ? ++_k : --_k) {
              window.timelineMinuteScroller.goToNextPage();
            }
          } else {
            for (i = _l = 0; 0 <= scrollDistance ? _l <= scrollDistance : _l >= scrollDistance; i = 0 <= scrollDistance ? ++_l : --_l) {
              window.timelineMinuteScroller.goToPreviousPage();
            }
          }
        }
        return instance = Template.instance();
      });
    };
    Template.timelineMinuteScroller.helpers({
      timelineMinuteStyles: function() {
        return {
          textAlign: 'center',
          color: '#ffffff'
        };
      }
    });
    Template.timelineMinute.rendered = function() {
      var data, fview, momentMinute, self, serverMoment, target;
      fview = FView.from(this);
      self = this;
      data = self.data;
      target = fview.surface || fview.view._eventInput;
      momentMinute = data.momentMinute;
      serverMoment = moment(TimeSync.serverTime());
      if (momentMinute.format('h:mm A') === serverMoment.format('h:mm A')) {
        Session.set('currentMinute', data.index);
      }
      target.on('click', function() {});
      return this.autorun(function(computation) {
        var currentMinute, instance;
        currentMinute = Session.get('currentMinute');
        instance = Template.instance();
        data = instance.data;
        if (currentMinute === data.index) {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(30, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        } else {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        }
      });
    };
    Template.timelineMinute.helpers({
      minute: function() {
        return this;
      }
    });
    Template.timelineDayScroller.rendered = function() {
      var fview, scrollView, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      scrollView = fview.children[1].view._eventInput;
      window.timelineDayScroller = fview.children[1].view;
      window.timelineDaySequence = window.timelineDayScroller._node;
      window.timelineDaySequence._.loop = true;
      scrollView.on('start', function(e) {});
      scrollView.on('update', function(e) {});
      scrollView.on('end', function(e) {});
      return this.autorun(function(computation) {
        var amountMidPoint, currentDay, i, instance, previousDay, scrollDistance, scrollStart, totalAmount, _i, _j, _k, _l;
        currentDay = Session.get('currentDay');
        previousDay = window.timelineDayScroller.getCurrentIndex();
        totalAmount = window.timelineDayScroller._node._.array.length;
        amountMidPoint = totalAmount / 2;
        log('*********************************************************************');
        log('previousDay', previousDay);
        log('currentDay', currentDay);
        scrollStart = 0;
        if (previousDay > amountMidPoint && currentDay < amountMidPoint) {
          scrollDistance = totalAmount + currentDay - previousDay;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _i = 0; 0 <= scrollDistance ? _i <= scrollDistance : _i >= scrollDistance; i = 0 <= scrollDistance ? ++_i : --_i) {
            window.timelineDayScroller.goToNextPage();
          }
        } else if (previousDay < amountMidPoint && currentDay > amountMidPoint) {
          scrollDistance = totalAmount + previousDay - currentDay;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _j = 0; 0 <= scrollDistance ? _j <= scrollDistance : _j >= scrollDistance; i = 0 <= scrollDistance ? ++_j : --_j) {
            window.timelineDayScroller.goToPreviousPage();
          }
        } else {
          scrollDistance = previousDay - currentDay;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          if (previousDay < currentDay) {
            for (i = _k = 0; 0 <= scrollDistance ? _k <= scrollDistance : _k >= scrollDistance; i = 0 <= scrollDistance ? ++_k : --_k) {
              window.timelineDayScroller.goToNextPage();
            }
          } else {
            for (i = _l = 0; 0 <= scrollDistance ? _l <= scrollDistance : _l >= scrollDistance; i = 0 <= scrollDistance ? ++_l : --_l) {
              window.timelineDayScroller.goToPreviousPage();
            }
          }
        }
        return instance = Template.instance();
      });
    };
    Template.timelineDayScroller.helpers({
      timelineDayStyles: function() {
        return {
          color: '#ffffff'
        };
      }
    });
    Template.timelineDay.rendered = function() {
      var data, fview, momentDay, self, serverMoment, target;
      fview = FView.from(this);
      self = this;
      data = self.data;
      target = fview.surface || fview.view._eventInput;
      momentDay = data.momentDay;
      serverMoment = moment(TimeSync.serverTime());
      if (momentDay.format('D') === serverMoment.format('D')) {
        Session.set('currentDay', data.index);
      }
      target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentDay', data.index);
      });
      return this.autorun(function(computation) {
        var currentDay, instance;
        currentDay = Session.get('currentDay');
        instance = Template.instance();
        data = instance.data;
        if (currentDay === data.index) {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(30, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        } else {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        }
      });
    };
    Template.timelineDay.helpers({
      day: function() {
        return this;
      }
    });
    Template.timelineMonthScroller.rendered = function() {
      var fview, scrollView, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      scrollView = fview.children[2].view._eventInput;
      window.timelineMonthScroller = fview.children[2].view;
      window.timelineMonthSequence = window.timelineMonthScroller._node;
      window.timelineMonthSequence._.loop = true;
      scrollView.on('start', function(e) {});
      scrollView.on('update', function(e) {});
      scrollView.on('end', function(e) {});
      return this.autorun(function(computation) {
        var amountMidPoint, currentMonth, i, instance, previousMonth, scrollDistance, scrollStart, totalAmount, _i, _j, _k, _l;
        currentMonth = Session.get('currentMonth');
        previousMonth = window.timelineMonthScroller.getCurrentIndex();
        totalAmount = window.timelineMonthScroller._node._.array.length;
        amountMidPoint = totalAmount / 2;
        log('*********************************************************************');
        log('previousMonth', previousMonth);
        log('currentMonth', currentMonth);
        scrollStart = 0;
        if (previousMonth > amountMidPoint && currentMonth < amountMidPoint) {
          scrollDistance = totalAmount + currentMonth - previousMonth;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _i = 0; 0 <= scrollDistance ? _i <= scrollDistance : _i >= scrollDistance; i = 0 <= scrollDistance ? ++_i : --_i) {
            window.timelineMonthScroller.goToNextPage();
          }
        } else if (previousMonth < amountMidPoint && currentMonth > amountMidPoint) {
          scrollDistance = totalAmount + previousMonth - currentMonth;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _j = 0; 0 <= scrollDistance ? _j <= scrollDistance : _j >= scrollDistance; i = 0 <= scrollDistance ? ++_j : --_j) {
            window.timelineMonthScroller.goToPreviousPage();
          }
        } else {
          scrollDistance = previousMonth - currentMonth;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          if (previousMonth < currentMonth) {
            for (i = _k = 0; 0 <= scrollDistance ? _k <= scrollDistance : _k >= scrollDistance; i = 0 <= scrollDistance ? ++_k : --_k) {
              window.timelineMonthScroller.goToNextPage();
            }
          } else {
            for (i = _l = 0; 0 <= scrollDistance ? _l <= scrollDistance : _l >= scrollDistance; i = 0 <= scrollDistance ? ++_l : --_l) {
              window.timelineMonthScroller.goToPreviousPage();
            }
          }
        }
        return instance = Template.instance();
      });
    };
    Template.timelineMonthScroller.helpers({
      timelineMonthStyles: function() {
        return {
          color: '#ffffff'
        };
      }
    });
    Template.timelineMonth.rendered = function() {
      var data, fview, momentMonth, self, serverMoment, target;
      fview = FView.from(this);
      self = this;
      data = self.data;
      target = fview.surface || fview.view._eventInput;
      momentMonth = data.momentMonth;
      serverMoment = moment(TimeSync.serverTime());
      if (momentMonth.format('M') === serverMoment.format('M')) {
        log('SERVER MOMENT MONTH MATCH!!!!!', serverMoment.format('M'), momentMonth.format('M'));
        Session.set('currentMonth', data.index);
      }
      target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentMonth', data.index);
      });
      return this.autorun(function(computation) {
        var currentMonth, instance;
        currentMonth = Session.get('currentMonth');
        instance = Template.instance();
        data = instance.data;
        if (currentMonth === data.index) {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(30, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        } else {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        }
      });
    };
    Template.timelineMonth.helpers({
      month: function() {
        return this;
      }
    });
    Template.timelineYearScroller.rendered = function() {
      var fview, scrollView, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      scrollView = fview.children[3].view._eventInput;
      window.timelineYearScroller = fview.children[3].view;
      window.timelineYearSequence = window.timelineYearScroller._node;
      window.timelineYearSequence._.loop = true;
      scrollView.on('start', function(e) {});
      scrollView.on('update', function(e) {});
      scrollView.on('end', function(e) {});
      return this.autorun(function(computation) {
        var amountMidPoint, currentYear, i, instance, previousYear, scrollDistance, scrollStart, totalAmount, _i, _j, _k, _l;
        currentYear = Session.get('currentYear');
        previousYear = window.timelineYearScroller.getCurrentIndex();
        totalAmount = window.timelineYearScroller._node._.array.length;
        amountMidPoint = totalAmount / 2;
        log('*********************************************************************');
        log('previousYear', previousYear);
        log('currentYear', currentYear);
        scrollStart = 0;
        if (previousYear > amountMidPoint && currentYear < amountMidPoint) {
          scrollDistance = totalAmount + currentYear - previousYear;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _i = 0; 0 <= scrollDistance ? _i <= scrollDistance : _i >= scrollDistance; i = 0 <= scrollDistance ? ++_i : --_i) {
            window.timelineYearScroller.goToNextPage();
          }
        } else if (previousYear < amountMidPoint && currentYear > amountMidPoint) {
          scrollDistance = totalAmount + previousYear - currentYear;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          for (i = _j = 0; 0 <= scrollDistance ? _j <= scrollDistance : _j >= scrollDistance; i = 0 <= scrollDistance ? ++_j : --_j) {
            window.timelineYearScroller.goToPreviousPage();
          }
        } else {
          scrollDistance = previousYear - currentYear;
          if (scrollDistance < 0) {
            scrollDistance = scrollDistance * -1;
          }
          if (previousYear < currentYear) {
            for (i = _k = 0; 0 <= scrollDistance ? _k <= scrollDistance : _k >= scrollDistance; i = 0 <= scrollDistance ? ++_k : --_k) {
              window.timelineYearScroller.goToNextPage();
            }
          } else {
            for (i = _l = 0; 0 <= scrollDistance ? _l <= scrollDistance : _l >= scrollDistance; i = 0 <= scrollDistance ? ++_l : --_l) {
              window.timelineYearScroller.goToPreviousPage();
            }
          }
        }
        return instance = Template.instance();
      });
    };
    Template.timelineYearScroller.helpers({
      timelineYearStyles: function() {
        return {
          color: '#ffffff'
        };
      }
    });
    Template.timelineYear.rendered = function() {
      var data, fview, momentYear, self, serverMoment, target;
      fview = FView.from(this);
      self = this;
      data = self.data;
      target = fview.surface || fview.view._eventInput;
      momentYear = data.momentYear;
      serverMoment = moment(TimeSync.serverTime());
      if (momentYear.format('YYYY') === serverMoment.format('YYYY')) {
        Session.set('currentYear', data.index);
      }
      target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentYear', data.index);
      });
      return this.autorun(function(computation) {
        var currentYear, instance;
        currentYear = Session.get('currentYear');
        instance = Template.instance();
        data = instance.data;
        if (currentYear === data.index) {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(30, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        } else {
          fview.modifier.halt();
          return fview.modifier.setTransform(Transform.translate(0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.3
          });
        }
      });
    };
    Template.timelineYear.helpers({
      year: function() {
        return this;
      }
    });
    Template.timelineMoment.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        log('TIMELINE MOMENT CLICKED', fview, target, this);
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(10, 10), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    return Template.timelineMoment.helpers({
      moment: function() {
        var data, instance;
        instance = Template.instance();
        data = instance.data;
        data;
        return this;
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
        var storedArchive;
        if (clock > 1) {
          clock--;
          log(clock);
          if (clock === 1) {
            if (archive.status !== 'stopped') {
              archive = openTokClient.stopArchive(archive.id);
              storedArchive = {
                archiveCreatedAt: archive.createdAt,
                tokboxArchiveId: archive.id,
                tokboxArchiveName: archive.name,
                tokboxPartnerId: archive.partnerId,
                tokboxSessionId: archive.sessionId,
                archiveUpdatedAt: archive.updatedAt
              };
              Moments.insert(storedArchive, function(error, id) {
                if (error) {
                  log('error');
                }
                return log('Moments insert callback!', id);
              });
              log('That\'s All Folks, let\'s cancel this server session archive', archive, storedArchive);
            }
            return Meteor.clearInterval(interval);
          }
        }
      };
      interval = Meteor.setInterval(timeLeft, 1000);
      log('Sigh archive', archive);
      return archive;
    },
    listArchives: function() {
      log('listArchives called!');
      return openTokClient.listArchives({
        count: 50
      }, function(error, archives, totalCount) {
        if (error) {
          log('listArchives error', error);
        }
        log('archives', archives);
        return log('totalCount', totalCount);
      });
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
    log('Server now!', now);
    return log('Get archives');
  });
}

})();

//# sourceMappingURL=moment.coffee.js.map
