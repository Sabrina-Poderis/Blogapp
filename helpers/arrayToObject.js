module.exports = 
function arrayToObject (array) {
    var thisObject = new Object();

    if(typeof array == "object"){
        for(var i in array){
            var thisElement = arrayToObject(array[i]);
            thisObject[i] = thisElement;
        }
    } else {
        thisObject = array;
    }

    return thisObject;
}