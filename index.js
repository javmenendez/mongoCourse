/*
* usar mongoimport para importar companies.json
*
* mongoimport -d crunchbase -c companies companies.json
*/
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = {"category_code": "biotech"};
    var projection = {"name": 1, "category_code": 1, "_id": 0};

    // En este momento todavia no se ha traido ningun documento de base de datos,
    // simplemente se crea el cursor
    var cursor = db.collection('companies').find(query);
    // Se añade una proyeccion al cursor para traer de base de datos solo los campos
    // que se necesitan, de esta forma se reduce el trafico.
    cursor.project(projection);

    // forEach no trae todos los documentos de la cosnulta como haria toArray
    // se traen bloques de datos y segun se necesitan mas se van obteniendo mas
    // Todo esto lo gestiona el driver de node/mongodb
    cursor.forEach(
        function(doc) {
            console.log(doc.name + " is a " + doc.category_code + " company.");
            console.log(doc);
        },
        function(err) {
            console.log(err);
            assert.equal(err, null);
            return db.close();
        }
    );

});
