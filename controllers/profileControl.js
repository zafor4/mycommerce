const {Profile}=require('../models/profile')
const _=require('lodash')



module.exports.getProfile=async (req,res)=>{
    const profile =await Profile.findOne({user:req.user._id})
    .populate('user','name')
    return res.status(201).send(profile)
}

module.exports.setProfile=async (req,res)=>{

    let profile=await Profile.findOne({user:req.user._id})



    if (!profile){

        profile=new Profile(req.body)
        profile['user']=req.user._id
        await profile.save()
        return res.status(200).send("Profile Created")
    }
    else {
        const updatedFields=_.pick(req.body,['phone','address1','address2','city','state','postcode','country'])
        _.assignIn(profile,updatedFields)
        await profile.save()
        return res.status(201).send("Product Updated Successfilly")
    }

}