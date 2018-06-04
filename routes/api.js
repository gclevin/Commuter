const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Toy Database
let neighborhoodsDatabase = [ {neighborhood:"Westwood", city:"Los Angeles"},
							  {neighborhood:"Studio City", city:"Los Angeles"}];

function get(link, neighborhood, maxTripLength) {
	console.log(neighborhood);
	return new Promise (function(resolve, reject) {
	 	request({
        	url: link,
        	json: true
      	}, function (error, response, body) {
        	if (!error && response.statusCode === 200) {
          		let tripDuration = body.rows[0].elements[0].duration.value;
          		if (parseInt(tripDuration) < maxTripLength) {
          			let toReturn = {neighborhood:neighborhood.neighborhood, city:neighborhood.city, duration:tripDuration};
          			resolve(toReturn);
          		} else {
          			resolve(null);
          		}
        	} else {
        		reject(error);
        	}
      	});   
	})
}

router.get('/get/:destination/:maxTripLength/:arrivalTime', function(req, res, next) {

	//Prepare and calculate parameters
	let maxTripLength = req.params.maxTripLength*60;
	let destination = req.params.destination;
	let arrivalTime = req.params.arrivalTime;
	let date = new Date();
    date.setDate(date.getDate() + (1 + 7 - date.getDay()) % 7);
    date.setHours( arrivalTime,0,0,0 );
   
	let promises = [];
	for (var i = 0; i < neighborhoodsDatabase.length; i++) {
    	let link = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + neighborhoodsDatabase[i].neighborhood + neighborhoodsDatabase[i].city + '&destinations=' + destination + 'arrival_time=' + date.getTime() + '&key=AIzaSyBBAXXISm2tD5pvEYg132Zaezu7zZt-rl0';
      	// let link = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=3522+greenfield+ave.+los+angeles&destinations=' + neighborhoodsDatabase[i] + 'arrival_time=1528128000&key=AIzaSyBBAXXISm2tD5pvEYg132Zaezu7zZt-rl0';

	  	let promise = get(link, neighborhoodsDatabase[i], maxTripLength);
	  	promises.push(promise);
	}
	
	Promise.all(promises).then(function(values){
		let toSend = values.filter(function(x){
        	return (x != null);
        });
		res.json(toSend);
	}).catch(function(error){
		res.json(error);
	});
});

module.exports = router;