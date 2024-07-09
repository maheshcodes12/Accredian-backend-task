const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SECRET_KEY = "accredian";

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if the user exists
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(400).json({ error: "User does not exist" });
		}

		// Check if the password is correct
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ error: "Invalid password" });
		}

		// Generate a JWT token
		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: "1h",
		});

		res
			.status(200)
			.json({ token, userId: user.id, name: user.name, success: true });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}
});

router.post("/signup", async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return res
				.status(400)
				.json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
			},
		});

		res.status(201).json({ success: true, newUser: newUser });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});

module.exports = router;
