Router.configure
	layoutTemplate: 'layout'

Router.map ->
	@route 'about',
		path: '/'

@log = ->
	log.history = log.history or [] # store logs to an array for reference
	log.history.push arguments
	console.log Array::slice.call(arguments)  if @console

if Meteor.isClient
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
	Session.setDefault 'canSubscribeToStream', false
	Session.setDefault 'userCanPublish', false
	Session.setDefault 'userIsPublishing', false

	# API Keys
	# Initialize API key, session, and token...
	# Think of a session as a room, and a token as the key to get in to the room
	# Sessions and tokens are generated on your server and passed down to the client
	apiKey = "45013152"
	sessionId = "1_MX40NTAxMzE1Mn5-MTQxMjI4OTUxMDkyMX40aE5YQ0dIK0dqbVVrazJ0dTZJd2poWW5-fg"
	token = "T1==cGFydG5lcl9pZD00NTAxMzE1MiZzaWc9ZWJmOTkzOTVhNmVlOTllM2RmZmI0NmRiM2E4NTY1YTMyYzQwOTY2ODpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UQXhNekUxTW41LU1UUXhNakk0T1RVeE1Ea3lNWDQwYUU1WVEwZElLMGRxYlZWcmF6SjBkVFpKZDJwb1dXNS1mZyZjcmVhdGVfdGltZT0xNDEyMjg5NjM4Jm5vbmNlPTAuODYzNzk0OTgxODc4ODAwOQ=="

	# Initialize session, set up event listeners, and connect
	session = OT.initSession(apiKey, sessionId)
	log 'session',session
	log 'token',token
	session.on "streamCreated", (event) ->
		log 'streamCreated!',event
		session.subscribe event.stream

	#Connect to the session
	session.connect token, (error) ->
		if error
			log 'error',error
		else
			log 'Connected to session!'
			if session.capabilities.publish is 1
				log 'User is capable of publishing!',session.capabilities
				Session.set 'canSubscribeToStream', true
			else
				log 'You are not able to publish a stream'

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
				backgroundColor: '#e5e5e5'
				textAlign: 'center'
		momentButtonStyles: ->
			styles =
				backgroundColor: '#333333'
				textAlign: 'center'
				color: '#ffffff'
		ppLogoStyles: ->
			styles = {}

	Template.background.rendered = ->
		fview = FView.from(this)

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
				publisher = OT.initPublisher()
				publisher.on
					streamCreated: (e) ->
						log 'publishStream created!',e
						Session.set 'userIsPublishing',true
					streamDestroyed: (e) ->
						log 'publishStream destroyed!',e
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

if Meteor.isServer
	Meteor.startup ->
		log 'Server!'
