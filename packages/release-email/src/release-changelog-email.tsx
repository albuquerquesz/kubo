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

import type { ReleaseChangelogEmailProps } from "./types";

const colors = {
  background: "#111111",
  surface: "#1b1b1b",
  surfaceRaised: "#242424",
  border: "#343434",
  text: "#f7f2e8",
  muted: "#aaa49b",
  yellow: "#f9ad00",
  yellowSoft: "#2e260f",
};

const fontFamily = "Arial, Helvetica, sans-serif";
const monoFamily = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

export function ReleaseChangelogEmail({
  version,
  releaseDate,
  intro,
  changes,
  releaseUrl,
  docsUrl,
  npmUrl,
}: ReleaseChangelogEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>KuboJS {version}: o que mudou e o que você pode usar agora.</Preview>
      <Body style={{ ...styles.body, fontFamily }}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.brand}>
              <span style={styles.brandMark}>■</span> KUBO
            </Text>
            <Text style={styles.headerMeta}>RELEASE NOTES</Text>
          </Section>

          <Section style={styles.hero}>
            <Text style={styles.eyebrow}>NOVA VERSÃO · {releaseDate}</Text>
            <Heading as="h1" style={styles.title}>
              KuboJS <span style={styles.titleAccent}>{version}</span>
            </Heading>
            <Text style={styles.intro}>{intro}</Text>
            <Button href={releaseUrl} style={styles.primaryButton}>
              Ver release completa <span style={styles.buttonArrow}>↗</span>
            </Button>
          </Section>

          <Hr style={styles.divider} />

          <Section>
            <Text style={styles.sectionLabel}>O QUE MUDOU</Text>
            {changes.map((change, index) => (
              <Section key={`${change.category}-${change.title}`} style={styles.changeCard}>
                <Text style={styles.changeIndex}>{String(index + 1).padStart(2, "0")}</Text>
                <Section style={styles.changeContent}>
                  <Text style={styles.changeCategory}>{change.category}</Text>
                  <Heading as="h2" style={styles.changeTitle}>
                    {change.title}
                  </Heading>
                  <Text style={styles.changeDescription}>{change.description}</Text>
                </Section>
              </Section>
            ))}
          </Section>

          <Section style={styles.footerCta}>
            <Text style={styles.footerCtaLabel}>CONTINUE A CONSTRUIR</Text>
            <Text style={styles.footerCtaText}>
              A documentação e os pacotes publicados já estão esperando por você.
            </Text>
            <Text style={styles.linkRow}>
              {docsUrl ? (
                <Link href={docsUrl} style={styles.secondaryLink}>
                  Documentação ↗
                </Link>
              ) : null}
              {docsUrl && npmUrl ? "  " : null}
              {npmUrl ? (
                <Link href={npmUrl} style={styles.secondaryLink}>
                  npm ↗
                </Link>
              ) : null}
            </Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerBrand}>KUBOJS</Text>
            <Text style={styles.footerText}>
              Feito para founders e devs que querem sair do zero com menos atrito.
            </Text>
            <Text style={styles.footerFinePrint}>
              Você está recebendo este email porque acompanha as novidades do KuboJS.
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
    maxWidth: "620px",
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
  headerMeta: {
    color: colors.muted,
    fontFamily: monoFamily,
    fontSize: "10px",
    letterSpacing: "0.12em",
    margin: "8px 0 0",
  },
  hero: {
    padding: "54px 0 48px",
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
    fontSize: "48px",
    fontWeight: "700",
    letterSpacing: "-0.06em",
    lineHeight: "1.04",
    margin: 0,
  },
  titleAccent: {
    color: colors.yellow,
  },
  intro: {
    color: colors.muted,
    fontFamily,
    fontSize: "17px",
    lineHeight: "1.55",
    margin: "24px 0 28px",
    maxWidth: "500px",
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
    fontSize: "16px",
    marginLeft: "7px",
  },
  divider: {
    borderColor: colors.border,
    margin: 0,
  },
  sectionLabel: {
    color: colors.muted,
    fontFamily: monoFamily,
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    margin: "34px 0 14px",
  },
  changeCard: {
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    marginBottom: "10px",
    padding: "20px",
  },
  changeIndex: {
    color: colors.yellow,
    fontFamily: monoFamily,
    fontSize: "11px",
    fontWeight: "700",
    margin: 0,
    width: "36px",
  },
  changeContent: {
    paddingLeft: "36px",
  },
  changeCategory: {
    backgroundColor: colors.yellowSoft,
    color: colors.yellow,
    display: "inline-block",
    fontFamily: monoFamily,
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    margin: "-2px 0 10px",
    padding: "5px 7px",
    textTransform: "uppercase",
  },
  changeTitle: {
    color: colors.text,
    fontFamily,
    fontSize: "19px",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0 0 8px",
  },
  changeDescription: {
    color: colors.muted,
    fontFamily,
    fontSize: "14px",
    lineHeight: "1.55",
    margin: 0,
  },
  footerCta: {
    backgroundColor: colors.surfaceRaised,
    borderLeft: `3px solid ${colors.yellow}`,
    margin: "34px 0",
    padding: "22px 24px",
  },
  footerCtaLabel: {
    color: colors.yellow,
    fontFamily: monoFamily,
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.13em",
    margin: "0 0 10px",
  },
  footerCtaText: {
    color: colors.text,
    fontFamily,
    fontSize: "15px",
    lineHeight: "1.45",
    margin: "0 0 15px",
  },
  linkRow: {
    padding: 0,
  },
  secondaryLink: {
    color: colors.yellow,
    fontFamily: monoFamily,
    fontSize: "11px",
    fontWeight: "700",
    marginRight: "18px",
    textDecoration: "none",
  },
  footer: {
    padding: "26px 0 10px",
  },
  footerBrand: {
    color: colors.text,
    fontFamily: monoFamily,
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    margin: "0 0 10px",
  },
  footerText: {
    color: colors.muted,
    fontFamily,
    fontSize: "12px",
    lineHeight: "1.5",
    margin: "0 0 18px",
  },
  footerFinePrint: {
    color: "#66615a",
    fontFamily,
    fontSize: "11px",
    lineHeight: "1.5",
    margin: 0,
  },
} as const;
