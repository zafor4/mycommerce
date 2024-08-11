const router=require('express').Router()

const {ipn,initPayment}=require('../controllers/paymentControllers')
const authorize=require('../middlewares/authorize')



router.route('/')
.get(authorize,initPayment)

router.route('/ipn')
.post(ipn)

module.exports=router