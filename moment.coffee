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
@momentTimer = 5

@log = ->
	log.history = log.history or [] # store logs to an array for reference
	log.history.push arguments
	console.log Array::slice.call(arguments)  if @console

if Meteor.isClient
	# Create Famous Views
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

					window.subscriber = session.subscribe event.stream, 'video',
						insertMode: 'replace'
						resolution: '1280x720'
					, (err) ->
						if err
							log 'Subscribe err',err
							Session.set 'subscribed',false
						else
							log 'Subscribed to stream!'
							Session.set 'subscribed',true

					#layout()

				session.on 'streamDestroyed', (event) ->
					event.preventDefault()
					log 'Another streamDestroyed!',event

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
		Session.setDefault 'backgroundTranslation', 0
		Session.setDefault 'overlayTranslation', 0
		Session.setDefault 'introTranslation', 0
		Session.setDefault 'momentButtonTranslation', 1
		Session.setDefault 'ppLogoTranslation', -20
		Session.setDefault 'timerTranslation', 300
		Session.setDefault 'questionTranslation', -200
		Session.setDefault 'timelineActive',false
		Session.setDefault 'canSubscribeToStream', false
		Session.setDefault 'userCanPublish', false
		Session.setDefault 'userIsPublishing', false
		Session.setDefault 'subscribed',false
		Session.setDefault 'timer', momentTimer
		Session.setDefault 'now', TimeSync.serverTime()

		#Filters
		Session.setDefault 'blur', 100
		Session.setDefault 'grayscale', false

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
				#log 'MAKE CANVAS!!!!'
				#size = FView.mainCtx.getSize()
				#canvasSize = [size[0] * 2, size[1] * 2];
				size = [320,240]
				canvasSize = [640,480]
				window.canvas.setSize(size, canvasSize);

				# Get the context
				#window.context = window.canvas.getContext('2d')
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
				window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
				window.camera.position.x = 0
				window.camera.position.y = 0
				window.camera.position.z = 1000

				# Create the rectangle bounds for the video input
				###rectLength = 640
				rectWidth = 480
				rectShape = new THREE.Shape()
				rectShape.moveTo 0, 0
				rectShape.lineTo 0, rectWidth
				rectShape.lineTo rectLength, rectWidth
				rectShape.lineTo rectLength, 0
				rectShape.lineTo 0, 0

				# Create the rectangle shape
				rectGeom = new THREE.ShapeGeometry(rectShape)

				rectMaterial = new THREE.MeshBasicMaterial
					color: 0x66FF66
				rectMesh = new THREE.Mesh(rectGeom, rectMaterial)

				# Add the video rectangle to the scene
				window.scene.add rectMesh###

				# Create the geometry
				#window.geometry = new THREE.BoxGeometry(200, 200, 200)

				# Create the material
				#window.material = new THREE.MeshBasicMaterial(
				#	color: 0xff0000
				#	wireframe: true
				#)

				# Create the mesh and add it to the scene
				#window.mesh = new THREE.Mesh(window.geometry, window.material)
				#window.scene.add window.mesh

				#log 'context!!!',window.context
			#else if window.canvas and FView.mainCtx
			#	size = FView.mainCtx.getSize()
			#	canvasSize = [size[0] * 2, size[1] * 2];
			#	window.canvas.setSize(size, canvasSize);
			if (window.publisher and Session.equals 'userIsPublishing',true and not window.videoCube) or (window.subscriber and Session.equals 'subscribed',true and not window.videoCube)

				video = document.querySelector('video')

				#Pipe the video in
				window.videoTexture = new THREE.Texture(video)
				window.videoTexture.wrapS = THREE.RepeatWrapping
				window.videoTexture.wrapT = THREE.RepeatWrapping
				window.videoTexture.repeat.set 1, 1

				videoGeometry = new THREE.BoxGeometry(5, 5, 5)
				videoMaterial = new THREE.MeshLambertMaterial(
				  map: window.videoTexture
				  shading: THREE.FlatShading
				)
				window.videoCube = new THREE.Mesh(videoGeometry, videoMaterial)
				window.scene.add videoCube
				window.camera.position.z = 6

				#Add a soft light
				light = new THREE.AmbientLight("rgb(255,255,255)") # soft white light
				window.scene.add light
			# Render to WebGL if the renderer is initialized - This starts the main render loop for the WebGL
			if window.renderer and window.scene and window.camera

				#window.mesh.rotation.x += 0.01
				#window.mesh.rotation.y += 0.02

				#Render the video if it exists
				if window.videoCube
					# Rotate the video feed like a boss
					window.videoCube.rotation.x += 0.01
					window.videoCube.rotation.y += 0.01
					window.videoTexture.needsUpdate = true

				#Render the easter egg model if it exists
				if window.easterEggModel
					# Allow for mouse rotation of the model
					#window.camera.position.x += (window.mouseX - window.camera.position.x) * .05
					#window.camera.position.y += (-window.mouseY - window.camera.position.y) * .05
					#window.camera.lookAt scene.position

					# Rotate the model like a boss
					window.easterEggModel.rotation.y += 0.01

				# Render the scene
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
					backgroundColor: '#f5f5f5'
					backgroundImage: 'url(img/performers/01.jpg)'
					backgroundRepeat: 'no-repeat'
					backgroundPosition: '50% 50%'
					backgroundSize: 'cover'
			overlayStyles: ->
				styles =
					#backgroundColor: 'rgba(0,0,0,0.4)'
					backgroundImage: 'radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%), radial-gradient(rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 46%)'
					backgroundPosition: '0 0, 2px 2px'
					backgroundSize: '4px 4px, 4px 4px, 100% 100%'
					backgroundRepeat: 'repeat, repeat, no-repeat'
			introStyles: ->
				styles =
					#backgroundColor: '#e5e5e5'
					textAlign: 'center'
					fontSize: '36px'
					fontFamily: 'ralewayheavy'
					color: '#ffffff'
			momentButtonStyles: ->
				styles =
					border: '1px solid #ffffff'
					textAlign: 'center'
					color: '#ffffff'
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
			timelineToggleStyles: ->
				backgroundColor: '#ffffff'
				borderRadius: '50%'
				textAlign: 'center'
				color: '#ffffff'
				zIndex: '999'
			timelineOverlayStyles: ->
				backgroundColor: '#000000'

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
			fview = FView.from(this)

			log 'Set videoWrapper layout!',fview
			videoWrapper = this.find '#videoWrapper'
			log 'videoWrapper',videoWrapper
			window.layout = TB.initLayoutContainer(videoWrapper,
				bigFixedRatio: false
			).layout
			log 'layout',layout
			window.canvasParent = fview
			window.canvas = fview.view

			log 'Ready?',FView.isReady

			log 'Canvas!',this.$('canvas')

			#Initialize the Konami Code easter egg ;)
			easterEgg = new Konami () ->
				log 'Trigger Model Viewer!'

				windowHalfX = window.innerWidth / 2
				windowHalfY = window.innerHeight / 2

				#Mousemove
				onDocumentMouseMove = (event) ->
					window.mouseX = (event.clientX - windowHalfX) / 2
					window.mouseY = (event.clientY - windowHalfY) / 2

				#Add an event listener to the mousemove
				document.addEventListener "mousemove", onDocumentMouseMove, false

				#Change the camera position to view the model better
				#window.camera.position.z = 30 #Crash
				window.camera.position.y = 10 #Link
				window.camera.position.z = 200 #Link

				#Add a directional light
				window.directionalLight = new THREE.DirectionalLight(0xffeedd)
				window.directionalLight.position.set 0, 0, 1
				scene.add window.directionalLight

				#Add a second directional light
				window.byLight = new THREE.DirectionalLight(0xffeedd)
				#window.byLight.position.set 1, 0, 1
				window.byLight.position.set 0, 1, 0
				scene.add window.byLight

				#Create a load manager
				manager = new THREE.LoadingManager()
				manager.onProgress = (item, loaded, total) ->
					log item, loaded, total
				texture = new THREE.Texture()
				onProgress = (xhr) ->
					if xhr.lengthComputable
						percentComplete = xhr.loaded / xhr.total * 100
						log Math.round(percentComplete, 2) + "% downloaded"
				onError = (xhr) ->
					log 'xhr error!',xhr

				#Instantiate the loader
				loader = new THREE.ImageLoader(manager)
				#loaderTexture = 'models/Crash/crash.png'
				#loaderTexture = 'models/Link/body.png'
				loaderTexture = 'models/YoungLink/YoungLink_grp.png'
				loader.load loaderTexture, (image) ->
					texture.image = image
					texture.needsUpdate = true
					return

				#Import the model
				loader = new THREE.OBJMTLLoader(manager)
				#loaderModel = 'models/Crash/Crash.obj'
				#loaderMTL = 'models/Crash/Crash.mtl'
				#loaderModel = 'models/Link/link.obj'
				#loaderMTL = 'models/Link/link.mtl'
				loaderModel = 'models/YoungLink/YoungLinkEquipped.obj'
				loaderMTL = 'models/YoungLink/YoungLinkEquipped.mtl'
				loader.load loaderModel, loaderMTL, ((object) ->
					object.traverse (child) ->
						child.material.map = texture  if child instanceof THREE.Mesh
					#object.position.y = 0 #Default
					object.position.y = -10
					window.easterEggModel = object
					scene.add window.easterEggModel
				), onProgress, onError


			#window.requestAnimationFrame ->
			#size = window.canvas.getSize()
			#canvasSize = [size[0] * 2, size[1] * 2];
			#window.canvas.setSize(size, canvasSize);

			# Get the context
			#window.context = window.canvas.getContext('2d')
			#log 'context!!!',window.context

			###setTimeout(->
				# Set canvas size
				size = window.canvas.getSize()
				canvasSize = [size[0] * 2, size[1] * 2];
				window.canvas.setSize(size, canvasSize);

				# Get the context
				window.context = window.canvas.getContext('2d')
				log 'context!!!',window.context
			, 20)###

			# Recalculate layout on resize
			window.onresize = ->
				clearTimeout resizeTimeout
				resizeTimeout = setTimeout(->
					log 'Layouting!'
					#layout()
				, 20)

			target = fview.surface || fview.view || fview.view._eventInput
			target.on('click', () ->
				log 'BACKGROUND TARGET CLICKED',fview, target
			)

			@autorun((computation)->
				timelineActive = Session.get('timelineActive')
				if timelineActive is true
					fview.modifier.halt()
					fview.modifier.setTransform Transform.scale(0.8,0.8,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
				else
					fview.modifier.halt()
					fview.modifier.setTransform Transform.scale(1,1,1),
						method: 'spring'
						period: 500
						dampingRatio: 0.5
			)

		Template.overlay.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'OVERLAY CLICKED',fview, target
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
							###output = () ->
								size = [320,240]
								canvasSize = [640,480]
								imgData = window.publisher.getImgData()
								#Only output to canvas if there's image data
								if imgData and imgData.length > 10
									#log 'imgData exists!'
									img = new Image()
									img.src = 'data:image/png;base64,' + imgData
									img.onload = () ->
										#log 'Stream image loaded!!!'
										#log 'Stream image!',img
										#Output the stream to canvas!
										#window.context.clearRect(0, 0, canvasSize[0], canvasSize[1]);
										window.context.drawImage(img, 0, 0, 640,480)
										#Get the canvasData
										if Session.equals 'grayscale',true
											canvasData = window.context.getImageData(0,0,canvasSize[0],canvasSize[1])
											data = canvasData.data
											#Iterate through the pixels
											i = 0
											while i < data.length
												r = data[i]
												g = data[i + 1]
												b = data[i + 2]
												brightness = parseInt((r + g + b) / 3)
												data[i] = brightness
												data[i + 1] = brightness
												data[i + 2] = brightness
												i += 4
											canvasData.data = data
											filteredData = canvasData
											window.context.putImageData filteredData,0,0
										if !Session.equals 'blur',0
											#Blur the canvas
											stackBlurCanvasRGB 'canvas', 0, 0, canvasSize[0], canvasSize[1], Session.get 'blur'
								Timer.setTimeout(output,20)
							output()###

							###canvasSize = window.canvas.getSize()
							imgData = window.publisher.getImgData()
							#Only output to canvas if there's image data
							if imgData and imgData.length > 10
								log 'imgData exists!'
								img = new Image()
								img.src = 'data:image/png;base64,' + imgData
								img.onload = () ->
									log 'Stream image loaded!!!'
									log 'Stream image!',img
									#Output the stream to canvas!
									window.context.drawImage(img,canvasSize[0]/2,canvasSize[1]/2)###
							#Hacky
							#video = event.target.element.children[0].children[2]
							#log 'Video!',video

							#video.addEventListener('play', () ->
							#	log 'DRAWING!!!'
						    #    #draw(this,context,cw,ch);
    						#,false)

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
												#session.unpublish publisher
												#Meteor.clearInterval interval
										else
											log "Uhhh else"
											#session.unpublish publisher
											Meteor.clearInterval interval
									interval = Meteor.setInterval(timeLeft, 1000)
							)
						streamDestroyed: (event) ->
							event.preventDefault()
							log 'publishStream destroyed!',event
							#Session.set 'userIsPublishing',false
							Meteor.setTimeout(->
								Session.set 'timer', momentTimer
							,1000)
					if window.subscriber then session.unsubscribe window.subscriber
					session.publish publisher
					#layout()
				else
					log 'Nope!'

				if Session.equals 'momentButtonTranslation', 1 then Session.set 'momentButtonTranslation', 1.3 else Session.set 'momentButtonTranslation', 1

				fview.modifier.halt()
				fview.modifier.setTransform Transform.scale(Session.get 'momentButtonTranslation'),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
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

		Template.timelineToggle.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view

			zoomTransition =
				duration: 500
				curve: Easing.inOutSine

			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'timelineActive', false
					Session.set 'timelineActive',true
					###fview.modifier.halt()
					fview.modifier.setTransform Transform.scale(1.5, 1.5, 999), zoomTransition###
				else
					Session.set 'timelineActive',false
					###fview.modifier.halt()
					fview.modifier.setTransform Transform.scale(1, 1, 999), zoomTransition###
			)

		#Timeline Search
		Template.timelineSearchHolder.rendered = ->
			fview = FView.from(this)
			log 'TIMELINESEARCHHOLDER FVIEW',fview
			target = fview.surface || fview.view._eventInput
			log 'TIMELINESEARCHHOLDER TARGET',target
			target.on('keyup', (e) ->
				log 'TIMELINESEARCHHOLDER KEYUP',e
			)

		Template.timelineSearchHolder.helpers
			timelineSearchStyles: ->
				backgroundColor: 'cadetblue'
				backgroundColor: 'transparent'
				padding: '0 10px 0 10px'
				fontSize: '72px'
				color: '#ffffff'
				fontFamily: 'ralewayregular'
				textTransform: 'uppercase'
				textAlign: 'center'

		Template.timelineSearch.rendered = ->
			fview = FView.from(this)
			log 'TIMELINESEARCH FVIEW',fview
			target = fview.surface || fview.view || fview.view._eventInput
			log 'TIMELINESEARCH TARGET',target
			window.timelineSearch = target
			target.on('keyup', (e) ->
				log 'TIMELINESEARCH KEYUP',e
			)


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
			#log 'TIMELINEMINUTESSCROLLER RENDERED',this
			fview = FView.from(this)
			#log 'TIMELINEMINUTESSCROLLER FVIEW',fview
			target = fview.surface || fview.view._eventInput
			#log 'TIMELINEMINUTESSCROLLER TARGET',target
			scrollView = fview.children[0].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			window.timelineMinuteScroller = fview.children[0].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			window.timelineMinuteSequence = window.timelineMinuteScroller._node
			window.timelineMinuteSequence._.loop = true

			scrollView.on('start', (e) ->
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
			)
			scrollView.on('update', (e) ->
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
			)
			scrollView.on('end', (e) ->
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
			)

			@autorun((computation)->
				currentMinute = Session.get('currentMinute')
				previousMinute = window.timelineMinuteScroller.getCurrentIndex()
				totalAmount = window.timelineMinuteScroller._node._.array.length
				amountMidPoint = totalAmount / 2

				log '====================================================================='

				#What is the previousMinute?
				log 'previousMinute',previousMinute
				#What is the currentMinute?
				log 'currentMinute',currentMinute

				scrollStart = 0
				#log '&&&&&&&&&&&&&&&&&&&&&&&&&scrollStart&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',scrollStart

				if previousMinute > amountMidPoint and currentMinute < amountMidPoint
					log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentMinute - previousMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '##############currentMinute distance from previousMinute##############',scrollDistance
					for i in [0...scrollDistance]
						window.timelineMinuteScroller.goToNextPage()
				else if previousMinute < amountMidPoint and currentMinute > amountMidPoint
					log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 59 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousMinute - currentMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '@@@@@@@@@@@@@@currentMinute distance from previousMinute@@@@@@@@@@@@@@',scrollDistance
					for i in [0...scrollDistance]
						window.timelineMinuteScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					log 'Just scroll as normal!'
					scrollDistance = previousMinute - currentMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousMinute < currentMinute
						log '!!!!!!!!!!!!!currentMinute distance from previousMinute!(forwards)!!!!',scrollDistance
						#We need to add a +1 here so that we'll scroll to the proper top element, because of indexes.
						#scrollDistance = scrollDistance + 1
						for i in [0...scrollDistance]
							window.timelineMinuteScroller.goToNextPage()
					else
						log '!!!!!!!!!!!!currentMinute distance from previousMinute!(backwards)!!!!',scrollDistance
						#Check for an edge case where the user has clicked on a different index but it won't change to that one because of an overflow issue
						if previousMinute is currentMinute
							log 'Scrolling back one to cover this edgecase!'
							window.timelineMinuteScroller.goToPreviousPage()
						else
							for i in [0...scrollDistance]
								window.timelineMinuteScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
			)

		Template.timelineMinuteScroller.helpers
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
				textAlign: 'center'
				color: '#ffffff'
				fontFamily: 'ralewaylight'
				textTransform: 'uppercase'
				overflow: 'hidden'
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
				fontFamily: 'ralewayheavy'
				zIndex: '1'
			timelineMinuteTimeStyles: ->
				backgroundColor: 'orange'
				backgroundColor: 'transparent'
				textAlign: 'center'
				color: '#ffffff'
				fontSize: '24px'
				fontFamily: 'ralewayheavy'
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

			@autorun((computation)->
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
			)

		Template.timelineMinute.helpers
			minute: ->
				#log 'window.timelineMinuteScroller.getCurrentIndex()',window.timelineMinuteScroller.getCurrentIndex()
				#log 'Minute!',this
				#this.momentMinute.set('minute',10)
				#this.formattedMinute = this.momentMinute.format('h:mm A')

				#Get the viewport height dimensions
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
			#log 'TIMELINEDAYSCROLLER RENDERED',this
			fview = FView.from(this)
			#log 'TIMELINEDAYSCROLLER FVIEW',fview
			target = fview.surface || fview.view._eventInput
			#log 'TIMELINEDAYSCROLLER TARGET',target
			scrollView = fview.children[1].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			window.timelineDayScroller = fview.children[1].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			window.timelineDaySequence = window.timelineDayScroller._node
			window.timelineDaySequence._.loop = true

			scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#timelineDayScroller.setPosition(400)
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			@autorun((computation)->
				currentDay = Session.get('currentDay')
				previousDay = window.timelineDayScroller.getCurrentIndex()
				totalAmount = window.timelineDayScroller._node._.array.length
				amountMidPoint = totalAmount / 2

				log '*********************************************************************'

				#What is the previousDay?
				log 'previousDay',previousDay
				#What is the currentDay?
				log 'currentDay',currentDay

				scrollStart = 0
				#log '&&&&&&&&&&&&&&&&&&&&&&&&&scrollStart&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',scrollStart

				if previousDay > amountMidPoint and currentDay < amountMidPoint
					log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentDay - previousDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '##############currentDay distance from previousDay##############',scrollDistance
					for i in [0...scrollDistance]
						window.timelineDayScroller.goToNextPage()
				else if previousDay < amountMidPoint and currentDay > amountMidPoint
					log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousDay - currentDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '@@@@@@@@@@@@@@currentDay distance from previousDay@@@@@@@@@@@@@@',scrollDistance
					for i in [0...scrollDistance]
						window.timelineDayScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					log 'Just scroll as normal!'
					scrollDistance = previousDay - currentDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousDay < currentDay
						log '!!!!!!!!!!!!!currentDay distance from previousDay!(forwards)!!!!',scrollDistance
						for i in [0...scrollDistance]
							window.timelineDayScroller.goToNextPage()
					else
						log '!!!!!!!!!!!!currentDay distance from previousDay!(backwards)!!!!',scrollDistance
						if previousDay is currentDay
							log 'Scrolling back one to cover this edgecase!'
							window.timelineDayScroller.goToPreviousPage()
						else
							log 'HURP SCROLL BACK NORMALLY'
							for i in [0...scrollDistance]
								window.timelineDayScroller.goToPreviousPage()

						#for i in [0...scrollDistance]
							#window.timelineDayScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
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
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'right'
					paddingRight: '190px'
				else
					backgroundColor: 'aqua'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'right'
					paddingRight: '190px'

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

			@autorun((computation)->
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
			)

		Template.timelineDay.helpers
			day: ->
				this

		Template.timelineMonthScroller.rendered = ->
			#log 'timelineMonthScroller RENDERED',this
			fview = FView.from(this)
			#log 'timelineMonthScroller FVIEW',fview
			target = fview.surface || fview.view._eventInput
			#log 'timelineMonthScroller TARGET',target
			scrollView = fview.children[2].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			window.timelineMonthScroller = fview.children[2].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			window.timelineMonthSequence = window.timelineMonthScroller._node
			window.timelineMonthSequence._.loop = true

			scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#timelineMonthScroller.setPosition(400)
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			@autorun((computation)->
				currentMonth = Session.get('currentMonth')
				previousMonth = window.timelineMonthScroller.getCurrentIndex()
				totalAmount = window.timelineMonthScroller._node._.array.length
				amountMidPoint = totalAmount / 2

				log '*********************************************************************'

				#What is the previousMonth?
				log 'previousMonth',previousMonth
				#What is the currentMonth?
				log 'currentMonth',currentMonth

				scrollStart = 0
				#log '&&&&&&&&&&&&&&&&&&&&&&&&&scrollStart&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',scrollStart

				if previousMonth > amountMidPoint and currentMonth < amountMidPoint
					log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentMonth - previousMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '##############currentMonth distance from previousMonth##############',scrollDistance
					for i in [0...scrollDistance]
						window.timelineMonthScroller.goToNextPage()
				else if previousMonth < amountMidPoint and currentMonth > amountMidPoint
					log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousMonth - currentMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '@@@@@@@@@@@@@@currentMonth distance from previousMonth@@@@@@@@@@@@@@',scrollDistance
					for i in [0...scrollDistance]
						window.timelineMonthScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					log 'Just scroll as normal!'
					scrollDistance = previousMonth - currentMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousMonth < currentMonth
						log '!!!!!!!!!!!!!currentMonth distance from previousMonth!(forwards)!!!!',scrollDistance
						for i in [0...scrollDistance]
							window.timelineMonthScroller.goToNextPage()
					else
						log '!!!!!!!!!!!!currentMonth distance from previousMonth!(backwards)!!!!',scrollDistance
						if previousMonth is currentMonth
							log 'Scrolling back one to cover this edgecase!'
							window.timelineMonthScroller.goToPreviousPage()
						else
							for i in [0...scrollDistance]
								window.timelineMonthScroller.goToPreviousPage()

						#for i in [0...scrollDistance]
						#	window.timelineMonthScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
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
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'right'
					paddingRight: '90px'
				else
					backgroundColor: 'purple'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'right'
					paddingRight: '90px'

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

			@autorun((computation)->
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
			)

		Template.timelineMonth.helpers
			month: ->
				this

		Template.timelineYearScroller.rendered = ->
			#log 'timelineYearSCROLLER RENDERED',this
			fview = FView.from(this)
			#log 'timelineYearSCROLLER FVIEW',fview
			target = fview.surface || fview.view._eventInput
			#log 'timelineYearSCROLLER TARGET',target
			scrollView = fview.children[3].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			window.timelineYearScroller = fview.children[3].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			window.timelineYearSequence = window.timelineYearScroller._node
			window.timelineYearSequence._.loop = true

			scrollView.on('start', (e) ->
				#log 'STARTING!!!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('update', (e) ->
				#log 'UPDATING!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#timelineYearScroller.setPosition(400)
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			scrollView.on('end', (e) ->
				#log 'ENDING!!!!!!!',this, this._cachedIndex
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)
			@autorun((computation)->
				currentYear = Session.get('currentYear')
				previousYear = window.timelineYearScroller.getCurrentIndex()
				totalAmount = window.timelineYearScroller._node._.array.length
				amountMidPoint = totalAmount / 2

				log '*********************************************************************'

				#What is the previousYear?
				log 'previousYear',previousYear
				#What is the currentYear?
				log 'currentYear',currentYear

				scrollStart = 0
				#log '&&&&&&&&&&&&&&&&&&&&&&&&&scrollStart&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&',scrollStart

				if previousYear > amountMidPoint and currentYear < amountMidPoint
					log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentYear - previousYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '##############currentYear distance from previousYear##############',scrollDistance
					for i in [0...scrollDistance]
						window.timelineYearScroller.goToNextPage()
				else if previousYear < amountMidPoint and currentYear > amountMidPoint
					log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousYear - currentYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					log '@@@@@@@@@@@@@@currentYear distance from previousYear@@@@@@@@@@@@@@',scrollDistance
					for i in [0...scrollDistance]
						window.timelineYearScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					log 'Just scroll as normal!'
					scrollDistance = previousYear - currentYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousYear < currentYear
						log '!!!!!!!!!!!!!currentYear distance from previousYear!(forwards)!!!!',scrollDistance
						for i in [0...scrollDistance]
							window.timelineYearScroller.goToNextPage()
					else
						log '!!!!!!!!!!!!currentYear distance from previousYear!(backwards)!!!!',scrollDistance
						#if previousYear is currentYear
						#	log 'Scrolling back one to cover this edgecase!'
						#	window.timelineYearScroller.goToPreviousPage()
						#else
						for i in [0...scrollDistance]
							window.timelineYearScroller.goToPreviousPage()

						#for i in [0...scrollDistance]
						#	window.timelineYearScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
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
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
					textAlign: 'center'
				else
					backgroundColor: 'orange'
					backgroundColor: 'transparent'
					color: '#ffffff'
					fontFamily: 'ralewaythin'
					textTransform: 'uppercase'
					fontSize: '12px'
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

			@autorun((computation)->
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
			)

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
			)
			@autorun((computation)->
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

		Template.timelineMoment.helpers
			timelineMomentImageStyles: ->
				backgroundSize: 'cover'
				backgroundPosition: '50% 50%'
				backgroundRepeat: 'no-repeat'
				backgroundColor: 'rgba(255,255,255,1)'
				backgroundImage: 'url(http://placekitten.com/g/320/180)'
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
