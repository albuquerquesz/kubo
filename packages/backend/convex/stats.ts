import { OssStats } from "@erquhart/convex-oss-stats";

import { components } from "./_generated/api";

export const ossStats = new OssStats(components.ossStats, {
  githubOwners: ["albuquerquesz"],
  githubRepos: ["albuquerquesz/idk"],
  npmPackages: ["create-better-t-stack"],
});

export const {
  sync,
  clearAndSync,
  getGithubOwner,
  getNpmOrg,
  getGithubRepo,
  getGithubRepos,
  getNpmPackage,
  getNpmPackages,
} = ossStats.api();
