import React from "react";

export type CliSelectOption = {
  label: string;
  description?: string;
  recommended?: boolean;
};

type CliSelectPanelProps = {
  badge?: string;
  question?: string;
  options?: CliSelectOption[];
  /** Option shown below the divider (e.g. docs link). Null hides it. */
  footerOption?: string | null;
  selectedIndex?: number;
  style?: React.CSSProperties;
};

const GOLD = "#FBC80D";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

export const DEFAULT_CLI_OPTIONS: CliSelectOption[] = [
  {
    label: "Full stack, medium",
    recommended: true,
    description:
      "Monorepo com frontend, backend e deploy no mesmo fluxo. Tamanho certo pra começar sem reinventar a stack.",
  },
  {
    label: "Frontend only",
    description: "Só a app web (ou multi-frontend). Backend e infra ficam pra depois.",
  },
  {
    label: "Custom / mínimo",
    description: "Escolhe cada pedaço: ORM, auth, deploy. Mais controle, mais prompts.",
  },
  {
    label: "Digitar algo…",
  },
];

/**
 * Dark CLI select panel (badge + question + numbered options + footer).
 * Visual grammar inspired by product landing “select menus”, brand colors only.
 */
export const CliSelectPanel: React.FC<CliSelectPanelProps> = ({
  badge = "create-kubojs",
  question = "Qual stack você quer montar?",
  options = DEFAULT_CLI_OPTIONS,
  footerOption = null,
  selectedIndex = 0,
  style,
}) => {
  return (
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid #222",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
        width: "100%",
        boxSizing: "border-box",
        padding: "40px 44px 36px",
        fontFamily: MONO,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        ...style,
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: GOLD,
          color: "#0a0a0a",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          padding: "6px 14px",
          borderRadius: 8,
          lineHeight: 1.2,
        }}
      >
        <span aria-hidden style={{ fontSize: 14, opacity: 0.85 }}>
          ▢
        </span>
        {badge}
      </div>

      <p
        style={{
          margin: 0,
          color: "#f5f5f5",
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.35,
        }}
      >
        {question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {options.map((opt, i) => {
          const selected = i === selectedIndex;
          const n = i + 1;
          const labelColor = selected ? GOLD : "#9a9a9a";
          const numColor = selected ? GOLD : "#7a7a7a";

          return (
            <div key={`${n}-${opt.label}`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: labelColor,
                  fontSize: 24,
                  fontWeight: selected ? 600 : 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                }}
              >
                <span
                  style={{
                    width: 18,
                    flexShrink: 0,
                    color: selected ? GOLD : "transparent",
                    fontWeight: 700,
                  }}
                  aria-hidden
                >
                  {">"}
                </span>
                <span style={{ color: numColor, flexShrink: 0 }}>{n}.</span>
                <span>
                  {opt.label}
                  {opt.recommended ? (
                    <span style={{ color: selected ? GOLD : "#9a9a9a" }}> (Recomendado)</span>
                  ) : null}
                </span>
              </div>
              {opt.description ? (
                <p
                  style={{
                    margin: "8px 0 0 0",
                    paddingLeft: 52,
                    color: "#6b6b6b",
                    fontSize: 18,
                    fontWeight: 400,
                    lineHeight: 1.45,
                    letterSpacing: "-0.01em",
                    maxWidth: 820,
                  }}
                >
                  {opt.description}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {footerOption ? (
        <>
          <div
            style={{
              height: 1,
              background: "#2a2a2a",
              marginTop: 4,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              color: "#9a9a9a",
              fontSize: 24,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.35,
              paddingLeft: 0,
            }}
          >
            <span style={{ width: 18, flexShrink: 0, color: "transparent" }} aria-hidden>
              {">"}
            </span>
            <span style={{ color: "#7a7a7a", flexShrink: 0 }}>{options.length + 1}.</span>
            <span>{footerOption}</span>
          </div>
        </>
      ) : null}
    </div>
  );
};
