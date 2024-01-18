const express = require("express");
const app = express();
const cors = require('cors');

app.use(express.json({}));
app.use(cors());

const stripe = require("stripe")("sk_test_51NUMLRL40JtRd3xc2BmtyjriYrQaDXh4v3F3m6EX5Awlem0qmjoaouJXh15CDs95RGT6zQyie8aKQyjFDN3vOGbx00fPC8UoGM");

app.get("/readers", async (req, res) => {
    try {
        const { data: readers } = await stripe.terminal.readers.list();
        console.log(readers)
        res.send( {readersList: readers});
    } catch (e) {
        res.send({error : { message : e.message }});
    }
})

app.post("/readers/process-payment", async (req, res) => {
    try {
        const { amount, readerId } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "eur",
            amount,
            payment_method_types: ["card_present"],
            capture_method: "manual"
        });
        const reader = await stripe.terminal.readers.processPaymentIntent(readerId, {
            payment_intent: paymentIntent.id
        });
        res.send({ reader, paymentIntent });
    } catch (e) {
        res.send({error : { message : e.message }});
    }
})

app.post("/payments/capture", async (req,res) => {
    try {
        const { paymentIntentId } = req.body;
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        res.send({ paymentIntent });
    } catch (e) {
        res.send({ error: { message: e.message }})
    }
})

app.post("/readers/cancel-action", async (req, res) => {
    try {
        const { readerId } = req.body;
        const reader = await stripe.terminal.readers.cancelAction(readerId);
        res.send({ reader })
    } catch (e) {
        res.send({ error: { message: e.message }})
    }
})

app.listen(4242, () =>
    console.log(`Node server listening at http://localhost:4242`)
);
