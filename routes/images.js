var express = require('express');
var _und = require('underscore');
var path = require('path');
var fs = require('fs');
var Buffer = require('buffer').Buffer
var router = express.Router();
var Random = require(__dirname+'/otros/Random');
var imageResize = require(__dirname+'/otros/imageResize'); //requires imagemagick installed
var gm = require('gm').subClass({ imageMagick: true }); //requires imagemagick --with-webp installed
var imagesFolder = path.normalize(__dirname+'/../images');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: imagesFolder+'/originals' });

/** AWS stuff **/
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-1'});
AWS.config.update({accessKeyId: 'AKIAIV3CIYUDA77CCVSA', secretAccessKey: '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'});


/* Servicio para subir las imágenes... */
router.post('/uploadImage/:key',multipartMiddleware, function(req, res, next) {

 
  		var key = req.params.key;

	  	var db = req.db;
		var collection = db.get('keys')

		collection.find({key:key})
	  	.success(function(docs){
	  		if(!_und.isEmpty(docs))
	  		{
	  			
		        var file = req.files.file;
				var nombreArchivo = path.basename(file.path);
				var rutaCompleta = file.path;

				var fileStream = fs.createReadStream(rutaCompleta);
				fileStream.on('error', function (err) {
				  if (err) { throw err; }
				});  
				fileStream.on('open', function () {
				  var s3 = new AWS.S3();
				  s3.putObject({
				    Bucket: 'approveitbucket/approveit/images/originals',
				    Key: nombreArchivo,
				    Body: fileStream
				  }, function (err) {
				    if (err) { throw err; }
				  });
				});
				


				//Acá se crea un thumbnail de la imagen y se envía su ruta completa al cliente
				
				imageResize(rutaCompleta,nombreArchivo,function(){				
					setTimeout(function(){
						var thumbnailRoute = imagesFolder+'/thumbnails/min'+nombreArchivo;
						fileStream = fs.createReadStream(thumbnailRoute);
						fileStream.on('error', function (err) {
						  if (err) { console.log(err); }
						});  
						fileStream.on('open', function () {
						  var s3 = new AWS.S3();
						  s3.putObject({
						    Bucket: 'approveitbucket/approveit/images/thumbnails',
						    Key: 'min'+nombreArchivo,
						    Body: fileStream
						  }, function (err) {
						    if (err) { throw err; }
						  });
						});
						res.send(nombreArchivo);
					},500);
				});

				/** After uploading to s3 the image and thumbnail they must be deleted **/

				setTimeout(function(){
					fs.unlink(rutaCompleta, function (err) {
					  	if(err) {
					        console.log(err);
					        res.status(404);
					    } else {
					        console.log("Image deleted");   
					    }
					});

					rutaCompleta = imagesFolder+'/thumbnails/min'+nombreArchivo;

					fs.unlink(rutaCompleta, function (err) {
					  	if(err) {
					        console.log(err);
					        res.status(404);
					    } else {
					        console.log("Thumbnail deleted");   
					    }
					});


				},15000);

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
	  	});

});


router.get('/downloadImage/:ruta/:key',function(req,res){

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys')

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			//Parámetro con el nombre de la foto que deseamos rescatar...
			var nombreArchivo = req.params.ruta;
			
			//Nombre de la ruta completa de la foto a rescatar...
			var rutaCompleta = 'approveitbucket/approveit/images/originals';


			  var s3 = new AWS.S3();
			  s3.getObject({
			    Bucket: rutaCompleta,
			    Key: nombreArchivo
			  }, function (err,data) {
			    if (err) { 
			    	console.log(err);
			    }
			    else
			    {
			    	//var cadena = data;
			    	//var buffer = new Buffer(cadena,'base64').toString('binary');
			    	//var rutaCompleta = imagesFolder+'/originals/popotito.jpg';
			    	//var fd = fs.openSync(rutaCompleta, 'w+');
			        //fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
			        //fs.closeSync(fd);

			        res.send(new Buffer(data.Body).toString('base64'));
			    }
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
  	});

});


/** Get thumbnail from disk and send to client **/


router.get('/downloadThumbnail/:ruta/:key',function(req,res){

	var key = req.params.key;


	var db = req.db;
	var collection = db.get('keys')

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			
  			//Nombre de la ruta completa de la foto a rescatar...
			var nombreArchivo = req.params.ruta;
			
			//Nombre de la ruta completa de la foto a rescatar...
			var rutaCompleta = 'approveitbucket/approveit/images/thumbnails';


			  var s3 = new AWS.S3();
			  s3.getObject({
			    Bucket: rutaCompleta,
			    Key: nombreArchivo
			  }, function (err,data) {
			    if (err) { 
			    	console.log(err);
			    }
			    else
			    {

			        res.send(new Buffer(data.Body).toString('base64'));
			    }
			  });
  		}
  		else
  		{
  			console.log('LA LLAVE NO COINCIDE CON NADA');
  			var err = Error('The key in use does not exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
  		console.log('ERRORCITO...');
  		res.send('There was an error. Please try again.');
  	});

});


router.get('/deleteImageAndThumbnail/:ruta/:key',function(req,res){

	var nombreArchivo = req.params.ruta;
	var rutaBucket = 'approveitbucket/approveit/images';
	var s3 = new AWS.S3();

	s3.deleteObject({
		Bucket:(rutaBucket+'/originals'),
		Key:nombreArchivo

	}, function(err, data) {
    	if (err){ 
    		console.log(err);
    	}
    	else{ 
    		console.log('image deleted');
    	}
    });

	s3.deleteObject({
		Bucket:(rutaBucket+'/thumbnails'),
		Key:'min'+nombreArchivo

	}, function(err, data) {
    	if (err){
    		console.log(err);
    	}
    	else{
    		console.log('thumbnail deleted');
    	}
    });


	res.send('images deleted');

});













/** SERVICIOS DE IMAGEN PARA APLICACIÓN MÓVIL **/



/* Servicio para subir las imágenes... */
router.post('/subirImagenTitanium', function(req, res, next) {


	var orient = req.body.orientation;
	console.log('ORIENT: '+orient);
	console.log('TYPEOF: '+(typeof orient));

	/** PARA GUARDAR LA IMAGEN **/

	
	var rand = new Random();
	var num = rand.randomNumber(5);
	var rString = rand.randomString(7);
	
	var nombreArchivo = num+'-'+rString+'.jpg';


	var cadena = req.body.imagen;
	var buffer = new Buffer(cadena,'base64').toString('binary');

	var rutaCompleta = imagesFolder+'/originals/'+nombreArchivo;

	var fileStream;
	var thumbnailRoute;


	fs.writeFile(rutaCompleta,buffer,'binary',function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        
	        console.log("Archivo guardado");

	        setTimeout(function(){
	        	fileStream = fs.createReadStream(rutaCompleta);
				fileStream.on('error', function (err) {
				  if (err) { console.log(err); }
				});  
				fileStream.on('open', function () {
				  var s3 = new AWS.S3();
				  s3.putObject({
				    Bucket: 'approveitbucket/approveit/images/originals',
				    Key: nombreArchivo,
				    Body: fileStream
				  }, function (err) {
				    if (err) { 
				    	console.log(err); 
				    }
				  });
				});
	        },500);
	    }
	});






	setTimeout(function(){
		switch(orient)
		{
			case 1:
				imageResize(rutaCompleta,nombreArchivo,function(){				
					setTimeout(function(){
						thumbnailRoute = imagesFolder+'/thumbnails/min'+nombreArchivo;
						fileStream = fs.createReadStream(thumbnailRoute);
						fileStream.on('error', function (err) {
						  if (err) { console.log(err); }
						});  
						fileStream.on('open', function () {
						  var s3 = new AWS.S3();
						  s3.putObject({
						    Bucket: 'approveitbucket/approveit/images/thumbnails',
						    Key: 'min'+nombreArchivo,
						    Body: fileStream
						  }, function (err) {
						    if (err) { 
						    	console.log(err); 
						    }
						  });
						});
					},500);
				});
			break;
			case 2:
				gm(rutaCompleta).rotate('green',90).write(rutaCompleta, function (err) {
			    	if (!err){
			    		imageResize(rutaCompleta,nombreArchivo,function(){				
							setTimeout(function(){
								thumbnailRoute = imagesFolder+'/thumbnails/min'+nombreArchivo;
								fileStream = fs.createReadStream(thumbnailRoute);
								fileStream.on('error', function (err) {
								  if (err) { console.log(err); }
								});  
								fileStream.on('open', function () {
								  var s3 = new AWS.S3();
								  s3.putObject({
								    Bucket: 'approveitbucket/approveit/images/thumbnails',
								    Key: 'min'+nombreArchivo,
								    Body: fileStream
								  }, function (err) {
								    if (err) { 
								    	console.log(err); 
								    }
								  });
								});
							},500);
						});
			    		console.log('Imagen rotada en 90');
			    	} 
				    else
				    {
				    	console.log(err);
				    } 
				});
			break;
			case 3:
				gm(rutaCompleta).rotate('green',180).write(rutaCompleta, function (err) {
			    	if (!err){
			    		imageResize(rutaCompleta,nombreArchivo,function(){				
							setTimeout(function(){
								thumbnailRoute = imagesFolder+'/thumbnails/min'+nombreArchivo;
								fileStream = fs.createReadStream(thumbnailRoute);
								fileStream.on('error', function (err) {
								  if (err) { console.log(err); }
								});  
								fileStream.on('open', function () {
								  var s3 = new AWS.S3();
								  s3.putObject({
								    Bucket: 'approveitbucket/approveit/images/thumbnails',
								    Key: 'min'+nombreArchivo,
								    Body: fileStream
								  }, function (err) {
								    if (err) { 
								    	console.log(err); 
								    }
								  });
								});
							},500);
						});
			    		console.log('Imagen rotada en 180');
			    	} 
				    else
				    {
				    	console.log(err);
				    } 
				});
			break;
			case 4:
				gm(rutaCompleta).rotate('green',270).write(rutaCompleta, function (err) {
			    	if (!err){
			    		imageResize(rutaCompleta,nombreArchivo,function(){				
							setTimeout(function(){
								thumbnailRoute = imagesFolder+'/thumbnails/min'+nombreArchivo;
								fileStream = fs.createReadStream(thumbnailRoute);
								fileStream.on('error', function (err) {
								  if (err) { console.log(err); }
								});  
								fileStream.on('open', function () {
								  var s3 = new AWS.S3();
								  s3.putObject({
								    Bucket: 'approveitbucket/approveit/images/thumbnails',
								    Key: 'min'+nombreArchivo,
								    Body: fileStream
								  }, function (err) {
								    if (err) { 
								    	console.log(err); 
								    }
								  });
								});
							},500);
						});
			    		console.log('Imagen rotada en 270');
			    	} 
				    else
				    {
				    	console.log(err);
				    } 
				});
			break;
		}
		
	},300);

	res.send(nombreArchivo);

});







/** Get thumbnail from disk and send to client **/

/**

router.get('/descargarThumbnail/:ruta',function(req,res){

	//Parámetro con el nombre de la foto que deseamos rescatar...
	var nombreArchivo = req.params.ruta;
	var key = req.params.key;


	var db = req.db;


	//Nombre de la ruta completa de la foto a rescatar...
	var nombreCompleto = (imagesFolder+'/thumbnails/'+nombreArchivo);


	
	fs.readFile(nombreCompleto, function (err, data) {
	  if (err)
	  { 
	  	res.send(err);
	  }
	  else	//res.writeHead(200, {'Content-Type': 'image/jpeg'});//res.write(Buffer(data).toString('base64'));	
	  {
	  	res.send(new Buffer(data).toString('base64'));
	  }
	});


});



router.get('/testingAws',function(req,res){

	var rutaCompleta = imagesFolder+'/originals/57026-ytz9ej5.jpg';

	var fileStream = fs.createReadStream(rutaCompleta);
	fileStream.on('error', function (err) {
	  if (err) { throw err; }
	});  
	fileStream.on('open', function () {
	  var s3 = new AWS.S3();
	  s3.putObject({
	    Bucket: 'approveitbucket/approveit/images/originals',
	    Key: 'caterina.jpg',
	    Body: fileStream
	  }, function (err) {
	    if (err) { throw err; }
	  });
	});

	res.send('it\'s working bitch!');
	
});



router.get('/testThumbnail',function(req,res){
	var rutaCompleta = imagesFolder+'/originals/popotito.jpg';	

	  var s3 = new AWS.S3();
	  s3.getObject({
	    Bucket: 'approveitbucket',
	    Key: 'caterina.jpg'
	  }, function (err,data) {
	    if (err) { 
	    	console.log(err);
	    }
	    else
	    {
	    	//var cadena = data;
	    	//var buffer = new Buffer(cadena,'base64').toString('binary');
	    	var rutaCompleta = imagesFolder+'/originals/popotito.jpg';
	    	var fd = fs.openSync(rutaCompleta, 'w+');
	        fs.writeSync(fd, data.Body, 0, data.Body.length, 0);
	        fs.closeSync(fd);
	    }
	  });


	res.send('it\'s working bitch!');
});


router.get('/testDelete',function(req,res){
	
	var nombreArchivo = '28588-1imv99n.jpg';
	var rutaBucket = 'approveitbucket/approveit/images/originals';
	var s3 = new AWS.S3();

	s3.deleteObject({
		Bucket:rutaBucket,
		Key:nombreArchivo

	}, function(err, data) {
    	if (err){ 
    		console.log('ERROR: '+err);
    		res.send('error')
    	}
    	else{ 
    		console.log('DONE!')
    		res.send('listoco');
    	}
    });
});

**/




module.exports = router;