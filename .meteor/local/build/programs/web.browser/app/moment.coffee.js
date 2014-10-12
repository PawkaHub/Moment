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

this.openTokApiKey = '45020262';

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
          log('streamCreated!', event);
          session.subscribe(event.stream, 'video', {
            insertMode: 'append'
          });
          return layout();
        });
        return session.connect(result.token, function(err) {
          if (err) {
            return log('session connect err', err);
          } else {
            log('Connected to session!');
            layout();
            if (session.capabilities.publish === 1) {
              log('User is capable of publishing!', session.capabilities);
              return Session.set('userCanPublish', false);
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
    Session.setDefault('canSubscribeToStream', false);
    Session.setDefault('userCanPublish', false);
    Session.setDefault('userIsPublishing', false);
    Session.setDefault('timer', 60);
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
          backgroundColor: 'rgba(0,0,0,0.4)'
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
          color: '#fff',
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
      }
    });
    Template.background.rendered = function() {
      var fview, target, video;
      fview = FView.from(this);
      log('Set video layout!');
      video = this.find('#video');
      log('video', video);
      window.layout = TB.initLayoutContainer(video, {
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
        var publisher;
        log('TARGET CLICKED', fview, target);
        if (Session.equals('canSubscribeToStream', true && Session.equals('userCanPublish', true && Session.equals('userIsPublishing', false)))) {
          log('User can publish!');
          publisher = OT.initPublisher('video', {
            insertMode: 'append',
            resolution: '1280x720'
          });
          layout();
          publisher.on({
            streamCreated: function(e) {
              var clock, interval, timeLeft;
              log('publishStream created!', e);
              Session.set('userIsPublishing', true);
              clock = 60;
              timeLeft = function() {
                if (clock > 0) {
                  clock--;
                  Session.set('timer', clock);
                  return console.log(clock);
                } else {
                  console.log("That's All Folks");
                  return Meteor.clearInterval(interval);
                }
              };
              return interval = Meteor.setInterval(timeLeft, 1000);
            },
            streamDestroyed: function(e) {
              log('publishStream destroyed!', e);
              Session.set('userIsPublishing', false);
              return Session.set('timer', 60);
            }
          });
          session.publish(publisher);
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
    return Template.question.rendered = function() {
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
    }
  });
  Meteor.startup(function() {
    var openTokOptions;
    log('Server!');
    Accounts.removeOldGuests();
    Meteor.setInterval(function() {
      return log('Change User!');
    }, 60000);
    this.openTokSecret = 'ce949e452e117eef38d2661e9e1824f8faddff40';
    this.openTokClient = new OpenTokClient(openTokApiKey, openTokSecret);
    log('openTokClient', openTokClient);
    log('createOpenTokSession!');
    openTokOptions = {
      mediaMode: 'routed',
      location: '127.0.0.1'
    };
    this.openTokSession = openTokClient.createSession(openTokOptions);
    return log('openTokSession', openTokSession);
  });
}

})();
