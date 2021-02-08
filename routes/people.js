var express = require('express');
var router = express.Router();
var _und = require('underscore');
var app = require('../app');
var path = require('path');
var fs = require('fs');



/** CREATE **/

/* Add persona with the given object */

router.put('/addRecord/',function(req,res,err){


	var persona = req.body;


	var key = persona.key;
	delete persona.key;
	

	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			//Acá puede arreglarse el dato Date de las personas ya que debo poder realizar cálculos desde la base de datos
	
			var fecha = new Date(persona.birthDate);
			persona.birthDate = fecha;

			db = req.db;
			collection = db.get('persona');

			//Se realiza la consulta y esta retorna una promesa que puede ser de éxito o no...
			collection.insert(persona)	
			.success(function(){
				res.send('The document has been successfully saved.');
			})
			.error(function(err){
				err = new Error('Network or query error');
				res.send(err.message);
			});
  		}
  		else
  		{
			var err = Error('The key in use doesn\'t exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error in the connection');
  		res.send(err.message);
  	})


	//db.close();
});







/** READ **/

/* GET para consultar la lista de usuarios. */

router.get('/listPeople/:key', function(req, res, err) {

	var key = req.params.key;


  	
  	var db = req.db;

  	var collection = db.get('keys');

  	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
        collection = db.get('persona');
  	
  		  	collection.find({},{})
  			.success(function(docs){
  				res.json(docs);
  			})
  			.error(function(err){
  				err = new Error('Network or query error.');
  				res.status(404);
          res.send(err.message);
  			});
  		}
  		else
  		{
  			var err = Error('The key in use doesn\'t exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.status(404);
        res.send(err.message);
  		}
  		
  	})
  	.error(function(err){
  		err = new Error('Error in the connection');
  		res.status(404);
      res.send(err.message);
  	});

  	
  	


	//La conexión debe cerrarse una vez utilizada...
	//db.close();
});



/** GET para consultar una persona por su rut **/

router.get('/personById/:chileanId/:key', function(req, res, err){
	
	var db = req.db;
	var rut = req.params.chileanId;

	var key = req.params.key;

	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection = db.get('persona');

		  	collection.find({chileanId:rut})
			.success(function(docs){
				//console.log(docs[0].nombre);
				console.log('The query by Chilean Id Was Successfull');
				res.json(docs);
			})
			.error(function(err){
				err = new Error('There was an error in the connection or the query');
				res.send(err.message);
			});

  		}
  		else
  		{
  			var err = Error('The key in use doesn\'t exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
  		err = new Error('Error in the connection');
  		res.send(err.message);
  	});

});




/** UPDATE **/

/* Update persona with the given object */

router.post('/updateRecord/',function(req,res){

	

	var persona = req.body;
	var id = persona._id;


	var key = persona.key;
	delete persona.key;

  	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{

        //var fecha = new Date(persona.birthDate);
        //persona.birthDate = fecha;
  			collection = db.get('persona');

			 //Revisar la función callback
  			collection.update({_id:id},{$set:persona})
  			.success(function(){
  				res.send('The document has been successfully updated.');
  			})
  			.error(function(err){
  				err = new Error('There was an error in the connection or the query.');
  				res.send(err.message);
  			});
  		}
  		else
  		{
			var err = Error('The key in use doesn\'t exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error in the connection');
  		res.send(err.message);
  	})

	//db.close();
});




/** DELETE **/

/* Delete persona with the given id */

router.delete('/deleteRecord/:id/:key',function(req,res, err){

	var id = req.params.id;


	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys');

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  			collection = db.get('persona');
	
			collection.remove({_id:id})
		   	.success(function(result){
				res.send('The document has been successfully deleted.');
			})
			.error(function(err){
				err = new Error('There was an error in the connection or the query.');
				res.send(err.message);
			});
  		}
  		else
  		{
			var err = Error('The key in use doesn\'t exist. Please log in again <a href="http://approveit.biz">Go back</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error in the connection');
  		res.send(err.message);
  	})
	

	

	//db.close();
});



/**

	var key = req.params.key;

  	var db = req.db;
	var collection = db.get('keys')

	collection.find({key:key})
  	.success(function(docs){
  		if(!_und.isEmpty(docs))
  		{
  		}
  		else
  		{
			var err = Error('La llave utilizada no existe. Por favor vuelva a autenticarse <a href="http://localhost">volver</a>');
  			res.send(err.message);
  		}
  	})
  	.error(function(){
		err = new Error('Error en la conexión');
  		res.send(err.message);
  	})

**/





/** MOBILE SERVICES **/

/** CREATE **/

/* Add persona with the given object */

router.put('/agregarPersonaTitanium/',function(req,res,err){

  var persona = req.body;

  var db = req.db;

  var imagesFolder = __dirname+'/../images';
  var nombreArchivo = persona.imageRoute;




  //Nombre de la ruta completa de la foto a rescatar...
  var nombreCompleto = path.normalize(imagesFolder+'/thumbnails/min'+nombreArchivo);
  
  //Acá puede arreglarse el dato Date de las personas ya que debo poder realizar cálculos desde la base de datos
  
  var cadenaFec = persona.birthDate.toString().substring(0,10);

  var fecha = new Date(persona.birthDate);
  persona.birthDate = fecha;

  persona.age = parseInt(persona.age);


  

  var db = req.db;
  var collection = db.get('persona');


  //Se realiza la consulta y esta retorna una promesa que puede ser de éxito o no...
  collection.insert(persona)  
  .success(function(){
    res.send('The document has been recorded successfully.');
    //persona.birthDate = persona.birthDate.substring(0,10);
    if(persona.smoker)
    {
      persona.smoker = 'yes';
    }
    else
    {
      persona.smoker = 'no';
    }

    persona.birthDate = cadenaFec;

     setTimeout(function(){
        fs.readFile(nombreCompleto, function (err, data) {
          if (err)
          { 
            console.log('ERROR READING THUMBNAIL');
            persona.image = '';
          }
          else  //res.writeHead(200, {'Content-Type': 'image/jpeg'});//res.write(Buffer(data).toString('base64'));  
          {
            console.log('NO ERROR READING THE FILE')
            persona.image = 'data:image/jpeg;base64,'+(new Buffer(data).toString('base64'));
            app.sumarPersona(persona);

            setTimeout(function(){
              fs.unlink(nombreCompleto, function (err) {
                  if(err) {
                      console.log(err);
                      res.status(404);
                  } else {
                      console.log("Thumbnail deleted");   
                  }
              });

              nombreCompleto = path.normalize(imagesFolder+'/originals/'+nombreArchivo);

              fs.unlink(nombreCompleto, function (err) {
                  if(err) {
                      console.log(err);
                      res.status(404);
                  } else {
                      console.log("Image deleted");   
                  }
              });
            },15000);
          }
        });
     },1000);  
  })
  .error(function(err){
    err = new Error('There was an error in the connection or the query.');
    res.send(err.message);
  });

  //db.close();
});




/** GET para consultar una persona por su rut 

router.get('/personaPorRutTitanium/:rut', function(req, res, err){


    var rut = req.params.rut;



    var db = req.db;
  
    var collection = db.get('persona');

    collection.find({rut:rut})
    .success(function(docs){
      //console.log(docs[0].nombre);
      console.log('la consulta de persona por Rut se realizó con éxito');
      res.json(docs);
    })
    .error(function(err){
      err = new Error('There was an error in the connection or the query.');
      res.send(err.message);
    });


}); **/




module.exports = router;



