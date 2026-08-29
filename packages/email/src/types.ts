export type ReleaseChange = {
  category: string;
  title: string;
  description: string;
};

export type ReleaseChangelogEmailProps = {
  version: string;
  releaseDate: string;
  intro: string;
  changes: ReleaseChange[];
  releaseUrl: string;
  docsUrl?: string;
  npmUrl?: string;
};
