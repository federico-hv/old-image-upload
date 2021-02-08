var express = require('express');
var router = express.Router();
var _und = require('underscore');


router.get('/occupations',function(req,res){
	
	var db = req.db;

	var collection = db.get('occupations');

	collection.find({},{})
	.success(function(docs){
	 	res.json(docs);
	})
	.error(function(err){
	 	res.send(err);
	});
});

router.get('/maritalStatuses',function(req,res){
	
	var db = req.db;

	var collection = db.get('maritalStatus');

	collection.find({},{})
	.success(function(docs){
	 	res.json(docs);
	})
	.error(function(err){
	 	res.send(err);
	});
});





module.exports = router;