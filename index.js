const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const userRoute = require("./routes/userRoute.js");
const referRoute = require("./routes/referRoute.js");

async function main() {
	console.log("Database connected successfully");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

dotenv.config({
	path: "./.env",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", userRoute);
app.use("/refer", referRoute);
const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
