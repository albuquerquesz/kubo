export interface CustomSearchItem {
  title: string;
  url: string;
  content: string;
  tags: string[];
}

export const customSearchItems: CustomSearchItem[] = [
  {
    title: "Análise",
    url: "/analytics",
    content: "Análise de criação de projetos e telemetria do CLI",
    tags: ["analise", "analytics", "insights", "estatisticas", "dados", "metricas"],
  },
  {
    title: "Exibição",
    url: "/showcase",
    content: "Projetos criados com o kubojs",
    tags: ["exibicao", "showcase", "projetos", "exemplos", "demos", "portfolio"],
  },
  {
    title: "Builder",
    url: "/new",
    content: "Construtor visual de stack",
    tags: ["builder", "criar", "novo", "projeto", "setup", "stack"],
  },
  {
    title: "Repositório no GitHub",
    url: "https://github.com/albuquerquesz/kubo",
    content: "Código-fonte no GitHub",
    tags: ["github", "codigo", "repositorio", "contribuir", "star"],
  },
  {
    title: "Pacote NPM",
    url: "https://www.npmjs.com/package/kubojs",
    content: "Pacote NPM do kubojs",
    tags: ["npm", "pacote", "instalar", "cli", "ferramenta"],
  },
  {
    title: "X (Twitter)",
    url: "https://x.com/byalbuquerquesz",
    content: "X",
    tags: ["twitter", "x", "social", "atualizacoes", "anuncios", "seguir"],
  },
  {
    title: "Comunidade no Discord",
    url: "https://discord.gg/ZYsbjpDaM5",
    content: "Discord",
    tags: ["discord", "comunidade", "chat", "ajuda", "suporte", "discussoes"],
  },
];

export function filterCustomItems(
  items: CustomSearchItem[],
  searchQuery: string,
): CustomSearchItem[] {
  if (!searchQuery) return items;

  const searchLower = searchQuery.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
  );
}
