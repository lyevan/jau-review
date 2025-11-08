/* REACT */
import { PropsWithChildren } from "react";
/* PLUGINS */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Providers = ({ children }: PropsWithChildren) => {
	const client = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export default Providers;
