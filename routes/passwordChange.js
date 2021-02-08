var express = require('express');
var router = express.Router();
var _und = require('underscore');
var bcrypt = require('bcrypt');


router.get('/:key',function(req,res){

	var paramKey = req.params.key;
	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:paramKey})
	.success(function(docs){
		if(!_und.isEmpty(docs))
		{
			res.render('passwordChange',{key:paramKey});
		}
		else
		{
			res.render('error');
		}
	})
	.error(function(err){
		res.send('There was an error in the query. Please try again.');
	});

});


router.post('/changePassword/:key/',function(req,res){
	var paramKey = req.params.key;
	var newPass = req.body.pass1;
	var db = req.db;
	var collection = db.get('keys');

	

	collection.find({key:paramKey})
	.success(function(docs){
		if(!_und.isEmpty(docs))
		{
			var salt;
			var hash;
			
			do
			{
				salt = bcrypt.genSaltSync(10);
				hash = bcrypt.hashSync(newPass, salt);

			}while(hash.indexOf("/") !== -1);


			collection = db.get('users');
			collection.update({email:docs[0].email},{$set:{password:hash}})
			.success(function(docs){
				collection = db.get('keys');
				collection.remove({key:paramKey})
				.success(function(){
					res.send('success');
				})
				.error(function(){
					err = new Error('There was an error. Please try again.');
  					res.send(err.message);
				});
			})
			.error(function(err){
				err = new Error('There was an error. Please try again.');
  				res.send(err.message);
			});
		}
		else
		{
			err = new Error('There was an error. Please try again.');
  			res.send(err.message);
		}
	})
	.error(function(err){
		err = new Error('There was an error. Please try again.');
  		res.send(err.message);
	});

});




module.exports = router;