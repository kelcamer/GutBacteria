# Revisit later

## Claude-Session links in commit history may expose this conversation publicly

**What happened:** Every commit made by Claude Code during the 2026-08
session (all-day session covering the bug-fix/feature sprint - global
search, hormone data audit, node-map fixes, Coffee/Stimulants, the
ConditionsGrid highlight feature, etc.) ends its commit message with:

```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UW3SwgTSgTh4qkmU4fFA6T
```

**Why it matters:** This repo (`kelcamer/GutBacteria`) is **public**
(confirmed via the GitHub API - `"private": false`). That means the
`Claude-Session` URL is visible to anyone browsing the commit history on
GitHub right now.

**What's unconfirmed:** Whether opening that `claude.ai/code/session_...`
URL as a logged-out stranger actually shows the conversation content, or
is blocked/requires the account owner's login. Not verified either way
during the session - the fastest way to know is to open it in a private/
incognito browser window (logged out) and see what loads. If it *does*
expose anything, it would show the full conversation transcript - both
sides, not just Claude's replies.

**Options, not yet acted on:**
1. Check the link yourself (incognito) to see what's actually exposed.
2. Rewrite git history to strip the `Claude-Session:` line from every
   past commit + force-push. Disruptive: changes every commit's SHA,
   breaks any existing local clone, and GitHub may retain some trace of
   old commits regardless (e.g. if a specific commit URL was ever
   referenced/starred/forked). Needs explicit go-ahead before doing this.
3. Do nothing further - going forward, new commits from this session no
   longer include the `Claude-Session` line (already stopped).

**Status:** Deferred at the user's request (documenting here instead of
acting immediately). Revisit when ready to decide on option 1 or 2.
