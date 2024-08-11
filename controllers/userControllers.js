const bcrypt=require('bcrypt')
const _=require('lodash')
const {User,validate}=require('../models/user')


module.exports.signUp=async (req,res)=>{
console.log("Sign up terminal 1",req.body)
    const {error}=validate(req.body)
    if (error) return res.status(400).send(error.details[0].message)
        let user={}
    user=await User.findOne({email:req.body.email})
    if (user) return res.status(400).send('user already registered')

        user=new User(_.pick(req.body,['name','email','password']))
console.log("user",user)
        const salt=await bcrypt.genSalt(10)
        user.password=await bcrypt.hash(user.password,salt)

        const token=user.generateJWT()
        
 try{
    const result=await user.save()


    console.log("result",result)
    return res.status(201).send({
        message:"Registration Successful",
        token:token,
        user:_.pick(result,['_id','name','email'])
    })
 }
 catch(err){
    console.log(err);
    return res.status('20000').send("parlam na")

 }


}

module.exports.signIn=async (req,res)=>{

    let user=await User.findOne({email:req.body.email});
    if (!user) return res.status(400).send("invalid email or password")

        const validUser=await bcrypt.compare(req.body.password,user.password)
        if (!validUser) return res.status(400).send("invalid email or password")
            const token =user.generateJWT()
        return res.status(200).send({
            message:"Log in Successful",
            token:token,
            user:_.pick(user,['_id','name','email'])
        })

}