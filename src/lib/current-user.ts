import { prisma } from "@/db/prisma";
import { VerifyAuthToken, getAuthCookie } from "./auth";
import { logEvent } from "@/utils/sentry";

type AuthPayload = {
	userId: string;
};

export async function getCurrentUser() {
	try {
		const token = (await getAuthCookie()) as string;
		if (!token) return null;

		const payload = (await VerifyAuthToken(
			token
		)) as AuthPayload;

		if (!payload?.userId) return null;

		const user = await prisma.user.findUnique({
			where: {
				id: payload.userId,
			},
			select: {
				id: true,
				name: true,
				email: true,
			},
		});

		return user;
	} catch (error) {
		logEvent(
			"Error getting current user",
			"user",
			{},
			"error",
			error
		);
		return null;
	}
}
