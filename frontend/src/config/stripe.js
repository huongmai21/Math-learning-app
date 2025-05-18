// Cấu hình Stripe cho môi trường phát triển
const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_sample_key",
  secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY || "sk_test_sample_key",
  webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET || "whsec_sample_key",
  currency: "VND",
  allowedCountries: ["VN"],
  paymentMethods: ["card"],
  mode: "development", // 'development' hoặc 'production'
}

// Kiểm tra môi trường
if (stripeConfig.mode === "development") {
  console.warn(
    "Stripe đang chạy ở chế độ phát triển. Vui lòng sử dụng HTTPS cho tích hợp Stripe trong môi trường sản xuất.",
  )
}

export default stripeConfig
