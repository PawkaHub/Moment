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

this.momentTimer = 100;

this.log = function() {
  log.history = log.history || [];
  log.history.push(arguments);
  if (this.console) {
    return console.log(Array.prototype.slice.call(arguments));
  }
};

if (Meteor.isClient) {
  FView.ready(function() {
    FView.registerView('InputSurface', famous.surfaces.InputSurface, {
      famousCreatedPost: function() {
        log('INPUT SURFACE!!!!!!!1111');
        return this.pipeChildrenTo = this.parent.pipeChildrenTo != null ? [this.view, this.parent.pipeChildrenTo[0]] : [this.view];
      }
    });
    FView.registerView('ImageSurface', famous.surfaces.ImageSurface, {
      famousCreatedPost: function() {
        return this.pipeChildrenTo = this.parent.pipeChildrenTo != null ? [this.view, this.parent.pipeChildrenTo[0]] : [this.view];
      }
    });
    FView.registerView('CanvasSurface', famous.surfaces.CanvasSurface, {
      famousCreatedPost: function() {
        this.pipeChildrenTo = this.parent.pipeChildrenTo != null ? [this.view, this.parent.pipeChildrenTo[0]] : [this.view];
        return log('CONTEXT?!');
      }
    });
    return FView.registerView('GridLayout', famous.views.GridLayout, {
      famousCreatedPost: function() {
        return this.pipeChildrenTo = this.parent.pipeChildrenTo != null ? [this.view, this.parent.pipeChildrenTo[0]] : [this.view];
      }
    });
  });
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
            Session.set('userIsPublishing', false);
            window.scene.remove(window.videoCube);
            window.videoCube = null;
            window.video = null;
          }
          return window.subscriber = session.subscribe(event.stream, 'video', {
            insertMode: 'replace',
            resolution: '1280x720'
          }, function(err) {
            if (err) {
              log('Subscribe err', err);
              Session.set('subscribed', false);
              window.scene.remove(window.videoCube);
              window.videoCube = null;
              return window.video = null;
            } else {
              log('Subscribed to stream!');
              Session.set('subscribed', true);
              return window.video = document.querySelector('video');
            }
          });
        });
        session.on('streamDestroyed', function(event) {
          log('Another streamDestroyed!', event);
          Session.set('subscribed', false);
          window.scene.remove(window.videoCube);
          window.videoCube = null;
          return window.video = null;
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
    this.Engine = famous.core.Engine;
    this.Transitionable = famous.transitions.Transitionable;
    this.SpringTransition = famous.transitions.SpringTransition;
    this.SnapTransition = famous.transitions.SnapTransition;
    this.Easing = famous.transitions.Easing;
    this.Timer = famous.utilities.Timer;
    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('snap', SpringTransition);
    Session.setDefault('ppLogoTranslation', -20);
    Session.setDefault('timelineActive', false);
    Session.setDefault('canSubscribeToStream', false);
    Session.setDefault('userCanPublish', false);
    Session.setDefault('userIsPublishing', false);
    Session.setDefault('subscribed', false);
    Session.setDefault('timer', momentTimer);
    Session.setDefault('now', TimeSync.serverTime());
    Session.setDefault('easterEggActive', false);
    Session.setDefault('loaded', false);
    Session.setDefault('blur', 100);
    Session.setDefault('grayscale', false);
    Session.setDefault('bloom', 1);

    /*Engine.on('prerender', () ->
    			if window.timelineMinuteScroller
    				parallaxEffect = 2.0
    				bgPos = -window.timelineMinuteScroller.getPosition() / parallaxEffect
    				 *log 'bgPos',bgPos
    				fview = FView.byId('timelineMinuteDisplay' + (window.timelineMinuteScroller.getCurrentIndex() + 1))
    				 *if fview
    					 *fview.modifier.setTransform Transform.translate(0, bgPos)
    		)
     */
    Engine.on('postrender', function() {
      var FAR, NEAR, SCREEN_HEIGHT, SCREEN_WIDTH, VIEW_ANGLE, axisHelper, canvasSize, effectBloom, effectCopy, effectHorizBlur, effectVertiBlur, light, renderModel, size, subscribed, userIsPublishing, videoGeometry, videoMaterial;
      if (window.canvas && !window.context) {
        log('MAKE CANVAS!!!!');
        size = FView.mainCtx.getSize();
        canvasSize = [size[0] * 2, size[1] * 2];
        window.canvas.setSize(size, canvasSize);
        window.context = window.canvas.getContext('webgl');
        window.renderer = new THREE.WebGLRenderer({
          canvas: window.canvas._currentTarget,
          antialias: true,
          devicePixelRatio: window.devicePixelRatio,
          context: window.context
        });
        window.scene = new THREE.Scene();
        VIEW_ANGLE = 45;
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
        NEAR = 0.01;
        FAR = 100;
        window.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR);
        window.camera.position.set(0, 0, 3);
        window.camera.lookAt(window.scene.position);
        window.composer = new THREE.EffectComposer(window.renderer);
        renderModel = new THREE.RenderPass(window.scene, window.camera);
        effectBloom = new THREE.BloomPass(Session.get('bloom'));
        effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectHorizBlur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
        effectVertiBlur = new THREE.ShaderPass(THREE.VerticalBlurShader);
        effectHorizBlur.uniforms["h"].value = 0 / window.innerWidth;
        effectVertiBlur.uniforms["v"].value = 0 / window.innerHeight;
        effectVertiBlur.renderToScreen = true;
        window.composer.addPass(renderModel);
        window.composer.addPass(effectHorizBlur);
        window.composer.addPass(effectVertiBlur);
        axisHelper = new THREE.AxisHelper(1);
        scene.add(axisHelper);
        light = new THREE.AmbientLight("rgb(255,255,255)");
        window.scene.add(light);
        THREEx.WindowResize(window.composer, window.camera);
      }
      userIsPublishing = Session.get('userIsPublishing');
      subscribed = Session.get('subscribed');
      if ((window.publisher && userIsPublishing && window.video && !window.videoCube) || (window.subscriber && subscribed && window.video && !window.videoCube)) {
        log('Running!', window.publisher, Session.get('userIsPublishing'), window.videoCube, window.subscriber, Session.get('subscribed'), window.videoCube);
        window.videoTexture = new THREE.Texture(window.video);
        window.videoTexture.wrapS = THREE.RepeatWrapping;
        window.videoTexture.wrapT = THREE.RepeatWrapping;
        window.videoTexture.repeat.set(1, 1);
        videoGeometry = new THREE.BoxGeometry(3, 3, 3);
        videoMaterial = new THREE.MeshLambertMaterial({
          map: window.videoTexture,
          shading: THREE.FlatShading
        });
        window.videoCube = new THREE.Mesh(videoGeometry, videoMaterial);
        window.scene.add(window.videoCube);
        window.camera.position.z = 3;
      }
      if (window.renderer && window.scene && window.camera) {
        if (window.videoCube) {
          window.videoTexture.needsUpdate = true;
        }
        if (window.easterEggModel) {
          window.easterEggModel.rotation.y += 0.001;
        }
        if (window.controls) {
          window.controls.update();
        }
        if (window.composer) {
          window.renderer.clear();
          return window.composer.render();
        } else {
          return window.renderer.render(window.scene, window.camera);
        }
      }
    });
    Template.registerHelper('minutes', function() {
      var epoch, minute, minutes, minutesInADay, momentMinute;
      epoch = TimeSync.serverTime();
      minutesInADay = 3;
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
      daysInAMonth = 100;
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
      monthsInAYear = 100;
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
      yearsSinceEpoch = 100;
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
          backgroundColor: '#000'
        };
      },
      overlayStyles: function() {
        var styles;
        return styles = {
          backgroundImage: 'radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%), radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%)',
          backgroundPosition: '0 0, 2px 2px',
          backgroundSize: '4px 4px, 4px 4px, 100% 100%',
          backgroundRepeat: 'repeat, repeat, no-repeat',
          pointerEvents: 'none'
        };
      },
      introStyles: function() {
        return {
          textAlign: 'center',
          fontSize: '36px',
          fontFamily: 'ziamimi-bold',
          color: '#ffffff'
        };
      },
      momentButtonStyles: function() {
        return {
          border: '1px solid #ffffff',
          textAlign: 'center',
          fontSize: '14px',
          fontFamily: 'ziamimi-light',
          color: '#ffffff',
          lineHeight: '44px',
          cursor: 'pointer'
        };
      },
      ppLogoStyles: function() {
        return {
          cursor: 'pointer'
        };
      },
      timerStyles: function() {
        return {
          textAlign: 'center',
          fontSize: '72px',
          fontFamily: 'ziamimi-light',
          color: '#ffffff'
        };
      },
      questionStyles: function() {
        return {
          textAlign: 'center',
          fontSize: '24px',
          fontFamily: 'ziamimi-light',
          color: '#ffffff'
        };
      },
      timelineToggleStyles: function() {
        return {
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          textAlign: 'center',
          color: '#ffffff',
          zIndex: '999',
          cursor: 'pointer'
        };
      },
      timelineOverlayStyles: function() {
        return {
          backgroundColor: '#000000',
          pointerEvents: 'none'
        };
      }
    });
    Template.about.rendered = function() {
      var fview, target;
      fview = FView.from(this);
      log('ABOUT FVIEW', fview);
      window.mainContext = fview;
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
      return Engine.defer(function() {
        var backgroundFView, easterEgg;
        backgroundFView = FView.byId('background');
        log('backgroundFView', backgroundFView);
        window.canvas = backgroundFView.view;
        return easterEgg = new Konami(function() {
          var SkywardSwordLink, SkywardSwordLinkDAE, TwilightPrincessLink, TwilightPrincessLinkDAE, WindWakerLink, YoungLink, easterEggActive, loader, threePointLighting;
          log('Trigger Model Viewer!');
          easterEggActive = Session.get('easterEggActive');
          if (!easterEggActive) {
            Session.set('easterEggActive', true);
            threePointLighting = new THREEx.ThreePointsLighting();
            window.scene.add(threePointLighting);
            loader = new THREEx.UniversalLoader();
            YoungLink = ['models/YoungLink/YoungLinkEquipped.obj', 'models/YoungLink/YoungLinkEquipped.mtl'];
            WindWakerLink = ['models/WindWakerLink/link.obj', 'models/WindWakerLink/link.mtl'];
            SkywardSwordLinkDAE = 'models/SkywardSwordLink/Link_2.dae';
            SkywardSwordLink = ['models/SkywardSwordLink/Link.obj', 'models/SkywardSwordLink/Link.mtl'];
            TwilightPrincessLinkDAE = 'models/TwilightPrincessLink/Link.dae';
            TwilightPrincessLink = ['models/TwilightPrincessLink/Link.obj', 'models/TwilightPrincessLink/Link.mtl'];
            return loader.load(YoungLink, function(object) {
              var boundingBox, scaleScalar, size;
              log('MODEL LOADED!', object);
              boundingBox = new THREE.Box3().setFromObject(object);
              window.link = boundingBox;
              log('boundingBox!', boundingBox);
              size = boundingBox.size();
              log('size', size);
              scaleScalar = Math.max(size.x, Math.max(size.y, size.z));
              log('scaleScalar', scaleScalar);
              object.scale.divideScalar(scaleScalar);
              boundingBox = new THREE.Box3().setFromObject(object);
              object.position.copy(boundingBox.center().negate());
              window.easterEggModel = object;
              return scene.add(object);
            });
          }
        });
      });
    };
    Template.overlay.rendered = function() {
      var fview, overlayFView, target;
      fview = FView.from(this);
      overlayFView = FView.byId('overlay');
      target = fview.surface || fview.view._eventInput;
      return target.on('click', function() {
        return log('OVERLAY CLICKED', fview, target);
      });
    };
    Template.timelineOverlay.rendered = function() {
      var fview, target, timelineOverlayFView;
      Template.overlay.rendered = function() {};
      fview = FView.from(this);
      timelineOverlayFView = FView.byId('timelineOverlay');
      target = fview.surface || fview.view._eventInput;
      target.on('click', function() {
        return log('TIMELINE OVERLAY CLICKED', fview, target);
      });
      return this.autorun(function(computation) {
        var timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive === true) {
          timelineOverlayFView.modifier.halt();
          return timelineOverlayFView.modifier.setOpacity(.8, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          timelineOverlayFView.modifier.halt();
          return timelineOverlayFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.intro.rendered = function() {
      var fview, introFView, target;
      fview = FView.from(this);
      introFView = FView.byId('intro');
      target = fview.surface || fview.view._eventInput;
      target.on('click', function() {
        return log('INTRO CLICKED', fview, target);
      });
      return this.autorun(function(computation) {
        var timelineActive, userIsPublishing;
        timelineActive = Session.get('timelineActive');
        userIsPublishing = Session.get('userIsPublishing');
        if (timelineActive === true || userIsPublishing === true) {
          introFView.modifier.halt();
          introFView.modifier.setTransform(Transform.scale(0, 0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return introFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          introFView.modifier.halt();
          introFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return introFView.modifier.setOpacity(1, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.momentButton.rendered = function() {
      var fview, momentButtonFView, target;
      fview = FView.from(this);
      momentButtonFView = FView.byId('momentButton');
      target = fview.surface || fview.view._eventInput;
      target.on('click', function() {
        log('MOMENT BUTTON CLICKED', fview, target);
        if (session.capabilities.publish === 1) {
          log('User can publish!');
          window.publisher = OT.initPublisher('video', {
            insertMode: 'replace',
            width: '1280',
            height: '720',
            resolution: '1280x720',
            audioLevelDisplayMode: 'none',
            buttonDisplayMode: 'off',
            nameDisplayMode: 'off'
          });
          publisher.on({
            streamCreated: function(event) {
              log('publishStream created!', event);
              Session.set('userIsPublishing', true);
              window.video = document.querySelector('video');
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
                        session.unpublish(publisher);
                        Session.set('userIsPublishing', false);
                        window.scene.remove(window.videoCube);
                        window.videoCube = null;
                        window.video = null;
                        return Meteor.clearInterval(interval);
                      }
                    } else {
                      log("Uhhh else");
                      session.unpublish(publisher);
                      Session.set('userIsPublishing', false);
                      window.scene.remove(window.videoCube);
                      window.videoCube = null;
                      window.video = null;
                      return Meteor.clearInterval(interval);
                    }
                  };
                  return interval = Meteor.setInterval(timeLeft, 1000);
                }
              });
            },
            streamDestroyed: function(event) {
              log('publishStream destroyed!', event);
              Session.set('userIsPublishing', false);
              window.scene.remove(window.videoCube);
              window.videoCube = null;
              window.video = null;
              return Meteor.setTimeout(function() {
                return Session.set('timer', momentTimer);
              }, 1000);
            }
          });
          if (window.subscriber) {
            session.unsubscribe(window.subscriber);
          }
          return session.publish(publisher);
        } else {
          return log('Nope!');
        }
      });
      return this.autorun(function(computation) {
        var timelineActive, userIsPublishing;
        timelineActive = Session.get('timelineActive');
        userIsPublishing = Session.get('userIsPublishing');
        if (timelineActive === true || userIsPublishing === true) {
          momentButtonFView.modifier.halt();
          momentButtonFView.modifier.setTransform(Transform.scale(0, 0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return momentButtonFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          momentButtonFView.modifier.halt();
          momentButtonFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return momentButtonFView.modifier.setOpacity(1, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.ppLogo.rendered = function() {
      var fview, ppLogo, target;
      fview = FView.from(this);
      target = fview.surface || fview.view._eventInput;
      log('DOM INSERTION', this.$('#ppLogo'));
      ppLogo = this.$('#ppLogo');
      log('ppLogo still exists!', ppLogo);
      return target.on('click', function() {
        var archiveId;
        log('TARGET CLICKED', fview, target);
        archiveId = Moments.find().fetch()[0].tokboxArchiveId;
        Meteor.call('getMoment', archiveId, function(err, result) {
          log('Calling getMoment!');
          if (err) {
            return log('getMoment err!', err);
          } else {
            return log('getMoment result!', result);
          }
        });
        if (Session.equals('ppLogoTranslation', -20)) {
          Session.set('ppLogoTranslation', -60);
        } else {
          Session.set('ppLogoTranslation', -20);
        }
        fview.modifier.halt();
        return fview.modifier.setTransform(Transform.translate(0, Session.get('ppLogoTranslation')), {
          method: 'spring',
          period: 1000,
          dampingRatio: 0.3
        });
      });
    };
    Template.timer.rendered = function() {
      var fview, target, timerFView;
      fview = FView.from(this);
      timerFView = FView.byId('timer');
      target = fview.surface || fview.view._eventInput;
      target.on('click', function() {
        return log('TIMER CLICKED', fview, target);
      });
      return this.autorun(function(computation) {
        var userIsPublishing;
        userIsPublishing = Session.get('userIsPublishing');
        if (userIsPublishing === true) {
          timerFView.modifier.halt();
          timerFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return timerFView.modifier.setOpacity(1, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          timerFView.modifier.halt();
          timerFView.modifier.setTransform(Transform.scale(0, 0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return timerFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.timer.helpers({
      timer: function() {
        return Session.get('timer');
      }
    });
    Template.question.rendered = function() {
      var fview, questionFView, target;
      fview = FView.from(this);
      questionFView = FView.byId('question');
      target = fview.surface || fview.view._eventInput;
      target.on('click', function() {
        return log('QUESTION CLICKED', fview, target);
      });
      return this.autorun(function(computation) {
        var timelineActive, userIsPublishing;
        timelineActive = Session.get('timelineActive');
        userIsPublishing = Session.get('userIsPublishing');
        if (timelineActive === true || userIsPublishing === true) {
          questionFView.modifier.halt();
          questionFView.modifier.setTransform(Transform.scale(0, 0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return questionFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          questionFView.modifier.halt();
          questionFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return questionFView.modifier.setOpacity(1, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.timelineToggle.rendered = function() {
      var fview, target, timelineToggleFView, zoomTransition;
      fview = FView.from(this);
      timelineToggleFView = FView.byId('timelineToggle');
      target = fview.surface || fview.view;
      zoomTransition = {
        duration: 500,
        curve: Easing.inOutSine
      };
      target.on('click', function() {
        log('TIMELINE TOGGLE CLICKED', fview, target);
        if (Session.equals('timelineActive', false)) {
          return Session.set('timelineActive', true);
        } else {
          return Session.set('timelineActive', false);
        }
      });
      return this.autorun(function(computation) {
        var userIsPublishing;
        userIsPublishing = Session.get('userIsPublishing');
        if (userIsPublishing === true) {
          timelineToggleFView.modifier.halt();
          timelineToggleFView.modifier.setTransform(Transform.scale(0, 0, 0), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return timelineToggleFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        } else {
          timelineToggleFView.modifier.halt();
          timelineToggleFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
          return timelineToggleFView.modifier.setOpacity(.14, {
            method: 'spring',
            period: 1000,
            dampingRatio: 0.6
          });
        }
      });
    };
    Template.timelineSearchHolder.rendered = function() {
      var target, timelineSearchFView;
      timelineSearchFView = FView.byId('timelineSearch');
      log('TIMELINESEARCHHOLDER FVIEW', timelineSearchFView);
      target = timelineSearchFView.surface || timelineSearchFView.view._eventInput;
      log('TIMELINESEARCHHOLDER TARGET', target);
      return target.on('keyup', function(e) {
        return log('TIMELINESEARCHHOLDER KEYUP', e);
      });

      /*@autorun((computation)->
      				timelineActive = Session.get('timelineActive')
      				if timelineActive is true
      					timelineSearchFView.modifier.halt()
      					timelineSearchFView.modifier.setTransform Transform.scale(1,1,1),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      				else
      					timelineSearchFView.modifier.halt()
      					timelineSearchFView.modifier.setTransform Transform.scale(0,0,0),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      			)
       */
    };
    Template.timelineSearchHolder.helpers({
      timelineSearchStyles: function() {
        return {
          backgroundColor: 'cadetblue',
          backgroundColor: 'transparent',
          padding: '0 10px 0 10px',
          fontSize: '40px',
          color: '#ffffff',
          fontFamily: 'ziamimi-light',
          textTransform: 'uppercase',
          textAlign: 'center'
        };
      }
    });
    Template.timelineSearch.rendered = function() {
      var fview, target, timelineSearchFView;
      fview = FView.from(this);
      log('TIMELINESEARCH FVIEW', fview);
      target = fview.surface || fview.view || fview.view._eventInput;
      log('TIMELINESEARCH TARGET', target);
      timelineSearchFView = FView.byId('timelineSearch');
      window.timelineSearch = target;
      return target.on('keyup', function(e) {
        return log('TIMELINESEARCH KEYUP', e);
      });

      /*@autorun((computation)->
      				timelineActive = Session.get('timelineActive')
      				if timelineActive is true
      					timelineSearchFView.modifier.halt()
      					timelineSearchFView.modifier.setTransform Transform.scale(1,1,1),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      				else
      					timelineSearchFView.modifier.halt()
      					timelineSearchFView.modifier.setTransform Transform.scale(0,0,0),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      			)
       */
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
      var timelineMinuteScrollerFView;
      log('TIMELINEMINUTESSCROLLER RENDERED', this);
      timelineMinuteScrollerFView = FView.byId('timelineMinuteScroller');
      timelineMinuteScrollerFView.modifier.setOrigin([0.5, 0.5]);
      Engine.pipe(timelineMinuteScrollerFView.view);
      return this.autorun(function(computation) {
        var timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive === true) {
          timelineMinuteScrollerFView.modifier.halt();
          timelineMinuteScrollerFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.8
          });
          return timelineMinuteScrollerFView.modifier.setOpacity(1, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.8
          });
        } else {
          timelineMinuteScrollerFView.modifier.halt();
          timelineMinuteScrollerFView.modifier.setTransform(Transform.scale(3, 3, 3), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.8
          });
          return timelineMinuteScrollerFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.8
          });
        }
      });
    };
    Template.timelineMinuteScroller.helpers({
      timelineMinuteScrollerStyles: function() {
        var styles, timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive) {
          log('Auto!');
          return styles = {
            pointerEvents: 'auto'
          };
        } else {
          log('None!');
          return styles = {
            pointerEvents: 'none'
          };
        }
      },
      moments: function() {
        var i, moment, moments, self, _i, _ref;
        self = this;
        moments = [];
        moment = {
          archiveCreatedAt: 'ARCHIVECREATEDAT',
          tokboxArchiveId: 'TOKBOXARCHIVEID',
          tokboxArchiveName: 'TOKBOXARCHIVENAME'
        };
        for (i = _i = 0, _ref = self.index; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          moments.push(moment);
        }
        return moments;
      },
      timelineMomentStyles: function() {
        var styles, timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive) {
          return styles = {
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: 'ziamimi-bold',
            textTransform: 'uppercase',
            overflow: 'hidden',
            lineHeight: '180px',
            cursor: 'pointer',
            pointerEvents: 'auto'
          };
        } else {
          return styles = {
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: 'ziamimi-bold',
            textTransform: 'uppercase',
            overflow: 'hidden',
            lineHeight: '180px',
            cursor: 'pointer',
            pointerEvents: 'none'
          };
        }
      },
      timelineMinuteTitleIndex: function() {
        return 'timelineMinuteTitle' + this.index;
      },
      timelineMinuteIndex: function() {
        return 'timelineMinute' + this.index;
      },
      timelineMinuteStyles: function() {
        var currentMinute, data, instance;
        currentMinute = Session.get('currentMinute');
        instance = Template.instance();
        data = instance.data;
        if (currentMinute === data.index) {
          return {
            backgroundColor: 'transparent',
            textAlign: 'center',
            color: '#ffffff',
            fontSize: '24px'
          };
        } else if (this.index === 0) {
          return {
            backgroundColor: 'transparent',
            textAlign: 'center',
            color: '#ffffff',
            fontSize: '24px'
          };
        } else {
          return {
            backgroundColor: 'transparent',
            textAlign: 'center',
            color: '#ffffff',
            fontSize: '24px'
          };
        }
      },
      timelineMinuteTitleStyles: function() {
        var currentMinute, data, instance;
        currentMinute = Session.get('currentMinute');
        instance = Template.instance();
        data = instance.data;
        return {
          backgroundColor: 'purple',
          backgroundColor: 'transparent',
          textAlign: 'center',
          color: '#ffffff',
          fontSize: '36px',
          fontFamily: 'ziamimi-bold',
          zIndex: '1'
        };
      },
      timelineMinuteTimeStyles: function() {
        return {
          backgroundColor: 'orange',
          backgroundColor: 'transparent',
          textAlign: 'center',
          color: '#ffffff',
          fontSize: '24px',
          fontFamily: 'ziamimi-bold',
          zIndex: '1'
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
      return target.on('click', function() {
        log('TIMELINE MINUTE CLICKED', fview, target, this, self);
        return Session.set('currentMinute', data.index);
      });

      /*@autorun((computation)->
      				currentMinute = Session.get('currentMinute')
      				 *Get the Template instance
      				instance = Template.instance()
      				data = instance.data
      				if currentMinute is data.index
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(30, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      				else
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(0, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      			)
       */
    };
    Template.timelineMinute.helpers({
      minute: function() {
        var fview, fviewHeight, fviewSize, instance, mainCtx, mainCtxHeight, mainCtxSize;
        if (FView.mainCtx) {
          mainCtx = FView.mainCtx;
          mainCtxSize = mainCtx.getSize();
          mainCtxHeight = mainCtxSize[1];
          instance = Template.instance();
          fview = FView.from(instance);
          if (this.index > 57 && this.index < 59) {
            fviewSize = fview.getSize();
            fviewHeight = fviewSize[1];
          }

          /*if this.index + 1 > 59
          						log 'I am greater than 59! I\'m gonna go back to 0',this.index
          					else if this.index - 1 < 0
          						log 'I am less than 0! I\'m gonna go back to 59',this.index
           */
        }
        return this;
      }
    });
    Template.timelineDayScroller.rendered = function() {
      var scrollView, timelineDayScrollerFView;
      timelineDayScrollerFView = FView.byId('timelineDayScroller');
      log('timelineDayScroller!');
      scrollView = timelineDayScrollerFView.view._eventInput;
      window.timelineDayScroller = timelineDayScrollerFView.view;
      window.timelineDaySequence = window.timelineDayScroller._node;
      window.timelineDaySequence._.loop = true;

      /*scrollView.on('start', (e) ->
      				 *log 'STARTING!!!!!!',this
      			)
      			scrollView.on('update', (e) ->
      				 *log 'UPDATING!!!!',this
      			)
      			scrollView.on('end', (e) ->
      				 *log 'ENDING!!!!!!!',this, this._cachedIndex
      			)
       */
      return this.autorun(function(computation) {
        var timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive === true) {
          timelineDayScrollerFView.modifier.halt();
          timelineDayScrollerFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineDayScrollerFView.modifier.setOpacity(.6, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        } else {
          timelineDayScrollerFView.modifier.halt();
          timelineDayScrollerFView.modifier.setTransform(Transform.scale(3, 3, 3), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineDayScrollerFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        }
      });
    };
    Template.timelineDayScroller.helpers({
      timelineDayStyles: function() {
        var currentDay, data, instance;
        currentDay = Session.get('currentDay');
        instance = Template.instance();
        data = instance.data;
        if (currentDay === data.index) {
          return {
            backgroundColor: 'green',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '12px',
            textAlign: 'center'
          };
        } else {
          return {
            backgroundColor: 'aqua',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '12px',
            textAlign: 'center'
          };
        }
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
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentDay', data.index);
      });

      /*@autorun((computation)->
      				currentDay = Session.get('currentDay')
      				 *Get the Template instance
      				instance = Template.instance()
      				data = instance.data
      				if currentDay is data.index
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(-20, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      				else
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(0, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      			)
       */
    };
    Template.timelineDay.helpers({
      day: function() {
        return this;
      }
    });
    Template.timelineMonthScroller.rendered = function() {
      var scrollView, timelineMonthScrollerFView;
      timelineMonthScrollerFView = FView.byId('timelineMonthScroller');
      log('timelineMonthScrollerFView', timelineMonthScrollerFView);
      scrollView = timelineMonthScrollerFView.view._eventInput;
      window.timelineMonthScroller = timelineMonthScrollerFView.view;
      window.timelineMonthSequence = window.timelineMonthScroller._node;
      window.timelineMonthSequence._.loop = true;

      /*scrollView.on('start', (e) ->
      				 *log 'STARTING!!!!!!',this
      			)
      			scrollView.on('update', (e) ->
      				 *log 'UPDATING!!!!',this
      			)
      			scrollView.on('end', (e) ->
      				 *log 'ENDING!!!!!!!',this, this._cachedIndex
      			)
       */
      return this.autorun(function(computation) {
        var timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive === true) {
          timelineMonthScrollerFView.modifier.halt();
          timelineMonthScrollerFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineMonthScrollerFView.modifier.setOpacity(.6, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        } else {
          timelineMonthScrollerFView.modifier.halt();
          timelineMonthScrollerFView.modifier.setTransform(Transform.scale(3, 3, 3), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineMonthScrollerFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        }
      });
    };
    Template.timelineMonthScroller.helpers({
      timelineMonthStyles: function() {
        var currentMonth, data, instance;
        currentMonth = Session.get('currentMonth');
        instance = Template.instance();
        data = instance.data;
        if (currentMonth === data.index) {
          return {
            backgroundColor: 'brown',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '14px',
            textAlign: 'center'
          };
        } else {
          return {
            backgroundColor: 'purple',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '14px',
            textAlign: 'center'
          };
        }
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
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentMonth', data.index);
      });

      /*@autorun((computation)->
      				currentMonth = Session.get('currentMonth')
      				 *Get the Template instance
      				instance = Template.instance()
      				data = instance.data
      				if currentMonth is data.index
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(-20, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      				else
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(0, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      			)
       */
    };
    Template.timelineMonth.helpers({
      month: function() {
        return this;
      }
    });
    Template.timelineYearScroller.rendered = function() {
      var scrollView, timelineYearScrollerFView;
      timelineYearScrollerFView = FView.byId('timelineYearScroller');
      scrollView = timelineYearScrollerFView.view._eventInput;
      window.timelineYearScroller = timelineYearScrollerFView.view;
      window.timelineYearSequence = window.timelineYearScroller._node;
      window.timelineYearSequence._.loop = true;

      /*scrollView.on('start', (e) ->
      				 *log 'STARTING!!!!!!',this
      			)
      			scrollView.on('update', (e) ->
      				 *log 'UPDATING!!!!',this
      			)
      			scrollView.on('end', (e) ->
      				 *log 'ENDING!!!!!!!',this, this._cachedIndex
      			)
       */
      return this.autorun(function(computation) {
        var timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive === true) {
          timelineYearScrollerFView.modifier.halt();
          timelineYearScrollerFView.modifier.setTransform(Transform.scale(1, 1, 1), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineYearScrollerFView.modifier.setOpacity(.6, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        } else {
          timelineYearScrollerFView.modifier.halt();
          timelineYearScrollerFView.modifier.setTransform(Transform.scale(3, 3, 3), {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
          return timelineYearScrollerFView.modifier.setOpacity(0, {
            method: 'spring',
            period: 500,
            dampingRatio: 0.5
          });
        }
      });
    };
    Template.timelineYearScroller.helpers({
      timelineYearStyles: function() {
        var currentYear, data, instance;
        currentYear = Session.get('currentYear');
        instance = Template.instance();
        data = instance.data;
        if (currentYear === data.index) {
          return {
            backgroundColor: 'gray',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '36px',
            textAlign: 'center'
          };
        } else {
          return {
            backgroundColor: 'orange',
            backgroundColor: 'transparent',
            color: '#ffffff',
            fontFamily: 'ziamimi-light',
            textTransform: 'uppercase',
            fontSize: '36px',
            textAlign: 'center'
          };
        }
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
      return target.on('click', function() {
        log('TARGET CLICKED', fview, target);
        return Session.set('currentYear', data.index);
      });

      /*@autorun((computation)->
      				currentYear = Session.get('currentYear')
      				 *Get the Template instance
      				instance = Template.instance()
      				data = instance.data
      				if currentYear is data.index
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(-20, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      				else
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.translate(0, 0),
      						method: 'spring'
      						period: 1000
      						dampingRatio: 0.3
      			)
       */
    };
    Template.timelineYear.helpers({
      year: function() {
        return this;
      }
    });
    Template.timelineMoment.rendered = function() {
      var fview, panTransition, target, timelineMomentBackground, zoomTransition;
      fview = FView.from(this);
      timelineMomentBackground = fview.children[0];
      target = fview.surface || fview.view || fview.view._eventInput;
      zoomTransition = {
        duration: 500,
        curve: Easing.inOutSine
      };
      panTransition = {
        duration: 500,
        curving: Easing.inOutSine
      };
      target.on('mouseover', function(e) {
        timelineMomentBackground.modifier.halt();
        return timelineMomentBackground.modifier.setTransform(Transform.scale(1.5, 1.5, 1), zoomTransition);
      });

      /*target.on('mousemove', (e) ->
      				 *Center the image to where the mouse cursor currently is
      				timelineMomentBackgroundWidth = 320
      				timelineMomentBackgroundHeight = 180
      				destinationX = 1 - e.offsetX/timelineMomentBackgroundWidth
      				destinationY = 1 - e.offsetY/timelineMomentBackgroundHeight
      				timelineMomentBackground.modifier.setOrigin [destinationX,destinationY]
      				timelineMomentBackground.modifier.setAlign [destinationX,destinationY]
      			)
       */
      target.on('mouseout', function(e) {
        timelineMomentBackground.modifier.halt();
        return timelineMomentBackground.modifier.setTransform(Transform.scale(1, 1, 1), zoomTransition);
      });
      return target.on('click', function() {
        log('TIMELINE MOMENT CLICKED', fview, target);
        Session.set('timelineActive', false);
        return Session.set('viewingArchivedMoment', true);
      });

      /*@autorun((computation)->
      				timelineActive = Session.get('timelineActive')
      				if timelineActive is true
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.scale(1,1,1),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      				else
      					fview.modifier.halt()
      					fview.modifier.setTransform Transform.scale(0,0,0),
      						method: 'spring'
      						period: 500
      						dampingRatio: 0.5
      			)
       */
    };
    return Template.timelineMoment.helpers({
      timelineMomentImageStyles: function() {
        var styles, timelineActive;
        timelineActive = Session.get('timelineActive');
        if (timelineActive) {
          return styles = {
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(255,255,255,1)',
            backgroundImage: 'url(http://placekitten.com/g/320/180)',
            pointerEvents: 'auto'
          };
        } else {
          return styles = {
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(255,255,255,1)',
            backgroundImage: 'url(http://placekitten.com/g/320/180)',
            pointerEvents: 'none'
          };
        }
      },
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
      log('ARCHIVE!!!!', archive);
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
    getMoment: function(archiveId) {
      var archive;
      log('Server getMoment called!', archiveId);
      archive = openTokClient.getArchive(archiveId);
      log('RETRIEVED ARCHIVE', archive);
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
    var epoch, now, openTokOptions, questionsArray;
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
    log('Get archives');
    questionsArray = [
      {
        question: 'What is the most important thing that happened to you today?',
        number: 0
      }, {
        question: '',
        number: 1
      }, {
        question: '',
        number: 2
      }, {
        question: '',
        number: 3
      }, {
        question: '',
        number: 4
      }, {
        question: '',
        number: 5
      }, {
        question: '',
        number: 6
      }, {
        question: '',
        number: 7
      }, {
        question: '',
        number: 8
      }, {
        question: '',
        number: 9
      }, {
        question: '',
        number: 10
      }, {
        question: '',
        number: 11
      }, {
        question: '',
        number: 12
      }, {
        question: '',
        number: 13
      }, {
        question: '',
        number: 14
      }, {
        question: '',
        number: 15
      }, {
        question: '',
        number: 16
      }, {
        question: '',
        number: 17
      }, {
        question: '',
        number: 18
      }, {
        question: '',
        number: 19
      }, {
        question: '',
        number: 20
      }, {
        question: '',
        number: 21
      }, {
        question: '',
        number: 22
      }, {
        question: '',
        number: 23
      }, {
        question: '',
        number: 24
      }, {
        question: '',
        number: 25
      }, {
        question: '',
        number: 26
      }, {
        question: '',
        number: 27
      }, {
        question: '',
        number: 28
      }, {
        question: '',
        number: 29
      }, {
        question: '',
        number: 30
      }, {
        question: '',
        number: 31
      }, {
        question: '',
        number: 32
      }, {
        question: '',
        number: 33
      }, {
        question: '',
        number: 34
      }, {
        question: '',
        number: 35
      }, {
        question: '',
        number: 36
      }, {
        question: '',
        number: 37
      }, {
        question: '',
        number: 38
      }, {
        question: '',
        number: 39
      }, {
        question: '',
        number: 40
      }, {
        question: '',
        number: 41
      }, {
        question: '',
        number: 42
      }, {
        question: '',
        number: 43
      }, {
        question: '',
        number: 44
      }, {
        question: '',
        number: 45
      }, {
        question: '',
        number: 46
      }, {
        question: '',
        number: 47
      }, {
        question: '',
        number: 48
      }, {
        question: '',
        number: 49
      }, {
        question: '',
        number: 50
      }, {
        question: '',
        number: 51
      }, {
        question: '',
        number: 52
      }, {
        question: '',
        number: 53
      }, {
        question: '',
        number: 54
      }, {
        question: '',
        number: 55
      }, {
        question: '',
        number: 56
      }, {
        question: '',
        number: 57
      }, {
        question: '',
        number: 58
      }, {
        question: '',
        number: 59
      }, {
        question: '',
        number: 60
      }, {
        question: '',
        number: 61
      }, {
        question: '',
        number: 62
      }, {
        question: '',
        number: 63
      }, {
        question: '',
        number: 64
      }, {
        question: '',
        number: 65
      }, {
        question: '',
        number: 66
      }, {
        question: '',
        number: 67
      }, {
        question: '',
        number: 68
      }, {
        question: '',
        number: 69
      }, {
        question: '',
        number: 70
      }, {
        question: '',
        number: 71
      }, {
        question: '',
        number: 72
      }, {
        question: '',
        number: 73
      }, {
        question: '',
        number: 74
      }, {
        question: '',
        number: 75
      }, {
        question: '',
        number: 76
      }, {
        question: '',
        number: 77
      }, {
        question: '',
        number: 78
      }, {
        question: '',
        number: 79
      }, {
        question: '',
        number: 80
      }, {
        question: '',
        number: 81
      }, {
        question: '',
        number: 82
      }, {
        question: '',
        number: 83
      }, {
        question: '',
        number: 84
      }, {
        question: '',
        number: 85
      }, {
        question: '',
        number: 86
      }, {
        question: '',
        number: 87
      }, {
        question: '',
        number: 88
      }, {
        question: '',
        number: 89
      }, {
        question: '',
        number: 90
      }, {
        question: '',
        number: 91
      }, {
        question: '',
        number: 92
      }, {
        question: '',
        number: 93
      }, {
        question: '',
        number: 94
      }, {
        question: '',
        number: 95
      }, {
        question: '',
        number: 96
      }, {
        question: '',
        number: 97
      }, {
        question: '',
        number: 98
      }, {
        question: '',
        number: 99
      }, {
        question: '',
        number: 100
      }, {
        question: '',
        number: 101
      }, {
        question: '',
        number: 102
      }, {
        question: '',
        number: 103
      }, {
        question: '',
        number: 104
      }, {
        question: '',
        number: 105
      }, {
        question: '',
        number: 106
      }, {
        question: '',
        number: 107
      }, {
        question: '',
        number: 108
      }, {
        question: '',
        number: 109
      }, {
        question: '',
        number: 110
      }, {
        question: '',
        number: 111
      }, {
        question: '',
        number: 112
      }, {
        question: '',
        number: 113
      }, {
        question: '',
        number: 114
      }, {
        question: '',
        number: 115
      }, {
        question: '',
        number: 116
      }, {
        question: '',
        number: 117
      }, {
        question: '',
        number: 118
      }, {
        question: '',
        number: 119
      }, {
        question: '',
        number: 120
      }, {
        question: '',
        number: 121
      }, {
        question: '',
        number: 122
      }, {
        question: '',
        number: 123
      }, {
        question: '',
        number: 124
      }, {
        question: '',
        number: 125
      }, {
        question: '',
        number: 126
      }, {
        question: '',
        number: 127
      }, {
        question: '',
        number: 128
      }, {
        question: '',
        number: 129
      }, {
        question: '',
        number: 130
      }, {
        question: '',
        number: 131
      }, {
        question: '',
        number: 132
      }, {
        question: '',
        number: 133
      }, {
        question: '',
        number: 134
      }, {
        question: '',
        number: 135
      }, {
        question: '',
        number: 136
      }, {
        question: '',
        number: 137
      }, {
        question: '',
        number: 138
      }, {
        question: '',
        number: 139
      }, {
        question: '',
        number: 140
      }, {
        question: '',
        number: 141
      }, {
        question: '',
        number: 142
      }, {
        question: '',
        number: 143
      }, {
        question: '',
        number: 144
      }, {
        question: '',
        number: 145
      }, {
        question: '',
        number: 146
      }, {
        question: '',
        number: 147
      }, {
        question: '',
        number: 148
      }, {
        question: '',
        number: 149
      }, {
        question: '',
        number: 150
      }, {
        question: '',
        number: 151
      }, {
        question: '',
        number: 152
      }, {
        question: '',
        number: 153
      }, {
        question: '',
        number: 154
      }, {
        question: '',
        number: 155
      }, {
        question: '',
        number: 156
      }, {
        question: '',
        number: 157
      }, {
        question: '',
        number: 158
      }, {
        question: '',
        number: 159
      }, {
        question: '',
        number: 160
      }, {
        question: '',
        number: 161
      }, {
        question: '',
        number: 162
      }, {
        question: '',
        number: 163
      }, {
        question: '',
        number: 164
      }, {
        question: '',
        number: 165
      }, {
        question: '',
        number: 166
      }, {
        question: '',
        number: 167
      }, {
        question: '',
        number: 168
      }, {
        question: '',
        number: 169
      }, {
        question: '',
        number: 170
      }, {
        question: '',
        number: 171
      }, {
        question: '',
        number: 172
      }, {
        question: '',
        number: 173
      }, {
        question: '',
        number: 174
      }, {
        question: '',
        number: 175
      }, {
        question: '',
        number: 176
      }, {
        question: '',
        number: 177
      }, {
        question: '',
        number: 178
      }, {
        question: '',
        number: 179
      }, {
        question: '',
        number: 180
      }, {
        question: '',
        number: 181
      }, {
        question: '',
        number: 182
      }, {
        question: '',
        number: 183
      }, {
        question: '',
        number: 184
      }, {
        question: '',
        number: 185
      }, {
        question: '',
        number: 186
      }, {
        question: '',
        number: 187
      }, {
        question: '',
        number: 188
      }, {
        question: '',
        number: 189
      }, {
        question: '',
        number: 190
      }, {
        question: '',
        number: 191
      }, {
        question: '',
        number: 192
      }, {
        question: '',
        number: 193
      }, {
        question: '',
        number: 194
      }, {
        question: '',
        number: 195
      }, {
        question: '',
        number: 196
      }, {
        question: '',
        number: 197
      }, {
        question: '',
        number: 198
      }, {
        question: '',
        number: 199
      }, {
        question: '',
        number: 200
      }, {
        question: '',
        number: 201
      }, {
        question: '',
        number: 202
      }, {
        question: '',
        number: 203
      }, {
        question: '',
        number: 204
      }, {
        question: '',
        number: 205
      }, {
        question: '',
        number: 206
      }, {
        question: '',
        number: 207
      }, {
        question: '',
        number: 208
      }, {
        question: '',
        number: 209
      }, {
        question: '',
        number: 210
      }, {
        question: '',
        number: 211
      }, {
        question: '',
        number: 212
      }, {
        question: '',
        number: 213
      }, {
        question: '',
        number: 214
      }, {
        question: '',
        number: 215
      }, {
        question: '',
        number: 216
      }, {
        question: '',
        number: 217
      }, {
        question: '',
        number: 218
      }, {
        question: '',
        number: 219
      }, {
        question: '',
        number: 220
      }, {
        question: '',
        number: 221
      }, {
        question: '',
        number: 222
      }, {
        question: '',
        number: 223
      }, {
        question: '',
        number: 224
      }, {
        question: '',
        number: 225
      }, {
        question: '',
        number: 226
      }, {
        question: '',
        number: 227
      }, {
        question: '',
        number: 228
      }, {
        question: '',
        number: 229
      }, {
        question: '',
        number: 230
      }, {
        question: '',
        number: 231
      }, {
        question: '',
        number: 232
      }, {
        question: '',
        number: 233
      }, {
        question: '',
        number: 234
      }, {
        question: '',
        number: 235
      }, {
        question: '',
        number: 236
      }, {
        question: '',
        number: 237
      }, {
        question: '',
        number: 238
      }, {
        question: '',
        number: 239
      }, {
        question: '',
        number: 240
      }, {
        question: '',
        number: 241
      }, {
        question: '',
        number: 242
      }, {
        question: '',
        number: 243
      }, {
        question: '',
        number: 244
      }, {
        question: '',
        number: 245
      }, {
        question: '',
        number: 246
      }, {
        question: '',
        number: 247
      }, {
        question: '',
        number: 248
      }, {
        question: '',
        number: 249
      }, {
        question: '',
        number: 250
      }, {
        question: '',
        number: 251
      }, {
        question: '',
        number: 252
      }, {
        question: '',
        number: 253
      }, {
        question: '',
        number: 254
      }, {
        question: '',
        number: 255
      }, {
        question: '',
        number: 256
      }, {
        question: '',
        number: 257
      }, {
        question: '',
        number: 258
      }, {
        question: '',
        number: 259
      }, {
        question: '',
        number: 260
      }, {
        question: '',
        number: 261
      }, {
        question: '',
        number: 262
      }, {
        question: '',
        number: 263
      }, {
        question: '',
        number: 264
      }, {
        question: '',
        number: 265
      }, {
        question: '',
        number: 266
      }, {
        question: '',
        number: 267
      }, {
        question: '',
        number: 268
      }, {
        question: '',
        number: 269
      }, {
        question: '',
        number: 270
      }, {
        question: '',
        number: 271
      }, {
        question: '',
        number: 272
      }, {
        question: '',
        number: 273
      }, {
        question: '',
        number: 274
      }, {
        question: '',
        number: 275
      }, {
        question: '',
        number: 276
      }, {
        question: '',
        number: 277
      }, {
        question: '',
        number: 278
      }, {
        question: '',
        number: 279
      }, {
        question: '',
        number: 280
      }, {
        question: '',
        number: 281
      }, {
        question: '',
        number: 282
      }, {
        question: '',
        number: 283
      }, {
        question: '',
        number: 284
      }, {
        question: '',
        number: 285
      }, {
        question: '',
        number: 286
      }, {
        question: '',
        number: 287
      }, {
        question: '',
        number: 288
      }, {
        question: '',
        number: 289
      }, {
        question: '',
        number: 290
      }, {
        question: '',
        number: 291
      }, {
        question: '',
        number: 292
      }, {
        question: '',
        number: 293
      }, {
        question: '',
        number: 294
      }, {
        question: '',
        number: 295
      }, {
        question: '',
        number: 296
      }, {
        question: '',
        number: 297
      }, {
        question: '',
        number: 298
      }, {
        question: '',
        number: 299
      }, {
        question: '',
        number: 300
      }, {
        question: '',
        number: 301
      }, {
        question: '',
        number: 302
      }, {
        question: '',
        number: 303
      }, {
        question: '',
        number: 304
      }, {
        question: '',
        number: 305
      }, {
        question: '',
        number: 306
      }, {
        question: '',
        number: 307
      }, {
        question: '',
        number: 308
      }, {
        question: '',
        number: 309
      }, {
        question: '',
        number: 310
      }, {
        question: '',
        number: 311
      }, {
        question: '',
        number: 312
      }, {
        question: '',
        number: 313
      }, {
        question: '',
        number: 314
      }, {
        question: '',
        number: 315
      }, {
        question: '',
        number: 316
      }, {
        question: '',
        number: 317
      }, {
        question: '',
        number: 318
      }, {
        question: '',
        number: 319
      }, {
        question: '',
        number: 320
      }, {
        question: '',
        number: 321
      }, {
        question: '',
        number: 322
      }, {
        question: '',
        number: 323
      }, {
        question: '',
        number: 324
      }, {
        question: '',
        number: 325
      }, {
        question: '',
        number: 326
      }, {
        question: '',
        number: 327
      }, {
        question: '',
        number: 328
      }, {
        question: '',
        number: 329
      }, {
        question: '',
        number: 330
      }, {
        question: '',
        number: 331
      }, {
        question: '',
        number: 332
      }, {
        question: '',
        number: 333
      }, {
        question: '',
        number: 334
      }, {
        question: '',
        number: 335
      }, {
        question: '',
        number: 336
      }, {
        question: '',
        number: 337
      }, {
        question: '',
        number: 338
      }, {
        question: '',
        number: 339
      }, {
        question: '',
        number: 340
      }, {
        question: '',
        number: 341
      }, {
        question: '',
        number: 342
      }, {
        question: '',
        number: 343
      }, {
        question: '',
        number: 344
      }, {
        question: '',
        number: 345
      }, {
        question: '',
        number: 346
      }, {
        question: '',
        number: 347
      }, {
        question: '',
        number: 348
      }, {
        question: '',
        number: 349
      }, {
        question: '',
        number: 350
      }, {
        question: '',
        number: 351
      }, {
        question: '',
        number: 352
      }, {
        question: '',
        number: 353
      }, {
        question: '',
        number: 354
      }, {
        question: '',
        number: 355
      }, {
        question: '',
        number: 356
      }, {
        question: '',
        number: 357
      }, {
        question: '',
        number: 358
      }, {
        question: '',
        number: 359
      }, {
        question: '',
        number: 360
      }, {
        question: '',
        number: 361
      }, {
        question: '',
        number: 362
      }, {
        question: '',
        number: 363
      }, {
        question: '',
        number: 364
      }
    ];
    if (Questions.find().fetch === 0) {
      return log('Questions array is empty!');
    }
  });
}

})();
