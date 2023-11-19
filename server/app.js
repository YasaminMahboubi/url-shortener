const fs = require('fs');

const path = require('path');

const express = require('express');
const app = express();

const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:5173'
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

app.use(cors(corsOptions));
app.use(express.json());

const mySEcretKey = process.env.jwtAccess;


async function symblolData () {
    const symbolData = await fs.promises.readFile(path.join('data','encryptCode.json'), 'utf-8');
    const jsonData = JSON.parse(symbolData); 
    const symbolArray = jsonData.symbol;
    return symbolArray;
}

async function urlData () {
    const urlData =  await fs.promises.readFile(path.join('data','url.json'), 'utf-8');
    const jsonUrl = JSON.parse(urlData); 
    return jsonUrl;
}
/* ----------------------------------------------------------- user ------------------------------------------------------------- */
app.get('/api/getUserById' , async (req , res) => {
        let userHeader = req.headers['authorization'];
        let token = userHeader.split(" ")[1];
        payload = jwt.verify(token, mySEcretKey);
    
        let usersData = fs.readFileSync("data/users.json");
        let users = JSON.parse(usersData);
        let foundUser = users.users.filter(user => user.id == payload.user);
    
        let urlDataArray = await urlData();
        let foundUserUrls = urlDataArray.data.filter(user => user.userId == payload.user);
    
        let resArray = [];
        foundUserUrls.forEach(url => {
                let urlData =  {
                    short: url.short,
                    shortUrl: url.shortUrl,
                    original: url.original,
                    clicked: url.clicked
                };
                resArray.push(urlData);
        });
        res.send({arrayData: resArray, username: foundUser[0].username});
})
app.post('/api/signUp' , (req , res) => {
    let { username , password , email} = req.body;

    if(username == "" || password == "" || email == "" ){
        res.send({input: "please fill all the the inputs"});
    }else{
        fs.readFile("data/users.json" , "utf-8" , (err , data) => {
            if(err){
                return err;
            }
            
            const usersData = JSON.parse(data);

            let userFound = usersData.users.find(user => {
                return user.username === username;
            })
            let emailFound = usersData.users.find(user => {
                return user.email === email;
            })
        
        if(userFound || emailFound){
            res.status(400).send({error: "username or email already exist"});
        }
        else{
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds , (err , randSalt) => {
                if(err){
                    return err;
                }
                bcrypt.hash(password , randSalt , (err , hashedPass) => {
                    if(err){
                        return err;
                    }

                    let newUser = {
                        id: usersData.id,
                        username: username,
                        email: email,
                        password: hashedPass
                    }

                    const accessToken = jwt.sign({user: usersData.id} , mySEcretKey , {algorithm: 'HS256'});
                    usersData.users.push(newUser);
                    usersData.id++;

                    fs.writeFileSync("data/users.json" , JSON.stringify(usersData));
                    res.send({access: accessToken})
                })
            })
        }
    })
    }
})

app.post('/api/login' , (req , res) => {
    const {userEmail , password} = req.body;

    if(userEmail == "" || password == ""){
        res.send({input: "please fill all the the inputs"});
    }else{
        fs.readFile("data/users.json" , "utf-8" , (err , data) => {
            if(err){
                return err;
            }
            const usersData = JSON.parse(data);
    
            let userFound = usersData.users.find(user => {
                 return user.username === userEmail || user.email === userEmail;
            })
            if(userFound){
                let foundedUserPass = userFound ? userFound.password : emailFound.password;
                bcrypt.compare(password , foundedUserPass , (err , result) => {
                    if(err){
                        res.send({generalError: "error has been found"});
                    }else{
                        if(!result){
                            res.send({passErr: "username or password is invalid"});
                        }
                        else{
                            const accessToken = jwt.sign({user: userFound.id} , mySEcretKey , {algorithm: 'HS256'});
                            res.send({access: accessToken});
                        }
                    }
                })
            }
            else{
                res.send({userError: "username/email did not found"});
            }
        })
    }
   
})

/* ----------------------------------------------------------- url ------------------------------------------------------------- */


async function encrypt (inp , stmt , saveUser) {
    try{
        let findObject;
        let finalObj;

        const symbolArray = await symblolData();
        const jsonUrl = await urlData();

        const existingObj = jsonUrl.data.find(obj => obj.original == inp);
        const existingShortUrl = jsonUrl.data.find(obj => obj.short == inp);

        if(existingShortUrl){
            existingShortUrl.clicked++;
            fs.promises.writeFile(path.join('data' , 'url.json') , JSON.stringify(jsonUrl));
            let dataToreturn = {
                foundObj : existingShortUrl,
                allUrl : jsonUrl.data
            }
            return dataToreturn;
        }

        if(existingObj && stmt == 'delete'){
            let userUrlnew = await deleteUrl(existingObj);
            return userUrlnew;   
        }
       
        if(existingObj && stmt == 'regenerate'){
            findObject = jsonUrl.data.findIndex(url => url.id == existingObj.id);
        }

        if(existingObj && stmt == 'urlReq'){
            if(existingObj.userId == saveUser){
                return {message:  existingObj.shortUrl};
            }
            if(existingObj.userId == "unknown" && saveUser !== "unknown"){
                existingObj.userId = saveUser;
                fs.promises.writeFile(path.join('data' , 'url.json') , JSON.stringify(jsonUrl));
                let urlHistory = jsonUrl.data.filter(url => url.userId == saveUser);
                return {message:  existingObj.shortUrl, historyResult : urlHistory};
            }
            if(existingObj.userId !== saveUser && existingObj.userId !== "unknown"){
                return {errorMessage: "this url already exist"};
            }
        }
        else{
            let encryptArray = [];
            let splittedInp = inp.split('//')[1].slice(5,10).split('');
            let rand = Math.round(Math.random()*symbolArray.length);
            
            const shortUrlArray = jsonUrl.data.map(item => item.short);

            for(let i=0;i<5;i++){
                let index = symbolArray.indexOf(splittedInp[i]);
                let encryptIndex = index + rand;
                if(encryptIndex > symbolArray.length){
                    encryptIndex %= symbolArray.length;
                }
                encryptArray.push(symbolArray[encryptIndex]);
            }
    
            let encryptString = encryptArray.join('');
            let findEncrypt = shortUrlArray.find(item => item == encryptString);
            if(findEncrypt){
                return 'again';
            }
            else if(stmt == 'regenerate' && saveUser !== 'unknown'){
                jsonUrl.data[findObject].short = encryptString;
                jsonUrl.data[findObject].shortUrl = `http://localhost:3000/${encryptString}`;
            }
            else{
                    finalObj = {
                        "id":  jsonUrl.id, 
                        "userId": saveUser,
                        "original" : inp,
                        "short": encryptString,
                        "shortUrl": `http://localhost:3000/${encryptString}`,
                        "clicked": 0
                    }
                    jsonUrl.id++;
                    jsonUrl.data.push(finalObj);
                }

                fs.promises.writeFile(path.join('data' , 'url.json') , JSON.stringify(jsonUrl));
                if(saveUser !== 'unknown'){
                    let returnData = {};
                    if(stmt == 'urlReq'){
                        returnData.message = finalObj.shortUrl;
                    }
                    else if( stmt == 'regenerate'){
                        returnData.message = jsonUrl.data[findObject].shortUrl;
                    }
                    returnData.historyResult = jsonUrl.data.filter(url => url.userId == saveUser);
                    return returnData;
                }
                return {message: `http://localhost:3000/${encryptString}`};
            }
        }
    catch(err){
        console.error(err);
        return;
    }
}

async function deleteUrl (existingObj) {
    let jsonUrl = await urlData();
    jsonUrl.data = jsonUrl.data.filter(item => item.id !== existingObj.id);
    fs.promises.writeFile(path.join('data' , 'url.json') , JSON.stringify(jsonUrl));
    let newUrls = jsonUrl.data.filter(url => url.userId == existingObj.userId);
    return newUrls;
}

app.post('/api/urlReq', async (req, res) => {
    try {
        let saveUser = 'unknown';
        if(req.body.urlReq == ""){
            res.json({errorMessage : "please enter your url"});
        }
        else if(req.body.urlReq !== ""){
            let correctUrlFormat = req.body.urlReq.split('://');
            if(correctUrlFormat[0] == "http" || correctUrlFormat[0] == "https"){
                if(req.headers['authorization']  !== ""){
                    let reqHeader = req.headers['authorization'];
                    let token = reqHeader.split(" ")[1];
                    payload = jwt.verify(token, mySEcretKey);
                    saveUser = payload.user;
                }
                let symbolArray = await encrypt(req.body.urlReq, 'urlReq' , saveUser);
        
                if (symbolArray === 'again') {
                    symbolArray = await encrypt(req.body.urlReq, 'urlReq' , saveUser);
                } else {
                    res.json(symbolArray);
                }
            }
            else{
                res.json({errorMessage : "please enter your url in correct form"});
            }
            
        }
    }catch (error) {
        console.error("An error occurred:", error);
    }
});

app.post('/api/regenerate', async (req, res) => {
    try {
            let saveUser = 'unknown';

            if(req.headers['authorization']){
                let reqHeader = req.headers['authorization'];
                let token = reqHeader.split(" ")[1];
                payload = jwt.verify(token, mySEcretKey);
                saveUser = payload.user;
            }
            const symbolArray = await encrypt(req.body.urlReq, 'regenerate', saveUser);
            res.send(symbolArray);

    }catch (error) {
        console.error("An error occurred:", error);
    }
});

app.post('/api/deleteUrl' , async (req ,res) => {
    let reqHeader = req.headers['authorization'];
    let token = reqHeader.split(" ")[1];
    payload = jwt.verify(token, mySEcretKey);
    saveUser = payload.user;
    
    const symbolArray = await encrypt(req.body.urlReq, 'delete' , saveUser);
    res.json({historyResult: symbolArray});
})

app.get('/:x' , async  (req, res) => {
    let shortUrl = req.params.x;
    if(shortUrl == 'favicon.ico'){
        return;
    }
    else{
        encrypt(shortUrl , '' , '')
        .then(dataToreturn => {
            if (dataToreturn) {
                if(dataToreturn.foundObj.userId == 'unknown'){
                    res.redirect(dataToreturn.foundObj.original);
                }else{
                    let filteredUserArray = dataToreturn.allUrl.filter(url => url.userId == dataToreturn.foundObj.userId);
                    res.send({org: dataToreturn.foundObj.original , historyResult: filteredUserArray});
                }
            } else {
                console.log("An error occurred.");
            }
        });
    }
})

app.get('/copy/:x' , (req , res) => {
    let shortUrl = req.params.x;
    encrypt(shortUrl , '' , '')
    .then(dataToreturn => {
        if(dataToreturn){
            res.redirect(dataToreturn.foundObj.original);
        }else{
            res.status(404).send("page did not found");
        }
    })
})

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT  , () => {
    console.log("app is listening to the port : 3000");
})