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
						#log 'Connected to session!'
						if session.capabilities.publish is 1
							#log 'User is capable of publishing!',session.capabilities
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
			epoch = TimeSync.serverTime()
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
			#log 'minutes',minutes
			minutes
		Template.registerHelper 'days', ->
			epoch = TimeSync.serverTime()
			day = moment(epoch)
			currentDay = day.day()
			daysInAMonth = 31
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
			monthsInAYear = 40
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
			yearsSinceEpoch = 40
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

		#Template.views_Scrollview.rendered = ->
		#	log 'SCROLLVIEW RENDERED'

		Template.about.rendered = ->
			#log 'ABOUT RENDERED',this
			fview = FView.from(this)
			#log 'ABOUT FVIEW',fview
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
				#timelineMinuteScroller.setPosition(400)
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
					#log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentMinute - previousMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '##############currentMinute distance from previousMinute##############',scrollDistance
					for i in [0..scrollDistance]
						window.timelineMinuteScroller.goToNextPage()
				else if previousMinute < amountMidPoint and currentMinute > amountMidPoint
					#log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousMinute - currentMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '@@@@@@@@@@@@@@currentMinute distance from previousMinute@@@@@@@@@@@@@@',scrollDistance
					for i in [0..scrollDistance]
						window.timelineMinuteScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					#log 'Just scroll as normal!'
					scrollDistance = previousMinute - currentMinute
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousMinute < currentMinute
						#log '!!!!!!!!!!!!!currentMinute distance from previousMinute!(forwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineMinuteScroller.goToNextPage()
					else
						#log '!!!!!!!!!!!!currentMinute distance from previousMinute!(backwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineMinuteScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
			)

		Template.timelineMinuteScroller.helpers
			timelineMinuteStyles: ->
				#backgroundColor: '#000000'
				textAlign: 'center'
				color: '#ffffff'

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
				#log 'TIMELINE MINUTE CLICKED',fview, target, this, self
				#Get the current index at point of click
				#Session.set('currentMinute',data.index)
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
					#log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentDay - previousDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '##############currentDay distance from previousDay##############',scrollDistance
					for i in [0..scrollDistance]
						window.timelineDayScroller.goToNextPage()
				else if previousDay < amountMidPoint and currentDay > amountMidPoint
					#log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousDay - currentDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '@@@@@@@@@@@@@@currentDay distance from previousDay@@@@@@@@@@@@@@',scrollDistance
					for i in [0..scrollDistance]
						window.timelineDayScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					#log 'Just scroll as normal!'
					scrollDistance = previousDay - currentDay
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousDay < currentDay
						#log '!!!!!!!!!!!!!currentDay distance from previousDay!(forwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineDayScroller.goToNextPage()
					else
						#log '!!!!!!!!!!!!currentDay distance from previousDay!(backwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineDayScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
			)

		Template.timelineDayScroller.helpers
			timelineDayStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'

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
					#log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentMonth - previousMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '##############currentMonth distance from previousMonth##############',scrollDistance
					for i in [0..scrollDistance]
						window.timelineMonthScroller.goToNextPage()
				else if previousMonth < amountMidPoint and currentMonth > amountMidPoint
					#log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousMonth - currentMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '@@@@@@@@@@@@@@currentMonth distance from previousMonth@@@@@@@@@@@@@@',scrollDistance
					for i in [0..scrollDistance]
						window.timelineMonthScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					#log 'Just scroll as normal!'
					scrollDistance = previousMonth - currentMonth
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousMonth < currentMonth
						#log '!!!!!!!!!!!!!currentMonth distance from previousMonth!(forwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineMonthScroller.goToNextPage()
					else
						#log '!!!!!!!!!!!!currentMonth distance from previousMonth!(backwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineMonthScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
			)

		Template.timelineMonthScroller.helpers
			timelineMonthStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'

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
					#log '***************We\'re gonna overscroll past 0 here!*******(forwards)'
					#Calculate the forwards sroll distance
					scrollDistance = totalAmount + currentYear - previousYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '##############currentYear distance from previousYear##############',scrollDistance
					for i in [0..scrollDistance]
						window.timelineYearScroller.goToNextPage()
				else if previousYear < amountMidPoint and currentYear > amountMidPoint
					#log '%%%%%%%%%%%%%%%We\'re gonna overscroll past 1439 here!%%%%%(backwards)'
					#Calculate the backwards scroll distance
					scrollDistance = totalAmount + previousYear - currentYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					#log '@@@@@@@@@@@@@@currentYear distance from previousYear@@@@@@@@@@@@@@',scrollDistance
					for i in [0..scrollDistance]
						window.timelineYearScroller.goToPreviousPage()
				else
					#No overlaps going on here, just scroll normally to get things going for the time being, I can optimize this last.
					#log 'Just scroll as normal!'
					scrollDistance = previousYear - currentYear
					if scrollDistance < 0 then scrollDistance = scrollDistance * -1 #Make sure that scrollDistance is always a positive number
					if previousYear < currentYear
						#log '!!!!!!!!!!!!!currentYear distance from previousYear!(forwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineYearScroller.goToNextPage()
					else
						#log '!!!!!!!!!!!!currentYear distance from previousYear!(backwards)!!!!',scrollDistance
						for i in [0..scrollDistance]
							window.timelineYearScroller.goToPreviousPage()

				#Get the Template instance
				instance = Template.instance()
				#log 'AUTORUN INSTANCE',instance
			)

		Template.timelineYearScroller.helpers
			timelineYearStyles: ->
				#backgroundColor: '#000000'
				color: '#ffffff'

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

		Template.timelineYear.helpers
			year: ->
				this

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

