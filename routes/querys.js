var express = require('express');
var router = express.Router();
var _und = require('underscore');






router.get('/smokersVsNonsmokers/:key', function(req, res) {
	 

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection = db.get('persona');

			 collection.count({smoker:true})
			 .success(function(docs){
			 	var smkrs = docs
			 	collection.count({smoker:false})
			 	.success(function(docs){
			 		var nonSmkrs = docs;
			 		res.json({smokers:smkrs,nonSmokers:nonSmkrs});
			 	})
			 	.error(function(err){
			 		res.send(err);
			 	});
			 })
			 .error(function(err){
			 	res.send(err);
			 });
  		}
  		else
  		{
			var err = Error('The key you used does not exist. Please log in again <a href="http://appproveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error in the connection');
  		res.send(err.message);
  	})

});












/**  Ruta que devuelve el total de fumadores **/

router.get('/smokersByGender/:key', function(req, res) {
	 

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection = db.get('persona');

			 collection.count({smoker:true,gender:'m'})
			 .success(function(docs){
			 	var menDocs = docs
			 	collection.count({smoker:true,gender:'f'})
			 	.success(function(docs){
			 		var womenDocs = docs;
			 		res.json({men:menDocs,women:womenDocs});
			 	})
			 	.error(function(err){
			 		res.send(err);
			 	});
			 })
			 .error(function(err){
			 	res.send(err);
			 });
  		}
  		else
  		{
			var err = Error('The key you used does not exist. Please log in again <a href="http://appproveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error in the connection');
  		res.send(err.message);
  	})

});






/** Ruta que devuelve los fumadores por rangos de edad **/


router.get('/smokersByAgeRange/:key', function(req, res) {

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection = db.get('persona');

  			collection.count({smoker:true,age:{$gte:11,$lte:20}})
			 .success(function(docs){
			 	var prim = docs;
			 	
			 	collection.count({smoker:true,age:{$gte:21,$lte:30}})
			 	.success(function(docs){
			 		var seg = docs;

			 		collection.count({smoker:true,age:{$gte:31,$lte:40}})
				 	.success(function(docs){
				 		var ter = docs;

				 		collection.count({smoker:true,age:{$gte:41,$lte:50}})
					 	.success(function(docs){
					 		var cuar = docs;
					 		
					 		collection.count({smoker:true,age:{$gte:51,$lte:60}})
						 	.success(function(docs){
						 		var quin = docs;

						 		res.json({firstRange:prim,secondRange:seg,thirdRange:ter,fourthRange:cuar,fifthRange:quin});
						 		
						 	})
						 	.error(function(err){
						 		res.send(err);
						 	});
					 	})
					 	.error(function(err){
					 		res.send(err);
					 	});
				 		
				 	})
				 	.error(function(err){
				 		res.send(err);
				 	});
			 		
			 	})
			 	.error(function(err){
			 		res.send(err);
			 	});
			 })
			 .error(function(err){
			 	res.send(err);
			 });
  		}
  		else
  		{
			var err = Error('The key you used does not exist. Please log in again <a href="http://approveit.biz">volver</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('There has been an error. Please try again');
  		res.send(err.message);
  	})

});






















module.exports = router;