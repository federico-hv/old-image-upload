
var mainUrl = 'approveit.biz';


/** Funcion para capitalizar **/
String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};