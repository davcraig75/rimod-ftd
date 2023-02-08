var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require("fs");


require("dotenv").config({path:"./../.env"});
itgz = require("../src/lib/lz-string.js");
var itg_comp = function(file) {return itgz.compressToEncodedURIComponent(fs.readFileSync(file, "utf8"));};
var itg_engz = function(data) {return itgz.compressToEncodedURIComponent(JSON.stringify(data)).toString();};

var max_range_10M = 10000000;
//////////////////////////////////////////////////////////////////////////////////
// MongoDB API
//////////////////////////////////////////////////////////////////////////////////
var db = mongoose.connection;
var GenePosSchema = mongoose.Schema({chr:String,first_pos:Number,last_pos:Number},{collection: "gene_summary"});   
var Private_Gene_Schema = mongoose.Schema({chr:String,first_pos:Number,last_pos:Number},{collection: "gene_detail"});   
var url = 'mongodb://127.0.0.1:'+process.env.MONGODB_PRIVATE_PORT+'/'+process.env.MONGODB_PRIVATE_DB;
mongoose.connect(url, { useNewUrlParser: true });

//////////////////////////////////////////////////////////////////////////////////
// GeneInfo API
//////////////////////////////////////////////////////////////////////////////////
  
    var GenePosCollection = db.model('gene_summary', GenePosSchema);
    function search_genepos(req, res) {
        var chr=req.params.chr;
        var first_pos=Math.round(req.params.first_pos);
        var last_pos=Math.round(req.params.last_pos);
        var startTime = Date.now();
        var range=Math.abs(last_pos-first_pos);
        if(range<max_range_10M) {   
            GenePosCollection.find({
                "$or":[
                    {"g38.0": { "$gte": first_pos,"$lte": last_pos },"summaries_COUNT":{"$exists":1} },
                    {"g38.1": { "$gte": first_pos,"$lte": last_pos },"summaries_COUNT":{"$exists":1} }
                ]
            }, function(err, pos) {
                if (err) { console.log ("error");res.json({})}
                if (pos) {
                    res.json({genepos:encodeURI(itgz.compressToBase64(JSON.stringify(pos)))}); 
                }
            }).limit(500);
        } else {
                res.json([]); 
        }       
    }
    router.get('/genePos/first_pos/:first_pos/last_pos/:last_pos',search_genepos); // Public


    var Private_Gene_Connection = db.model('gene_detail', Private_Gene_Schema);
    function private_search_gene(req, res) {
        var mygene=req.params.gene;
        Private_Gene_Connection.find({'gene':req.params.gene}, function(err, gene) {
            if (err) { console.log('err'+err)}
            if (gene.length>0) {
                res.json({gene:encodeURI(itgz.compressToBase64(JSON.stringify(gene[0])))});
            } else {
                Private_Gene_Connection.find({'names':req.params.gene}, function(err, gene) {
                    if (err) { console.log('err'+err)}
                    if (gene) {
                        if (gene.length>0) {
                            res.json({gene:encodeURI(itgz.compressToBase64(JSON.stringify(gene[0])))});
                        } else {
                            res.json();
                        }
                    } else {
                        res.json();
                    }    
                });                
            }
        });
    }
    router.get('/gene/:gene', private_search_gene); 

//////////////////////////////////////////////////////////////////////////////////
// METH
//////////////////////////////////////////////////////////////////////////////////
{
    var methCollectionName="METHAR";
    var METHSchema = mongoose.Schema({},{collection: "METHAR" });
    var METHCollection = db.model("METHAR", METHSchema);
    function search_METH(req, res) {
        var g0=Math.round(req.params.g0);
        var g1=Math.round(req.params.g1);
        var range=Math.abs(g1-g0);
        var startTime = Date.now();
        if(range<max_range_10M) {
            METHCollection.aggregate([
                {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
                {$unwind:"$samples"},
                {$project:{"_id":0,"g0":1,"g1":"$g0","Full":"$samples.F","UID":"$samples.Sa","Pathology":"$samples.P","Disease":"$samples.D","Mutation":"$samples.M","Sex":"$samples.S","v0":"$samples.v0"}}
            ], function(err, dat) {
                if (err) { console.log ("error");res.json({});}        
                if (dat) {
                    console.log('METHAR:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                    res.json(dat); 
                }
            });
        } else {res.json([]);}
    }   
    router.get('/meth/g0/:g0/g1/:g1',search_METH); // Public

    function search_METH_summary(req, res) {
        var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
        if(range<max_range_10M) {
            METHCollection.aggregate([
                {"$match":{"g0":{"$gt":g0,"$lt":g1}}},{$unwind:"$summaries"},
                {$project:{"_id":0,"g0":1,"g1":"$g0","min":"$summaries.min","q1":"$summaries.q1","median":"$summaries.median","q3":"$summaries.q3","event":"$summaries.event","variable":"$summaries.variable","max":"$summaries.max","n":"$summaries.n"}}
            ], function(err, dat) {
                if (err) { console.log ("error");res.json({});}        
                if (dat) {
                    
                    console.log('METHSUMMARY:\t',g1,g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                    res.json(dat); 
                }
            });
        } else {res.json([]);}
    }   
    router.get('/meth_summary/g0/:g0/g1/:g1',search_METH_summary); // Public
}

//////////////////////////////////////////////////////////////////////////////////
// CAGE API
//////////////////////////////////////////////////////////////////////////////////
var cageCollectionName="CAGE";
var CAGESchema = mongoose.Schema({},{collection: cageCollectionName });
var CAGECollection = db.model(cageCollectionName, CAGESchema);     
function search_CAGE_summary(req, res) {

    var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
    console.log('range'+range+'g0 '+g0+'g1 '+g1);
    if(range<max_range_10M) {
        CAGECollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
            {$unwind:"$summaries"},
            {$project:{"_id":0,"g0":1,"g1":1,"count":"$summaries.count","event":"$summaries.event","variable":"$summaries.variable","v0":"$summaries.v0"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({"err":err});}        
            if (dat) {
                console.log('CAGE:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);     
                //console.log(dat)               
                res.json(dat); 
            }
        });
    } else {res.json([]);}
}       
router.get('/cage_summary/g0/:g0/g1/:g1',search_CAGE_summary); // Public

function search_CAGE(req, res) {
    var g0=Math.round(req.params.g0);var g1=Math.round(req.params.g1);var range=Math.abs(g1-g0);var startTime = Date.now();
    if(range<max_range_10M) {
        CAGECollection.aggregate([
            {"$match":{"g0":{"$gt":g0,"$lt":g1}}},
            {$unwind:"$k"},
            {$project:{"_id":0,"g0":1,"g1":1,"Full":"$k.F","UID":"$k.U","Pathology":"$k.P","Disease":"$k.D","Mutation":"$k.M","Sex":"$k.S","v0":"$k.v0"}}
        ], function(err, dat) {
            if (err) { console.log ("error");res.json({});}        
            if (dat) {
                console.log('CAGE:\t',g1-g0,'c:\t',Object.keys(dat).length,',MS:\t', Date.now() - startTime);
                
                res.json(dat); 
            }
        });
    } else {res.json([])}
}   
router.get('/cage/g0/:g0/g1/:g1',search_CAGE); // Public
module.exports = router;
