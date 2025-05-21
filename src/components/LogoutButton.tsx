"use client";

import { useActionState, useEffect } from "react";
import { logoutUser } from "@/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const LogoutButton = () => {
	const router = useRouter();
	const initialState = {
		success: false,
		message: "",
	};

	const [state, formAction, pending] = useActionState(
		logoutUser,
		initialState
	);

	useEffect(() => {
		if (state.success) {
			toast.success("Logout successful");
			router.push("/login");
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<form action={formAction}>
			<button
				type="submit"
				className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
			>
				{pending ? (
					<ClipLoader
						size={20}
						color="#fff"
						className="mx-auto"
					/>
				) : (
					"Logout"
				)}
			</button>
		</form>
	);
};

export default LogoutButton;
