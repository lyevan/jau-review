"use client";

/* COMPONENTS */
import { Toaster as RhtToaster, ToastBar } from "react-hot-toast";

const Toaster = () => {
	return (
		<RhtToaster
			position="bottom-right"
			toastOptions={{
				duration: 5000,
				style: {
					padding: "0",
				},
				success: {
					iconTheme: {
						primary: "#258750",
						secondary: "#FFFFFF",
					}
				},
				error: {
					iconTheme: {
						primary: "#D83A52",
						secondary: "#FFFFFF",
					},
				},
			}}
		>
			{(t) => (
				<ToastBar toast={t} position="bottom-right">
					{({ icon, message }) => {
						const toast_title = t.type === "success" ? "Success" : "Error Occurred";

						return (
							<div className="flex w-full items-center gap-[16] px-[16] py-[12]">
								<div className="flex size-[16] items-center justify-center rounded-full">
									{icon}
								</div>
								<div className="flex flex-col items-start *:m-[0px_0px_!important]">
									<span className="text-title-s-bold text-t-primary-black">{toast_title}</span>
									<span className="max-w-[250] text-paragraph-s-reg text-t-primary-black *:m-[0px_0px_!important]">
										{message}
									</span>
								</div>
							</div>
						);
					}}
				</ToastBar>
			)}
		</RhtToaster>
	);
};

export default Toaster;
