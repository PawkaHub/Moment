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

	Template.background.rendered = ->
		fview = FView.from(this)

		target = fview.surface || fview.view._eventInput
		target.on('click', () ->
			log 'TARGET CLICKED',fview

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
			log 'TARGET CLICKED',fview

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
			log 'TARGET CLICKED',fview

			if Session.equals 'introTranslation', 0 then Session.set 'introTranslation', 400 else Session.set 'introTranslation', 0

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
			log 'TARGET CLICKED',fview

			if Session.equals 'momentButtonTranslation', 0 then Session.set 'momentButtonTranslation', 200 else Session.set 'momentButtonTranslation', 0

			fview.modifier.halt()
			fview.modifier.setTransform Transform.translate(0, Session.get 'momentButtonTranslation'),
				method: 'spring'
				period: 1000
				dampingRatio: 0.3
		)

if Meteor.isServer
	Meteor.startup ->
		log 'Server!'
