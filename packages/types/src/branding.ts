export const KUBO_CLI_TITLE = `
██╗  ██╗██╗   ██╗██████╗  ██████╗
██║ ██╔╝██║   ██║██╔══██╗██╔═══██╗
█████╔╝ ██║   ██║██████╔╝██║   ██║
██╔═██╗ ██║   ██║██╔══██╗██║   ██║
██║  ██╗╚██████╔╝██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝
`;

export const KUBO_TITLE_COLORS = [
  "#D6A72B",
  "#F5D76E",
  "#E0B43E",
  "#E08A2E",
  "#E0B43E",
  "#E8A43A",
  "#E08A2E",
  "#E08A2E",
  "#C49314",
  "#E8C978",
  "#E5D3A5",
] as const;

export const KUBO_TITLE_GRADIENT = `linear-gradient(to right, ${KUBO_TITLE_COLORS.join(", ")})`;
