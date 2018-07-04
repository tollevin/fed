import { Meteor } from 'meteor/meteor'
import CreateApp from '/imports/ui/app.js'

Meteor.startup(() => {
  CreateApp()
})
