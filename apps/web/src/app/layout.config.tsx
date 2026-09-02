import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

import { KuboMark } from "@/components/brand/kubo-mark";
import type { Dictionary } from "@/i18n";
import { ptBR } from "@/i18n/dictionaries/pt-BR";
import discordLogo from "@/public/icon/discord.svg";
import npmLogo from "@/public/icon/npm.svg";
import xLogo from "@/public/icon/x.svg";

export const logo = <KuboMark title="Kubo" className="size-8" />;

export function getLinks(nav: Dictionary["nav"]): LinkItemType[] {
  return [
    {
      text: nav.docs,
      url: "/docs",
      active: "nested-url",
    },
    {
      text: nav.builder,
      url: "/new",
    },
    {
      text: nav.analytics,
      url: "/analytics",
    },
    {
      text: nav.demo,
      url: "https://my-kubo-app.amanv.cloud/",
      external: true,
    },
    {
      text: "NPM",
      icon: <Image src={npmLogo} alt="npm" className="size-4 invert-0 dark:invert" />,
      label: "NPM",
      type: "icon",
      url: "https://www.npmjs.com/package/create-kubojs",
      external: true,
      secondary: true,
    },
    {
      text: "X",
      icon: <Image src={xLogo} alt="x" className="size-4 invert dark:invert-0" />,
      label: "X",
      type: "icon",
      url: "https://x.com/byalbuquerquesz",
      external: true,
      secondary: true,
    },
    {
      text: "Discord",
      icon: <Image src={discordLogo} alt="discord" className="size-5 invert-0 dark:invert" />,
      label: "Discord",
      type: "icon",
      url: "https://discord.gg/ZYsbjpDaM5",
      external: true,
      secondary: true,
    },
  ];
}

export function getBaseOptions(dictionary: Dictionary): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {logo}
          <span className="font-medium font-mono text-md tracking-tighter">Kubo</span>
        </>
      ),
    },
    links: getLinks(dictionary.nav),
    githubUrl: "https://github.com/albuquerquesz/kubo",
    themeSwitch: {
      enabled: false,
    },
  };
}

/** Default PT options for callers that do not resolve locale yet. */
export const links: LinkItemType[] = getLinks(ptBR.nav);
export const baseOptions: BaseLayoutProps = getBaseOptions(ptBR);
