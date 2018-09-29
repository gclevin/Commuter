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



router.get('/', (req, res) => {
  res.render('home.pug');
});

router.post('/', (req, res) => {
  if (req.body.modeOfTransportation == 'car') {
    res.redirect('/commuter/car');
  } else {
  	res.redirect('/commuter/transit');
  }
});

router.get('/car', (req, res) => {
  res.render('tripInformation.pug', {
	neighborhoods: [],
	travelMode: "Car",
    message: "",
    });
});

router.post('/car', function(req, res) {
 	let parameters = prepareParameters(req, "car");
 	let promises = createPromises(parameters);
 	
	Promise.all(promises).then(function(values){
		let toSend = values.filter(function(x){
        	return (x != null);
        });

		let message = "";
		if (!toSend.length) {
			message = "No neighborhoods fit your criteria."
		}
		res.render('tripInformation.pug', {
			neighborhoods: toSend,
			travelMode: "Car",
            message: message,
          });
	}).catch(function(error){
		res.render('tripInformation.pug', {
			neighborhoods: [],
			travelMode: "Car",
            message: error,
          });
	});

});

router.get('/transit', (req, res) => {
    res.render('tripInformation.pug', {
		neighborhoods: [],
		travelMode: "Public Transportation",
    	message: "",
    });
});

router.post('/transit', function(req, res) {

 	let parameters = prepareParameters(req, "transit");
 	let promises = createPromises(parameters);
 	
	Promise.all(promises).then(function(values){
		let toSend = values.filter(function(x){
        	return (x != null);
        });

        let message = "";
		if (!toSend.length) {
			message = "No neighborhoods fit your criteria."
		}

		res.render('tripInformation.pug', {
			neighborhoods: toSend,
			travelMode: "Public Transportation",
            message: message,
          });
	}).catch(function(error){
		res.render('tripInformation.pug', {
			neighborhoods: [],
			travelMode: "Public Transportation",
            message: error,
          });
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
        		if (body.rows[0].elements[0].status == "NOT_FOUND") {
        			reject("Invalid Address");
        		} else {
        			let tripDuration = body.rows[0].elements[0].duration.value;
          			if (parseInt(tripDuration) < maxTripLength) {
          				let toReturn = {neighborhood:neighborhood.neighborhood, city:neighborhood.city, duration:Math.round(tripDuration/60)};
          				resolve(toReturn);
          			} else {
          				resolve(null);
          			}
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

	  	let promise = createPromise(link, neighborhoodsDatabase[i], parameters.maxTripLength);
	  	promises.push(promise);
	}
	
	return promises;
}