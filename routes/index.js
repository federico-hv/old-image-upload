var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var _und = require('underscore');
var Random = require(__dirname+'/otros/Random');
var html_dir = __dirname+'/../public/html/';


/* GET home page. */
router.get('/', function(req, res) {
  
	var rand = new Random();
	var cad = rand.randomString(10);

   	var salt;
	var hash;

	do
	{
		salt = bcrypt.genSaltSync(10);
		hash = bcrypt.hashSync(cad, salt);
		//console.log('PRUEBA: '+hash);

	}while(hash.indexOf("/") !== -1);

   res.render('index',{checks:0,keyUno:hash});
   

});


/** Esta ruta revisa los resultados de la consulta y abre el main **/

router.post('/open',function(req, res){
	

	/** Acá debe confirmarse la existencia del usuario. 
		Si existe debe crearse una colección temporal con un string largo y este string se envía al 
		cliente**/

	//var keyUno = req.params.keyUno;



	var em = req.body.email;
	var pass = req.body.password;

	var checks = parseInt(req.body.checks);

	var db = req.db;

	
	var collection = db.get('users');


	
	collection.find({},{})
	.success(function(docs){

		// Esta variable es para indicar que el correo existe y puede fallar en la contraseña 	
		var correoTrue = false;

		// Esta variable es para indicar que existe el usuario y se econtraron sus datos 
		var datosCorrectos = false;	


		for(i=0;i<docs.length;i++)
		{
			if(docs[i].email === em)
			{
				// El correo está registrado 
				correoTrue = true;

				if(bcrypt.compareSync(pass,docs[i].password))
				{
					// El usuario se identificó exitosamente 
					datosCorrectos = true;
					

					collection = db.get('attempts');

					collection.remove({email:em})
					.success(function(docs){
						
						collection = db.get('keys');


						var salt;
						var hash;
						
						do
						{
							salt = bcrypt.genSaltSync(10);
							hash = bcrypt.hashSync(em, salt);
							//console.log('PRUEBA: '+hash);

						}while(hash.indexOf("/") !== -1);


						collection.insert({email:em,key:hash,fecha:new Date()})
						.success(function(){


							var MobileDetect = require('mobile-detect'),
						    md = new MobileDetect(req.headers['user-agent']);

						  if(md.mobile()===null)
						  {	//res.sendFile('/opt/express-projects/serverDemo/views/prueba.html');
						  	res.render('main',{key:hash});
						  }
						  else
						  {
						  	res.render('main',{key:hash});
						  }

						})
						.error(function(){
							res.render('index',{checks:0});
						});

					})
					.error(function(err){
						res.render('index',{checks:0});
					})

				}
			}
		}

		
		
		if(datosCorrectos===false)
		{

			// Si el usuario existe y se equivocó 

			if(correoTrue)
			{
				collection = db.get('attempts');

				collection.find({email:em})
				.success(function(docs){
					var existe = false;

					for(i=0;i<docs.length;i++)
					{
						if(docs[i].email === em)
						{
							existe = true;
							var attempts = docs[i].attempts+1;
							collection.update({_id:docs[i]._id},{$set:{attempts:attempts}});

							res.render('index',{checks:parseInt(attempts)});		
						}
					}

					if(existe === false)
					{
						collection.insert({email:em,attempts:1,fecha:new Date()});
						res.render('index',{checks:1});
					}
				})
				.error(function(){
					console.log('Query error');
					res.render('index',{checks:0});
				});
			}
			else
			{
				collection = db.get('attempts');
				collection.insert({email:em,attempts:1,fecha:new Date()});
				res.render('index',{checks:0});	
			}	
		}

	})
	.error(function(err){
		res.render('index',{checks:'0'});
	});	
	


	//var salt = bcrypt.genSaltSync(10);
	//var hash = bcrypt.hashSync(user.password, salt);

	//bcrypt.compareSync(



	/**

	var MobileDetect = require('mobile-detect'),
    md = new MobileDetect(req.headers['user-agent']);

	  if(md.mobile()==null)
	  	//res.sendFile('/opt/express-projects/serverDemo/views/prueba.html');
	  	res.render('main');
	  else
	  	res.render('mainMobile');
		//res.render('indexMobile',{mensaje:'Este dispositivo es móvil'}); **/
		//res.render('main',{code:'popotito'});
	
});



router.delete('/deleteKey/:key',function(req,res){

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys')


	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection.remove({key:key})
  			.success(function(){
  				res.send('key has been deleted');
  			})
  			.error(function(err){
  				res.send(err);
  			});
  		}
  		else
  		{
			var err = Error('The key in use does not exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('There has been an error. Please try again.');
  		res.send(err.message);
  	})
});



/** MOBILE SERVICES **/


router.post('/openMobile',function(req,res){


	var em = req.body.email;
	var pass = req.body.password;

	//console.log('EMAIL: '+em);
	//console.log('PASS '+pass);


	var db = req.db;

	
	var collection = db.get('users');


	
	collection.find({},{})
	.success(function(docs){

		// Esta variable es para indicar que el correo existe y puede fallar en la contraseña 	
		var correoTrue = false;

		// Esta variable es para indicar que existe el usuario y se econtraron sus datos 
		var datosCorrectos = false;	


		for(i=0;i<docs.length;i++)
		{
			if(docs[i].email === em)
			{
				// El correo está registrado 
				correoTrue = true;

				if(bcrypt.compareSync(pass,docs[i].password))
				{
					// El usuario se identificó exitosamente 
					datosCorrectos = true;
					

					collection = db.get('attempts');

					collection.remove({email:em})
					.success(function(docs){
						
						collection = db.get('keys');


						var salt;
						var hash;
						
						do
						{
							salt = bcrypt.genSaltSync(10);
							hash = bcrypt.hashSync(em, salt);
							//console.log('PRUEBA: '+hash);

						}while(hash.indexOf("/") !== -1);


						collection.insert({email:em,key:hash,fecha:new Date()})
						.success(function(){


							var MobileDetect = require('mobile-detect'),
						    md = new MobileDetect(req.headers['user-agent']);

						  if(md.mobile()===null)
						  {	//res.sendFile('/opt/express-projects/serverDemo/views/prueba.html');
						  	//res.status(400);
						  	res.send('error');
						  }
						  else
						  {
						  	//res.status(200);
						  	res.send('successfulAuth');
						  }

						})
						.error(function(){
							//res.status(400);
							res.send('error');
						});

					})
					.error(function(err){
						//res.status(400);
						res.send('error');
					})

				}
			}
		}

		
		
		if(datosCorrectos===false)
		{

			// Si el usuario existe y se equivocó 

			if(correoTrue)
			{
				collection = db.get('attempts');

				collection.find({email:em})
				.success(function(docs){
					var existe = false;

					for(i=0;i<docs.length;i++)
					{
						if(docs[i].email === em)
						{
							existe = true;
							var attempts = docs[i].attempts+1;
							collection.update({_id:docs[i]._id},{$set:{attempts:attempts}});

							//res.status(400);
							res.send('error');		
						}
					}

					if(existe === false)
					{
						collection.insert({email:em,attempts:1,fecha:new Date()});
						//res.status(400);
						res.send('error');
					}
				})
				.error(function(){
					//res.status(400);
					res.send('error');
				});
			}
			else
			{
				collection = db.get('attempts');
				collection.insert({email:em,attempts:1,fecha:new Date()});
				//res.status(401);
				res.send('error');	
			}	
		}

	})
	.error(function(err){
		//res.status(400);
		res.send('error');
	});	

});








// RUTA MOMENTANEA PARA INGRESAR UNA CADENA Y RECIBIR UN PASSWORD HASHEADO

/**

router.get('/passHashed/:pass',function(req,res){
	
	var pass = req.params.pass;

	var salt;
	var hash;
	
	do
	{
		salt = bcrypt.genSaltSync(10);
		hash = bcrypt.hashSync(pass, salt);
		//console.log('PRUEBA: '+hash);

	}while(hash.indexOf("/") !== -1);

	res.send(hash);
});

**/




module.exports = router;
