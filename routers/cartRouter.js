const router=require('express').Router()
const {createCartItem,getCartItems,updatecartItem,deleteCartItem}=require('../controllers/cartControllers')
const authorize=require('../middlewares/authorize')


router.route('/')
.get(authorize,getCartItems)
.post(authorize,createCartItem)
.put(authorize,updatecartItem)


router.route('/:id')
.delete(authorize,deleteCartItem)
module.exports=router