{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert",
        "security",
        "ci",
        "build"
      ]
    ],
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "subject-max-length": [2, "always", 72],
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
    "footer-token-case": [2, "always", "upper-case"],
    "type-case": [2, "always", "always-lowercase"],
    "scope-case": [2, "always", "always-lowercase"]
  }
}
