Router.configure
	layoutTemplate: 'layout'

Router.map ->
	@route 'about',
		path: '/'

@Publisher = new Mongo.Collection 'publisher'
@Questions = new Mongo.Collection 'questions'

# API Keys
@openTokApiKey = '45020262'

@log = ->
	log.history = log.history or [] # store logs to an array for reference
	log.history.push arguments
	console.log Array::slice.call(arguments)  if @console

if Meteor.isClient
	Meteor.startup ->
		# Create a guest user
		Guests.add()
		Meteor.call('createOpenTokSession', (err,result)->
			if err
				log 'createOpenTokSession err',err
			else
				# Initialize the session
				log 'createOpenTokSession result',result
				@session = OT.initSession result.apiKey, result.session
				log 'session',session

				session.on 'streamCreated', (event) ->
					log 'streamCreated!',event

					session.subscribe event.stream, 'video',
						insertMode: 'append'
					layout()

				# Connect to the session
				session.connect result.token, (err) ->
					if err
						log 'session connect err',err
					else
						log 'Connected to session!'
						layout()
						if session.capabilities.publish is 1
							log 'User is capable of publishing!',session.capabilities
							#Session.set 'canSubscribeToStream', true
							Session.set 'userCanPublish', false
						else
							log 'You are not able to publish a stream'
		)

		# Famous Globals
		@Transform = famous.core.Transform

		# Transitions
		@Transitionable = famous.transitions.Transitionable
		@SpringTransition = famous.transitions.SpringTransition
		@SnapTransition = famous.transitions.SnapTransition

		#Register Transitions
		Transitionable.registerMethod 'spring',SpringTransition
		Transitionable.registerMethod 'snap',SpringTransition

		#Default Session States
		Session.setDefault 'backgroundTranslation', 0
		Session.setDefault 'overlayTranslation', 0
		Session.setDefault 'introTranslation', 0
		Session.setDefault 'momentButtonTranslation', 0
		Session.setDefault 'ppLogoTranslation', -10
		Session.setDefault 'timerTranslation', 300
		Session.setDefault 'questionTranslation', -200
		Session.setDefault 'canSubscribeToStream', false
		Session.setDefault 'userCanPublish', false
		Session.setDefault 'userIsPublishing', false
		Session.setDefault 'timer', 60

		Template.about.helpers
			backgroundStyles: ->
				styles =
					backgroundColor: '#f5f5f5'
					backgroundImage: 'url(img/performers/01.jpg)'
					backgroundRepeat: 'no-repeat'
					backgroundPosition: '50% 50%'
					backgroundSize: 'cover'
			overlayStyles: ->
				styles =
					backgroundColor: 'rgba(0,0,0,0.4)'
			introStyles: ->
				styles =
					#backgroundColor: '#e5e5e5'
					textAlign: 'center'
					color: '#ffffff'
			momentButtonStyles: ->
				styles =
					border: '1px solid #ffffff'
					textAlign: 'center'
					color: '#fff'
					lineHeight: '40px'
			ppLogoStyles: ->
				styles = {}
			timerStyles: ->
				#backgroundColor: '#dddddd'
				textAlign: 'center'
				color: '#ffffff'
			questionStyles: ->
				#backgroundColor: '#666666'
				textAlign: 'center'
				color: '#ffffff'

		Template.background.rendered = ->
			fview = FView.from(this)

			log 'Set video layout!'
			video = this.find '#video'
			log 'video',video
			window.layout = TB.initLayoutContainer(video,
				bigFixedRatio: false
			).layout
			log 'layout',layout

			# Recalculate layout on resize
			window.onresize = ->
				clearTimeout resizeTimeout
				resizeTimeout = setTimeout(->
					log 'Layouting'
					layout()
				, 20)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'backgroundTranslation', 0 then Session.set 'backgroundTranslation', 300 else Session.set 'backgroundTranslation', 0

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get 'backgroundTranslation'),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.overlay.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'overlayTranslation', 0 then Session.set 'overlayTranslation', 500 else Session.set 'overlayTranslation', 0

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get 'overlayTranslation'),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.intro.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'introTranslation', 0 then Session.set 'introTranslation', 150 else Session.set 'introTranslation', 0

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get 'introTranslation'),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.momentButton.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				#Set up the session connection
				if Session.equals 'canSubscribeToStream', true and Session.equals 'userCanPublish', true and Session.equals 'userIsPublishing',false
					log 'User can publish!'
					publisher = OT.initPublisher('video',
						insertMode: 'append'
						resolution: '1280x720'
					)
					layout()

					publisher.on
						streamCreated: (e) ->
							log 'publishStream created!',e
							Session.set 'userIsPublishing',true

							#Start the timer!
							clock = 60
							timeLeft = ->
								if clock > 0
									clock--
									Session.set 'timer', clock
									console.log clock
								else
									console.log "That's All Folks"
									#session.unpublish publisher
									Meteor.clearInterval interval

							interval = Meteor.setInterval(timeLeft, 1000)
						streamDestroyed: (e) ->
							log 'publishStream destroyed!',e
							Session.set 'userIsPublishing',false
							Session.set 'timer', 60
					session.publish publisher
				else
					log 'Nope!'

				if Session.equals 'momentButtonTranslation', 0 then Session.set 'momentButtonTranslation', 200 else Session.set 'momentButtonTranslation', 0

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get 'momentButtonTranslation'),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.ppLogo.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'ppLogoTranslation', -10 then Session.set 'ppLogoTranslation', -100 else Session.set 'ppLogoTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(Session.get('ppLogoTranslation'), -10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timer.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'timerTranslation', 300 then Session.set 'timerTranslation', 100 else Session.set 'timerTranslation', 300

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get('timerTranslation')),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timer.helpers
			timer: ->
				Session.get 'timer'

		Template.question.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'questionTranslation', -200 then Session.set 'questionTranslation', 0 else Session.set 'questionTranslation', -200

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get('questionTranslation')),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

if Meteor.isServer
	Meteor.methods
		createOpenTokSession: () ->
			log 'Meteor.userId()',Meteor.userId()

			openTokSessionOptions =
				role: 'publisher'
				data: 'userId:' + Meteor.userId()
				expireTime: Math.round(new Date().getTime() / 1000) + 86400

			token = openTokClient.generateToken openTokSession, openTokSessionOptions
			log 'token',token
			payload =
				apiKey: openTokApiKey
				session: openTokSession
				token: token
			payload

	Meteor.startup ->
		log 'Server!'

		# Wipe all guest accounts that are more than 24 hours old, this way people can say something once a day
		Accounts.removeOldGuests();

		# Change user tokens and active user every minute
		Meteor.setInterval ->
			log 'Change User!'
		, 60000

		# Initialize OpenTokClient
		@openTokSecret = 'ce949e452e117eef38d2661e9e1824f8faddff40'
		@openTokClient = new OpenTokClient openTokApiKey, openTokSecret
		log 'openTokClient',openTokClient

		log 'createOpenTokSession!'
		openTokOptions =
			mediaMode: 'routed'
			location: '127.0.0.1'

		@openTokSession = openTokClient.createSession openTokOptions
		log 'openTokSession',openTokSession
