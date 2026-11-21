// Review questions for job boards. Ids are stored in Supabase: rename a
// label freely, never change an id.

export const jobBoardFlow = {
  type: "job_board",

  aspects: [
    { id: "candidate_quality", label: "Candidate quality" },
    { id: "candidate_volume", label: "Candidate volume" },
    { id: "support", label: "Support" },
  ],

  pros: [
    { id: "candidate_quality", label: "Good candidate quality" },
    { id: "fresh_profiles", label: "Fresh profiles" },
    { id: "search_filters", label: "Good search filters" },
    { id: "support", label: "Responsive support" },
    { id: "pricing", label: "Fair pricing" },
    { id: "niche_specialties", label: "Covers niche specialties" },
  ],
  prosNone: { id: "none", label: "Nothing stands out" },

  cons: [
    { id: "stale_candidates", label: "Stale or duplicate candidates" },
    { id: "unqualified", label: "Unqualified applicants" },
    { id: "price_increases", label: "Price increases" },
    { id: "weak_support", label: "Weak support" },
    { id: "lock_in", label: "Contract lock-in" },
    { id: "agency_overlap", label: "Candidates already with other agencies" },
  ],
  consNone: { id: "none", label: "No real complaints" },

  // Fact questions depend on the reviewer's role. Every one also offers
  // "Not sure" and can be skipped.
  factsFor(role) {
    if (role === "manager" || role === "owner") {
      return [
        {
          id: "monthly_spend",
          question: "Monthly spend on this board",
          public: "Monthly spend",
          options: [
            { id: "under_500", label: "Under $500" },
            { id: "500_2k", label: "$500-2k" },
            { id: "2k_5k", label: "$2k-5k" },
            { id: "5k_10k", label: "$5k-10k" },
            { id: "10k_plus", label: "$10k+" },
          ],
        },
        {
          id: "relative_value",
          question: "Compared with your other boards, the value is",
          public: "Value vs. their other boards",
          options: [
            { id: "best", label: "Best" },
            { id: "average", label: "Average" },
            { id: "worst", label: "Worst" },
          ],
        },
        {
          id: "value_for_money",
          question: "Value for money",
          public: "Value for money",
          scale: true,
          options: [1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: String(n) })),
        },
      ];
    }
    return [
      {
        id: "applicants_worth_call",
        question: "Out of 10 applicants from this board, how many are worth a call?",
        public: "Applicants worth a call (of 10)",
        options: [
          { id: "0_1", label: "0-1" },
          { id: "2_3", label: "2-3" },
          { id: "4_6", label: "4-6" },
          { id: "7_plus", label: "7+" },
        ],
      },
      {
        id: "placements_3mo",
        question: "Placements you personally made from it in the last 3 months",
        public: "Placements in last 3 months",
        options: [
          { id: "0", label: "0" },
          { id: "1_2", label: "1-2" },
          { id: "3_5", label: "3-5" },
          { id: "6_plus", label: "6+" },
        ],
      },
    ];
  },
};
