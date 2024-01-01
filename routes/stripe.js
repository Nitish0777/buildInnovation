import express from "express";
import Stripe from "stripe";

const KEY =
  "sk_test_51OHRWBSBiNhl5WCsUuUuhD8tG0ryrkJTEIBvwV5k16G2oiybLecFeGDJJZYZ1eTPac5QypeEvSNHD2TpD9q18miO00cKcyJAwE";
console.log("STRIPE KEY", KEY);

const stripe = new Stripe(`${KEY}`, {
  apiVersion: "2020-08-27",
});

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  console.log("req.body", req.body.cartItems.cart[0].name);
  const priceInPaise = Math.floor(parseFloat(req.body.totalPrice) * 100);
  console.log("priceInPaise", priceInPaise);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "inr", // Replace with your actual currency
          product_data: {
            name: req.body.cartItems.cart[0].name, // Use the product name from req.body
            // images: [""], // Add your image URLs
          },
          unit_amount: priceInPaise, // Use the unit amount from the mapping
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:3000/checkout-success`,
    cancel_url: `http://localhost:3000/cart`,
  });
  console.log("session", session);
  res.send({ URL: session.url });
});

export default router;
