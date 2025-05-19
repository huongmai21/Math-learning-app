const Stripe = require("stripe");

   const stripeConfig = {
     publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_sample_key",
     secretKey: process.env.STRIPE_SECRET_KEY || "sk_test_sample_key",
     webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_sample_key",
     currency: "VND",
     allowedCountries: ["VN"],
     paymentMethods: ["card"],
     mode: "development",
   };

   const stripe = Stripe(stripeConfig.secretKey);

   if (stripeConfig.mode === "development") {
     console.warn(
       "Stripe đang chạy ở chế độ phát triển. Vui lòng sử dụng HTTPS cho tích hợp Stripe trong môi trường sản xuất."
     );
   }

   module.exports = stripe;