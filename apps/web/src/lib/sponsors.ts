import type { SponsorsData } from "./types";

export const emptySponsorsData: SponsorsData = {
  generated_at: "",
  summary: {
    total_sponsors: 0,
    total_lifetime_amount: 0,
    total_current_monthly: 0,
    special_sponsors: 0,
    current_sponsors: 0,
    past_sponsors: 0,
    backers: 0,
    top_sponsor: null,
  },
  specialSponsors: [],
  sponsors: [],
  pastSponsors: [],
  backers: [],
};
