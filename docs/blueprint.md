# Writer's Muse — Bot specification

**Archetype:** custom

**Voice:** warm and encouraging — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot for writers and poets that provides ideation prompts, rhythm/rhyme analysis, and optional human review requests. Offers multilingual support with actionable suggestions for structure, meter, and poetic devices.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- aspiring poets
- songwriters
- prose writers
- multilingual writers

## Success criteria

- Users receive actionable rhythm/rhyme analysis within 5 seconds
- Admin receives structured human-review submissions with 100ms latency
- Session state persists across multi-step flows

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open main menu with quick-start options
  - inputs: Telegram ID, language preference
  - outputs: main menu buttons
- **Get idea** (button, actor: user, callback: idea:generate) — Generate writing prompts based on genre/mood
  - inputs: genre, mood, length
  - outputs: 3 seed prompts with action buttons
- **Check rhythm** (button, actor: user, callback: check:rhythm) — Analyze poem's meter and rhyme scheme
  - inputs: submitted text, language
  - outputs: analysis verdict + suggestions
- **Improve rhyme** (button, actor: user, callback: improve:rhyme) — Request specific rhyme/meter improvements
  - inputs: focus area (rhyme/meter/imagery)
  - outputs: editable suggestions with explanations
- **review:request** (button, actor: user, callback: review:request) — Send submission to admin for manual feedback
  - inputs: piece text, language, type
  - outputs: admin notification with submission package

## Flows

### Onboarding
_Trigger:_ /start

1. Language selection
2. Optional skill level
3. Quick-start menu

_Data touched:_ user profile

### Rhythm Check
_Trigger:_ check:rhythm

1. Text submission
2. Automated analysis
3. Suggestions presentation

_Data touched:_ piece, review request

### Human Review
_Trigger:_ review:request

1. Submission packaging
2. Admin notification delivery

_Data touched:_ review request, piece

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **user profile** _(retention: persistent)_ — User preferences and metadata
  - fields: Telegram ID, preferred language, display name, skill level (optional)
- **session** _(retention: session)_ — Active interaction state tracking
  - fields: current flow, temp data
- **piece** _(retention: persistent)_ — Submitted writing work
  - fields: text, language, type, timestamp, automated check results
- **review request** _(retention: persistent)_ — Human review tracking
  - fields: piece ID, status, admin Telegram ID
- **admin account** _(retention: persistent)_ — Human reviewer access
  - fields: Telegram ID

## Integrations

- **Telegram** (required) — Bot API messaging and admin notifications
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Configure admin Telegram ID
- Set review request retention policy
- Adjust automated check sensitivity thresholds

## Notifications

- Admin receives submission notification with user's piece and analysis summary

## Permissions & privacy

- User data stored with language preferences
- Admin access requires explicit configuration
- Submissions retained for 90 days or 50 per-user pieces

## Edge cases

- Unsupported language detection
- Missing admin account configuration
- Large text submissions exceeding message limits

## Required tests

- End-to-end rhythm check flow with session persistence
- Human review submission delivery to admin
- Multilingual prompt generation accuracy

## Assumptions

- Language auto-detection works for 20+ languages
- Admin account is pre-configured by owner
- Users prefer button-driven workflows over free text
