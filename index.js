//const axios = require("axios");
const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");
const port = 3000;
const server = http.createServer();
const {ClientID, ClientSecret, RedirectURL, GenereatedURL, Token} = require("./credentials.json");

server.on("listening", listening_handler);
server.listen(port);
function listening_handler(){
    console.log(`Now Listening on Port ${port}`);
}

server.on("request", connection_handler);
function connection_handler(req, res){
    console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`);
    // displays the html page created
    if(req.url === "/"){    //root of the page
        const form = fs.createReadStream("html/main.html");
            res.writeHead(200, {"Content-Type": "text/html"})
            form.pipe(res);
    }
    else if(req.url.startsWith("/getPokemonData")){
        const url = new URL(req.url, "https://localhost:3000");
        const pokemondata = url.searchParams.get('pokemondata');
        //console.log(pokemondata);     // FOR TESTING
        request_access_token(pokemondata, res);
        // pokemondata wont be used right away but will be passed down
    }
    else{   // if we go anywhere else return a 404 error
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end(`<h1>404 Not Found</h1>`);
    }
}

function request_access_token(pokemondata, res){
    const{ClientID, ClientSecret, RedirectURL} = require('./credentials.json');
    const APIendpoint = 'https://discord.com/api/v10';
    const tokenEndpoint = 'https://discord.com/api/oauth2/token';
    const options = {
        method: "POST",
        headers:{
            "Content-Type": 'application/x-www-form-urlencoded'
        }
    }
    const formData = new url.URLSearchParams({
        'client_id': ClientID,
        'client_secret': ClientSecret,
        'grant_type': 'authorization_code',
        'code': pokemondata,
        'redirect_uri': RedirectURL     //'http:localhost:3000/api/auth/discord'
    })
    // console.log(formData);  // FOR TESTING (displays what data the user chose)

    const tokenRequest = https.request(tokenEndpoint, options);
    tokenRequest.once("error", err => errorHandler);
    function errorHandler(err){
        throw err;
    }
    tokenRequest.once("response", receivedToken);    // receivedToken executes when a response is received
    tokenRequest.end();
}

function receivedToken(tokenStream){
}

function get_pokemon_data(pokemondata, res){
    // endpoint variable is not needed
    //const endpoint = 'https://pokemon-go1.p.rapidapi.com/pokemon_names.json'; 
    const options = {
        "method": "GET",
        "hostname": "pokemon-go1.p.rapidapi.com",
        "port": null,
        "path": "/pokemon_names.json",
        "headers": {
            "X-RapidAPI-Host": "pokemon-go1.p.rapidapi.com",
            "X-RapidAPI-Key": "3eac2f6ef2msh97f0708f1eb5011p18e08ejsna892dac76dcb",
            "useQueryString": true
        }
    };
    const pokemonrequest = https.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            return `<h1>Results:</h1><ul>${body}</ul>`;
        });
    });
    pokemonrequest.end();  // code above is pulled from the API documentation
}