/*
 * "Built with Kubo" card for the sidebar footer.
 * It is self-contained: delete this file and its <KuboCta /> usage in
 * conversation-sidebar.tsx to remove it, nothing else depends on it.
 */

const KUBO_URL = "https://kubojs.dev/?utm_source=kubo-template&utm_medium=chatbot";

export function KuboCta() {
  return (
    <a
      href={KUBO_URL}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2.5 rounded-card bg-surface p-2.5 shadow-card transition-colors duration-150 hover:bg-hover"
    >
      {/* the Kubo mark: a gold cube drawn with a gradient */}
      <span
        aria-hidden="true"
        className="relative flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[13px] font-bold text-[#2a1f05]"
        style={{ background: "linear-gradient(135deg, #F5D76E, #E0B43E 45%, #E08A2E)" }}
      >
        K
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[12.5px] font-medium text-ink">Built with Kubo</span>
        <span className="truncate text-[11.5px] text-ink-3">
          <span className="animated-underline">Start your own stack at kubojs.dev</span>
        </span>
      </span>
    </a>
  );
}
