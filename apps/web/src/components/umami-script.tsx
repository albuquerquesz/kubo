"use client";

import { useEffect } from "react";

const SCRIPT_ID = "umami-analytics";
const SCRIPT_SRC = "https://umami.amanv.cloud/script.js";
const WEBSITE_ID = "3fe218f9-a51b-40c3-ab37-d65e6963d686";

export default function UmamiScript() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.websiteId = WEBSITE_ID;
    document.body.appendChild(script);
  }, []);

  return null;
}
