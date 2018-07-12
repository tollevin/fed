import { HTTP } from 'meteor/http';
import moment from 'moment';

key = 'AIzaSyCFc9ReT6fI0UWG8Wip3NTgNRvu_Sr5uKM';

Meteor.methods({

  testMaps () {
    const result = HTTP.get('http://gebweb.net/optimap/index.php?loc0=1302%20STAFFORD%20ST%20N,%20ARLINGTON,%20VA%2022201&loc1=4334%20HENDERSON%20RD%20N,%20ARLINGTON,%20VA%2022203&loc2=1922%20MADISON%20ST,%20ARLINGTON,%20VA%2022205');

    console.log(result.content);
    return result.data; // << JSON form (if api reports application/json as the content-type header
  },
});
