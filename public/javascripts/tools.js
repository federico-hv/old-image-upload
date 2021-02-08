
var app = angular.module("prueba",[]);


app.controller("controladorUno",['$scope', '$http','$timeout', 'servicios','$window',function controlador($scope, $http, $timeout, servicios, $window) {
    

    $scope.people = [];
    $scope.persona = {};
    $scope.newRecord = {};
    $scope.currentView = 'infoView'; //Esta variable guarda el firstname de la vista principal (encuestas)
    $scope.seeMenu = 'mostrar';
    $scope.seePeople = 'mostrar';
    $scope.seeCharts = 'mostrar';
    $scope.newRecordTable = 'mostrar';
    $scope.updatePerson = 'mostrar';
    $scope.seeImage = 'mostrar';
    $scope.seeMap = 'mostrar';
    $scope.seeInfo = 'mostrar';
    $scope.position = {coords:{latitude:null,longitude:null}};
    $scope.imageDetailStyle = {};
    $scope.chartsLoaded = false;
    $scope.newRecord.age = 0;
    $scope.showLoader = false;
    $scope.goMain = false;
    $scope.occupations = [];
    $scope.maritalStatuses = [];

    /** This variable contains all the possible filters for the records **/
    $scope.order = ['lastname','firstname','chileanId','birthDate','age','occupation','email','gender','address','telephone','maritalStatus','smoker'];


    //Tanto sexo como estadoCivil podrían venir desde la base de datos en colecciones
    $scope.gender = ['m','f'];
    //Se dejan estos valores del modelo nuevo por defecto para sacar los espacios blancos del select.
    $scope.setearSelect = function(){
        $scope.newRecord.gender = $scope.gender[0];
        
        var defaultDate = new Date();
        defaultDate = defaultDate.toISOString();

        $scope.newRecord.birthDate = defaultDate.substring(0,10);

        //var fec = document.getElementById('inputFechaNac');
        //fec.setAttribute('max',defaultDate.substring(0,10));


        $http.get('/clientLoader/occupations')
        .success(function(data){
           angular.forEach(data,function(value,index){
                $scope.occupations.push(value.enVal);
           });
           $scope.newRecord.occupation = $scope.occupations[0];
        })
        .error(function(err){
            $window.alert('Unable to load occupations. Please reload the site.');
        });

        $http.get('/clientLoader/maritalStatuses')
        .success(function(data){
           angular.forEach(data,function(value,index){
                $scope.maritalStatuses.push(value.state);
                //console.log(value.state);
           });
           $scope.newRecord.maritalStatus = $scope.maritalStatuses[0]; 
        })
        .error(function(err){
            $window.alert('Unable to load marital statuses. Please reload the site.');
        });

           

    };
    $scope.setearSelect();


    //Variable de bloqueo del botón de datos
    $scope.btnEnviar = true;

    //Variable para validar el rut
    $scope.chileanIdPattern = /^([1-9]{0,1}[0-9]{1})\.[0-9]{3}\.[0-9]{3}\-[0-9kK]{1}$/;

    //Variable para validar teléfono
    $scope.telephonePattern = /^\+?\d{1,3}?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$/;

    //Variable para validar el email
    $scope.emailPattern = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/;

    //Variable para validar fecha con años bisiestos en formato dd/mm/yyyy o dd.mm.yyyy
    //$scope.datePattern = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/; 

    
    //ESTE PATRÓN ES MUY PENCA DEBO ARREGLAR EL DE ARRIBA Y REUTILIZARLO CON LA FECHA FORMATO ISO
    //Variable para validar fecha con años bisiestos en formato yyyy/mm/dd que es el formato ISO para fechas -> Importante!!!
    $scope.datePattern = /((([0-9][0-9][0-9][1-9])|([1-9][0-9][0-9][0-9])|([0-9][1-9][0-9][0-9])|([0-9][0-9][1-9][0-9]))-((0[13578])|(1[02]))-((0[1-9])|([12][0-9])|(3[01])))|((([0-9][0-9][0-9][1-9])|([1-9][0-9][0-9][0-9])|([0-9][1-9][0-9][0-9])|([0-9][0-9][1-9][0-9]))-((0[469])|11)-((0[1-9])|([12][0-9])|(30)))|(((000[48])|([0-9]0-9)|([0-9][1-9][02468][048])|([1-9][0-9][02468][048])|([0-9]0-9)|([0-9][1-9][13579][26])|([1-9][0-9][13579][26]))-02-((0[1-9])|([12][0-9])))|((([0-9][0-9][0-9][1-9])|([1-9][0-9][0-9][0-9])|([0-9][1-9][0-9][0-9])|([0-9][0-9][1-9][0-9]))-02-((0[1-9])|([1][0-9])|([2][0-8])))$/;


    $scope.onlyLowerCase = function(nuevo,atributo){
        if(atributo === 'firstname')
            $scope.newRecord.firstname = $scope.newRecord.firstname.toLowerCase();
        else if(atributo === 'lastname')
            $scope.newRecord.lastname = $scope.newRecord.lastname.toLowerCase();
        else if(atributo === 'occupation')
            $scope.newRecord.occupation = $scope.newRecord.occupation.toLowerCase();
        else if(atributo === 'address')
            $scope.newRecord.address = $scope.newRecord.address.toLowerCase();

    };

    //Este algoritmo calcula la edad en base a la fecha ingresada y la fecha actual

    $scope.calculateAge = function(x){

        var fecha = x.birthDate;



        // Si la fecha es correcta, calculamos la edad
        var values=fecha.split("-");
        var dia = values[2];
        var mes = values[1];
        var ano = values[0];

        // cogemos los valores actuales
        var fecha_hoy = new Date();
        var ahora_ano = fecha_hoy.getYear();
        var ahora_mes = fecha_hoy.getMonth()+1;
        var ahora_dia = fecha_hoy.getDate();
        
        // realizamos el calculo
        var edad = (ahora_ano + 1900) - ano;
        if ( ahora_mes < mes )
        {
            edad--;
        }
        if ((mes == ahora_mes) && (ahora_dia < dia))
        {
            edad--;
        }
        if (edad > 1900)
        {
            edad -= 1900;
        }

        // calculamos los meses
        var meses=0;
        if(ahora_mes>mes)
            meses=ahora_mes-mes;
        if(ahora_mes<mes)
            meses=12-(mes-ahora_mes);
        if(ahora_mes==mes && dia>ahora_dia)
            meses=11;

        // calculamos los dias
        var dias=0;
        if(ahora_dia>dia)
            dias=ahora_dia-dia;
        if(ahora_dia<dia)
        {
            ultimoDiaMes=new Date(ahora_ano, ahora_mes, 0);
            dias=ultimoDiaMes.getDate()-(dia-ahora_dia);
        }

        if(edad>0)
        {
            x.age = edad;
        }

    };

    /** This function gives automatic format to the value entered in the id field (called RUT in Chile) **/

    $scope.formatearRut = function(objeto){
        
        var valor = objeto.chileanId;

        //Esta variable tiene el último valor ingresado
        var ultimo = valor.substring(valor.length-1,valor.length);
        //Las siguientes variables crean arreglos de los valores permitidos
        var numeros = '0123456789';
        var caracteres = '0123456789-Kk.';
        var caracteresEsp = '-Kk.';
        var arrayValor = valor.split('');
        var nuevo;
        var nuevoValor;

        //Estas líneas cuentan la cantidad de guiones en el valor entregado
        var cuentaGuion = 0;
        for(i=0;i<arrayValor.length;i++)
        {
            if(arrayValor[i] === '-')
            {
                cuentaGuion++;
            }
        }

        var cuentaK = 0;
        for(i=0;i<arrayValor.length;i++)
        {
            if(arrayValor[i] === 'K' || arrayValor[i] === 'k')
            {
                cuentaK++;
            }
        }

        var cuentaPuntos = 0;
        for(i=0;i<arrayValor.length;i++)
        {
            if(arrayValor[i] === '.')
            {
                cuentaPuntos++;
            }
        }

       //Entra al if si el rut no tiene los 12 caracteres aún
        if(valor.length <= 12)
        { 
            //Si el último valor ingresado no está entre los caracteres se envía una alerta y se elimina
            if(caracteres.indexOf(ultimo)!==-1)
            {
                //Este primer if impide el 0 si es que se puso como caracter inicial
                if(valor.length === 1 && valor.substring(0,1)==='0')
                {
                    objeto.chileanId = '';
                }

                //Entra al if si se ingresó un número
                if(caracteresEsp.indexOf(ultimo)===-1)
                {
                        //Si el rut ya cuenta con dos números se agrega un punto y se inserta el siguiente después
                        if(valor.length === 3)
                        {
                            if(valor.substring(1,2)!=='.')
                            {
                                nuevo = valor.substring(0,2)+'.'+valor.substring(valor.length-1,valor.length);
                                objeto.chileanId = nuevo;
                            }
                            else
                                objeto.chileanId = valor;
                        }
                        else
                        {
                            if(valor.length === 6 && valor.substring(1,2) === '.')
                            {
                                nuevo = valor.substring(0,5)+'.'+ultimo;
                                objeto.chileanId = nuevo;
                            }
                            else if(valor.length === 7)
                            {
                                if(valor.substring(1,2)==='.')
                                {
                                    nuevo = valor.substring(0,6)+ultimo;
                                    objeto.chileanId = nuevo; 
                                }
                                else
                                {
                                    nuevo = valor.substring(0,6)+'.'+ultimo;
                                    objeto.chileanId = nuevo;
                                }
    
                            }
                            else if(valor.length === 10 && valor.substring(1,2) === '.')
                            {
                                nuevo = valor.substring(0,9)+'-'+ultimo;
                                objeto.chileanId = nuevo;
                            }
                            else
                            {
                                if(valor.length === 11)
                                {                                   
                                    if(cuentaGuion === 0)
                                    {
                                        nuevo = valor.substring(0,10)+'-'+valor.substring(valor.length-1,valor.length);
                                        objeto.chileanId = nuevo;
                                    }
                                    else
                                    {
                                        objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length);
                                    }
                                }
                                else
                                {
                                    if(valor.length === 12)
                                    {
                                        if(ultimo === '-' || cuentaGuion === 2)
                                            objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                    }
                                }
                            }  
                        }
                }
                else //Entra al else si ingresó un caracter especial
                {
                    if(ultimo === '-') //Reglas para los guiones
                    {   
                        if(cuentaGuion === 1)
                        {
                            switch(valor.length)
                            {
                                case 1:
                                    objeto.chileanId = '';
                                break;
                                case 10:
                                    nuevoValor = [];
                                    for(i=0;i<arrayValor.length;i++)
                                    {
                                        if(arrayValor[i]!=='.' && arrayValor[i] !=='-')
                                            nuevoValor.push(arrayValor[i]);
                                    }
                                    nuevoValor = nuevoValor.join('');
                                    //alert(nuevoValor.substring(0,1)+'.'+nuevoValor.substring(1,4)+'.'+nuevoValor.substring(4,7)+'-');
                                    objeto.chileanId = nuevoValor.substring(0,1)+'.'+nuevoValor.substring(1,4)+'.'+nuevoValor.substring(4,7)+'-';
                                break;
                                case 11:
                                    objeto.chileanId = valor;
                                break;
                                default:
                                    objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                break;
                            }

                        }
                        else
                        {
                            objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                        }
                    }
                    else if(ultimo === '.') //Reglas para los puntos
                    {
                        //Si no hay puntos antes
                        //Si no hay 2 puntos en total
                        //Dividir las partes y ver que sean 1 o 2 '.' 3 '.'

                        if(valor.length === 1 && valor.substring(0,1)==='.')
                        {
                            objeto.chileanId = '';
                        }
                        else
                        {
                            if(cuentaPuntos <= 2)
                            {
                                switch(valor.length){
                                    case 2:
                                        objeto.chileanId = valor;
                                    break;
                                    case 3:
                                        if(valor.substring(1,2) === '.')
                                            objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                    break;
                                    case 6:
                                        if(valor.substring(1,2) !== '.')
                                            objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                    break;
                                    case 7:
                                        if(valor.substring(2,3) !== '.')
                                            objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                    break;
                                    default:
                                        objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                                    break;
                                }
                            }
                            else
                                objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                        }    

                    }
                    else //Entra acá si se ingresa una k
                    {
                        if(cuentaGuion === 1)
                        {
                            if(cuentaK === 1)
                            {
                                objeto.chileanId = valor;
                            }
                            else
                            {
                                objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);    
                            }
                        }
                        else
                        {
                            if(valor.length === 10)
                            {
                                nuevoValor = [];
                                for(i=0;i<arrayValor.length;i++)
                                {
                                    if(arrayValor[i]!=='.' && arrayValor[i] !=='-')
                                        nuevoValor.push(arrayValor[i]);
                                }
                                nuevoValor = nuevoValor.join('');
                                
                                objeto.chileanId = nuevoValor.substring(0,1)+'.'+nuevoValor.substring(1,4)+'.'+nuevoValor.substring(4,7)+'-'+ultimo;
                            }
                            else if(valor.length === 11)
                            {
                                nuevoValor = valor.substring(0,valor.length-1);
                                objeto.chileanId = nuevoValor+'-'+ultimo;
                            }
                            else
                            {
                                objeto.chileanId = objeto.chileanId.substring(0,objeto.chileanId.length-1);
                            }

                        }
                    }
                }
            }
            else//Entra a este else si ingresa un caracter prohibido
            {
                objeto.chileanId = valor.substring(0,valor.length-1);
            }
        }
        else
        {
            nuevo = valor.substring(0,12);
            objeto.chileanId = nuevo;
        }

        
    };

    $scope.capturaKey = function(event,objeto){
        if(event.keyCode !== 8)
        {
            $timeout(function(){
                $scope.formatearRut(objeto);
            },10);
        }
        else
        {
            objeto.chileanId = '';
        }
    };


    


    /** FUNCIONES PARA El DOCUMENTO PERSONA **/


    /** Función para cargar la lista de personas **/
    $scope.loadPeople = function(){
            //var key = $scope.key;
            //Acá se hace la llamada para cargar los datos de todas las personas...
            $http.get('/people/listPeople/'+$scope.key)
            .success(function(response) {
                $scope.people = response;

                angular.forEach($scope.people,function(value,index){
                    try
                    {
                        var fecOriginal = value.birthDate;
                        var fecSlice = fecOriginal.slice(0,10);
                        value.birthDate = fecSlice;
                    }
                    catch(e)
                    {
                        $window.console.log(e);
                    }
                    
                    if(value.smoker === true)
                    {
                        value.smoker = 'yes';
                    }
                    else
                    {
                        value.smoker = 'no';
                    }


                    //ESTA PARTE DEBE SER UN SERVICIO PARA QUE SE PUEDA LLAMAR DESDE OTRAS PARTES SIN REESCRIBIR

                    //Acá voy a hacer la llamada Ajax que traerá la foto y la cargará como atributo del objeto
                    if(value.imageRoute)
                    {
                        //var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
                        //var encodedString = Base64.encode(ruta);
                        var ruta = value.imageRoute;
                        //alert(encodedString);

                        $timeout(function(){
                            $http.get('/images/downloadThumbnail/min'+ruta+'/'+$scope.key)
                            .success(function(data){
                                value.image = 'data:image/jpeg;base64,'+data;

                                //Creo un elemento imagen con los datos en base64 para saber las proporciones del thumbnail con respecto al tamaño real                           
                                //var i = new Image();  
                                //i.src = 'data:image/jpeg;base64,'+data;
                                //var style = servicios.createThumbStyle(i.width,i.height);
                                //$scope.thumbStyle.push(style);
                                //delete i;
                                
                            })
                            .error(function(err){
                                value.image = 'http://icreativelabs.com/blog/wp-content/themes/icreativelabs/images/no-thumb.jpg';
                            });
                        },100);
                    }
                });

            })
            .error(function(err){
                    //alert('La llave utilizada no existe. Por favor vuelva a identificarse.')
                    $window.location.href = 'http://'+mainUrl+'/error';
            });
    };


    /** Función para agregar una persona a la lista de personas llamando por ajax haciendo uso del rut **/
    
    $scope.appendPersona = function(rut){
        
        var personaNueva = {};

        $http.get('/people/personById/'+rut+'/'+$scope.key)
        .success(function(data){
            personaNueva = data[0];

            var fecOriginal = personaNueva.birthDate;
            var fecSlice = fecOriginal.slice(0,10);
            personaNueva.birthDate = fecSlice;

            if(personaNueva.smoker === true)
            {
                personaNueva.smoker = 'yes';
            }
            else
            {
                personaNueva.smoker = 'no';
            }

            if(personaNueva.imageRoute)
            {
                //var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
                //var encodedString = Base64.encode(ruta);
                var ruta = personaNueva.imageRoute;
                //alert(encodedString);
                
                $timeout(function(){
                    $http.get('/images/downloadThumbnail/min'+ruta+'/'+$scope.key)
                    .success(function(data){
                        personaNueva.image = 'data:image/jpeg;base64,'+data;

                        //Creo un elemento imagen con los datos en base64 para saber las proporciones del thumbnail con respecto al tamaño real                           
                        //var i = new Image();  
                        //i.src = 'data:image/jpeg;base64,'+data;
                        //var style = servicios.createThumbStyle(i.width,i.height);
                        //$scope.thumbStyle.push(style);
                        //delete i;
                        
                        try
                        {
                            $scope.renewCharts();
                            $scope.socket.emit('nuevaPersona',personaNueva);

                        }
                        catch(e)
                        {
                            $window.alert(e);
                        }

                        
                    })
                    .error(function(err){
                        personaNueva.image = 'http://icreativelabs.com/blog/wp-content/themes/icreativelabs/images/no-thumb.jpg';
                    });
                },300);
                
            }
            
            
            $scope.people.push(personaNueva);
        
        })
        .error(function(err){
            $window.alert('ERROR!');
        });
    };


    /** Función para agregar a una persona en la lista pasando el objeto como parámetro. Esta función se utiliza con los socket **/

    $scope.appendPersonaObj = function(persona){
        

        try
        {
            $scope.people.push(persona);
                    
            try
            {
                $scope.$apply();
            }
            catch(e)
            {
                $window.alert('Error: '+e);
            }
        }
        catch(e)
        {
            $window.alert(e);
        }
        
        
    };


    /** Función para agregar personas a la base de datos **/
    $scope.addRecord = function(){

        var nuevo = $scope.newRecord;
        var ed1 = parseInt(nuevo.age);
        var ed2 = parseFloat(nuevo.age);
        
        //var fecFormat = new Date('2012-02-30');
        //alert(fecFormat );


        //alert('MATCH1: '+nuevo.chileanId.match($scope.chileanIdPattern)); //Este match responde cuantos caracteres calzan
        //alert('MATCH2: '+$scope.chileanIdPattern.test(nuevo.rut));


        if(nuevo.firstname && nuevo.lastname && nuevo.age)
        {    
            if(!isNaN(nuevo.age) && nuevo.age>0 && nuevo.age<110 && ed1 == ed2)
            {
                    if(nuevo.firstname.length>1 && nuevo.firstname.length<20)
                    {    
                        if(nuevo.lastname.length>1 && nuevo.lastname.length<20)   
                        {
                            if(typeof nuevo.chileanId !== 'undefined' && $scope.chileanIdPattern.test(nuevo.chileanId))    
                            {
                                if(typeof nuevo.telephone !== 'undefined')
                                {    
                                    if(typeof nuevo.email !== 'undefined')
                                    {
                                        if(typeof nuevo.birthDate !== 'undefined')
                                        {   
                                            if(typeof nuevo.gender !=='undefined')
                                            {
                                                if(typeof nuevo.maritalStatus !== 'undefined')
                                                { 
                                                    
                                                   if(typeof nuevo.image !== 'undefined' && (nuevo.image.type === 'image/jpeg' || nuevo.image.type === 'image/jpg' || nuevo.image.type === 'image/png' || nuevo.image.type === 'image/gif'))
                                                    {   
                                                        
                                                        if(typeof nuevo.occupation !== 'undefined')  
                                                         {
                                                                
                                                                if(nuevo.image.size < 8000000)
                                                                {
                                                                    $scope.showLoader = true;
                                                                    
                                                                    var elementosFecha = nuevo.birthDate.split('-');
                                                                    var anio = elementosFecha[0];
                                                                    var mes = elementosFecha[1];
                                                                    var dia = parseInt(elementosFecha[2]);
                                                                    
                                                                 
                                                                    var fecFormat = new Date(anio+'-'+mes+'-'+dia);
                                                                    nuevo.birthDate = fecFormat;

                                                                    //Se sube la imagen al servidor y se borra el atributo
                                                                    var imagen = nuevo.image;

                                                                    nuevo.age = parseInt(nuevo.age);
                                                                    
                                                                    
                                                                    var uploadUrl = '/images/uploadImage/'+$scope.key;
                                                                    var promise = servicios.uploadFileToUrl(imagen, uploadUrl);
                                                                    promise.then(function(obj){      
                                                                        //Se asigna la ruta de la imagen como atributo del objeto
                                                                        nuevo.imageRoute = obj.data;

                                                                        nuevo.coordinates = {};

                                                                        nuevo.coordinates.latitude = $scope.position.coords.latitude;
                                                                        nuevo.coordinates.longitude = $scope.position.coords.longitude;
                                                                        
                                                                        nuevo.key = $scope.key;
                                                                            
                                                                        //Se sube la información de la persona 
                                                                        $http.put('/people/addRecord/',nuevo)
                                                                        .success(function(data){
                                                                            var extension = nuevo.imageRoute.substring((nuevo.imageRoute.length-3),nuevo.imageRoute.length);
                                                                            
                                                                            if(extension === 'gif')
                                                                            {
                                                                                $timeout(function(){
                                                                                    $scope.appendPersona(nuevo.chileanId);
                                                                                },500);
                                                                            }
                                                                            else
                                                                            {
                                                                                $timeout(function(){
                                                                                    $scope.appendPersona(nuevo.chileanId);
                                                                                    $scope.showList();
                                                                                },500);
                                                                            }

                                                                            $scope.newRecord = {};
                                                                            $scope.newRecord.age = 0;
                                                                            $scope.setearSelect();
                                                                            
                                                                            //Esto deja el input vacío 
                                                                            var inputImagen = document.getElementById('imagen');
                                                                            inputImagen.value = inputImagen.defaultValue;

                                                                            $scope.showLoader = false;
                                                                        })
                                                                        .error(function(err){
                                                                            $scope.showLoader = false;
                                                                            $window.alert('Error: '+err.data+' uploading the data. Please try again.');
                                                                        });
                                                                    },function(error){
                                                                        $scope.showLoader = false;
                                                                        $window.alert('There was an error uploading the image. Please try again. '+error);
                                                                    });
                                                                    delete $scope.newRecord.image;
                                                                }
                                                                else
                                                                {
                                                                    $window.alert('Please use images of less than 8 MB');
                                                                }
                                                        }
                                                        else
                                                        {
                                                            $window.alert('Please add an occupation.');
                                                        }
                                                        
                                                    }
                                                    else
                                                    {
                                                        $window.alert('Please add an image in some of the following formats: jpg,jpeg,png,gif');  
                                                    }


                                                }
                                                else
                                                {
                                                    $window.alert('Please select a marital status');
                                                }
                                            }
                                            else
                                            {
                                              $window.alert('Please select a gender');
                                            }
                                        }
                                        else
                                        {
                                            $window.alert('Please enter a valid date with the following format yyyy-mm-dd');
                                        }
                                    }
                                    else
                                    {
                                        $window.alert('The email\'s format is incorrect. Please check and try again.');
                                    }
                                }
                                else
                                {
                                    $window.alert('The phone\'s value is incorrect. Remember the format +countrycode/citycode/number');
                                }
                            }
                            else
                            {
                                $window.alert('Please check and correct the id\'s format and try again');
                            }
                        }
                        else
                        {
                            $window.alert('The last name has to have between 2 and 20 letters');
                        }
                    }
                    else
                    {
                        $window.alert('The first name has to have between 2 and 20 letters');  
                    }
            }
            else
            {
                $window.alert('The age must be a number between 1 y 110');
            }
        }
        else
        {
            $window.alert('There is data missing or the format is not correct. Please check and try again.');
        }


    };



    /** Función para eliminar una persona de la base de datos **/
    $scope.deleteRecord = function(x){
        var conf = $window.confirm('Are you sure you want to delete this record?');

        if(conf){

            $http.delete('/people/deleteRecord/'+x._id+'/'+$scope.key)
            .success(function(data){
                $scope.deleteRecordById(x._id);
                $scope.socket.emit('eliminarPersona',x._id);
            })
            .error(function(err){
                $window.alert('Unable to delete record. Please try again.');
            });

            $http.get('/images/deleteImageAndThumbnail/'+x.imageRoute+'/'+$scope.key)
            .success(function(data){
                $window.console.log(data);
            })
            .error(function(err){
                $window.alert('Unable to delete the images associated with the record.');
            });
        }
        
    };


    /** Función para eliminar persona de la interfaz por id **/
    $scope.deleteRecordById = function(id){
        //alert('El id de la persona a eliminar es: '+id);
        angular.forEach($scope.people,function(value,index){
            //alert('entro al forEach');
            if(angular.equals(id,value._id))
            {
                //alert('se pilló un id igual!!! --> '+value._id);
                
                try
                {
                    //alert('Se va a elimimar a '+value.firstname+' '+value.lastname);
                    $scope.people.splice(index, 1); //Esto no está funcionando para los otros clientes
                    $scope.renewCharts();
                    //alert('Se ejecutó el splice');
                    try
                    {
                        $scope.$apply();
                    }
                    catch(e)
                    {
                        $window.console.log('There was an error '+e);
                    }


                    //$scope.loadPeople();
                }
                catch(e)
                {
                    $window.console.log(e);
                }

            }
        });
    };


    /** Función para modificar personas de la lista y actualizar o no(se puede cancelar) **/

    $scope.modifyRecord = function(x){
        
        $scope.persona = angular.copy(x);
        
        if($scope.persona.smoker === 'yes')
            $scope.persona.smoker = true;
        else
            $scope.persona.smoker = false;

        $scope.hideList();
        $scope.showUpdater();

    };



    /** This function cancels the record updating **/

    $scope.cancelUpdateRecord = function(){       
        $scope.hideUpdater();
        $scope.showList();
        $timeout(function(){
            $scope.persona = {};
        },1000);
    };

    /** Función para actualizar una persona desde la base de datos. **/
    $scope.updateRecord = function(){
        //RECORDAR QUE LA EDAD DEBE SACARSE DE LA FECHA DE NACIMIENTO

        var persona = $scope.persona;
        var ed1 = parseInt(persona.age);
        var ed2 = parseFloat(persona.age);
        var temporaryImage = persona.image;

        

        if(persona.firstname && persona.lastname && persona.age)
        {    
            if(!isNaN(persona.age) && persona.age>0 && persona.age<110 && ed1 == ed2)
            { 
                    if(persona.firstname.length>1 && persona.firstname.length<20)
                    {    
                        if(persona.lastname.length>1 && persona.lastname.length<20)   
                        {
                            if(typeof persona.chileanId !== 'undefined' && $scope.chileanIdPattern.test(persona.chileanId))    
                            {
                                if(typeof persona.telephone !== 'undefined')
                                {
                                    if(typeof persona.email !== 'undefined')
                                    { 
                                        
                                        if(typeof persona.occupation !== 'undefined' && persona.occupation.length > 0)
                                        {

                                            if((typeof persona.birthDate !== 'undefined') && persona.birthDate !== null)
                                            {   
                                                
                                                var cadenaFecha = persona.birthDate;
                                                var elementosFecha = persona.birthDate.split('-');
                                                var anio = elementosFecha[0];
                                                var mes = elementosFecha[1];
                                                var dia = parseInt(elementosFecha[2])+1;
                                                
                                                var fecFormat = new Date(anio+'-'+mes+'-'+dia);
                                                persona.birthDate = fecFormat;
                                                //alert(persona.birthDate);

                                                persona.age = parseInt(persona.age);
                                                persona.key = $scope.key;

                                                if(typeof persona.gender !=='undefined')
                                                {
                                                    if(typeof persona.maritalStatus !== 'undefined')
                                                    {
                                                            
                                                            delete persona.image;
                                                            $scope.showLoader = true;
                                                            $http.post('/people/updateRecord/',persona)
                                                            .success(function(data){
                                                                
                                                                $scope.showList();
                                                                $scope.hideUpdater();

                                                                /** CON ESTO SE RECORRE EL OBJETO CON CLAVE Y VALOR
                                                                
                                                                angular.forEach($scope.persona,function(value,index){
                                                                    alert('Index: '+index+' Value: '+value);
                                                                });
                                                                
                                                                **/

                                                                if(persona.smoker)
                                                                {
                                                                    persona.smoker = 'yes';
                                                                }
                                                                else
                                                                {
                                                                    persona.smoker = 'no';
                                                                }

                                                                angular.forEach($scope.people,function(value,index){
                                                                    if(angular.equals(persona._id,value._id))
                                                                    {
                                                                        $scope.people[index] = persona;
                                                                    }
                                                                });

                                                                persona.birthDate = cadenaFecha;
                                                                persona.image = temporaryImage;


                                                                $scope.renewCharts();
                                                                $scope.socket.emit('actualizarPersona',persona);

                                                                $scope.showLoader = false;                                                     


                                                            })
                                                            .error(function(err){
                                                                $scope.showLoader = false;
                                                                $window.alert(persona.birthDate);
                                                            });
                                                            
                                                            //Esto deja el input vacío 
                                                            //var inputFoto = document.getElementById('updateFoto');
                                                            //inputFoto.value = inputFoto.defaultValue;  
                                                    }
                                                    else
                                                    {
                                                        $window.alert('Please select a marital status.');
                                                    }
                                                }
                                                else
                                                {
                                                  $window.alert('Please select a gender');
                                                }
                                            }
                                            else
                                            {
                                                $window.alert('Please enter a valid date with the following format yyyy-mm-dd');
                                            }
                                        
                                        }
                                        else
                                        {
                                            $window.alert('Please add an occupation.');
                                        }

                                    }
                                    else
                                    {
                                        $window.alert('The email\'s format is incorrect. Please check and try again.');
                                    }
                                }
                                else
                                {
                                    $window.alert('The phone\'s value is incorrect. Remember the format +countrycode/citycode/number');
                                }
                            }
                            else
                            {
                                $window.alert('Please check and correct the id\'s format and try again');
                            }
                        }
                        else
                        {
                            $window.alert('The last name has to have between 2 and 20 letters');
                        }
                    }
                    else
                    {
                        $window.alert('The first name has to have between 2 and 20 letters');  
                    }
            }
            else
            {
                $window.alert('The age must be a number between 1 y 110');
            }
        }
        else
        {
            $window.alert('There is data missing or the format is not correct. Please check and try again.');
        }

    };

    /** Esta función recibe un objeto con datos desde el socket para actualizar un registro **/

    $scope.updateRecordObject = function(persona){

        
        angular.forEach($scope.people,function(value,index){
            if(angular.equals(persona._id,value._id))
            {
                $scope.people[index] = persona;
                try
                {
                    $scope.$apply();
                }
                catch(e)
                {
                    $window.alert('Error: '+e);
                }
            }
        });
       
    };


    /** Esta función es para ver la foto en grande **/

    $scope.seePicture = function(x){
        
        var ruta = x.imageRoute;

        var fullname = (x.firstname+' '+x.lastname).capitalize();

        $scope.portrait = fullname;
       
        $http.get('/images/downloadImage/'+ruta+'/'+$scope.key)
        .success(function(data){
            $scope.bigImage = 'data:image/jpeg;base64,'+data;  
            $scope.imageDetailStyle = servicios.resizePicture($scope.bigImage.width,$scope.bigImage.height);
            
            $scope.hideList();
            $scope.showImageDetail();
        })
        .error(function(err){
            $scope.bigImage = 'http://icreativelabs.com/blog/wp-content/themes/icreativelabs/images/no-thumb.jpg';
        });

         
    };

    $timeout(function(){
        $scope.loadPeople();
    },100);

    
    $timeout(function(){
        $scope.seeMenu = 'ocultar';
        $scope.seeInfo = 'ocultar';
    },500);


    $scope.logout = function(){
    
        var conf = $window.confirm('Are you sure you want to log out?');

        if(conf){

            $http.delete('/deleteKey/'+$scope.key)
            .success(function(data){
                $scope.key = null;
                $window.location.href = 'http://'+mainUrl;
            })
            .error(function(err){
                $window.alert('There was an error. Please try again.');
            });   
        }
    };
    


    //ANIMACIONES Y VISTAS


   //This function is to make visible the menu
    
    $scope.showMenu = function(){   
        $scope.seeMenu = 'mostrar mostrar-active';
        $timeout(function(){
            $scope.seeMenu = 'mostrar mostrar-active reponer';
        },500);
    };

    //This function hides the menu

    $scope.hideMenu = function(x){          
        $scope.seeMenu = 'ocultar ocultar-active';        
        $timeout(function(){
            $scope.seeMenu = 'ocultar ocultar-active remover';
        },500);
    };


    //This function is to make visible the menu
    
    $scope.showNewRecordForm = function(){
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('mapa') !== -1)
        {
            $scope.hideMap();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }

        if($scope.currentView.indexOf('newRecordForm') === -1)
        { 
            $scope.currentView = 'newRecordForm';
            $scope.newRecordTable = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.newRecordTable = 'mostrar mostrar-active reponer';
                $window.scrollTo(0,0);
            },500);
            
        }
    };

    //This function hides the menu

    $scope.hideNewRecordForm = function(x){          
        $scope.newRecordTable = 'ocultar ocultar-active';        
        $timeout(function(){
            $scope.newRecordTable = 'ocultar ocultar-active remover';
        },500);
    };

    

    //Esta función es para hacer visible la lista principal de usuarios encuestados
    
    $scope.showList = function(){

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('mapa') !== -1)
        {
            $scope.hideMap();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }
        
        if($scope.currentView.indexOf('encuestas') === -1)
        { 
            $scope.currentView = 'encuestas';
            $scope.seePeople = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.seePeople = 'mostrar mostrar-active reponer';
                $window.scrollTo(0,0);
            },500);
        }
    };

    //Esta función es para ocultar la vista principal de usuarios encuestados

    $scope.hideList = function(){
           
        $scope.seePeople = 'ocultar ocultar-active';
        
        $timeout(function(){
            $scope.seePeople = 'ocultar ocultar-active remover';
        },500);

    };

    //Esta función es para mostrar el cuadro de actualizaciones

    $scope.showUpdater = function(){
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('mapa') !== -1)
        {
            $scope.hideMap();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }

        if($scope.currentView.indexOf('actualizador') === -1)
        {
            $scope.currentView = 'actualizador';
            $scope.updatePerson = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.updatePerson = 'mostrar mostrar-active reponer';
            },500);
        }
    };



    $scope.hideUpdater = function(){
        $scope.updatePerson = 'ocultar ocultar-active';
        $timeout(function(){
            $scope.updatePerson = 'ocultar ocultar-active remover';
        },500);
    };


   //Esta función es para mostrar el detalle de la foto

    $scope.showImageDetail = function(){
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('mapa') !== -1)
        {
            $scope.hideMap();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }

        if($scope.currentView.indexOf('detalleImagen') === -1)
        {
            //$scope.hideMenu();
            $scope.currentView = 'detalleImagen';
            $scope.seeImage = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.seeImage = 'mostrar mostrar-active reponer';
                $window.scrollTo(0,0);
            },500);
        }
    };

    //Esta función es para ocultar el detalle de la foto

    $scope.hideImageDetail = function(){
        $scope.seeImage = 'ocultar ocultar-active';
        $timeout(function(){
            $scope.seeImage = 'ocultar ocultar-active remover';
        },500);
    };



    //Esta función permite ver el mapa de la ubicación desde la cual se envió el registro

    $scope.showMap = function(x){
       
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }

       if($scope.currentView.indexOf('mapa') === -1)
        { 
            $scope.currentView = 'mapa';
            $scope.seeMap = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.seeMap = 'mostrar mostrar-active reponer';
                $scope.loadMap(x);
            },800);
        }
    };

    $scope.hideMap = function(){
        $scope.seeMap = 'ocultar ocultar-active';
        $timeout(function(){
            $scope.seeMap = 'ocultar ocultar-active remover';
        },500);
    };

    //This functions makes the info visible

    $scope.showInfo = function(){
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('grafico') !== -1)
        {
            $scope.hideCharts();
        }

       if($scope.currentView.indexOf('infoView') === -1)
        { 
            $scope.currentView = 'infoView';
            $scope.seeInfo = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.seeInfo = 'mostrar mostrar-active reponer';
                $scope.goMain = false;
            },500);
        }
    };


    $scope.hideInfo= function(){
        $scope.seeInfo = 'ocultar ocultar-active';
        $timeout(function(){
            $scope.seeInfo = 'ocultar ocultar-active remover';
            $scope.goMain = true;
        },500);
    };





     $scope.renewCharts = function(){
        $scope.chartsLoaded = false;
        if($scope.currentView === 'grafico')
        {
            $scope.currentView = '';
            $scope.showCharts();
        }
    };


    $scope.showCharts = function(){   
        if($scope.currentView.indexOf('encuestas') !== -1)
        {
             $scope.hideList();
        }

        if($scope.currentView.indexOf('detalleImagen') !== -1)
        {
            $scope.hideImageDetail();
        }

        if($scope.currentView.indexOf('mapa') !== -1)
        {
            $scope.hideMap();
        }

        if($scope.currentView.indexOf('actualizador') !== -1)
        {
            $scope.hideUpdater();
        }

        if($scope.currentView.indexOf('newRecordForm') !== -1)
        {
            $scope.hideNewRecordForm();
        }

        if($scope.currentView.indexOf('infoView') !== -1)
        {
            $scope.hideInfo();
        }

        if($scope.currentView.indexOf('grafico') === -1)
        { 
            $scope.currentView = 'grafico';
            $scope.seeCharts = 'mostrar mostrar-active';
            $timeout(function(){
                $scope.seeCharts = 'mostrar mostrar-active reponer';
                $window.scrollTo(0,0);
                $scope.prepareCharts();
            },500);
            
        }
    };

    $scope.hideCharts = function(){
        $scope.seeCharts = 'ocultar ocultar-active';
        $timeout(function(){
            $scope.seeCharts = 'ocultar ocultar-active remover';
        },500);
    };



    //GRAFICO

    /** Estos métodos son momentáneos porque no van con angular **/


    $scope.prepareCharts = function(){
        if(!$scope.chartsLoaded)
        {
            $scope.showLoader = true;
            $scope.drawDiv('graficoUno',"-7%");
            $scope.loadCharts(1);
            $scope.drawDiv('graficoDos',"10%");
            $scope.loadCharts(2);
            $scope.drawDiv('graficoTres',"10%");
            $scope.loadCharts(3);
            $scope.chartsLoaded = true;
        }
    };


    $scope.drawDiv = function(nombreDiv,top){
        var div = document.getElementById(nombreDiv);
        div.style.width = "80%";
        div.style.height = "700px";
        div.style.position = "inherit";
        div.style.marginTop = top;
        div.style.marginLeft = "20%";
        div.style.backgroundColor = "#CFF9D9";
        div.style.border = "2px solid black";
    };


    $scope.loadCharts = function(opcion){
        google.load('visualization','1',{packages:['corechart'],callback:function(){
            $scope.drawCharts(opcion);
        }});
    };

    $scope.drawCharts = function(opcion){

        switch(opcion)
        {
            case 1:          
                $http.get('/querys/smokersVsNonsmokers/'+$scope.key)
                .success(function(data){
                    var smokers = parseInt(data.smokers);
                    var nonSmokers = parseInt(data.nonSmokers);

                    if(smokers === 0 && nonSmokers === 0)
                    {
                        var div = document.getElementById('graficoUno');
                        div.innerHTML = '<h1>There\'s no data to draw the chart. Please fill in a form.</h1>';
                    }
                    else
                    {
                        var datos = google.visualization.arrayToDataTable(
                            [
                                ['Marca','Votos'],
                                ['Smokers',smokers],
                                ['Non-smokers',nonSmokers],
                                ['otros',0]
                            ]
                        );

                        var opciones = {title:'Smokers vs Non-smokers',is3D:true,backgroundColor: 'transparent'};

                        var grafico = new google.visualization.PieChart(document.getElementById('graficoUno'));
                        grafico.draw(datos,opciones);
                    }

                })
                .error(function(){
                    $window.alert('There was an error in the connection. Please reload the page');
                });
            break;
            case 2:
                $http.get('/querys/smokersByGender/'+$scope.key)
                .success(function(data){
                    var men = parseInt(data.men);
                    var women = parseInt(data.women);

                    if(men === 0 && women === 0)
                    {
                        var div = document.getElementById('graficoDos');
                        div.innerHTML = '<h1>There\'s no data to draw the chart. Please fill in a form.</h1>';
                    }
                    else
                    {
                        var datos = google.visualization.arrayToDataTable(
                            [
                                ['Marca','Votos'],
                                ['Men',men],
                                ['Women',women],
                                ['otros',0]
                            ]
                        );

                        var opciones = {title:'Smokers by gender',is3D:true,backgroundColor: 'transparent'};

                        var grafico = new google.visualization.PieChart(document.getElementById('graficoDos'));
                        grafico.draw(datos,opciones);
                    }

                })
                .error(function(){
                    $window.alert('There was an error in the connection. Please reload the page');
                });
            break;
            case 3:
                $http.get('/querys/smokersByAgeRange/'+$scope.key)
                .success(function(data){

                    var prim = parseInt(data.firstRange);
                    var seg = parseInt(data.secondRange);
                    var ter = parseInt(data.thirdRange);
                    var cuar = parseInt(data.fourthRange);
                    var quin = parseInt(data.fifthRange);



                    if(prim === 0 && seg === 0 && ter === 0 && cuar === 0 && quin === 0)
                    {
                        var div = document.getElementById('graficoTres');
                        div.innerHTML = '<h1>There\'s no data to draw the chart. Please fill in a form.</h1>';
                    }
                    else
                    {

                        var datos = google.visualization.arrayToDataTable(
                            [
                                ['Marca','Votos'],
                                ['11-20 years',prim],
                                ['21-30 years',seg],
                                ['31-40 years',ter],
                                ['41-50 years',cuar],
                                ['51-60 years',quin],
                                ['otros',0]
                            ]
                        );

                        var opciones = {title:'Smokers by age range',is3D:true,backgroundColor: 'transparent'};

                        var grafico = new google.visualization.PieChart(document.getElementById('graficoTres'));
                        grafico.draw(datos,opciones);
                    }

                })
                .error(function(){
                    $window.alert('There was an error');
                });
                $scope.showLoader = false;
            break;
        }
    };





    //GEOLOCALIZACIÓN


    //Esta función se lanza al crear un registro. Es para obtener las coordenas
    $scope.geolocate = function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position){
              $scope.$apply(function(){
                $scope.position = position; 
              });
            });
        }
    };

    /** Se llama a la función de geolocalizar inmediatamente cuando se carga la página para poder tener
        acceso posteriormente a las coordenadas **/
    $scope.geolocate();

    $scope.loadMap = function(x){
            $timeout(function(){            
                //Hago una referencia al div que contendrá el mapa
                var divMapa = document.getElementById('mapa');
                
                if(x.hasOwnProperty('coordinates'))
                {
                   if(x.coordinates.latitude !== null && x.coordinates.latitude !== 'undefined' && x.coordinates.longitude !== null && x.coordinates.longitude !== 'undefined')
                   {
                        //Defino el punto en el que se basará el mapa
                        var puntoCentro = new google.maps.LatLng(x.coordinates.latitude,x.coordinates.longitude);
                        
                        //Defino las opciones para el mapa
                        var opcionesMapa = {
                                        zoom:14,
                                        center: puntoCentro
                                    };
                        
                       
                        //Creo el mapa
                        var mapa = new google.maps.Map(divMapa,opcionesMapa);

                        var miCasa = new google.maps.LatLng(x.coordinates.latitude,x.coordinates.longitude);

                        var marcador = new google.maps.Marker({
                            position:miCasa,
                            map:mapa,
                            title:'Geolocation',
                            url:'http://'+mainUrl
                        });

                        google.maps.event.addListener(marcador,'click',function(){
                            window.open(marcador.url);
                        });
                    }
                    else
                    {
                        divMapa.innerHTML = '<br><h3>Sorry, there  are no coordinates registered for this record!!</h3>';

                        $timeout(function(){
                            $scope.showList();
                        },1000);
                    }
                }
                else
                {
                    divMapa.innerHTML = '<br><h3>Sorry, there  are no coordinates registered for this record!!</h3>';
                    $timeout(function(){
                            $scope.showList();
                    },1000);
                }
            },100);
    };


    $scope.workInProgress = function(){
        $window.alert('We are currently working on this section. It will be ready soon...');
    };





    //AUDIO PLAYER

    /**
    
    $scope.audioFun = function(){
        var rep = document.getElementsByTagName('audio');
        
        for(i=0;i<rep.length;i++)
        { 
            rep[i].addEventListener('play',function(){
                $scope.adminAudios(this.id,'bloquear');
            });
        }
    };


    $scope.audioNotFun = function(){
        var rep = document.getElementsByTagName('audio');
        
        var cont = 0;
        for(i=0;i<rep.length;i++)
        { 
            rep[i].addEventListener('pause',function(){
                $scope.adminAudios(this.id,'activar');
            });
        }
    };


    $scope.adminAudios = function(id,accion){
        var rep = document.getElementsByTagName('audio');
        for(i=0;i<rep.length;i++)
        {
            if(rep[i].id !== id)
            {
                if(accion === 'bloquear')
                    rep[i].removeAttribute("controls");
                else
                    rep[i].setAttribute("controls","controls");
            }

        }
    };

    **/

    /**
    $timeout(function(){
        $scope.audioFun();
        $scope.audioNotFun();
    },1000);
    **/
















    //SOCKETS!!!

    $scope.socket = servicios.socket();

    $scope.socket.on('pruebaRefresh',function(){
        //$window.alert('WORKS MOTHERFUCKER!!!!');
    });


    $scope.socket.on('update',function(){
        $scope.loadPeople();
        $scope.renewCharts();
    });

    $scope.socket.on('newAppend',function(data){
        $scope.appendPersonaObj(data);
        $scope.renewCharts();
    }); 

    $scope.socket.on('deletePerson',function(id){
        $scope.deleteRecordById(id);
        $scope.renewCharts();
    }); 

    $scope.socket.on('updatePerson',function(data){
        $scope.updateRecordObject(data);
        $scope.renewCharts();
    }); 

}])
.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.factory('servicios', ['$http', function ($http,$scope) {
    return {
        value:null,
        //Esta función es para subir los archivos de imágen al servidor....
        uploadFileToUrl : function(file, uploadUrl){
            var fd = new FormData();
            fd.append('file', file);
            var promise = $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data){
                return data;
            })
            .error(function(err){
                $window.alert(err);
                return err;
            });

            return promise;
        },
        //Esta función crea un objeto de estilo para los thumbnails dependiendo de los valore que se le envíen por parámetro
        resizePicture : function(width,height){            

            var style = {};
            style.borderRadius = '5px 5px 5px 5px';

            var anchoOriginal = width;
            var altoOriginal = height;
            var anchoDeseado = 400;
            var altoDeseado;

            //Acá va el cálculo en relación al anchoDeseado

            altoDeseado = parseInt((altoOriginal*anchoDeseado)/anchoOriginal);


            style.height = altoDeseado+'px';
            style.width = anchoDeseado+'px';

            //console.log('AnchoOriginal: '+width+' AltoOriginal: '+height);
            //console.log('AnchoNuevo: '+style.width+' AltoNuevo: '+style.height);
            

            return style;
        },
        socket : function(){
             var socket = io.connect('http://'+mainUrl);
             return socket;
        }           
    };
}]);




