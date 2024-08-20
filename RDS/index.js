var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const cors = require('cors');


var corsOptions = { origin: true, optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

const {
    DynamoDB
} = require('@aws-sdk/client-dynamodb');
//Nuevo 
const mysql = require('mysql');  //<- para importar la base de datos 
const aws_keys = require('./creds_template'); // <-- se agrega la clase en donde estan las credenciales 

var port = 9000;
app.listen(port);
console.log("Escuchando en el puerto", port)


// se manda a llamar las credenciales de Mysql 
const db_credentials = require('./db_creds'); //<-- Se importa las credenciales de la base de datos 
var conn = mysql.createPool(db_credentials); // <- Se crea un pool para realizar la conexion a la base de datos 

// Se instancian todos los objetos de aws 
const ddb = new DynamoDB(aws_keys.dynamodb); //------> Base de datos - Dynamo 


//---------------------------------Ejemplo DB ------------------------------------


///DYNAMO 
//subir foto y guardar en dynamo
app.post('/saveImageInfoDDB', (req, res) => {
    let body = req.body;

    let name = body.name;
    let base64String = body.base64;
    let extension = body.extension;

    //Decodificar imagen
    let encodedImage = base64String;
    let decodedImage = Buffer.from(encodedImage, 'base64');
    let filename = `${name}.${extension}`; 

            ddb.putItem({
                TableName: "Prueba", // el nombre de la tabla de dynamoDB 
                Item: {
                    "id": { S: name},
                    "foto": { S: base64String }
                }
            }, function (err, data) {
                if (err) {
                    console.log('Error saving data:', err);
                    res.send({ 'message': 'ddb failed' });
                } else {
                    console.log('Save success:', data);
                    res.send({ 'message': 'ddb success' });
                }
            });
     
})


/******************************RDS *************/
//obtener datos de la BD
app.get("/getdata", async (req, res) => {
    conn.query(`SELECT * FROM ejemplo`, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

//insertar datos
app.post("/insertdata", async (req, res) => {
    let body = req.body;
    conn.query('INSERT INTO ejemplo VALUES(?,?)', [body.id, body.nombre], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

