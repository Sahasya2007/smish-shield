const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("SIH SMS Security Backend is working!");
});

app.post("/check-sms", (req, res) => {

    const message = req.body.message || "";

    let risk = 0;
    let reasons = [];

    const text = message.toLowerCase();

    if (text.includes("otp")) {
        risk += 20;
        reasons.push("OTP detected");
    }

    if (text.includes("winner")) {
        risk += 20;
        reasons.push("Winner message detected");
    }

    if (text.includes("prize")) {
        risk += 20;
        reasons.push("Prize message detected");
    }

    if (text.includes("claim")) {
        risk += 20;
        reasons.push("Claim request detected");
    }

    if (text.includes("http")) {
        risk += 20;
        reasons.push("Link detected");
    }

    let result;

    if (risk >= 60) {
        result = "BLOCK";
    } else if (risk >= 30) {
        result = "WARN";
    } else {
        result = "SAFE";
    }

    res.json({
        message: message,
        riskScore: risk,
        result: result,
        reasons: reasons
    });
});

app.listen(5000, () => {
    console.log("SIH Backend is running!");
    console.log("http://localhost:5000");
});