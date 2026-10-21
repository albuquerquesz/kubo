import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

import type { MagicLinkEmailProps } from "./types";

const colors = {
  background: "#111111",
  surface: "#1b1b1b",
  border: "#343434",
  text: "#f7f2e8",
  muted: "#aaa49b",
  yellow: "#f9ad00",
};

const fontFamily = "Arial, Helvetica, sans-serif";
const monoFamily = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

export function MagicLinkEmail({ url, expiresInMinutes = 5 }: MagicLinkEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu link de acesso ao Kubo</Preview>
      <Body style={{ ...styles.body, fontFamily }}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>
              <span style={styles.brandMark}>■</span> KUBO
            </Text>
          </Section>

          <Section style={styles.hero}>
            <Text style={styles.eyebrow}>LINK DE ACESSO</Text>
            <Heading as="h1" style={styles.title}>
              Entre no Kubo
            </Heading>
            <Text style={styles.intro}>
              Clique no botão abaixo para entrar. O link expira em {expiresInMinutes} minutos e só
              pode ser usado uma vez.
            </Text>
            <Button href={url} style={styles.primaryButton}>
              Entrar no Kubo <span style={styles.buttonArrow}>→</span>
            </Button>
          </Section>

          <Section style={styles.fallback}>
            <Text style={styles.fallbackLabel}>OU COPIE E COLE NO NAVEGADOR</Text>
            <Link href={url} style={styles.fallbackLink}>
              {url}
            </Link>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerFinePrint}>
              Se você não pediu este acesso, pode ignorar este email com segurança.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: colors.background,
    margin: 0,
    padding: "32px 12px",
  },
  container: {
    backgroundColor: colors.background,
    margin: "0 auto",
    maxWidth: "520px",
    width: "100%",
  },
  header: {
    borderBottom: `1px solid ${colors.border}`,
    padding: "0 0 22px",
  },
  brand: {
    color: colors.text,
    fontFamily: monoFamily,
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.16em",
    margin: 0,
  },
  brandMark: {
    color: colors.yellow,
    fontSize: "12px",
    marginRight: "7px",
  },
  hero: {
    padding: "44px 0 36px",
  },
  eyebrow: {
    color: colors.yellow,
    fontFamily: monoFamily,
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.13em",
    margin: "0 0 18px",
  },
  title: {
    color: colors.text,
    fontFamily,
    fontSize: "36px",
    fontWeight: "700",
    letterSpacing: "-0.04em",
    lineHeight: "1.08",
    margin: 0,
  },
  intro: {
    color: colors.muted,
    fontFamily,
    fontSize: "16px",
    lineHeight: "1.55",
    margin: "20px 0 28px",
  },
  primaryButton: {
    backgroundColor: colors.yellow,
    borderRadius: "4px",
    color: "#16120a",
    fontFamily,
    fontSize: "13px",
    fontWeight: "700",
    padding: "13px 17px",
    textDecoration: "none",
  },
  buttonArrow: {
    fontSize: "15px",
    marginLeft: "7px",
  },
  fallback: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    margin: "0 0 32px",
    padding: "16px 18px",
  },
  fallbackLabel: {
    color: colors.muted,
    fontFamily: monoFamily,
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    margin: "0 0 8px",
  },
  fallbackLink: {
    color: colors.yellow,
    fontFamily: monoFamily,
    fontSize: "11px",
    wordBreak: "break-all",
  },
  divider: {
    borderColor: colors.border,
    margin: 0,
  },
  footer: {
    padding: "22px 0 10px",
  },
  footerFinePrint: {
    color: "#66615a",
    fontFamily,
    fontSize: "11px",
    lineHeight: "1.5",
    margin: 0,
  },
} as const;
