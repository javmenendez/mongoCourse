/*
* usar mongoimport para importar companies.json
*
* mongoimport -d school -c students school.json
*/
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


MongoClient.connect('mongodb://localhost:27017/school', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = {};
    var projection = {"student": 1, "grade": 1, "_id": 0};

    // En este momento todavia no se ha traido ningun documento de base de datos,
    // simplemente se crea el cursor
    var cursor = db.collection('students').find(query);

    cursor.skip(6);
    cursor.limit(2);
    cursor.sort({"grade": 1});
    // Se añade una proyeccion al cursor para traer de base de datos solo los campos
    // que se necesitan, de esta forma se reduce el trafico.
    cursor.project(projection);

    // forEach no trae todos los documentos de la cosnulta como haria toArray
    // se traen bloques de datos y segun se necesitan mas se van obteniendo mas
    // Todo esto lo gestiona el driver de node/mongodb
    cursor.forEach(
        function(doc) {
            console.log(doc);
        },
        function(err) {
            assert.equal(err, null);
            return db.close();
        }
    );

});
