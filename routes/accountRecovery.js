var express = require('express');
var router = express.Router();
var _und = require('underscore');
var nodemailer = require("nodemailer");
var bcrypt = require('bcrypt');
var Random = require(__dirname+'/otros/Random');


router.get('/',function(req,res){
	res.render('accountRecovery');
});


router.post('/resetPassword/',function(req,res){

	var em = req.body.email;

	var db = req.db;

	var collection = db.get('users');

	collection.find({email:em})
	.success(function(docs){

		//Acá se dan las directivas para el envío de correo
		if(!_und.isEmpty(docs))
  		{
  			var salt;
			var hash;

			var rand = new Random();
			var rString = rand.randomString(10);

			
			do
			{
				salt = bcrypt.genSaltSync(10);
				hash = bcrypt.hashSync(rString, salt);

			}while(hash.indexOf("/") !== -1);



  			collection = db.get('keys');

  			collection.insert({email:em,key:hash,fecha:new Date()})
  			.success(function(){

  				var correo = "<h1>Approveit.biz</h1><p align=\"justify\">This email has been sent to reset your password. Please go to the following link: <a href=\"http://approveit.biz/passwordChange/"+hash+"\">http://approveit.biz/passwordChange/"+hash+"</a> and fill in the required fields. If you didn't ask for this change, just ignore this message.</p><br>Kind Regards,<br><br><h4>Approveit.biz</h4>";

	  			var smtpTransport = nodemailer.createTransport("SMTP",{
				   service: "Gmail",
				   auth: {
				       user: "federicohernandez.ve@gmail.com",
				       pass: "Apple9736"
				   }
				});

				smtpTransport.sendMail({
				   from: "Federico Hernandez <federicohernandez.ve@gmail.com>", // sender address
				   to: em, // comma separated list of receivers
				   subject: "Password Reset", // Subject line
				   html: correo // html message
				}, function(error, response){
				   if(error){
				       err = new Error('There has been an error. Please try again.');
		  				res.send(err.message);
				   }else{
				       res.send(response.message);
				   }
				});

  			})
  			.error(function(err){
  				err = new Error('There has been an error. Please try again.');
	  			res.send(err.message);
  			});

  		}
  		else
  		{
  			res.status(404);
  			err = new Error('This email is not registered in our database.');
	  		res.send(err.message);
  		}

	})
	.error(function(){
		err = new Error('There has been an error. Please try again.');
	  	res.send(err.message);
	});


});



module.exports = router;