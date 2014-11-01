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
				log 'createOpenTokSession result',result
				@session = OT.initSession result.apiKey, result.session
				log 'session',session

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
						else
							log 'Subscribed to stream!'

					layout()

				session.on 'streamDestroyed', (event) ->
					event.preventDefault()
					log 'Another streamDestroyed!',event

				# Connect to the session
				session.connect result.token, (err) ->
					if err
						log 'session connect err',err
					else
						log 'Connected to session!'
						if session.capabilities.publish is 1
							log 'User is capable of publishing!',session.capabilities
						else
							log 'You are not able to publish a stream'
		)

		# Famous Globals
		@Transform = famous.core.Transform

		# Transitions
		@Transitionable = famous.transitions.Transitionable
		@SpringTransition = famous.transitions.SpringTransition
		@SnapTransition = famous.transitions.SnapTransition

		# Register Transitions
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
		Session.setDefault 'timelineToggleTranslation', -10
		Session.setDefault 'canSubscribeToStream', false
		Session.setDefault 'userCanPublish', false
		Session.setDefault 'userIsPublishing', false
		Session.setDefault 'timer', momentTimer
		Session.setDefault 'now', TimeSync.serverTime()

		#Global Template Helpers
		Template.registerHelper 'minutes', ->
			#Create all the minutes in a day
			epoch = Session.get 'epoch'
			minutesInADay = 1440
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
			log 'minutes',minutes
			minutes
		Template.registerHelper 'days', ->
			epoch = Session.get 'epoch'
			day = moment(epoch)
			currentDay = day.day()
			daysInAMonth = 31
			days = []
			while days.length < daysInAMonth
				#log 'currentDay',currentDay
				day.set('day',currentDay--)
				#log 'day',day
				days.push(day.format('dddd'))
			days
		Template.registerHelper 'months', ->
			epoch = Session.get 'epoch'
			month = moment(epoch)
			currentMonth = month.month()
			monthsInAYear = 12
			months = []
			while months.length < monthsInAYear
				#log 'currentMonth',currentMonth
				month.set('month',currentMonth--)
				#log 'month',month
				months.push(month.format('MMMM'))
			#log 'months',months
			months
		Template.registerHelper 'years', ->
			epoch = Session.get 'epoch'
			year = moment(epoch)
			currentYear = year.year()
			years = []
			yearsSinceEpoch = 10
			while years.length < yearsSinceEpoch
				#log 'currentYear',currentYear
				year.set('year',currentYear--)
				#log 'year',year
				years.push(year.format('YYYY'))
			log 'years',years
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
					backgroundColor: '#000000'
			introStyles: ->
				styles =
					#backgroundColor: '#e5e5e5'
					textAlign: 'center'
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
			timelineMomentStyles: ->
				textAlign: 'center'
				color: '#ffffff'
			timelineDayStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'
			timelineMonthStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'
			timelineYearStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'

		#Template.views_Scrollview.rendered = ->
		#	log 'SCROLLVIEW RENDERED'

		Template.about.rendered = ->
			log 'ABOUT RENDERED',this
			fview = FView.from(this)
			log 'ABOUT FVIEW',fview
			target = fview.surface || fview.view._eventInput
			log 'ABOUT TARGET',target

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

			log 'Set videoWrapper layout!'
			videoWrapper = this.find '#videoWrapper'
			log 'videoWrapper',videoWrapper
			window.layout = TB.initLayoutContainer(videoWrapper,
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
				if session.capabilities.publish is 1
					log 'User can publish!'
					window.publisher = OT.initPublisher('video',
						insertMode: 'replace'
						resolution: '1280x720'
					)

					publisher.on
						streamCreated: (event) ->
							log 'publishStream created!',event
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
					#if window.subscriber then session.unsubscribe window.subscriber
					session.publish publisher
					layout()
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

		Template.timelineToggle.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(Session.get('timelineToggleTranslation'), 10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
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

		#Template.timelineMinuteScroller.created = ->
			#log 'TIMELINEMINUTESSCROLLER CREATED',this
			#fview = FView.from(this)
			#log 'TIMELINEMINUTESSCROLLER CREATED FVIEW',fview
			#target = fview.surface || fview.view._eventInput
			#log 'TIMELINEMINUTESSCROLLER TARGET',target
			#scrollView = fview.children[0].view._eventInput
			#log 'SCROLLVIEW?!',scrollView
			#window.timelineMinuteScroller = fview.children[0].view
			#window.timelineMinuteScroller._node._.loop = true

		Template.timelineMinuteScroller.rendered = ->
			log 'TIMELINEMINUTESSCROLLER RENDERED',this
			fview = FView.from(this)
			log 'TIMELINEMINUTESSCROLLER FVIEW',fview
			target = fview.surface || fview.view._eventInput
			log 'TIMELINEMINUTESSCROLLER TARGET',target
			scrollView = fview.children[0].view._eventInput
			log 'SCROLLVIEW?!',scrollView
			window.timelineMinuteScroller = fview.children[0].view
			#Set the viewSequence within the scrollView to be a loop - XXX: Figure out a better way to do this by accessing Viewsequence
			window.timelineMinuteScroller._node._.loop = true

			#Set the page to 0 so that we don't get wonky overscrolling when the user clicks another option, as by default the ScrollView
			#page index starts at the last item in the list (1439 in our case), so we want to set it to 0 by just bumping the page forward by one.
			window.timelineMinuteScroller.goToNextPage()

			#Scroll to the current minute set in the server
			window.timelineMinuteScroller.goToPage(Session.get('currentMinute'))

			scrollView.on('start', (e) ->
				log 'STARTING!!!!!!',this
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
				log 'UPDATING!!!!',this
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
				log 'ENDING!!!!!!!',this
				#log 'clientX',e.clientX
				#log 'clientY',e.clientY
				#log 'delta',e.delta
				#log 'offsetX',e.offsetX
				#log 'offsetY',e.offsetY
				#log 'position',e.position
				#log 'slip',e.slip
				#log 'velocity',e.velocity
			)

		Template.timelineMinuteScroller.helpers
			timelineMinuteStyles: ->
				#backgroundColor: '#000000'
				textAlign: 'center'
				color: '#ffffff'
			timelineMinuteStatus: ->
				log 'TIMELINE MINUTE STATUS!!!'

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
				log 'SERVER MOMENT MATCH!!!!!',momentMinute.format('h:mm A')
				log 'SERVER MOMENT DATA',data
				Session.set 'currentMinute',data.index
				#window.timelineMinuteScroller.goToPage(data.index)

			target.on('click', () ->
				log 'TIMELINE MINUTE CLICKED',fview, target, this, self

				#if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				log 'data.index',data.index
				currentIndex = window.timelineMinuteScroller.getCurrentIndex()
				log 'currentIndex',currentIndex
				#destinationIndex = data.index - currentIndex
				#log 'destinationIndex',destinationIndex

				Session.set('currentMinute',data.index)
				window.timelineMinuteScroller.goToPage(Session.get('currentMinute'))

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(30, 0),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timelineMinute.helpers
			second: ->
				instance = Template.instance()
				index = instance.data
				#We have to use this as a workaround because the first result returned from an array is an object, not a 0.
				if typeof index is 'object'
					0
				else
					index
			minute: ->
				#instance = Template.instance()
				#log 'instance',instance
				#data = instance.data
				#if typeof index is 'object'
				#0
				#else
				#	index
				this
			hour: ->
				instance = Template.instance()
				index = instance.data
				if typeof index is 'object'
					0
				else
					index

		Template.timelineMoment.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TIMELINE MOMENT CLICKED',fview, target, this

				#if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(10, 10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timelineMoment.helpers
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

		Template.timelineDay.rendered = ->
			fview = FView.from(this)

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				#if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(10, 10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timelineDay.helpers
			day: ->
				instance = Template.instance()
				index = instance.data
				#We have to use this as a workaround because the first result returned from an array is an object, not a 0.
				if typeof index is 'object'
					0
				else
					index

		Template.timelineMonth.rendered = ->
			fview = FView.from(this)
			#log 'timelineMonth!!!!',this

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				#if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(10, 10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timelineMonth.helpers
			month: ->
				instance = Template.instance()
				index = instance.data
				#We have to use this as a workaround because the first result returned from an array is an object, not a 0.
				if typeof index is 'object'
					0
				else
					index

		Template.timelineYear.rendered = ->
			fview = FView.from(this)
			#log 'timelineYear!!!!',this

			target = fview.surface || fview.view._eventInput
			target.on('click', () ->
				log 'TARGET CLICKED',fview, target

				#if Session.equals 'timelineToggleTranslation', -10 then Session.set 'timelineToggleTranslation', -100 else Session.set 'timelineToggleTranslation', -10

				fview.modifier.halt()
				fview.modifier.setTransform Transform.translate(10, 10),
					method: 'spring'
					period: 1000
					dampingRatio: 0.3
			)

		Template.timelineYear.helpers
			year: ->
				instance = Template.instance()
				index = instance.data
				log 'timelineYear!!!!1',index
				#We have to use this as a workaround because the first result returned from an array is an object, not a 0.
				if typeof index is 'object'
					0
				else
					index


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

