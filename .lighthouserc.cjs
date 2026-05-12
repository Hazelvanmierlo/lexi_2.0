module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/", "http://localhost:3000/signup", "http://localhost:3000/kind", "http://localhost:3000/admin/quizzen", "http://localhost:3000/shop"],
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      // 3 runs + median smooths Lighthouse's well-known TBT/LCP noise.
      // Single runs can vary by 0.1+ on the perf score even on identical builds.
      numberOfRuns: 3,
    },
    assert: {
      // Use medianRun aggregation so one noisy run cannot fail the gate.
      aggregationMethod: "median-run",
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
      },
    },
  },
};
