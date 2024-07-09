const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
	const { id_of_referrer, email } = req.body;

	try {
		const isAlreadyReferred = await prisma.referral.findMany({
			where: { referee: email },
		});
		if (isAlreadyReferred.length > 0) {
			return res
				.status(400)
				.json({ success: false, message: "You have been referred already" });
		}

		const user = await prisma.user.findUnique({
			where: { id: id_of_referrer },
		});

		if (!user) {
			return res.status(400).json({ error: "Referrer does not exist" });
		}

		const newReferal = await prisma.referral.create({
			data: {
				referrer: user.email,
				referee: email,
				status: "ok",
			},
		});

		res
			.status(200)
			.json({ success: true, message: "Referal added successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}
});

router.get("/getreferals", async (req, res) => {
	const { email } = req.query;

	const data = { referedFrom: null, referedTo: [] };

	try {
		const referedFrom = await prisma.referral.findMany({
			where: { referee: email },
		});
		if (referedFrom) {
			data.referedFrom = referedFrom[0]?.referrer;
		}

		const referedTo = await prisma.referral.findMany({
			where: { referrer: email },
		});

		if (referedTo) {
			for (let i = 0; i < referedTo.length; i++) {
				const element = referedTo[i];
				console.log(element);
				data.referedTo.push(element.referee);
			}
		}

		res.status(201).json({ success: true, data: data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
