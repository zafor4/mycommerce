require('dotenv/config')
const app=require('./app')

const mongoose=require('mongoose')

mongoose.connect(process.env.MONGODB_URL_LOCAL)
.then(()=>console.log("connected to mongoDB!!!"))
.catch(err=>console.log("MongoDB connection failed!!"))


const port =process.env.PORT || 3001;

app.listen(port,()=>console.log(`App running on port ${port}`))