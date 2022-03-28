var jwt =require('jsonwebtoken');
var config = require("../config/config");
module.exports ={
    auth: (req,res,next)=>{
        
            jwt.verify(req.headers.token,config.jwtSecretKey,(error,result)=>{
                if(error)
                { 
                    console.log("Error is============>", error)
                    return res.send({ response_code: 500, response_message: "Internal server error",error })
                }
                else if(!result){
                   console.log("Token is not correct") 
                   res.send({response_code:500,response_message:"Invalid Token"})
                }
                else{
                    console.log("Token match");
                    next();
                }

            }) 
           
        
    }
}