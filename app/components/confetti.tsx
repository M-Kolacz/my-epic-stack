import ReactConfetti from "react-confetti";
import { ClientOnly } from "remix-utils/client-only";

export const Confetti = ({ id }: { id?: string | null }) => {
	if (!id) return null;

	return (
		<ClientOnly>
			{() => (
				<ReactConfetti
					key={id}
					run={!!id}
					recycle={false}
					numberOfPieces={1000}
					width={window.innerWidth}
					height={window.innerHeight}
				/>
			)}
		</ClientOnly>
	);
};
