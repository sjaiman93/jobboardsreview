// Review questions for AI recruiting and sourcing tools. Ids are stored in
// Supabase: rename a label freely, never change an id.

export const aiToolFlow = {
  type: "ai_tool",

  aspects: [
    { id: "output_accuracy", label: "Output accuracy" },
    { id: "ease_of_setup", label: "Ease of setup" },
    { id: "support", label: "Support" },
  ],

  pros: [
    { id: "saves_time", label: "Saves real time" },
    { id: "accurate", label: "Accurate results" },
    { id: "easy_setup", label: "Easy setup" },
    { id: "integrations", label: "Good integrations" },
    { id: "support", label: "Responsive support" },
    { id: "pricing", label: "Fair pricing" },
  ],
  prosNone: { id: "none", label: "Nothing stands out" },

  cons: [
    { id: "inaccurate", label: "Inaccurate results" },
    { id: "hard_setup", label: "Hard to set up" },
    { id: "poor_integrations", label: "Poor integrations" },
    { id: "weak_support", label: "Weak support" },
    { id: "too_expensive", label: "Too expensive" },
    { id: "low_adoption", label: "Team didn't adopt it" },
  ],
  consNone: { id: "none", label: "No real complaints" },

  // Same fact questions for every role.
  factsFor() {
    return [
      {
        id: "hours_saved",
        question: "Hours saved per recruiter per week",
        public: "Hours saved per recruiter per week",
        options: [
          { id: "none", label: "None" },
          { id: "1_2", label: "1-2" },
          { id: "3_5", label: "3-5" },
          { id: "6_plus", label: "6+" },
        ],
      },
      {
        id: "replaced",
        question: "What did it replace?",
        public: "Replaced",
        options: [
          { id: "manual", label: "Manual work" },
          { id: "other_tool", label: "Another tool" },
          { id: "new", label: "Nothing, it's new" },
        ],
      },
    ];
  },
};
