/** Este componente crea los thumbnails de las imágenes ingresadas +*/
var path = require('path');
var imagesFolder = path.normalize(__dirname+'/../../images');
var sizeOf = require('image-size');
var easyimg = require('easyimage');

var imageResize = function(rutaCompleta,nombreArchivo,callback){
	//Objeto que trae el largo y ancho de la foto para hacerle un resize...
	var style = sizeOf(rutaCompleta);
	var anchoOriginal = style.width;
    var altoOriginal = style.height;
    var anchoDeseado = 80; 
    var altoDeseado = parseInt((altoOriginal*anchoDeseado)/anchoOriginal);
    var destino = path.normalize(__dirname+'/../../images/thumbnails/min'+nombreArchivo);
    console.log('DESTINOOOOO: '+destino);

    easyimg.resize({src:rutaCompleta, dst:destino, width:anchoDeseado, height:altoDeseado}, function(err, stdout, stderr) {
	    if (err) throw err;
	});

	if(callback){
		callback();
	}
};

module.exports = imageResize;