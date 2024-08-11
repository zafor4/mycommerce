const SSLCommerz = require("ssl-commerz-node");
const PaymentSession = SSLCommerz.PaymentSession;
const generateUniqueId = require('generate-unique-id');
const { CartItem }=require('../models/cartItem')
const {Profile}=require('../models/profile');
const {Order}=require('../models/order')
const {Payment}=require('../models/payment')


module.exports.ipn=async (req,res)=>{
    const payment=new Payment(req.body)
    const tran_id=payment['tran_id']
    if (payment['status']==='VALID'){
        const order=await Order.updateOne({transaction_id:tran_id},{status:'Complete'})
        await CartItem.deleteMany(order.cartItems)
    }
    else {
        await Order.deleteOne({transaction_id:tran_id})
    }
    await payment.save()
    return res.status(201).send("IPN")
}



module.exports.initPayment=async (req,res)=>{

    const userId=req.user._id
    const cartItems=await CartItem.find({user:userId})
    const profile=await Profile.findOne({user:userId})

    const {address1,address2,city,state,postcode,country,phone}=profile





    const total_amount=cartItems.map(item=>item.count*item.price)
    .reduce((a,b)=>a+b,0)

    const total_item=cartItems.map(item=>item.count)
    .reduce((a,b)=>a+b,0)
    const tran_id=generateUniqueId()




    const payment = new PaymentSession(
        true,
        process.env.SSLCOMMERZ_STORE_ID,
        process.env.SSLCOMMERZ_STORE_PASSWORD
      )


      payment.setUrls({
        success: "yoursite.com/success", // If payment Succeed
        fail: "yoursite.com/fail", // If payment failed
        cancel: "yoursite.com/cancel", // If user cancel payment
        ipn: "https://mycommerce-iy3p.onrender.com/api/payment/ipn", // SSLCommerz will send http post request in this link
      });


      payment.setOrderInfo({
        total_amount: total_amount, // Number field
        currency: "BDT", // Must be three character string
        tran_id: tran_id, // Unique Transaction id
        emi_option: 0, // 1 or 0
      });

      payment.setCusInfo({
        name: req.user.name,
        email: req.user.email,
        add1: address1,
        add2: address2,
        city: city,
        state:state,
        postcode: postcode,
        country: country,
        phone: phone,
        fax: phone
      });


      payment.setShippingInfo({
        method: "Courier", //Shipping method of the order. Example: YES or NO or Courier
        num_item: total_item,
        name: req.user.name,
        add1: address1,
        add2: address2,
        city: city,
        state:state,
        postcode: postcode,
        country: country,
      });

      payment.setProductInfo({
        product_name: "various product",
        product_category: "general",
        product_profile: "general",
      });
try{

    response= await payment.paymentInit()
    let order=new Order({cartItems:cartItems,user:userId,transaction_id:tran_id,address:profile})
    if (response.status==='SUCCESS'){
        order.sessionKey=response["sessionkey"]
        await order.save()

    }
    return res.status(200).send(response)
}
catch (err) {
    console.error("Error initializing payment:", err);
    return res.status(500).send({ error: "Error initializing payment" });
  }
  


}