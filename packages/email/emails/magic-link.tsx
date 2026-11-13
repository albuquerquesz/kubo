import { MagicLinkEmail } from "../src/magic-link-email";

export default function MagicLinkPreview() {
  return <MagicLinkEmail url="https://kubojs.dev/api/auth/magic-link/verify?token=example" />;
}
