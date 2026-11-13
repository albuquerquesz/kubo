/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_POSTHOG_KEY?: string;
	readonly VITE_POSTHOG_HOST?: string;
	readonly VITE_POSTHOG_DEBUG?: string;
	readonly VITE_BUILD_SHA?: string;
	readonly VITE_APP_VERSION?: string;
}
