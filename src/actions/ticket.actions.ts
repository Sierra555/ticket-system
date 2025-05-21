"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";
import { getCurrentUser } from "@/lib/current-user";

export async function createTicket(
	prevState: {
		success: boolean;
		message: string;
	},
	formData: FormData
): Promise<{ success: boolean; message: string }> {
	try {
		const subject = formData.get("subject") as string;
		const description = formData.get(
			"description"
		) as string;
		const priority = formData.get("priority") as string;
		const user = await getCurrentUser();

		if (!user) {
			logEvent(
				"Unauthorized ticket creation attempt",
				"ticket",
				{},
				"warning"
			);

			return {
				success: false,
				message: "You must be logged in to create a ticket",
			};
		}

		if (!subject || !description || !priority) {
			logEvent(
				"Validation Error: missing required field",
				"ticket",
				{ subject, description, priority },
				"warning"
			);

			return {
				success: false,
				message: `All fields are required`,
			};
		}

		//Create ticket in db
		const ticket = await prisma.ticket.create({
			data: {
				subject,
				description,
				priority,
				user: {
					connect: { id: user.id },
				},
			},
		});

		logEvent(
			`Ticket created successfully: ${ticket.id}`,
			"ticket",
			{ ticketId: ticket.id },
			"info"
		);

		revalidatePath("tickets");

		return {
			success: true,
			message: "Ticket created successfully",
		};
	} catch (error) {
		logEvent(
			"An error occured while creating the ticket",
			"ticket",
			{ formData: Object.fromEntries(formData.entries()) },
			"error",
			error
		);
		Sentry.captureException(error as Error, {
			extra: {},
		});
		return {
			success: false,
			message: "An error occured while creating the ticket",
		};
	}
}

export async function getTickets() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			logEvent(
				"Unauthorized access to tickets",
				"ticket",
				{},
				"warning"
			);

			return [];
		}

		const tickets = await prisma.ticket.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
		});

		logEvent(
			"Fetched ticket list",
			"ticket",
			{ count: tickets.length },
			"info"
		);

		return tickets;
	} catch (error) {
		logEvent(
			"Error fetching tickets",
			"ticket",
			{},
			"error",
			error
		);

		return [];
	}
}

export async function getTicketById(id: string) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			logEvent(
				"Unauthorized access to the ticket page",
				"ticket",
				{},
				"warning"
			);

			return null;
		}
		const ticket = await prisma.ticket.findUnique({
			where: {
				id: Number(id),
			},
		});

		if (!ticket) {
			logEvent(
				"Ticket not found",
				"ticket",
				{ ticketId: id },
				"warning"
			);
		}

		return ticket;
	} catch (error) {
		logEvent(
			"Error fethching ticket data",
			"ticket",
			{ ticketId: id },
			"error",
			error
		);
	}

	return null;
}

export async function closeTicket(
	prevState: {
		success: boolean;
		message: string;
	},
	formData: FormData
): Promise<{ success: boolean; message: string }> {
	const ticketId = Number(formData.get("ticketId"));

	if (!ticketId) {
		logEvent("Missing ticket id", "ticket", {}, "warning");

		return {
			success: false,
			message: `Ticket id is required`,
		};
	}

	const user = await getCurrentUser();
	if (!user) {
		logEvent("Missing user id", "ticket", {}, "warning");

		return {
			success: false,
			message: "User id is required",
		};
	}

	const ticket = await prisma.ticket.findUnique({
		where: {
			id: ticketId,
			userId: user.id,
		},
	});

	if (!ticket || ticket.userId !== user.id) {
		logEvent(
			"Unauthorized ticket close attempt",
			"ticket",
			{ ticketId, userId: user.id },
			"warning"
		);

		return {
			success: false,
			message:
				"You are not authorized to close this ticket",
		};
	}

	await prisma.ticket.update({
		where: {
			id: ticketId,
		},
		data: {
			status: "Closed",
		},
	});

	revalidatePath("/tickets");
	revalidatePath(`/tickets/${ticketId}`);

	return {
		success: true,
		message: "Ticket closed successfully",
	};
}
