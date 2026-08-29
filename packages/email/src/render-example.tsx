import { render, toPlainText } from "react-email";

import { exampleRelease } from "../emails/release-changelog";
import { ReleaseChangelogEmail } from "./release-changelog-email";

const html = await render(<ReleaseChangelogEmail {...exampleRelease} />, { pretty: true });
const text = toPlainText(html);

console.log(html);
console.error("\n--- PLAIN TEXT ---\n");
console.error(text);
