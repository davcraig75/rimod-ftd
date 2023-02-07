//////////////////////////////////////////////////////////////////////////////////
// Copyright David Wesley Craig 2020, University of Southern California
//////////////////////////////////////////////////////////////////////////////////
var pjson = require('./package.json');
var express = require('express');
var compression = require("compression");
var bodyParser = require("body-parser");
var path = require("path");
var http = require("http");
var dotenv = require("dotenv");
var cookieParser = require('cookie-parser');
var morgan       = require('morgan');
var debug = require("debug")("ripple:server");
var fs = require("fs");
var app = express();
require("dotenv").config();
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
itgz = require("./src/lz-string.js");
var app_name="rimod-ftd";
var itg_comp = function(file) {
  return itgz.compressToEncodedURIComponent(fs.readFileSync(file, "utf8"));
};
var itg_engz = function(data) {
  return itgz.compressToEncodedURIComponent(JSON.stringify(data)).toString();
};
 
app.set('port', port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

 // ALLOW CORS (Modify as appropriate)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}); 
var max_range_10M = 10000000;

// Start server
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use(morgan('dev')); // log every request to the console
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/////////////////////////////////////////////////////////////////////////////////
// Convert csv to json
//////////////////////////////////////////////////////////////////////////////////
d3 = require("./src/d3-dsv.v1.min.js");
samples_data=d3.csvParse(fs.readFileSync("src/RiMod_master_sample_file.csv", "utf8"), d3.autoType);
var samples={json:samples_data,columns:samples_data.columns};

//////////////////////////////////////////////////////////////////////////////////
// Compression and Data
//////////////////////////////////////////////////////////////////////////////////  
    var document = {
        gene_wordcloud:itg_comp("views/json/geneview.wordcloud.042119.v30.json"),
        logos:itg_comp("src/logos.css"),
        samples:itg_engz(samples),
        genomebrowser:itg_comp("views/json/browser.020921.json"),
        genes:itg_comp("views/genes.ejs"),     
        browser:itg_comp("views/browser.ejs"),    
        landing:itg_comp("views/home.ejs"), 
        menu:itg_comp("views/menu.ejs"),  
        autocomplete:itg_comp("./src/autocomplete.css"),   
        rimodcss:itg_comp("./views/styles-rimod.css"),
        rimodcss:itg_comp("./views/styles-rimod.css"),
        jquerycss:itg_comp("src/jquery-ui.css"),
        footer:itg_comp("views/footer.ejs"),
        abstractdiagram:itg_comp("src/abstractdiagram.svg"),
        loader:itg_comp("src/dna.css"),
        genelist:itg_comp("src/genelist.json"),
        itgversion: pjson.version,
        global_api: process.env.APP_GLOBAL_API,
        app_name:pjson.name        
    };

/////////////////////////////////////////////////////////////////////////////////
// Webpage From Node
//////////////////////////////////////////////////////////////////////////////////
      app.get(process.env.NODE_PRIVATE, function(req, res) {
          res.render('body.ejs',  document);
      });
      const priv = require('./routes/mongo_routes.js'); 

//////////////////////////////////////////////////////////////////////////////////
// END API  Server
//////////////////////////////////////////////////////////////////////////////////
        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }
            var bind = typeof port === 'string' ?
                'Pipe ' + port :
                'Port ' + port;
            switch (error.code) {
                case 'EACCES':
                    console.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }
        function normalizePort(val) {
            var port = parseInt(val, 10);
            if (isNaN(port)) {
                return val;
            }
            if (port >= 0) {
                return port;
            }
            return false;
        }
        function onListening() {
            var addr = server.address();
            var bind = typeof addr === 'string' ?
                'pipe ' + addr :
                'port ' + addr.port;
            debug('Listening on ' + bind);
        }
        app.use(compression());
        app.set('port', process.env.PORT);
        var server = http.createServer(app);
        server.listen(process.env.PORT);
        server.on('error', onError);
        server.on('listening', onListening);

//////////////////////////////////////////////////////////////////////////////////
// Compile Javascript
//////////////////////////////////////////////////////////////////////////////////
if (process.argv[2] == "build") {
    app.render("wrapper.ejs", document, function(err, javascript) {
      fs.writeFile("public/" + app_name + ".js", javascript, function(err) {
        if (err) console.error(err);
        console.log("Built javascript");
        fs.writeFile(app_name  + ".js", javascript, function(err) {
          if (err) console.error(err);
          console.log("Built javascript");
          process.exit();
        });   
      });
   
    });
  }






