import { ClipLoader } from "react-spinners";

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<ClipLoader
				size={50}
				color="grey"
			/>
		</div>
	);
}
