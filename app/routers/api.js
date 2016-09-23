var User = require('../models/user.js');

var config = require('../../config');

var jsonwebtoken = require ('jsonwebtoken');

var secretKey = config.secretKey;
 function createToken(user){
 	var token = jsonwebtoken.sign({
 		_id : user._id,
 		name : user.name,
 		userName : user.userName,
 	},secretKey,{expiresIn: 1400});
 	return token;
 }


module.exports = function(app,express){

	var api = express.Router();

	api.post('/signup',function(req,res){
		var user = new User({

			name : req.body.name,
			userName : req.body.userName,
			password : req.body.password

		});


		user.save(function(err){
			if(err){
				res.send(err);
				return;
			}

			res.json({message : 'User has been added successfully'});

		});

		
	});

	api.get('/users',function(req,res){
		User.find({},function(err,users){
			if(err){
				res.send(err);
				return;
			}

			res.json(users);
		});
	});

	api.post('/login',function(req,res){
		User.findOne({userName : req.body.userName}).select('password').exec(function(err,user){
			if(err) throw err;

			if(!user){
				res.send({message : "User Doesnot exist"});
			}

			else if(user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.send({message : "Invalid password"});
				}
				else{
					var token = createToken(user);
					res.json({
						success : true,
						message : "Login Success",
						token : token
					})

				}
			}
		});
	});

	api.use(function(req,res,next){
		var token = req.body.token || req.param('token') || req.headers['x-access-token'] ;
		if(token){
			jsonwebtoken.verify(token,secretKey,function(err,decoded){
				if(err){
					res.status(403).send({success : false,message : "Failed to authenticate"});
				}
				else{
					req.decoded = decoded;
					next();		
				}
			});
		}
		else{
			res.status(403).send({success : false,message : 'Token not found'});
		}

	});

	api.get('/',function(req,res){
		console.log('Bypassed Middleware');
		res.json({result :'Bypassed Middleware'});

	});
	return api;
}