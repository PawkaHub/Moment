Router.configure layoutTemplate: "layout"

Router.map ->
  @route "home",
    path: "/"
  @route "about"
  return

@log = ->
  log.history = log.history or [] # store logs to an array for reference
  log.history.push arguments
  console.log Array::slice.call(arguments)  if @console
  return

if Meteor.isClient
  # counter starts at 0
  Session.setDefault "counter", 0
  Template.layout.helpers
    counter: ->
      Session.get "counter"

  Template.layout.events "click button": ->
    # increment the counter when button is clicked
    Session.set "counter", Session.get("counter") + 1
    return

if Meteor.isServer
  Meteor.startup ->

