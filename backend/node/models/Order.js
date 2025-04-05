const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
      }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    guestInfo: {
      name: { type: String, required: function() { return !this.user; } },
      email: { type: String, required: function() { return !this.user; } },
      phone: { type: String, required: function() { return !this.user; } }
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
