import { getWebPort, type ProjectConfig } from "@kubojs/types";

type ExampleSetup = {
  readonly enabled: (config: ProjectConfig) => boolean;
  readonly render: (config: ProjectConfig) => string;
};

const generateChatbotSetup = (config: ProjectConfig): string => `
## Chatbot Example

A chat assistant at [http://localhost:${getWebPort(config.frontend)}/chatbot](http://localhost:${getWebPort(config.frontend)}/chatbot): conversation sidebar, a centered prompt that moves down after the first message, streaming answers, expandable reasoning, tool chips, a human-in-the-loop approval card and per-message actions.

- **Agent protocol:** [CopilotKit](https://docs.copilotkit.ai) over [AG-UI](https://docs.ag-ui.com). The runtime lives in this app at \`/api/copilotkit\` (\`apps/web/src/lib/chatbot/runtime.ts\`).
- **Model:** set \`GOOGLE_GENERATIVE_AI_API_KEY\` in \`apps/web/.env\`. Change \`CHATBOT_MODEL\` to switch provider, e.g. \`openai/gpt-6-luna\` with \`OPENAI_API_KEY\` or \`anthropic/claude-sonnet-4-6\` with \`ANTHROPIC_API_KEY\`. Without a key the UI shows which variable is missing.
- **Swap the agent:** replace the \`BuiltInAgent\` in \`runtime.ts\` with any AG-UI agent (LangGraph, Mastra, your own), registered under \`default\`.
- **Frontend tools:** \`setTheme\` lets the agent switch the light/dark theme and \`askUser\` renders the approval card and waits for the answer (\`apps/web/src/components/chatbot/chat-thread.tsx\`).
- **Conversations** are kept in the browser (\`localStorage\`) in this version; see \`use-conversations.ts\` to persist them in your database.${
  config.auth === "better-auth"
    ? "\n- **Auth:** the page and the runtime route require a Better Auth session."
    : ""
}
- **UI:** components adapted from [Beautiful UI](https://www.beautifului.dev) (MIT, see \`apps/web/src/components/chatbot/beautiful-ui/LICENSE\`); icons are drawn with CSS only and respect \`prefers-reduced-motion\`.
- **Built with Kubo:** the sidebar card lives in \`kubo-cta.tsx\`; delete it and its usage to remove it.
- CopilotKit collects anonymous telemetry by default; set \`COPILOTKIT_TELEMETRY_DISABLED=true\` to opt out.
`;

const EXAMPLE_SETUPS: readonly ExampleSetup[] = [
  { enabled: (config) => config.examples.includes("chatbot"), render: generateChatbotSetup },
];

export function generateExampleSetups(config: ProjectConfig): string {
  return EXAMPLE_SETUPS.filter(({ enabled }) => enabled(config))
    .map(({ render }) => render(config))
    .join("");
}
