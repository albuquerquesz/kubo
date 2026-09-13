import { FRONTEND_VALUES, isWebFrontend as isCanonicalWebFrontend } from "@kubojs/types";

import type { Frontend } from "../types";

export const WEB_FRAMEWORKS: readonly Frontend[] = FRONTEND_VALUES.filter(isCanonicalWebFrontend);
