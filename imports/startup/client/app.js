import { Meteor } from 'meteor/meteor'
import './routes';
import CreateApp from '/imports/ui/app.js'

Meteor.startup(() => {
  CreateApp()
})
