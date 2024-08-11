const router=require('express').Router()

const {ipn,initPayment, paymentSuccess}=require('../controllers/paymentControllers')
const authorize=require('../middlewares/authorize')



router.route('/')
.get(authorize,initPayment)

router.route('/ipn')
.post(ipn)

router.route('/success')
.post(paymentSuccess)

module.exports=router