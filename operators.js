/*
* Utiliza la libreria command-line-args para pasar parametros desde la linea de comandos.
* A partir de los parametros recibidos se crea el filtro para la consulta sobre la base
* de datos crunchbase en la coleccion companies.
*/

var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require('command-line-args'),
    assert = require('assert');


var options = commandLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {

    assert.equal(err, null);
    console.log("Successfully connected to MongoDB.");

    var query = queryDocument(options);
    var projection = {"_id": 1,
                      "name": 1,
                      "founded_year": 1,
                      "number_of_employees": 1,
                      "crunchbase_url": 1,
                      "offices.country_code": 1,
                      "ipo.valuation_amount": 1};

    var cursor = db.collection('companies').find(query);
    cursor.project(projection);

    // MongoDB siempre va a aplicar estas funciones en el siguiente orden
    // 1. SORT
    // 2. SKIP
    // 3. LIMIT
    // Independientemente del orden en que los llamemos.

    cursor.skip(options.skip);
    cursor.limit(options.limit);

    //cursor.sort({founded_year: 1})

    // Ordenar por varios campos. El orden es importante, en un objeto javascript
    // no esta garantizado el orden de los campos. Se puede hacer asi, pero no se
    // garantiza que ordene pruimero por un campo u otro.

    //cursor.sort({founded_year: 1, number_of_employees: -1})

    // Para garantizar el orden utilizamos un array
    cursor.sort([["founded_year", 1], ["number_of_employees", -1]]);




    var numMatches = 0;

    cursor.forEach(
        function(doc) {
            numMatches = numMatches + 1;
            console.log( doc );
        },
        function(err) {
            assert.equal(err, null);
            console.log("Our query was:" + JSON.stringify(query));
            console.log("Matching documents: " + numMatches);
            return db.close();
        }
    );

});


function queryDocument(options) {

    console.log(options);

    // Aqui se pueden ver 3 formas distintas de establecer la query en MongoDB

    // Object notation
    var query = {
        "founded_year": {
            "$gte": options.firstYear,
            "$lte": options.lastYear
        }
    };

    // Dot Notation
    if ("employees" in options) {
        query.number_of_employees = { "$gte": options.employees };
    }

    // Array like notation
    if ("ipo" in options) {
        if (options.ipo === "yes") {
            query["ipo.valuation_amount"] = {"$exists": true, "$ne": null}
        } else if (options.ipo === "no") {
            query["ipo.valuation_amount"] = null
        }
    }

    // Se puede usar Dot Notation para buscar en propiedades de documentos dentro de arrays
    // Por ejemplo offices es un array de documentos y cada documento tiene un campo country_code,
    // utilizando Dot Notation busca en cada documento del array en el campo indicado.
    // Digamos que MongoDB, aunque no funciona asi, trata cada elemento de un array como un documento
    // con toda la informacion restante de los documentos padres. Es como si hubiera varias copias del
    // documento global pro cada elemento del array.

    if ("country" in options) {
        query["offices.country_code"] = options.country;
    }

    return query;

}


function commandLineOptions() {

    var cli = commandLineArgs([
        { name: "firstYear", alias: "f", type: Number },
        { name: "lastYear", alias: "l", type: Number },
        { name: "employees", alias: "e", type: Number },
        { name: "ipo", alias: "i", type: String },
        { name: "country", alias: "c", type: String },
        { name: "skip", type: Number, defaultValue: 0 },
        { name: "limit", type: Number, defaultValue: 20000 }
    ]);

    var options = cli.parse()
    if ( !(("firstYear" in options) && ("lastYear" in options))) {
        console.log(cli.getUsage({
            title: "Usage",
            description: "The first two options below are required. The rest are optional."
        }));
        process.exit();
    }

    return options;

}


