import type { TechCategory } from "./types";

export const ICON_BASE_URL = "https://r2.kubojs.dev/icons";

export const TECH_OPTIONS: Record<
  TechCategory,
  {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    default?: boolean;
    className?: string;
  }[]
> = {
  api: [
    {
      id: "trpc",
      name: "tRPC",
      description: "APIs type-safe de ponta a ponta",
      icon: `${ICON_BASE_URL}/trpc.svg`,
      color: "from-blue-500 to-blue-700",
      default: true,
    },
    {
      id: "orpc",
      name: "oRPC",
      description: "APIs type-safe de forma simples",
      icon: `${ICON_BASE_URL}/orpc.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "none",
      name: "Sem API",
      description: "Sem camada de API (rotas de API desabilitadas)",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  webFrontend: [
    {
      id: "tanstack-router",
      name: "TanStack Router",
      description: "Router type-safe moderno para React",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-blue-400 to-blue-600",
      default: true,
    },
    {
      id: "react-router",
      name: "React Router",
      description: "Roteamento declarativo para React",
      icon: `${ICON_BASE_URL}/react-router.svg`,
      color: "from-cyan-400 to-cyan-600",
      default: false,
    },
    {
      id: "tanstack-start",
      name: "TanStack Start",
      description: "Framework full-stack React e Solid com TanStack Router",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-purple-400 to-purple-600",
      default: false,
    },
    {
      id: "next",
      name: "Next.js",
      description: "Framework React com renderização híbrida",
      icon: `${ICON_BASE_URL}/nextjs.svg`,
      color: "from-gray-700 to-black",
      default: false,
    },
    {
      id: "nuxt",
      name: "Nuxt",
      description: "Framework full-stack Vue (SSR, SSG, híbrido)",
      icon: `${ICON_BASE_URL}/nuxt.svg`,
      color: "from-green-400 to-green-700",
      default: false,
    },
    {
      id: "svelte",
      name: "Svelte",
      description: "Apps web com reatividade aprimorada",
      icon: `${ICON_BASE_URL}/svelte.svg`,
      color: "from-orange-500 to-orange-700",
      default: false,
    },
    {
      id: "solid",
      name: "Solid",
      description: "Reatividade simples e performática para UIs",
      icon: `${ICON_BASE_URL}/solid.svg`,
      color: "from-blue-600 to-blue-800",
      default: false,
    },
    {
      id: "astro",
      name: "Astro",
      description: "Framework web para sites orientados a conteúdo",
      icon: `${ICON_BASE_URL}/astro.svg`,
      color: "from-purple-500 to-orange-500",
      default: false,
    },
    {
      id: "none",
      name: "Sem frontend web",
      description: "Sem frontend baseado na web",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: false,
    },
  ],
  nativeFrontend: [
    {
      id: "native-bare",
      name: "Expo + Bare",
      description: "Expo com StyleSheet (sem lib de estilo)",
      icon: `${ICON_BASE_URL}/expo.svg`,
      color: "from-blue-400 to-blue-600",
      className: "invert-0 dark:invert",
      default: true,
    },
    {
      id: "native-uniwind",
      name: "Expo + Uniwind",
      description: "Bindings Tailwind mais rápidos para React Native com HeroUI Native",
      icon: `${ICON_BASE_URL}/expo.svg`,
      color: "from-purple-400 to-purple-600",
      className: "invert-0 dark:invert",
      default: false,
    },
    {
      id: "native-unistyles",
      name: "Expo + Unistyles",
      description: "Expo com Unistyles (estilo type-safe)",
      icon: `${ICON_BASE_URL}/expo.svg`,
      color: "from-pink-400 to-pink-600",
      className: "invert-0 dark:invert",
      default: false,
    },
    {
      id: "none",
      name: "Sem frontend nativo",
      description: "Sem frontend mobile nativo",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: false,
    },
  ],
  runtime: [
    {
      id: "bun",
      name: "Bun",
      description: "Runtime e toolkit JavaScript rápido",
      icon: `${ICON_BASE_URL}/bun.svg`,
      color: "from-amber-400 to-amber-600",
      default: true,
    },
    {
      id: "node",
      name: "Node.js",
      description: "Ambiente de runtime JavaScript",
      icon: `${ICON_BASE_URL}/node.svg`,
      color: "from-green-400 to-green-600",
    },
    {
      id: "workers",
      name: "Cloudflare Workers",
      description: "Runtime serverless na edge",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "none",
      name: "Sem runtime",
      description: "Sem runtime específico",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  backend: [
    {
      id: "hono",
      name: "Hono",
      description: "Framework web ultrarrápido",
      icon: `${ICON_BASE_URL}/hono.svg`,
      color: "from-blue-500 to-blue-700",
      default: true,
    },
    {
      id: "elysia",
      name: "Elysia",
      description: "Framework web em TypeScript",
      icon: `${ICON_BASE_URL}/elysia.svg`,
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "express",
      name: "Express",
      description: "Framework Node.js popular",
      icon: `${ICON_BASE_URL}/express.svg`,
      color: "from-gray-500 to-gray-700",
    },
    {
      id: "fastify",
      name: "Fastify",
      description: "Framework web rápido e leve para Node.js",
      icon: `${ICON_BASE_URL}/fastify.svg`,
      color: "from-gray-500 to-gray-700",
    },
    {
      id: "convex",
      name: "Convex",
      description: "Backend-as-a-service reativo",
      icon: `${ICON_BASE_URL}/convex.svg`,
      color: "from-pink-500 to-pink-700",
    },
    {
      id: "self-next",
      name: "Next.js fullstack",
      description: "Usa as rotas de API nativas do Next.js",
      icon: `${ICON_BASE_URL}/nextjs.svg`,
      color: "from-gray-700 to-black",
    },
    {
      id: "self-tanstack-start",
      name: "TanStack Start fullstack",
      description: "Usa as rotas de API nativas do TanStack Start",
      icon: `${ICON_BASE_URL}/tanstack.svg`,
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "self-nuxt",
      name: "Nuxt fullstack",
      description: "Usa as rotas de servidor nativas do Nuxt",
      icon: `${ICON_BASE_URL}/nuxt.svg`,
      color: "from-green-400 to-green-700",
    },
    {
      id: "self-svelte",
      name: "SvelteKit fullstack",
      description: "Usa as rotas de servidor nativas do SvelteKit",
      icon: `${ICON_BASE_URL}/svelte.svg`,
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "self-astro",
      name: "Astro fullstack",
      description: "Usa as rotas de API nativas do Astro",
      icon: `${ICON_BASE_URL}/astro.svg`,
      color: "from-purple-500 to-orange-500",
    },
    {
      id: "none",
      name: "Sem backend",
      description: "Pular integração de backend (só frontend)",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  database: [
    {
      id: "sqlite",
      name: "SQLite",
      description: "Banco SQL baseado em arquivo",
      icon: `${ICON_BASE_URL}/sqlite.svg`,
      color: "from-blue-400 to-cyan-500",
      default: true,
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      description: "Banco SQL avançado",
      icon: `${ICON_BASE_URL}/postgres.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "mysql",
      name: "MySQL",
      description: "Banco relacional popular",
      icon: `${ICON_BASE_URL}/mysql.svg`,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "mongodb",
      name: "MongoDB",
      description: "Banco de documentos NoSQL",
      icon: `${ICON_BASE_URL}/mongodb.svg`,
      color: "from-green-400 to-green-600",
    },
    {
      id: "none",
      name: "Sem banco de dados",
      description: "Pular integração de banco de dados",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  orm: [
    {
      id: "drizzle",
      name: "Drizzle",
      description: "ORM em TypeScript",
      icon: `${ICON_BASE_URL}/drizzle.svg`,
      color: "from-cyan-400 to-cyan-600",
      default: true,
    },
    {
      id: "prisma",
      name: "Prisma",
      description: "ORM de nova geração",
      icon: `${ICON_BASE_URL}/prisma.svg`,
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "mongoose",
      name: "Mongoose",
      description: "Ferramenta elegante de modelagem de objetos",
      icon: `${ICON_BASE_URL}/mongoose.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "none",
      name: "Sem ORM",
      description: "Pular integração de ORM",
      icon: "",
      color: "from-gray-400 to-gray-600",
    },
  ],
  dbSetup: [
    {
      id: "turso",
      name: "Turso",
      description: "SQLite distribuído com réplicas na edge (libSQL)",
      icon: `${ICON_BASE_URL}/turso.svg`,
      color: "from-pink-400 to-pink-600",
    },
    {
      id: "d1",
      name: "Cloudflare D1",
      description: "Banco serverless compatível com SQLite para Cloudflare Workers",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "neon",
      name: "Neon Postgres",
      description: "Postgres serverless com autoscaling e branching",
      icon: `${ICON_BASE_URL}/neon.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "prisma-postgres",
      name: "Prisma PostgreSQL",
      description: "Postgres gerenciado via Prisma Data Platform",
      icon: `${ICON_BASE_URL}/prisma.svg`,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      id: "mongodb-atlas",
      name: "MongoDB Atlas",
      description: "Clusters MongoDB gerenciados na nuvem",
      icon: `${ICON_BASE_URL}/mongodb.svg`,
      color: "from-green-400 to-green-600",
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Stack Postgres local via Supabase (Docker necessário)",
      icon: `${ICON_BASE_URL}/supabase.svg`,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "planetscale",
      name: "PlanetScale",
      description: "Postgres e Vitess (MySQL) em NVMe",
      icon: `${ICON_BASE_URL}/planetscale.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Rode Postgres/MySQL/MongoDB localmente com Docker Compose",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "none",
      name: "Configuração básica",
      description: "Sem integração de banco na nuvem",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  webDeploy: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Deploy no Cloudflare Workers com Alchemy",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Self-host com Dockerfile e docker-compose.yml",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Deploy na Vercel com Services",
      icon: `${ICON_BASE_URL}/vercel.svg`,
      color: "from-gray-700 to-black",
    },
    {
      id: "guaracloud",
      name: "Guara Cloud",
      description: "Deploy de containers na Guara Cloud com serviços por app",
      icon: "",
      color: "from-emerald-500 to-teal-700",
    },
    {
      id: "none",
      name: "Nenhum",
      description: "Pular configuração de deploy",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  serverDeploy: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Deploy no Cloudflare Workers com Alchemy",
      icon: `${ICON_BASE_URL}/workers.svg`,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "docker",
      name: "Docker",
      description: "Self-host com Dockerfile e docker-compose.yml",
      icon: `${ICON_BASE_URL}/docker.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "vercel",
      name: "Vercel",
      description: "Deploy na Vercel com Services",
      icon: `${ICON_BASE_URL}/vercel.svg`,
      color: "from-gray-700 to-black",
    },
    {
      id: "guaracloud",
      name: "Guara Cloud",
      description: "Deploy de containers na Guara Cloud com serviços por app",
      icon: "",
      color: "from-emerald-500 to-teal-700",
    },
    {
      id: "none",
      name: "Nenhum",
      description: "Pular configuração de deploy",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
  ],
  auth: [
    {
      id: "better-auth",
      name: "Better-Auth",
      description: "O framework de autenticação mais completo para TypeScript",
      icon: `${ICON_BASE_URL}/better-auth.svg`,
      color: "from-green-400 to-green-600",
      default: true,
    },
    {
      id: "clerk",
      name: "Clerk",
      description: "Mais que autenticação: gestão completa de usuários",
      icon: `${ICON_BASE_URL}/clerk.svg`,
      color: "from-blue-400 to-blue-600",
    },
    {
      id: "none",
      name: "Sem auth",
      description: "Pular autenticação",
      icon: "",
      color: "from-red-400 to-red-600",
    },
  ],
  payments: [
    {
      id: "none",
      name: "Sem pagamentos",
      description: "Pular integração de pagamentos",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
    {
      id: "abacatepay",
      name: "AbacatePay",
      description: "Checkout hospedado + webhooks para pagamentos no Brasil",
      icon: "",
      color: "from-emerald-400 to-lime-600",
    },
  ],
  observability: [
    {
      id: "none",
      name: "Sem observabilidade",
      description: "Pular orientação de observabilidade",
      icon: "",
      color: "from-gray-400 to-gray-600",
      default: true,
    },
    {
      id: "getmonitor",
      name: "GetMonitor",
      description: "Monitoramento de uptime, alertas e páginas de status hospedadas",
      icon: "",
      color: "from-sky-400 to-blue-700",
    },
  ],
  packageManager: [
    {
      id: "npm",
      name: "npm",
      description: "Gerenciador de pacotes padrão",
      icon: `${ICON_BASE_URL}/npm.svg`,
      color: "from-red-500 to-red-700",
      className: "invert-0 dark:invert",
    },
    {
      id: "pnpm",
      name: "pnpm",
      description: "Rápido e eficiente em disco",
      icon: `${ICON_BASE_URL}/pnpm.svg`,
      color: "from-orange-500 to-orange-700",
    },
    {
      id: "bun",
      name: "bun",
      description: "Toolkit all-in-one",
      icon: `${ICON_BASE_URL}/bun.svg`,
      color: "from-amber-500 to-amber-700",
      default: true,
    },
  ],
  addons: [
    {
      id: "pwa",
      name: "PWA (Progressive Web App)",
      description: "Torne o app instalável e funcional offline",
      icon: "",
      color: "from-blue-500 to-blue-700",
      default: false,
    },
    {
      id: "tauri",
      name: "Tauri",
      description: "Empacote apps web estáticos como apps desktop nativos",
      icon: `${ICON_BASE_URL}/tauri.svg`,
      color: "from-amber-500 to-amber-700",
      default: false,
    },
    {
      id: "electrobun",
      name: "Electrobun",
      description: "Empacote apps web estáticos em um shell desktop leve",
      icon: "",
      color: "from-orange-500 to-orange-700",
      default: false,
    },
    {
      id: "starlight",
      name: "Starlight",
      description: "Crie documentação excelente com Astro",
      icon: `${ICON_BASE_URL}/starlight.svg`,
      color: "from-teal-500 to-teal-700",
      default: false,
    },
    {
      id: "fumadocs",
      name: "Fumadocs",
      description: "Crie um site de documentação excelente",
      icon: `${ICON_BASE_URL}/fumadocs.svg`,
      color: "from-indigo-500 to-indigo-700",
      default: false,
    },
    {
      id: "lefthook",
      name: "Lefthook",
      description: "Gerenciador de Git hooks rápido e poderoso",
      icon: "",
      color: "from-red-500 to-red-700",
      default: false,
    },
    {
      id: "husky",
      name: "Husky",
      description: "Git hooks nativos modernos, de forma simples",
      icon: "",
      color: "from-purple-500 to-purple-700",
      default: false,
    },
    {
      id: "biome",
      name: "Biome",
      description: "Formatar, fazer lint e mais",
      icon: `${ICON_BASE_URL}/biome.svg`,
      color: "from-green-500 to-green-700",
      default: false,
    },
    {
      id: "oxlint",
      name: "Oxlint",
      description: "Oxlint + Oxfmt (lint e formatação)",
      icon: `${ICON_BASE_URL}/oxc.svg`,
      color: "from-orange-500 to-orange-700",
      default: false,
    },
    {
      id: "turborepo",
      name: "Turborepo",
      description: "Sistema de build de alta performance",
      icon: `${ICON_BASE_URL}/turborepo.svg`,
      color: "from-gray-400 to-gray-700",
      default: true,
    },
    {
      id: "nx",
      name: "Nx",
      description: "Sistema de build e task runner inteligente para monorepos",
      icon: `${ICON_BASE_URL}/nx.svg`,
      color: "from-cyan-500 to-cyan-700",
      default: false,
    },
    {
      id: "vite-plus",
      name: "Vite+",
      description: "Toolchain Vite unificada: task runner, lint, formatação e hooks opcionais",
      icon: `${ICON_BASE_URL}/vite-plus.svg`,
      color: "from-violet-500 to-cyan-600",
      default: false,
    },
    {
      id: "ultracite",
      name: "Ultracite",
      description: "Preset do Biome com integração de IA",
      icon: `${ICON_BASE_URL}/ultracite.svg`,
      color: "from-blue-500 to-blue-700",
      className: "invert-0 dark:invert",
      default: false,
    },
    {
      id: "opentui",
      name: "OpenTUI",
      description: "Crie interfaces de usuário no terminal",
      icon: "",
      color: "from-cyan-500 to-cyan-700",
      default: false,
    },
    {
      id: "wxt",
      name: "WXT",
      description: "Crie extensões de navegador",
      icon: "",
      color: "from-emerald-500 to-emerald-700",
      default: false,
    },
    {
      id: "skills",
      name: "Skills",
      description: "Instale skills de agentes de IA para assistentes de código",
      icon: "",
      color: "from-pink-500 to-pink-700",
      default: false,
    },
    {
      id: "mcp",
      name: "MCP",
      description: "Instale servidores MCP para seus agentes/editores",
      icon: "",
      color: "from-emerald-500 to-emerald-700",
      default: false,
    },
    {
      id: "evlog",
      name: "evlog",
      description: "Logging estruturado de requisições com contexto do Better Auth",
      icon: "",
      color: "from-sky-500 to-slate-700",
      default: false,
    },
  ],
  examples: [
    {
      id: "todo",
      name: "Exemplo Todo",
      description: "Aplicação todo simples",
      icon: "",
      color: "from-indigo-500 to-indigo-700",
      default: false,
    },
    {
      id: "ai",
      name: "Exemplo de IA",
      description: "Exemplo de integração de IA com AI SDK",
      icon: "",
      color: "from-purple-500 to-purple-700",
      default: false,
    },
  ],
  git: [
    {
      id: "true",
      name: "Git",
      description: "Inicializar repositório Git",
      icon: `${ICON_BASE_URL}/git.svg`,
      color: "from-gray-500 to-gray-700",
      default: true,
    },
    {
      id: "false",
      name: "Sem Git",
      description: "Pular inicialização do Git",
      icon: "",
      color: "from-red-400 to-red-600",
    },
  ],
  install: [
    {
      id: "true",
      name: "Instalar dependências",
      description: "Instalar pacotes automaticamente",
      icon: "",
      color: "from-green-400 to-green-600",
      default: true,
    },
    {
      id: "false",
      name: "Pular instalação",
      description: "Pular instalação de dependências",
      icon: "",
      color: "from-yellow-400 to-yellow-600",
    },
  ],
};

export const PRESET_TEMPLATES = [
  {
    id: "mern",
    name: "Stack MERN",
    description: "MongoDB + Express + React + Node.js — stack MERN clássica",
    stack: {
      projectName: "my-kubo-app",
      webFrontend: ["react-router"],
      nativeFrontend: ["none"],
      runtime: "node",
      backend: "express",
      database: "mongodb",
      orm: "mongoose",
      dbSetup: "mongodb-atlas",
      auth: "better-auth",
      payments: "none",
      observability: "none",
      packageManager: "bun",
      addons: ["turborepo"],
      examples: ["todo"],
      git: "true",
      install: "true",
      api: "orpc",
      webDeploy: "none",
      serverDeploy: "none",
      yolo: "false",
    },
  },
  {
    id: "pern",
    name: "Stack PERN",
    description: "PostgreSQL + Express + React + Node.js — stack PERN popular",
    stack: {
      projectName: "my-kubo-app",
      webFrontend: ["tanstack-router"],
      nativeFrontend: ["none"],
      runtime: "node",
      backend: "express",
      database: "postgres",
      orm: "drizzle",
      dbSetup: "none",
      auth: "better-auth",
      payments: "none",
      observability: "none",
      packageManager: "bun",
      addons: ["turborepo"],
      examples: ["todo"],
      git: "true",
      install: "true",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
      yolo: "false",
    },
  },
  {
    id: "t3",
    name: "Stack T3",
    description: "Next.js + tRPC + Prisma + PostgreSQL + Better Auth",
    stack: {
      projectName: "my-kubo-app",
      webFrontend: ["next"],
      nativeFrontend: ["none"],
      runtime: "none",
      backend: "self-next",
      database: "postgres",
      orm: "prisma",
      dbSetup: "none",
      auth: "better-auth",
      payments: "none",
      observability: "none",
      packageManager: "bun",
      addons: ["biome", "turborepo"],
      examples: ["none"],
      git: "true",
      install: "true",
      api: "trpc",
      webDeploy: "none",
      serverDeploy: "none",
      yolo: "false",
    },
  },
  {
    id: "uniwind",
    name: "Uniwind nativo",
    description: "App nativo Expo + Uniwind sem serviços de backend",
    stack: {
      projectName: "my-kubo-app",
      webFrontend: ["none"],
      nativeFrontend: ["native-uniwind"],
      runtime: "none",
      backend: "none",
      database: "none",
      orm: "none",
      dbSetup: "none",
      auth: "none",
      payments: "none",
      observability: "none",
      packageManager: "bun",
      addons: ["none"],
      examples: ["none"],
      git: "true",
      install: "true",
      api: "none",
      webDeploy: "none",
      serverDeploy: "none",
      yolo: "false",
    },
  },
];

export type StackState = {
  projectName: string | null;
  webFrontend: string[];
  nativeFrontend: string[];
  runtime: string;
  backend: string;
  database: string;
  orm: string;
  dbSetup: string;
  auth: string;
  payments: string;
  observability: string;
  packageManager: string;
  addons: string[];
  examples: string[];
  git: string;
  install: string;
  api: string;
  webDeploy: string;
  serverDeploy: string;
  yolo: string;
};

export const DEFAULT_STACK: StackState = {
  projectName: "my-kubo-app",
  webFrontend: ["tanstack-router"],
  nativeFrontend: ["none"],
  runtime: "bun",
  backend: "hono",
  database: "sqlite",
  orm: "drizzle",
  dbSetup: "none",
  auth: "better-auth",
  payments: "none",
  observability: "none",
  packageManager: "bun",
  addons: ["turborepo"],
  examples: ["none"],
  git: "true",
  install: "true",
  api: "trpc",
  webDeploy: "none",
  serverDeploy: "none",
  yolo: "false",
};

export const isStackDefault = <K extends keyof StackState>(
  stack: StackState,
  key: K,
  value: StackState[K],
): boolean => {
  const defaultValue = DEFAULT_STACK[key];

  if (stack.backend === "convex") {
    if (key === "runtime" && value === "none") return true;
    if (key === "database" && value === "none") return true;
    if (key === "orm" && value === "none") return true;
    if (key === "api" && value === "none") return true;
    if (key === "auth" && value === "none") return true;
    if (key === "dbSetup" && value === "none") return true;
  }

  if (key === "webFrontend" || key === "nativeFrontend" || key === "addons" || key === "examples") {
    if (Array.isArray(defaultValue) && Array.isArray(value)) {
      const sortedDefault = [...defaultValue].sort();
      const sortedValue = [...value].sort();
      return (
        sortedDefault.length === sortedValue.length &&
        sortedDefault.every((item, index) => item === sortedValue[index])
      );
    }
  }

  if (Array.isArray(defaultValue) && Array.isArray(value)) {
    const sortedDefault = [...defaultValue].sort();
    const sortedValue = [...value].sort();
    return (
      sortedDefault.length === sortedValue.length &&
      sortedDefault.every((item, index) => item === sortedValue[index])
    );
  }

  return defaultValue === value;
};
