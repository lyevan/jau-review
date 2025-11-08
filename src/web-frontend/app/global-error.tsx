"use client";

import { Button } from "@/app/_components/ui/Button";

export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<div className="text-foreground flex h-screen flex-col items-center justify-center">
					<h1 className="text-8xl">Oops!</h1>
					<p className="text-4xl">Something went wrong.</p>
					<Button className="mt-4" onClick={() => reset()}>
						Try again
					</Button>
				</div>
			</body>
		</html>
	);
}
