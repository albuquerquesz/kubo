import KuboCliTerminal from "./kubo-cli-terminal";

export default function StackFlowSection() {
  return (
    <section
      aria-labelledby="stack-flow-title"
      className="mx-auto my-12 box-border h-[960px] w-[1200px] max-w-full overflow-hidden rounded-3xl bg-yellow-400 p-16 sm:my-16"
    >
      <h2 id="stack-flow-title" className="sr-only">
        Fluxo de criação de um projeto Kubo no terminal
      </h2>
      <KuboCliTerminal />
    </section>
  );
}
