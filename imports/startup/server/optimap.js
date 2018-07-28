import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.methods({

  testOptimap () {
    // << JSON form (if api reports application/json as the content-type header
    return HTTP.get('http://gebweb.net/optimap/index.php?loc0=1302%20STAFFORD%20ST%20N,%20ARLINGTON,%20VA%2022201&loc1=4334%20HENDERSON%20RD%20N,%20ARLINGTON,%20VA%2022203&loc2=1922%20MADISON%20ST,%20ARLINGTON,%20VA%2022205');
  },
});
