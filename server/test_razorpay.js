const Razorpay = require("razorpay");

console.log("Testing Razorpay with provided keys...");

const rzp = new Razorpay({
  key_id: "rzp_test_Sa9eQ3yQLVFKTH",
  key_secret: "usmlT1BQhshl07h4lTJ6EzP1"
});

rzp.orders.create({
  amount: 1000,
  currency: "INR",
  receipt: "rcpt_test_123"
}).then(order => {
  console.log("SUCCESS! Order created:", order.id);
}).catch(err => {
  console.error("FAILED! Error from Razorpay:");
  console.error(err);
});
