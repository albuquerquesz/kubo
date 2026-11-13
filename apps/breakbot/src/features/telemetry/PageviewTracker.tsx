import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { trackEvent } from "#/shared/telemetry";

// Fora do efeito: o StrictMode monta o efeito duas vezes e o mesmo pageview sairia dobrado.
let lastPath = "";

const capturePageview = (path: string) => {
	if (path === lastPath) return;
	lastPath = path;
	trackEvent("$pageview", { path });
};

// Pageview manual: o SPA tem duas rotas e o pageview automático do SDK está desligado.
export const PageviewTracker = () => {
	const router = useRouter();

	useEffect(() => {
		capturePageview(window.location.pathname);
		return router.subscribe("onResolved", (event) => capturePageview(event.toLocation.pathname));
	}, [router]);

	return null;
};
