---
name: security-review
description: Security-focused audit — OWASP Top 10, secrets, auth, injection, supply chain
argument-hint: "<files, PR, or area to audit>"
---

# security-review

Dedicated security audit. More thorough than @review's security section.

## When to use

- Before shipping anything that handles auth, user data, or external input
- When adding new API endpoints or third-party integrations
- Periodic security audits of sensitive subsystems

## What it covers

- **Injection** — SQL, command, HTML, template injection
- **Auth** — broken authentication, missing authorization, JWT issues
- **Secrets** — hardcoded credentials, tokens, keys in code or git history
- **Input validation** — unvalidated input reaching dangerous operations
- **Dependencies** — known CVEs in package.json / requirements
- **IDOR** — direct object references without ownership checks
- **CSRF/XSS** — missing protections in web-facing code
- **Data exposure** — sensitive fields in logs, API responses, or error messages
- **Supply chain** — suspicious packages, loose version pins

## Output

Report with findings:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File:line reference
- Attack vector description
- Recommended fix

Verdict: SECURE | ISSUES FOUND (N critical, N high)
