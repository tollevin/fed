import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { 
	yesZips,
	MH,
	MH_20,
	zipZones
} from './zipcodes.js';

export const getZipZone = new ValidatedMethod({
  name: 'delivery.getZone',
  validate: new SimpleSchema({
    zip_code: { type: String },
  }).validator(),
  run({ zip_code }) {

  	var zone_id = '';

    for (var borough in zipZones) {
      var letters = zipZones[borough];
    	for (var letter in letters) {
    		var zips = letters[letter];
    		if (zips.includes(zip_code)) {
    			zone_id = borough + '-' + letter;
    		}
    	}
    };

		return zone_id;
  },
});