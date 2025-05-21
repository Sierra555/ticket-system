"use client";

import { registerUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";

const RegisterForm = () => {
	const router = useRouter();

	const initState = {
		success: false,
		message: "",
	};

	const [state, formAction, pending] = useActionState(
		registerUser,
		initState
	);

	useEffect(() => {
		if (state.success) {
			toast.success("Registration successful!");
			router.push("/tickets");
			router.refresh();
		} else if (state.message) {
			toast.error(state.message);
		}
	}, [state, router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
			<div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 border border-gray-200">
				<h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
					Register
				</h1>

				<form
					action={formAction}
					className="space-y-4 text-gray-700"
				>
					<input
						className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						type="text"
						name="name"
						placeholder="Your Name"
						autoComplete="name"
						required
					/>
					<input
						className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						type="email"
						name="email"
						placeholder="Your Email"
						autoComplete="email"
						required
					/>
					<input
						className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
						type="password"
						name="password"
						placeholder="Password"
						autoComplete="new-password"
						required
					/>
					<button
						className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
						type="submit"
						disabled={pending}
					>
						{pending ? (
							<ClipLoader
								size={20}
								color="#fff"
								className="mx-auto"
							/>
						) : (
							"Register"
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default RegisterForm;
