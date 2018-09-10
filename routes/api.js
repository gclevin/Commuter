const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Toy Database
let neighborhoodsDatabase = [ {neighborhood:"Westwood", city:"Los Angeles"},
							  {neighborhood:"Studio City", city:"Los Angeles"},
							  {neighborhood:"Venice", city:"Los Angeles"}];


router.post('/car', function(req, res) {

 	let parameters = prepareParameters(req, "car");
 	let promises = createPromises(parameters);
 	
	Promise.all(promises).then(function(values){
		let toSend = values.filter(function(x){
        	return (x != null);
        });
		res.json(toSend);
	}).catch(function(error){
		res.json(error);
	});

});

router.post('/transit', function(req, res) {

 	let parameters = prepareParameters(req, "transit");
 	let promises = createPromises(parameters);
 	
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

//Utility Methods

function createPromise(link, neighborhood, maxTripLength) {
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

function prepareParameters(req, travelMode) {
	let parameters = {};

	parameters.maxTripLength = req.body.maxTripLength*60;
	parameters.destination = req.body.destination;
	parameters.arrivalTime = req.body.arrivalTime;
	parameters.travelMode = travelMode;

	let date = new Date();
    date.setDate(date.getDate() + (1 + 7 - date.getDay()) % 7);
    date.setHours( parameters.arrivalTime,0,0,0 );
    parameters.date = date;


    return parameters;
}

function createPromises(parameters) {
	let promises = [];
	for (var i = 0; i < neighborhoodsDatabase.length; i++) {
		let link = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + neighborhoodsDatabase[i].neighborhood + neighborhoodsDatabase[i].city + '&destinations=' + parameters.destination + 'arrival_time=' + parameters.date.getTime() + '&mode=' + parameters.travelMode + '&key=AIzaSyBBAXXISm2tD5pvEYg132Zaezu7zZt-rl0';
      	// let link = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=3522+greenfield+ave.+los+angeles&destinations=' + neighborhoodsDatabase[i] + 'arrival_time=1528128000&key=AIzaSyBBAXXISm2tD5pvEYg132Zaezu7zZt-rl0';

	  	let promise = createPromise(link, neighborhoodsDatabase[i], parameters.maxTripLength);
	  	promises.push(promise);
	}
	
	return promises;
}