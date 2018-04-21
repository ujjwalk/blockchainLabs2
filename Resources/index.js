const Web3 = require('web3');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var etherUrl = "ENDPOINT_URL";
var account = "ACCOUNT_ADDRESS";
var contract = "CONTRACT_ADDRESS"

var httpPort = 8080;
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(etherUrl));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    console.log(req.method + " " + req.url);
    next();
});

app.use(express.static("public"));

app.get("/ratings", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/ratings.html"));
});

var abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "newRating",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "professorID",
          "type": "uint256"
        },
        {
          "name": "comment",
          "type": "string"
        },
        {
          "name": "stars",
          "type": "uint256"
        }
      ],
      "name": "addRating",
      "outputs": [
        {
          "name": "ratingID",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getRatingsCount",
      "outputs": [
        {
          "name": "count",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getRating",
      "outputs": [
        {
          "name": "professorID",
          "type": "uint256"
        },
        {
          "name": "comment",
          "type": "string"
        },
        {
          "name": "stars",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
];

contractInstance = new web3.eth.Contract(abi, contract);

app.get("/count", function (req, res) {
	contractInstance.methods.getRatingsCount().call(function(error, count) {
		if (error) {
			res.status(500).send(error);
		}
		else {
			res.status = 200;
			res.json(count);
		}
	});
});

app.get("/rating/:index", function (req, res) {
	contractInstance.methods.getRating(parseInt(req.params.index)).call(function(error, comment) {
		if (error) {
			res.status(500).send(error);
		}
		else {
			res.status = 200;
			res.json({
				"professorID": parseInt(comment.professorID),
				"comment": comment.comment,
				"stars": parseInt(comment.stars)
			});
		}
	});
});

app.post("/add", function (req, res) {
	contractInstance.methods.addRating(parseInt(req.body.professorId), req.body.comment, parseInt(req.body.stars)).send({ from: account, gas:500000 }, function(error, transactionHash) {
		if (error) {
			res.status(500).send(error)	;
		}
		else {
			res.status = 200;
			res.json({ id: 0 });
		}
	});			
});

app.listen(httpPort, function () {
	console.log("Listening on port " + httpPort);
});