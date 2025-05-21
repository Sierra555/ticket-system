"use server";

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "@/utils/sentry";
import {
	signAuthToken,
	setAuthCookie,
	removeAuthCookie,
} from "@/lib/auth";

//Register new user
export async function registerUser(
	prevState: {
		success: boolean;
		message: string;
	},
	formData: FormData
): Promise<{ success: boolean; message: string }> {
	try {
		const email = formData.get("email") as string;
		const name = formData.get("name") as string;
		const password = formData.get("password") as string;

		if (!name || !email || !password) {
			logEvent(
				"Missing required fields",
				"auth",
				{ name, email },
				"warning"
			);

			return {
				success: false,
				message: "Missing required fields",
			};
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			logEvent(
				`Registration failed: user already exists: ${email}`,
				"auth",
				{ name, email },
				"warning"
			);

			return {
				success: false,
				message: "Registration failed: user already exists",
			};
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
			},
		});

		const token = await signAuthToken({
			userId: newUser.id,
			name: newUser.name,
		});

		await setAuthCookie(token);

		logEvent(
			"User was registered successfully",
			"auth",
			{ userId: newUser.id, email },
			"info"
		);

		return {
			success: true,
			message: "User was registered successfully",
		};
	} catch (error) {
		logEvent(
			"Failed user registration",
			"auth",
			{},
			"error",
			error
		);

		return {
			success: false,
			message: "Failed user registration",
		};
	}
}

//Log out user and remove token from cookie

export async function logoutUser(): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		await removeAuthCookie();

		return {
			success: true,
			message: "User log out successfully",
		};
	} catch (error) {
		logEvent(
			"Failed log out user",
			"auth",
			{},
			"error",
			error
		);

		return {
			success: false,
			message: "Failed log out",
		};
	}
}

//Log in user

export async function loginUser(
	prevState: {
		success: boolean;
		message: string;
	},
	formData: FormData
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		if (!email || !password) {
			logEvent(
				"Validation error: missing required fields",
				"auth",
				{ email },
				"warning"
			);

			return {
				success: false,
				message: "Missing required fields",
			};
		}

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user || !user.password) {
			logEvent(
				"Login failed: user not found",
				"auth",
				{ email },
				"warning"
			);

			return {
				success: false,
				message: "Not registered yet",
			};
		}

		const isMatch = await bcrypt.compare(
			password,
			user.password
		);

		if (!isMatch) {
			logEvent(
				"Login failed: password doesn't match",
				"auth",
				{ email },
				"warning"
			);

			return {
				success: false,
				message: "Password doesn't match",
			};
		}

		const token = await signAuthToken({
			userId: user.id,
			name: user.name,
		});

		await setAuthCookie(token);

		return {
			success: true,
			message: "Verification passed",
		};
	} catch (error) {
		logEvent(
			"Failed to log in",
			"auth",
			{},
			"error",
			error
		);

		return {
			success: false,
			message: "Failed to log in",
		};
	}
}
