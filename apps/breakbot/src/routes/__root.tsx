import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { PageviewTracker, RouteErrorScreen } from "#/features/telemetry";
import appCss from "../styles.css?url";

const RootDocument = ({ children }: PropsWithChildren) => (
	<html lang="pt-BR">
		<head>
			<HeadContent />
		</head>
		<body>
			{children}
			<PageviewTracker />
			<Scripts />
		</body>
	</html>
);

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
			},
			{ name: "theme-color", content: "#05070a" },
			{ title: "PUSH" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
	errorComponent: RouteErrorScreen,
});
