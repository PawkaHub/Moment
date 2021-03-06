Router.configure
	layoutTemplate: 'layout'

Router.map ->
	@route 'about',
		path: '/'

@Publisher = new Mongo.Collection 'publisher'
@Questions = new Mongo.Collection 'questions'
@Moments = new Mongo.Collection 'moments'
@Archives = new Mongo.Collection 'archives'
@Seconds = new Mongo.Collection 'seconds'

# API Keys
@openTokApiKey = '45020262'
@momentTimer = 100

@log = ->
	log.history = log.history or [] # store logs to an array for reference
	log.history.push arguments
	console.log Array::slice.call(arguments)  if @console

if Meteor.isClient
	# Create Famous Views
	FView.ready ->
		FView.registerView 'InputSurface',famous.surfaces.InputSurface,
			famousCreatedPost: ->
				log 'INPUT SURFACE!!!!!!!1111'
		    	# `this` or `@` is the fview for this instance
				@pipeChildrenTo = if @parent.pipeChildrenTo? then [ @view, @parent.pipeChildrenTo[0] ] else [ @view ]

		FView.registerView 'ImageSurface',famous.surfaces.ImageSurface,
			famousCreatedPost: ->
		    	# `this` or `@` is the fview for this instance
				@pipeChildrenTo = if @parent.pipeChildrenTo? then [ @view, @parent.pipeChildrenTo[0] ] else [ @view ]

		FView.registerView 'CanvasSurface',famous.surfaces.CanvasSurface,
			famousCreatedPost: ->
		    	# `this` or `@` is the fview for this instance
				@pipeChildrenTo = if @parent.pipeChildrenTo? then [ @view, @parent.pipeChildrenTo[0] ] else [ @view ]
				log 'CONTEXT?!'

		FView.registerView 'GridLayout',famous.views.GridLayout,
			famousCreatedPost: ->
				# `this` or `@` is the fview for this instance
				@pipeChildrenTo = if @parent.pipeChildrenTo? then [ @view, @parent.pipeChildrenTo[0] ] else [ @view ]

	Meteor.startup ->
		#Set famous logging to be more calm
		Logger.setLevel 'famous-views', 'info'

		# Create a guest user
		Guests.add()
		Meteor.call('createOpenTokSession', (err,result)->
			if err
				log 'createOpenTokSession err',err
			else
				# Initialize the session
				#log 'createOpenTokSession result',result
				@session = OT.initSession result.apiKey, result.session
				#log 'session',session

				session.on 'streamCreated', (event) ->
					log 'Another streamCreated!',event
					if window.publisher
						session.unpublish window.publisher
						Session.set 'userIsPublishing',false
						window.scene.remove window.videoCube
						window.videoCube = null
						window.video = null

					window.subscriber = session.subscribe event.stream, 'video',
						insertMode: 'replace'
						resolution: '1280x720'
					, (err) ->
						if err
							log 'Subscribe err',err
							Session.set 'subscribed',false
							window.scene.remove window.videoCube
							window.videoCube = null
							window.video = null
						else
							log 'Subscribed to stream!'
							Session.set 'subscribed',true
							window.video = document.querySelector('video')

				session.on 'streamDestroyed', (event) ->
					#event.preventDefault()
					log 'Another streamDestroyed!',event
					Session.set 'subscribed',false
					window.scene.remove window.videoCube
					window.videoCube = null
					window.video = null

				# Connect to the session
				session.connect result.token, (err) ->
					if err
						log 'session connect err',err
					else
						#log 'Connected to session!'
						if session.capabilities.publish is 1
							#log 'User is capable of publishing!',session.capabilities
						else
							log 'You are not able to publish a stream'
		)

		# Famous Globals
		@Transform = famous.core.Transform
		@Engine = famous.core.Engine

		# Transitions
		@Transitionable = famous.transitions.Transitionable
		@SpringTransition = famous.transitions.SpringTransition
		@SnapTransition = famous.transitions.SnapTransition
		@Easing = famous.transitions.Easing
		@Timer = famous.utilities.Timer

		# Register Transitions
		Transitionable.registerMethod 'spring',SpringTransition
		Transitionable.registerMethod 'snap',SpringTransition

		#Default Session States
		Session.setDefault 'ppLogoTranslation', -20
		Session.setDefault 'timelineActive',false
		Session.setDefault 'canSubscribeToStream', false
		Session.setDefault 'userCanPublish', false
		Session.setDefault 'userIsPublishing', false
		Session.setDefault 'subscribed',false
		Session.setDefault 'timer', momentTimer
		Session.setDefault 'now', TimeSync.serverTime()
		Session.setDefault 'easterEggActive',false
		Session.setDefault 'loaded',false

		#Filters
		Session.setDefault 'blur', 100
		Session.setDefault 'grayscale', false
		Session.setDefault 'bloom', 1

		# Parallax Scrolling Capabilities
		###Engine.on('prerender', () ->
			if window.timelineMinuteScroller
				parallaxEffect = 2.0
				bgPos = -window.timelineMinuteScroller.getPosition() / parallaxEffect
				#log 'bgPos',bgPos
				fview = FView.byId('timelineMinuteDisplay' + (window.timelineMinuteScroller.getCurrentIndex() + 1))
				#if fview
					#fview.modifier.setTransform Transform.translate(0, bgPos)
		)###
		# Detect loading to initialize Canvas
		Engine.on('postrender', () ->
			if window.canvas and not window.context
				log 'MAKE CANVAS!!!!'
				size = FView.mainCtx.getSize()
				canvasSize = [size[0] * 2, size[1] * 2];
				window.canvas.setSize(size, canvasSize);

				# Get the context
				window.context = window.canvas.getContext('webgl')

				# Create the WebGL renderer
				window.renderer = new THREE.WebGLRenderer(
					canvas: window.canvas._currentTarget
					antialias: true
					devicePixelRatio: window.devicePixelRatio
					context: window.context
				)

				# Create the WebGL Scene
				window.scene = new THREE.Scene()

				# Create the Camera
				VIEW_ANGLE = 45
				SCREEN_WIDTH = window.innerWidth
				SCREEN_HEIGHT = window.innerHeight
				NEAR = 0.01
				FAR = 100
				window.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR)
				window.camera.position.set 0, 0, 3
				window.camera.lookAt window.scene.position

				# Create a Composer for Post Processing
				window.composer = new THREE.EffectComposer window.renderer

				# Post Processing
				renderModel = new THREE.RenderPass window.scene, window.camera

				# Bloom Effect
				effectBloom = new THREE.BloomPass Session.get 'bloom'
				effectCopy = new THREE.ShaderPass THREE.CopyShader

				# Render effects to screen
				#effectCopy.renderToScreen = true

				# Blur Effect
				effectHorizBlur = new THREE.ShaderPass THREE.HorizontalBlurShader
				effectVertiBlur = new THREE.ShaderPass THREE.VerticalBlurShader

				# Set Blur Strength
				effectHorizBlur.uniforms[ "h" ].value = 0 / window.innerWidth
				effectVertiBlur.uniforms[ "v" ].value = 0 / window.innerHeight

				# Render to screen
				#effectHorizBlur.renderToScreen = true
				effectVertiBlur.renderToScreen = true

				# Add Post Process Effects
				window.composer.addPass renderModel
				#window.composer.addPass effectBloom
				window.composer.addPass effectHorizBlur
				window.composer.addPass effectVertiBlur
				#window.composer.addPass effectCopy

				# Create an axis to visualize position
				axisHelper = new THREE.AxisHelper 1
				scene.add axisHelper

				# Add a soft light
				light = new THREE.AmbientLight("rgb(255,255,255)") # soft white light
				window.scene.add light

				# Handle Window Resizing
				THREEx.WindowResize window.composer, window.camera

				# Add debug controls for mouse movement
				#window.controls = new THREE.OrbitControls window.camera, window.renderer.domElement
			userIsPublishing = Session.get 'userIsPublishing'
			subscribed = Session.get 'subscribed'
			if (window.publisher and userIsPublishing and window.video and not window.videoCube) or (window.subscriber and subscribed and window.video and not window.videoCube)

				log 'Running!',window.publisher,Session.get('userIsPublishing'), window.videoCube, window.subscriber, Session.get('subscribed'), window.videoCube

				#video = document.querySelector('video')

				#Pipe the video in
				window.videoTexture = new THREE.Texture(window.video)
				window.videoTexture.wrapS = THREE.RepeatWrapping
				window.videoTexture.wrapT = THREE.RepeatWrapping
				window.videoTexture.repeat.set 1, 1

				videoGeometry = new THREE.BoxGeometry(3, 3, 3)
				videoMaterial = new THREE.MeshLambertMaterial(
				  map: window.videoTexture
				  shading: THREE.FlatShading
				)
				window.videoCube = new THREE.Mesh(videoGeometry, videoMaterial)
				window.scene.add window.videoCube
				window.camera.position.z = 3
			# Render to WebGL if the renderer is initialized - This starts the main render loop for the WebGL
			if window.renderer and window.scene and window.camera

				#Render the video if it exists
				if window.videoCube
					# Rotate the video feed like a boss
					#window.videoCube.rotation.x += 0.01
					#window.videoCube.rotation.y += 0.01
					window.videoTexture.needsUpdate = true

				# Easter Egg Model
				if window.easterEggModel
					window.easterEggModel.rotation.y += 0.001

				if window.controls
					#Update the controls position
					window.controls.update()

				# Render PostProcessing Effects if they exist
				if window.composer
					window.renderer.clear()
					window.composer.render()
				else
					# Render the scene normally
					window.renderer.render window.scene, window.camera
		)

		#Global Template Helpers
		Template.registerHelper 'minutes', ->
			#Create all the minutes in a day
			epoch = TimeSync.serverTime()
			minutesInADay = 3
			minutes = []
			while minutes.length < minutesInADay
				momentMinute = moment(epoch)
				#Create a minute object that stores the index for scrolling, as well as the moment minute.
				minute =
					index: minutes.length
					momentMinute: momentMinute
				#Overflow the minutes count based on the length, moment will smartly handle formatting it properly
				minute.momentMinute.set('minute',minutes.length)
				#Pass in the minute formatted to display as 10:00 AM, etc.
				minute.formattedMinute = minute.momentMinute.format('h:mm A')
				minutes.push(minute)
			#log 'minutes',minutes
			minutes
		Template.registerHelper 'days', ->
			epoch = TimeSync.serverTime()
			day = moment(epoch)
			currentDay = day.day()
			daysInAMonth = 100
			days = []
			while days.length < daysInAMonth
				#log 'currentDay',currentDay
				momentDay = moment(epoch)
				day =
					index: days.length
					momentDay: momentDay
				day.momentDay.set('day',currentDay--)
				#log 'day',day
				day.formattedDay = day.momentDay.format('dddd')
				days.push(day)
			days
		Template.registerHelper 'months', ->
			epoch = TimeSync.serverTime()
			month = moment(epoch)
			currentMonth = month.month()
			monthsInAYear = 100
			months = []
			while months.length < monthsInAYear
				momentMonth = moment(epoch)
				month =
					index: months.length
					momentMonth: momentMonth
				#log 'currentMonth',currentMonth
				month.momentMonth.set('month',currentMonth--)
				#log 'month',month
				month.formattedMonth = month.momentMonth.format('MMMM')
				months.push(month)
			#log 'months',months
			months
		Template.registerHelper 'years', ->
			epoch = TimeSync.serverTime()
			year = moment(epoch)
			currentYear = year.year()
			years = []
			yearsSinceEpoch = 100
			while years.length < yearsSinceEpoch
				#log 'currentYear',currentYear
				momentYear = moment(epoch)
				year =
					index: years.length
					momentYear: momentYear
				year.momentYear.set('year',currentYear--)
				#log 'year',year
				year.formattedYear = year.momentYear.format('YYYY')
				years.push(year)
			#log 'years',years
			years
		Template.registerHelper 'timelineMoments', ->
			instance = Template.instance()
			data = instance.data
			#moments = [1,2,3,4,5,6,7]
			#moments
			Moments.find()
		Template.registerHelper 'currentEpoch', ->
			TimeSync.serverTime()

		Template.about.helpers
			backgroundStyles: ->
				styles =
					backgroundColor: '#000'
			overlayStyles: ->
				styles =
					#backgroundColor: 'rgba(0,0,0,0.4)'
					backgroundImage: 'radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%), radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%)'
					backgroundPosition: '0 0, 2px 2px'
					backgroundSize: '4px 4px, 4px 4px, 100% 100%'
					backgroundRepeat: 'repeat, repeat, no-repeat'
					pointerEvents: 'none'
			introStyles: ->
				#backgroundColor: '#e5e5e5'
				textAlign: 'center'
				fontSize: '36px'
				fontFamily: 'ziamimi-bold'
				color: '#ffffff'
			momentButtonStyles: ->
				border: '1px solid #ffffff'
				textAlign: 'center'
				fontSize: '14px'
				fontFamily: 'ziamimi-light'
				color: '#ffffff'
				lineHeight: '44px'
				cursor: 'pointer'
			ppLogoStyles: ->
				cursor: 'pointer'
			timerStyles: ->
				#backgroundColor: '#dddddd'
				textAlign: 'center'
				fontSize: '72px'
				fontFamily: 'ziamimi-light'
				color: '#ffffff'
			questionStyles: ->
				#backgroundColor: '#666666'
				textAlign: 'center'
				fontSize: '24px'
				fontFamily: 'ziamimi-light'
				color: '#ffffff'
			timelineToggleStyles: ->
				backgroundColor: '#ffffff'
				borderRadius: '50%'
				textAlign: 'center'
				color: '#ffffff'
				zIndex: '999'
				cursor: 'pointer'
			timelineOverlayStyles: ->
				backgroundColor: '#000000'
				pointerEvents: 'none'

		#Template.views_Scrollview.rendered = ->
		#	log 'SCROLLVIEW RENDERED'

		Template.about.rendered = ->
			fview = FView.from(this)
			log 'ABOUT FVIEW',fview
			window.mainContext = fview
			target = fview.surface || fview.view._eventInput
			#log 'ABOUT TARGET',target

			target.on('start', () ->
				log 'STARTING!!!!!!'
			)
			target.on('update', () ->
				log 'UPDATING!!!!'
			)
			target.on('end', () ->
				log 'ENDING!!!!!!!'
			)

		Template.background.rendered = ->
			Engine.defer ->
				backgroundFView = FView.byId('background')
				log 'backgroundFView',backgroundFView
				window.canvas = backgroundFView.view
				#Get around a weird rendering issue
				#Session.set 'loaded',true

				#Initialize the Konami Code easter egg ;)
				easterEgg = new Konami () ->
					log 'Trigger Model Viewer!'
					easterEggActive = Session.get 'easterEggActive'

					if !easterEggActive

						Session.set 'easterEggActive',true

						# Add basic three point lighting
						threePointLighting = new THREEx.ThreePointsLighting()
						window.scene.add threePointLighting

						# Create a universal loader
						loader = new THREEx.UniversalLoader()

						# Model Assets
						YoungLink = ['models/YoungLink/YoungLinkEquipped.obj','models/YoungLink/YoungLinkEquipped.mtl']
						WindWakerLink = ['models/WindWakerLink/link.obj','models/WindWakerLink/link.mtl']
						SkywardSwordLinkDAE = 'models/SkywardSwordLink/Link_2.dae'
						SkywardSwordLink = ['models/SkywardSwordLink/Link.obj','models/SkywardSwordLink/Link.mtl']
						TwilightPrincessLinkDAE = 'models/TwilightPrincessLink/Link.dae'
						TwilightPrincessLink = ['models/TwilightPrincessLink/Link.obj','models/TwilightPrincessLink/Link.mtl']

						# Load the Model
						loader.load YoungLink, (object) ->
							log 'MODEL LOADED!',object

							# Normalize the scale
							boundingBox = new THREE.Box3().setFromObject(object)
							window.link = boundingBox
							log 'boundingBox!',boundingBox
							size = boundingBox.size()
							log 'size',size
							scaleScalar = Math.max(size.x, Math.max(size.y, size.z))
							log 'scaleScalar',scaleScalar
							object.scale.divideScalar scaleScalar

							# Normalize the position
							boundingBox = new THREE.Box3().setFromObject(object)
							object.position.copy boundingBox.center().negate()
							window.easterEggModel = object
							scene.add object

		Template.overlay.rendered = ->
			fview = FView.from(this)

			overlayFView = FView.byId('overlay')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'OVERLAY CLICKED',fview, target
			)

		Template.timelineOverlay.rendered = ->
			Template.overlay.rendered = ->
			fview = FView.from(this)

			timelineOverlayFView = FView.byId('timelineOverlay')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TIMELINE OVERLAY CLICKED',fview, target
			)
			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				if timelineActive is true
					timelineOverlayFView.modifier.halt()
					timelineOverlayFView.modifier.setOpacity .8,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					timelineOverlayFView.modifier.halt()
					timelineOverlayFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		Template.intro.rendered = ->
			fview = FView.from(this)

			introFView = FView.byId('intro')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'INTRO CLICKED',fview, target
			)
			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				userIsPublishing = Session.get 'userIsPublishing'
				if timelineActive is true or userIsPublishing is true
					introFView.modifier.halt()
					introFView.modifier.setTransform Transform.scale(0,0,0),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					introFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					introFView.modifier.halt()
					introFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					introFView.modifier.setOpacity 1,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		Template.momentButton.rendered = ->
			fview = FView.from(this)

			momentButtonFView = FView.byId('momentButton')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'MOMENT BUTTON CLICKED',fview, target

				#Set up the session connection
				if session.capabilities.publish is 1
					log 'User can publish!'
					window.publisher = OT.initPublisher('video',
						insertMode: 'replace'
						width: '1280'
						height: '720'
						resolution: '1280x720'
						audioLevelDisplayMode: 'none'
						buttonDisplayMode: 'off'
						nameDisplayMode: 'off'
					)

					publisher.on
						streamCreated: (event) ->
							log 'publishStream created!',event
							Session.set 'userIsPublishing',true
							window.video = document.querySelector('video')

							Meteor.call('createMoment', (err,result)->
								if err
									log 'createMoment err',err
								else
									log 'createMoment result',result
									#Start the timer once we get a result back from the server and know an archive is going!

									#We should also insert the archive result instance back into the moments/archive collection here.
									#(We create an archive instance here, although perhaps it might be good to either insert it upon
									#archive completion, so that we only insert archives that are a minute long(?) or to ensure we have
									#the right metadata.)
									archive =
										archiveCreatedAt: result.createdAt
										duration: result.duration
										tokboxArchiveId: result.id
										tokboxArchiveName: result.name
										tokboxPartnerId: result.partnerId
										tokboxSessionId: result.sessionId
										archiveSize: result.size
										archiveUpdatedAt: result.updatedAt

									clock = momentTimer
									timeLeft = ->
										if clock > 0
											clock--
											Session.set 'timer',clock
											log clock
											if clock is 0
												log "That's All Folks, let's cancel this clientside session"
												session.unpublish publisher
												Session.set 'userIsPublishing',false
												window.scene.remove window.videoCube
												window.videoCube = null
												window.video = null
												Meteor.clearInterval interval
										else
											log "Uhhh else"
											session.unpublish publisher
											Session.set 'userIsPublishing',false
											window.scene.remove window.videoCube
											window.videoCube = null
											window.video = null
											Meteor.clearInterval interval
									interval = Meteor.setInterval(timeLeft, 1000)
							)
						streamDestroyed: (event) ->
							#event.preventDefault()
							log 'publishStream destroyed!',event
							Session.set 'userIsPublishing',false
							window.scene.remove window.videoCube
							window.videoCube = null
							window.video = null
							Meteor.setTimeout(->
								Session.set 'timer', momentTimer
							,1000)
					if window.subscriber then session.unsubscribe window.subscriber
					session.publish publisher
				else
					log 'Nope!'
			)

			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				userIsPublishing = Session.get 'userIsPublishing'
				if timelineActive is true or userIsPublishing is true
					momentButtonFView.modifier.halt()
					momentButtonFView.modifier.setTransform Transform.scale(0,0,0),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					momentButtonFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					momentButtonFView.modifier.halt()
					momentButtonFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					momentButtonFView.modifier.setOpacity 1,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		Template.ppLogo.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput

			log 'DOM INSERTION',this.$('#ppLogo')
			#Not sure why we have to do this, but remove the path from the element and add it back in so that we get proper resizing for the SVG element.
			ppLogo = this.$('#ppLogo')
			#ppLogo.remove()
			log 'ppLogo still exists!',ppLogo

			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				archiveId = Moments.find().fetch()[0].tokboxArchiveId
				Meteor.call('getMoment', archiveId, (err,result) ->
					log 'Calling getMoment!'
					if err
						log 'getMoment err!',err
					else
						log 'getMoment result!',result
				)

				if Session.equals 'ppLogoTranslation', -20 then Session.set 'ppLogoTranslation', -60 else Session.set 'ppLogoTranslation', -20

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(0, Session.get('ppLogoTranslation')),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timer.rendered = ->
			fview = FView.from(this)

			timerFView = FView.byId('timer')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TIMER CLICKED',fview, target
			)
			@autorun((computation)->
				userIsPublishing = Session.get('userIsPublishing')
				if userIsPublishing is true
					timerFView.modifier.halt()
					timerFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					timerFView.modifier.setOpacity 1,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					timerFView.modifier.halt()
					timerFView.modifier.setTransform Transform.scale(0,0,0),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					timerFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		Template.timer.helpers
			timer: ->
				Session.get 'timer'

		Template.question.rendered = ->
			fview = FView.from(this)

			questionFView = FView.byId('question')

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'QUESTION CLICKED',fview, target
			)
			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				userIsPublishing = Session.get 'userIsPublishing'
				if timelineActive is true or userIsPublishing is true
					questionFView.modifier.halt()
					questionFView.modifier.setTransform Transform.scale(0,0,0),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					questionFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					questionFView.modifier.halt()
					questionFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					questionFView.modifier.setOpacity 1,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		Template.timelineToggle.rendered = ->
			fview = FView.from(this)

			timelineToggleFView = FView.byId('timelineToggle')

			target = fview.surface || fview.view

			zoomTransition =
				duration: 500
				curve: Easing.inOutSine

			target.on('click', () ->
				log 'TIMELINE TOGGLE CLICKED',fview, target
				if Session.equals 'timelineActive', false
					Session.set 'timelineActive',true
				else
					Session.set 'timelineActive',false
			)
			@autorun((computation)->
				userIsPublishing = Session.get 'userIsPublishing'
				if userIsPublishing is true
					timelineToggleFView.modifier.halt()
					timelineToggleFView.modifier.setTransform Transform.scale(0,0,0),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					timelineToggleFView.modifier.setOpacity 0,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
				else
					timelineToggleFView.modifier.halt()
					timelineToggleFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
					timelineToggleFView.modifier.setOpacity .14,
						method: 'spring'
						period: 1000
						dampingRatio: 0.6
			)

		#Timeline Search
		Template.timelineSearchHolder.rendered = ->
			timelineSearchFView = FView.byId('timelineSearch')
			log 'TIMELINESEARCHHOLDER FVIEW',timelineSearchFView
			target = timelineSearchFView.surface || timelineSearchFView.view._eventInput
			log 'TIMELINESEARCHHOLDER TARGET',target
			target.on('keyup', (e) ->
				log 'TIMELINESEARCHHOLDER KEYUP',e
			)
			###@autorun((computation)->
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
			)###

		Template.timelineSearchHolder.helpers
			timelineSearchStyles: ->
				backgroundColor: 'cadetblue'
				backgroundColor: 'transparent'
				padding: '0 10px 0 10px'
				fontSize: '40px'
				color: '#ffffff'
				fontFamily: 'ziamimi-light'
				textTransform: 'uppercase'
				textAlign: 'center'

		Template.timelineSearch.rendered = ->
			fview = FView.from(this)
			log 'TIMELINESEARCH FVIEW',fview
			target = fview.surface || fview.view || fview.view._eventInput
			log 'TIMELINESEARCH TARGET',target
			timelineSearchFView = FView.byId('timelineSearch')
			window.timelineSearch = target
			target.on('keyup', (e) ->
				log 'TIMELINESEARCH KEYUP',e
			)

			###@autorun((computation)->
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
			)###


		#Timeline code
		Session.setDefault 'currentSecond',0
		Session.setDefault 'currentMinute',0
		Session.setDefault 'currentHour',0
		Session.setDefault 'currentDay',0
		Session.setDefault 'currentMonth',0
		Session.setDefault 'currentYear',0

		Session.setDefault 'epoch','2010-01-01 00:00'
		Session.setDefault 'epochSecond',moment(Session.get('epoch')).second()
		Session.setDefault 'epochMinute',moment(Session.get('epoch')).minute()
		Session.setDefault 'epochHour', moment(Session.get('epoch')).hour()
		Session.setDefault 'epochDay', moment(Session.get('epoch')).day()
		Session.setDefault 'epochMonth', moment(Session.get('epoch')).month()
		Session.setDefault 'epochYear', moment(Session.get('epoch')).year()

		Template.timelineMinuteScroller.rendered = ->
			log 'TIMELINEMINUTESSCROLLER RENDERED',this
			#fview = FView.from(this)
			#log 'TIMELINEMINUTESSCROLLER FVIEW',fview
			#target = fview.surface || fview.view._eventInput
			#log 'TIMELINEMINUTESSCROLLER TARGET',target
			#scrollView = fview.children[0].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			#window.timelineMinuteScroller = fview.children[0].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			#window.timelineMinuteSequence = window.timelineMinuteScroller._node
			#window.timelineMinuteSequence._.loop = true

			timelineMinuteScrollerFView = FView.byId('timelineMinuteScroller')
			timelineMinuteScrollerFView.modifier.setOrigin [0.5,0.5]

			#Pipe scroll events to the engine
			Engine.pipe timelineMinuteScrollerFView.view

			#scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
				#log 'getCurrentIndex',this.getCurrentIndex()
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			#)
			#scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this,e
				#log 'getCurrentIndex',this.getCurrentIndex()
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#timelineMinuteScroller.setPosition(400)
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			#)
			#scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
				#log 'getCurrentIndex',this.getCurrentIndex()
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			#)

			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				if timelineActive is true
					timelineMinuteScrollerFView.modifier.halt()
					timelineMinuteScrollerFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.8
					timelineMinuteScrollerFView.modifier.setOpacity 1,
						method: 'spring'
						period: 500
						dampingRatio: 0.8
				else
					timelineMinuteScrollerFView.modifier.halt()
					timelineMinuteScrollerFView.modifier.setTransform Transform.scale(3,3,3),
						method: 'spring'
						period: 500
						dampingRatio: 0.8
					timelineMinuteScrollerFView.modifier.setOpacity 0,
						method: 'spring'
						period: 500
						dampingRatio: 0.8
			)

		Template.timelineMinuteScroller.helpers
			timelineMinuteScrollerStyles: ->
				timelineActive = Session.get 'timelineActive'
				if timelineActive
					log 'Auto!'
					styles =
						pointerEvents: 'auto'
				else
					log 'None!'
					styles =
						pointerEvents: 'none'
			moments: ->
				self = this
				#Iterate enough items based on the current index for stub issues right now
				moments = []
				moment =
					archiveCreatedAt: 'ARCHIVECREATEDAT'
					tokboxArchiveId: 'TOKBOXARCHIVEID'
					tokboxArchiveName: 'TOKBOXARCHIVENAME'
				for i in [0...self.index]
					moments.push moment
				moments
			timelineMomentStyles: ->
				timelineActive = Session.get 'timelineActive'
				if timelineActive
					styles =
						textAlign: 'center'
						color: '#ffffff'
						fontFamily: 'ziamimi-bold'
						textTransform: 'uppercase'
						overflow: 'hidden'
						lineHeight: '180px'
						cursor: 'pointer'
						pointerEvents: 'auto'
				else
					styles =
						textAlign: 'center'
						color: '#ffffff'
						fontFamily: 'ziamimi-bold'
						textTransform: 'uppercase'
						overflow: 'hidden'
						lineHeight: '180px'
						cursor: 'pointer'
						pointerEvents: 'none'
			timelineMinuteTitleIndex: ->
				'timelineMinuteTitle' + this.index
			timelineMinuteIndex: ->
				'timelineMinute' + this.index
			timelineMinuteStyles: ->
				#backgroundColor: '#000000'
				currentMinute = Session.get('currentMinute')
				instance = Template.instance()
				data = instance.data
				#log 'fviewHeight',fviewHeight

				if currentMinute is data.index
					#backgroundColor: 'red'
					backgroundColor: 'transparent'
					textAlign: 'center'
					color: '#ffffff'
					fontSize: '24px'
				else if this.index is 0
					#backgroundColor: 'green'
					backgroundColor: 'transparent'
					textAlign: 'center'
					color: '#ffffff'
					fontSize: '24px'
				else
					#backgroundColor: 'blue'
					backgroundColor: 'transparent'
					textAlign: 'center'
					color: '#ffffff'
					fontSize: '24px'
					#lineHeight: '460px'
			timelineMinuteTitleStyles: ->
				#backgroundColor: '#000000'
				currentMinute = Session.get('currentMinute')
				instance = Template.instance()
				data = instance.data
				#log 'fviewHeight',fviewHeight
				backgroundColor: 'purple'
				backgroundColor: 'transparent'
				textAlign: 'center'
				color: '#ffffff'
				fontSize: '36px'
				fontFamily: 'ziamimi-bold'
				zIndex: '1'
			timelineMinuteTimeStyles: ->
				backgroundColor: 'orange'
				backgroundColor: 'transparent'
				textAlign: 'center'
				color: '#ffffff'
				fontSize: '24px'
				fontFamily: 'ziamimi-bold'
				zIndex: '1'

		Template.timelineMinute.rendered = ->
			fview = FView.from(this)
			self = this
			data = self.data

			target = fview.surface || fview.view._eventInput
			#log 'TIMELINE MINUTE RENDERED!',data

			momentMinute = data.momentMinute
			#log 'MOMENT MINUTE',momentMinute.format('h:mm A')

			serverMoment = moment(TimeSync.serverTime())
			#log 'SERVER MOMENT',serverMoment.format('h:mm A'), momentMinute.format('h:mm A')

			if momentMinute.format('h:mm A') is serverMoment.format('h:mm A')
				#log 'SERVER MOMENT MATCH!!!!!',momentMinute.format('h:mm A')
				#log 'SERVER MOMENT DATA',data
				Session.set 'currentMinute',data.index

			target.on('click', () ->
				log 'TIMELINE MINUTE CLICKED',fview, target, this, self
				#Get the current index at point of click
				Session.set('currentMinute',data.index)
			)

			###@autorun((computation)->
				currentMinute = Session.get('currentMinute')
				#Get the Template instance
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
			)###

		Template.timelineMinute.helpers
			minute: ->
				#log 'window.timelineMinuteScroller.getCurrentIndex()',window.timelineMinuteScroller.getCurrentIndex()
				#log 'Minute!',this
				#this.momentMinute.set('minute',10)
				#this.formattedMinute = this.momentMinute.format('h:mm A')

				#Get the viewport height dimensions
				if FView.mainCtx
					mainCtx = FView.mainCtx
					mainCtxSize = mainCtx.getSize()
					mainCtxHeight = mainCtxSize[1]
					#log 'mainCtxHeight',mainCtxHeight

					#Get the famous template from this helper instance!
					instance = Template.instance()
					fview = FView.from(instance)

					if this.index > 57 and this.index < 59
						#log 'Index!',this.index
						#log 'instance',instance
						#log 'fview',fview
						#Get the famous template height!
						fviewSize = fview.getSize()
						fviewHeight = fviewSize[1]
						#log 'famous index and height!',this.index, fviewHeight

						#Figure out where you are in the array
						#log 'momentMinute',this.momentMinute
						#log 'formattedMinute',this.formattedMinute
					###if this.index + 1 > 59
						log 'I am greater than 59! I\'m gonna go back to 0',this.index
					else if this.index - 1 < 0
						log 'I am less than 0! I\'m gonna go back to 59',this.index###
					#else
						#log 'I am in between 0 and 59!',this.index

				this

		Template.timelineDayScroller.rendered = ->
			timelineDayScrollerFView = FView.byId('timelineDayScroller')
			log 'timelineDayScroller!'
			scrollView = timelineDayScrollerFView.view._eventInput
			window.timelineDayScroller = timelineDayScrollerFView.view
			#Set the viewSequence within the scrollView to be a loop
			window.timelineDaySequence = window.timelineDayScroller._node
			window.timelineDaySequence._.loop = true

			###scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
			)###
			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				if timelineActive is true
					timelineDayScrollerFView.modifier.halt()
					timelineDayScrollerFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineDayScrollerFView.modifier.setOpacity .6,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
				else
					timelineDayScrollerFView.modifier.halt()
					timelineDayScrollerFView.modifier.setTransform Transform.scale(3,3,3),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineDayScrollerFView.modifier.setOpacity 0,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
			)

		Template.timelineDayScroller.helpers
			timelineDayStyles: ->
				#backgroundColor: '#000000'
				currentDay = Session.get('currentDay')
				instance = Template.instance()
				data = instance.data
				#log 'fviewHeight',fviewHeight

				if currentDay is data.index
					backgroundColor: 'green'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'center'
				else
					backgroundColor: 'aqua'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'center'

		Template.timelineDay.rendered = ->
			fview = FView.from(this)
			self = this
			data = self.data

			target = fview.surface || fview.view._eventInput
			#log 'TIMELINE DAY RENDERED!',data

			momentDay = data.momentDay
			#log 'MOMENT DAY',momentDay.format('D')

			serverMoment = moment(TimeSync.serverTime())
			#log 'SERVER MOMENT',serverMoment.format('D'), momentDay.format('D')

			if momentDay.format('D') is serverMoment.format('D')
				#log 'SERVER MOMENT DAY MATCH!!!!!',serverMoment.format('M D'),momentDay.format('M D')
				#log 'SERVER MOMENT DAY DATA',data
				Session.set 'currentDay',data.index

			target.on('click', () ->
				log 'TARGET CLICKED',fview, target
				Session.set('currentDay',data.index)
			)

			###@autorun((computation)->
				currentDay = Session.get('currentDay')
				#Get the Template instance
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
			)###

		Template.timelineDay.helpers
			day: ->
				this

		Template.timelineMonthScroller.rendered = ->
			timelineMonthScrollerFView = FView.byId('timelineMonthScroller')
			log 'timelineMonthScrollerFView',timelineMonthScrollerFView
			scrollView = timelineMonthScrollerFView.view._eventInput
			window.timelineMonthScroller = timelineMonthScrollerFView.view
			#Set the viewSequence within the scrollView to be a loop
			window.timelineMonthSequence = window.timelineMonthScroller._node
			window.timelineMonthSequence._.loop = true

			###scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
			)###
			@autorun((computation)->
				timelineActive = Session.get 'timelineActive'
				if timelineActive is true
					timelineMonthScrollerFView.modifier.halt()
					timelineMonthScrollerFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineMonthScrollerFView.modifier.setOpacity .6,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
				else
					timelineMonthScrollerFView.modifier.halt()
					timelineMonthScrollerFView.modifier.setTransform Transform.scale(3,3,3),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineMonthScrollerFView.modifier.setOpacity 0,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
			)

		Template.timelineMonthScroller.helpers
			timelineMonthStyles: ->
				#backgroundColor: '#000000'
				currentMonth = Session.get('currentMonth')
				instance = Template.instance()
				data = instance.data
				#log 'fviewHeight',fviewHeight

				if currentMonth is data.index
					backgroundColor: 'brown'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '14px'
					textAlign: 'center'
				else
					backgroundColor: 'purple'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '14px'
					textAlign: 'center'

		Template.timelineMonth.rendered = ->
			fview = FView.from(this)
			self = this
			data = self.data

			target = fview.surface || fview.view._eventInput
			#log 'TIMELINE MONTH RENDERED!',data

			momentMonth = data.momentMonth
			#log 'MOMENT MONTH',momentMonth.format('M')

			serverMoment = moment(TimeSync.serverTime())
			#log 'SERVER MOMENT',serverMoment.format('M'), momentMonth.format('M')

			if momentMonth.format('M') is serverMoment.format('M')
				log 'SERVER MOMENT MONTH MATCH!!!!!',serverMoment.format('M'),momentMonth.format('M')
				#log 'SERVER MOMENT MONTH DATA',data
				Session.set 'currentMonth',data.index

			target.on('click', () ->
				log 'TARGET CLICKED',fview, target
				Session.set('currentMonth',data.index)
			)

			###@autorun((computation)->
				currentMonth = Session.get('currentMonth')
				#Get the Template instance
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
			)###

		Template.timelineMonth.helpers
			month: ->
				this

		Template.timelineYearScroller.rendered = ->
			timelineYearScrollerFView = FView.byId('timelineYearScroller')
			scrollView = timelineYearScrollerFView.view._eventInput
			window.timelineYearScroller = timelineYearScrollerFView.view
			#Set the viewSequence within the scrollView to be a loop
			window.timelineYearSequence = window.timelineYearScroller._node
			window.timelineYearSequence._.loop = true

			###scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
			)###
			@autorun((computation)->
				timelineActive = Session.get('timelineActive')
				if timelineActive is true
					timelineYearScrollerFView.modifier.halt()
					timelineYearScrollerFView.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineYearScrollerFView.modifier.setOpacity .6,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
				else
					timelineYearScrollerFView.modifier.halt()
					timelineYearScrollerFView.modifier.setTransform Transform.scale(3,3,3),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
					timelineYearScrollerFView.modifier.setOpacity 0,
						method: 'spring'
						period: 500
						dampingRatio: 0.5
			)

		Template.timelineYearScroller.helpers
			timelineYearStyles: ->
				#backgroundColor: '#000000'
				currentYear = Session.get('currentYear')
				instance = Template.instance()
				data = instance.data
				#log 'fviewHeight',fviewHeight

				if currentYear is data.index
					backgroundColor: 'gray'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '36px'
					textAlign: 'center'
				else
					backgroundColor: 'orange'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ziamimi-light'
					textTransform: 'uppercase'
					fontSize: '36px'
					textAlign: 'center'

		Template.timelineYear.rendered = ->
			fview = FView.from(this)
			self = this
			data = self.data

			target = fview.surface || fview.view._eventInput
			#log 'TIMELINE YEAR RENDERED!',data

			momentYear = data.momentYear
			#log 'MOMENT YEAR',momentYear.format('YYYY')

			serverMoment = moment(TimeSync.serverTime())
			#log 'SERVER MOMENT',serverMoment.format('YYYY'), momentYear.format('YYYY')

			if momentYear.format('YYYY') is serverMoment.format('YYYY')
				#log 'SERVER MOMENT YEAR MATCH!!!!!',serverMoment.format('YYYY'),momentYear.format('YYYY')
				#log 'SERVER MOMENT YEAR DATA',data
				Session.set 'currentYear',data.index

			target.on('click', () ->
				log 'TARGET CLICKED',fview, target
				Session.set('currentYear',data.index)
			)

			###@autorun((computation)->
				currentYear = Session.get('currentYear')
				#Get the Template instance
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
			)###

		Template.timelineYear.helpers
			year: ->
				this

		Template.timelineMoment.rendered = ->
			fview = FView.from(this)

			timelineMomentBackground = fview.children[0]

			#log 'timelineMomentBackground!!!',timelineMomentBackground

			target = fview.surface || fview.view || fview.view._eventInput

			zoomTransition =
				duration: 500
				curve: Easing.inOutSine

			panTransition =
				duration: 500
				curving: Easing.inOutSine

			#log 'timelineMoment',fview

			target.on('mouseover', (e) ->
				timelineMomentBackground.modifier.halt()
				timelineMomentBackground.modifier.setTransform Transform.scale(1.5, 1.5, 1), zoomTransition
			)
			###target.on('mousemove', (e) ->
				#Center the image to where the mouse cursor currently is
				timelineMomentBackgroundWidth = 320
				timelineMomentBackgroundHeight = 180
				destinationX = 1 - e.offsetX/timelineMomentBackgroundWidth
				destinationY = 1 - e.offsetY/timelineMomentBackgroundHeight
				timelineMomentBackground.modifier.setOrigin [destinationX,destinationY]
				timelineMomentBackground.modifier.setAlign [destinationX,destinationY]
			)###
			target.on('mouseout', (e) ->
				#log 'TIMELINE MOMENT MOUSEOUT',fview, target, this
				timelineMomentBackground.modifier.halt()
				timelineMomentBackground.modifier.setTransform Transform.scale(1, 1, 1), zoomTransition
			)
			target.on('click', () ->
				log 'TIMELINE MOMENT CLICKED',fview, target
				Session.set 'timelineActive',false
				Session.set 'viewingArchivedMoment',true
			)
			###@autorun((computation)->
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
			)###

		Template.timelineMoment.helpers
			timelineMomentImageStyles: ->
				timelineActive = Session.get 'timelineActive'
				if timelineActive
					styles =
						backgroundSize: 'cover'
						backgroundPosition: '50% 50%'
						backgroundRepeat: 'no-repeat'
						backgroundColor: 'rgba(255,255,255,1)'
						backgroundImage: 'url(http://placekitten.com/g/320/180)'
						pointerEvents: 'auto'
				else
					styles =
						backgroundSize: 'cover'
						backgroundPosition: '50% 50%'
						backgroundRepeat: 'no-repeat'
						backgroundColor: 'rgba(255,255,255,1)'
						backgroundImage: 'url(http://placekitten.com/g/320/180)'
						pointerEvents: 'none'
			moment: ->
				instance = Template.instance()
				#log 'timelineMoment instance!',instance
				data = instance.data
				data
				this
				#if typeof index is 'object'
				#	0
				#else
				#	index

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
		createMoment: () ->
			log 'Server createMoment called!'

			#Create an archive!
			openTokArchiveOptions =
				name: 'moment:' + Meteor.userId()

			archive = openTokClient.startArchive openTokSession, openTokArchiveOptions

			log 'ARCHIVE!!!!',archive

			#Start the timer!
			clock = momentTimer
			timeLeft = ->
				if clock > 1
					clock--
					log clock
					#We've hit our time limit, wrap it up gentlemen.
					if clock is 1
						unless archive.status is 'stopped'
							archive = openTokClient.stopArchive archive.id
							storedArchive =
								archiveCreatedAt: archive.createdAt
								tokboxArchiveId: archive.id
								tokboxArchiveName: archive.name
								tokboxPartnerId: archive.partnerId
								tokboxSessionId: archive.sessionId
								archiveUpdatedAt: archive.updatedAt

							Moments.insert storedArchive
							,
								(error,id)->
									log 'error' if error
									log 'Moments insert callback!',id

							log 'That\'s All Folks, let\'s cancel this server session archive',archive,storedArchive
						Meteor.clearInterval interval
				#else
				#	log 'Other stuff'
			interval = Meteor.setInterval(timeLeft, 1000)

			log 'Sigh archive',archive
			archive
		getMoment: (archiveId) ->
			log 'Server getMoment called!',archiveId

			#Retrieve an archive
			archive = openTokClient.getArchive archiveId
			log 'RETRIEVED ARCHIVE',archive
			archive
		listArchives: () ->
			log 'listArchives called!'

			openTokClient.listArchives
				count: 50
			, (error,archives,totalCount)->
				log 'listArchives error',error if error
				log 'archives',archives
				log 'totalCount',totalCount
		stopMoment: (archiveId) ->
			log 'Server stopMoment called!'
			log 'archive?',archiveId
			archive = openTokClient.stopArchive archiveId
			archive

	Meteor.startup ->
		log 'Server!'

		# Wipe all guest accounts that are more than 24 hours old, this way people can say something once a day
		Accounts.removeOldGuests();

		# Initialize OpenTokClient
		@openTokSecret = 'ce949e452e117eef38d2661e9e1824f8faddff40'
		@openTokClient = new OpenTokClient openTokApiKey, openTokSecret
		#@openTok = new OpenTok openTokApiKey, openTokSecret
		#log 'openTokClient',openTokClient

		log 'createOpenTokSession!'
		openTokOptions =
			mediaMode: 'routed'
			location: '127.0.0.1'

		@openTokSession = openTokClient.createSession openTokOptions
		log 'openTokSession',openTokSession

		# Create a reverse timeline
		epoch = moment '2010-01-01 00:00'
		log 'Server epoch!',epoch
		now = moment()
		log 'Server now!',now

		log 'Get archives'

		questionsArray = [
				question:'What is the most important thing that happened to you today?'
				number:0
			,
				question:''
				number:1
			,
				question:''
				number:2
			,
				question:''
				number:3
			,
				question:''
				number:4
			,
				question:''
				number:5
			,
				question:''
				number:6
			,
				question:''
				number:7
			,
				question:''
				number:8
			,
				question:''
				number:9
			,
				question:''
				number:10
			,
				question:''
				number:11
			,
				question:''
				number:12
			,
				question:''
				number:13
			,
				question:''
				number:14
			,
				question:''
				number:15
			,
				question:''
				number:16
			,
				question:''
				number:17
			,
				question:''
				number:18
			,
				question:''
				number:19
			,
				question:''
				number:20
			,
				question:''
				number:21
			,
				question:''
				number:22
			,
				question:''
				number:23
			,
				question:''
				number:24
			,
				question:''
				number:25
			,
				question:''
				number:26
			,
				question:''
				number:27
			,
				question:''
				number:28
			,
				question:''
				number:29
			,
				question:''
				number:30
			,
				question:''
				number:31
			,
				question:''
				number:32
			,
				question:''
				number:33
			,
				question:''
				number:34
			,
				question:''
				number:35
			,
				question:''
				number:36
			,
				question:''
				number:37
			,
				question:''
				number:38
			,
				question:''
				number:39
			,
				question:''
				number:40
			,
				question:''
				number:41
			,
				question:''
				number:42
			,
				question:''
				number:43
			,
				question:''
				number:44
			,
				question:''
				number:45
			,
				question:''
				number:46
			,
				question:''
				number:47
			,
				question:''
				number:48
			,
				question:''
				number:49
			,
				question:''
				number:50
			,
				question:''
				number:51
			,
				question:''
				number:52
			,
				question:''
				number:53
			,
				question:''
				number:54
			,
				question:''
				number:55
			,
				question:''
				number:56
			,
				question:''
				number:57
			,
				question:''
				number:58
			,
				question:''
				number:59
			,
				question:''
				number:60
			,
				question:''
				number:61
			,
				question:''
				number:62
			,
				question:''
				number:63
			,
				question:''
				number:64
			,
				question:''
				number:65
			,
				question:''
				number:66
			,
				question:''
				number:67
			,
				question:''
				number:68
			,
				question:''
				number:69
			,
				question:''
				number:70
			,
				question:''
				number:71
			,
				question:''
				number:72
			,
				question:''
				number:73
			,
				question:''
				number:74
			,
				question:''
				number:75
			,
				question:''
				number:76
			,
				question:''
				number:77
			,
				question:''
				number:78
			,
				question:''
				number:79
			,
				question:''
				number:80
			,
				question:''
				number:81
			,
				question:''
				number:82
			,
				question:''
				number:83
			,
				question:''
				number:84
			,
				question:''
				number:85
			,
				question:''
				number:86
			,
				question:''
				number:87
			,
				question:''
				number:88
			,
				question:''
				number:89
			,
				question:''
				number:90
			,
				question:''
				number:91
			,
				question:''
				number:92
			,
				question:''
				number:93
			,
				question:''
				number:94
			,
				question:''
				number:95
			,
				question:''
				number:96
			,
				question:''
				number:97
			,
				question:''
				number:98
			,
				question:''
				number:99
			,
				question:''
				number:100
			,
				question:''
				number:101
			,
				question:''
				number:102
			,
				question:''
				number:103
			,
				question:''
				number:104
			,
				question:''
				number:105
			,
				question:''
				number:106
			,
				question:''
				number:107
			,
				question:''
				number:108
			,
				question:''
				number:109
			,
				question:''
				number:110
			,
				question:''
				number:111
			,
				question:''
				number:112
			,
				question:''
				number:113
			,
				question:''
				number:114
			,
				question:''
				number:115
			,
				question:''
				number:116
			,
				question:''
				number:117
			,
				question:''
				number:118
			,
				question:''
				number:119
			,
				question:''
				number:120
			,
				question:''
				number:121
			,
				question:''
				number:122
			,
				question:''
				number:123
			,
				question:''
				number:124
			,
				question:''
				number:125
			,
				question:''
				number:126
			,
				question:''
				number:127
			,
				question:''
				number:128
			,
				question:''
				number:129
			,
				question:''
				number:130
			,
				question:''
				number:131
			,
				question:''
				number:132
			,
				question:''
				number:133
			,
				question:''
				number:134
			,
				question:''
				number:135
			,
				question:''
				number:136
			,
				question:''
				number:137
			,
				question:''
				number:138
			,
				question:''
				number:139
			,
				question:''
				number:140
			,
				question:''
				number:141
			,
				question:''
				number:142
			,
				question:''
				number:143
			,
				question:''
				number:144
			,
				question:''
				number:145
			,
				question:''
				number:146
			,
				question:''
				number:147
			,
				question:''
				number:148
			,
				question:''
				number:149
			,
				question:''
				number:150
			,
				question:''
				number:151
			,
				question:''
				number:152
			,
				question:''
				number:153
			,
				question:''
				number:154
			,
				question:''
				number:155
			,
				question:''
				number:156
			,
				question:''
				number:157
			,
				question:''
				number:158
			,
				question:''
				number:159
			,
				question:''
				number:160
			,
				question:''
				number:161
			,
				question:''
				number:162
			,
				question:''
				number:163
			,
				question:''
				number:164
			,
				question:''
				number:165
			,
				question:''
				number:166
			,
				question:''
				number:167
			,
				question:''
				number:168
			,
				question:''
				number:169
			,
				question:''
				number:170
			,
				question:''
				number:171
			,
				question:''
				number:172
			,
				question:''
				number:173
			,
				question:''
				number:174
			,
				question:''
				number:175
			,
				question:''
				number:176
			,
				question:''
				number:177
			,
				question:''
				number:178
			,
				question:''
				number:179
			,
				question:''
				number:180
			,
				question:''
				number:181
			,
				question:''
				number:182
			,
				question:''
				number:183
			,
				question:''
				number:184
			,
				question:''
				number:185
			,
				question:''
				number:186
			,
				question:''
				number:187
			,
				question:''
				number:188
			,
				question:''
				number:189
			,
				question:''
				number:190
			,
				question:''
				number:191
			,
				question:''
				number:192
			,
				question:''
				number:193
			,
				question:''
				number:194
			,
				question:''
				number:195
			,
				question:''
				number:196
			,
				question:''
				number:197
			,
				question:''
				number:198
			,
				question:''
				number:199
			,
				question:''
				number:200
			,
				question:''
				number:201
			,
				question:''
				number:202
			,
				question:''
				number:203
			,
				question:''
				number:204
			,
				question:''
				number:205
			,
				question:''
				number:206
			,
				question:''
				number:207
			,
				question:''
				number:208
			,
				question:''
				number:209
			,
				question:''
				number:210
			,
				question:''
				number:211
			,
				question:''
				number:212
			,
				question:''
				number:213
			,
				question:''
				number:214
			,
				question:''
				number:215
			,
				question:''
				number:216
			,
				question:''
				number:217
			,
				question:''
				number:218
			,
				question:''
				number:219
			,
				question:''
				number:220
			,
				question:''
				number:221
			,
				question:''
				number:222
			,
				question:''
				number:223
			,
				question:''
				number:224
			,
				question:''
				number:225
			,
				question:''
				number:226
			,
				question:''
				number:227
			,
				question:''
				number:228
			,
				question:''
				number:229
			,
				question:''
				number:230
			,
				question:''
				number:231
			,
				question:''
				number:232
			,
				question:''
				number:233
			,
				question:''
				number:234
			,
				question:''
				number:235
			,
				question:''
				number:236
			,
				question:''
				number:237
			,
				question:''
				number:238
			,
				question:''
				number:239
			,
				question:''
				number:240
			,
				question:''
				number:241
			,
				question:''
				number:242
			,
				question:''
				number:243
			,
				question:''
				number:244
			,
				question:''
				number:245
			,
				question:''
				number:246
			,
				question:''
				number:247
			,
				question:''
				number:248
			,
				question:''
				number:249
			,
				question:''
				number:250
			,
				question:''
				number:251
			,
				question:''
				number:252
			,
				question:''
				number:253
			,
				question:''
				number:254
			,
				question:''
				number:255
			,
				question:''
				number:256
			,
				question:''
				number:257
			,
				question:''
				number:258
			,
				question:''
				number:259
			,
				question:''
				number:260
			,
				question:''
				number:261
			,
				question:''
				number:262
			,
				question:''
				number:263
			,
				question:''
				number:264
			,
				question:''
				number:265
			,
				question:''
				number:266
			,
				question:''
				number:267
			,
				question:''
				number:268
			,
				question:''
				number:269
			,
				question:''
				number:270
			,
				question:''
				number:271
			,
				question:''
				number:272
			,
				question:''
				number:273
			,
				question:''
				number:274
			,
				question:''
				number:275
			,
				question:''
				number:276
			,
				question:''
				number:277
			,
				question:''
				number:278
			,
				question:''
				number:279
			,
				question:''
				number:280
			,
				question:''
				number:281
			,
				question:''
				number:282
			,
				question:''
				number:283
			,
				question:''
				number:284
			,
				question:''
				number:285
			,
				question:''
				number:286
			,
				question:''
				number:287
			,
				question:''
				number:288
			,
				question:''
				number:289
			,
				question:''
				number:290
			,
				question:''
				number:291
			,
				question:''
				number:292
			,
				question:''
				number:293
			,
				question:''
				number:294
			,
				question:''
				number:295
			,
				question:''
				number:296
			,
				question:''
				number:297
			,
				question:''
				number:298
			,
				question:''
				number:299
			,
				question:''
				number:300
			,
				question:''
				number:301
			,
				question:''
				number:302
			,
				question:''
				number:303
			,
				question:''
				number:304
			,
				question:''
				number:305
			,
				question:''
				number:306
			,
				question:''
				number:307
			,
				question:''
				number:308
			,
				question:''
				number:309
			,
				question:''
				number:310
			,
				question:''
				number:311
			,
				question:''
				number:312
			,
				question:''
				number:313
			,
				question:''
				number:314
			,
				question:''
				number:315
			,
				question:''
				number:316
			,
				question:''
				number:317
			,
				question:''
				number:318
			,
				question:''
				number:319
			,
				question:''
				number:320
			,
				question:''
				number:321
			,
				question:''
				number:322
			,
				question:''
				number:323
			,
				question:''
				number:324
			,
				question:''
				number:325
			,
				question:''
				number:326
			,
				question:''
				number:327
			,
				question:''
				number:328
			,
				question:''
				number:329
			,
				question:''
				number:330
			,
				question:''
				number:331
			,
				question:''
				number:332
			,
				question:''
				number:333
			,
				question:''
				number:334
			,
				question:''
				number:335
			,
				question:''
				number:336
			,
				question:''
				number:337
			,
				question:''
				number:338
			,
				question:''
				number:339
			,
				question:''
				number:340
			,
				question:''
				number:341
			,
				question:''
				number:342
			,
				question:''
				number:343
			,
				question:''
				number:344
			,
				question:''
				number:345
			,
				question:''
				number:346
			,
				question:''
				number:347
			,
				question:''
				number:348
			,
				question:''
				number:349
			,
				question:''
				number:350
			,
				question:''
				number:351
			,
				question:''
				number:352
			,
				question:''
				number:353
			,
				question:''
				number:354
			,
				question:''
				number:355
			,
				question:''
				number:356
			,
				question:''
				number:357
			,
				question:''
				number:358
			,
				question:''
				number:359
			,
				question:''
				number:360
			,
				question:''
				number:361
			,
				question:''
				number:362
			,
				question:''
				number:363
			,
				question:''
				number:364
		]

		if Questions.find().fetch is 0
			log 'Questions array is empty!'
