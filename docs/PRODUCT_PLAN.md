# No Doubt — Product and Build Plan

## 1. Product mission

No Doubt helps Christians work through questions and doubts using clear, compassionate answers grounded in Scripture, historical evidence, logic, and an explicitly Christian worldview.

The product should help a user move from an anxious or vague question to:

1. A short, direct answer.
2. A simple explanation written near a third-grade reading level.
3. Bible passages shown in context.
4. Supporting historical or logical evidence with citations.
5. Practical next steps and trusted resources.
6. Follow-up questions that preserve the conversation context.

The app is educational and pastoral support, not a replacement for a pastor, counselor, doctor, or emergency service.

## 2. Recommended first release (MVP)

### User-facing features

- Home screen with the prompt: “What are you having trouble with?”
- Natural-language search.
- Browse by category and subcategory cards.
- Structured answer page containing:
  - direct answer;
  - simple explanation;
  - Bible passages;
  - evidence and reasoning;
  - a relatable example;
  - suggested resources;
  - related questions.
- One conversational follow-up flow.
- Helpful/not-helpful feedback and optional anonymous comment.
- Share and bookmark answers locally.
- Crisis-language response that directs a user to immediate human help.
- Responsive web/PWA plus iOS and Android builds from the same codebase.

### Deliberately postponed

- Public user posts, comments, or community chat.
- Direct messaging with pastors.
- Multiple denominations or personalized theological profiles.
- User-generated answers.
- Subscriptions or payments.
- Fully open-ended AI answers sourced from the public internet.

These features add moderation, legal, privacy, theological, and operational complexity before the core experience is proven.

## 3. Content strategy

### Use a hybrid curated-content and AI system

The source of truth should be an editor-reviewed content library. AI may find, organize, and simplify approved material, but it must not invent doctrine, quotations, Bible references, or historical claims.

For common questions, return a reviewed answer directly. For unusual wording or follow-ups, use retrieval-augmented generation (RAG):

1. Classify the question and detect safety concerns.
2. Search approved answer sections and sources by keyword and semantic similarity.
3. Generate a response using only the retrieved material.
4. Require a source reference for every Bible, historical, and factual claim.
5. Refuse to claim certainty when the library does not support an answer.
6. Log low-confidence questions for editorial review.

### Initial content set

Launch with approximately 50–100 reviewed questions across these categories:

- Does God exist?
- Can I trust the Bible?
- Why does God allow suffering?
- Science, creation, and faith.
- Prayer and unanswered prayer.
- Salvation, sin, grace, and forgiveness.
- Doubt, fear, anxiety, and spiritual dryness.
- Jesus, the resurrection, and historical evidence.
- Other religions and competing truth claims.
- Church hurt, hypocrisy, and difficult Christians.
- Identity, purpose, relationships, and temptation.
- Death, grief, heaven, and hell.

### Editorial workflow

Every published answer should have an author, reviewer, status, theological tradition/scope, sources, last-reviewed date, and version history. Establish a small review board that includes theological and pastoral review. Professional review is required for mental-health or crisis-related material.

Use a Bible translation that permits the intended amount and method of digital quotation. Store references separately from quoted text so the displayed translation can be changed later.

## 4. Recommended technical architecture

### Client

- Ionic Angular using standalone Angular components.
- Capacitor for iOS and Android packaging.
- Responsive PWA/web build from the same application.
- Angular signals/services for initial state management; avoid a large state library until complexity requires one.
- Accessible Ionic components, large touch targets, screen-reader labels, adjustable text, and dark mode.

### Backend

Recommended starting point: Supabase.

- PostgreSQL for structured content.
- `pgvector` for semantic retrieval.
- Authentication when accounts become necessary.
- Row Level Security for user-owned data.
- Storage for editorial assets.
- Edge Functions as the only path to AI providers and secret keys.

The public app may read published content with a publishable key and restrictive policies. AI keys and elevated database keys must exist only in server-side functions.

### AI boundary

Create a provider-independent server interface so the model vendor can be changed:

```text
POST /answer
  question
  conversationId (optional)
  previousTurnId (optional)

returns
  answer
  citedSources[]
  bibleReferences[]
  relatedQuestions[]
  confidence
  safetyAction
```

The server performs rate limiting, safety classification, retrieval, prompt construction, citation validation, response logging, and redaction. Never call a paid AI model directly from the shipped app.

## 5. Core data model

### Content

- `categories`: id, name, slug, description, icon, order, status.
- `questions`: id, canonical_question, slug, category_id, aliases, status.
- `answers`: id, question_id, summary, simple_explanation, reasoning, practical_steps, tradition_scope, status, version, reviewed_at.
- `bible_references`: id, answer_id, book, chapter, verse_start, verse_end, translation, permitted_excerpt, explanation.
- `sources`: id, title, author, publisher, url, source_type, publication_date, accessed_at.
- `answer_sources`: answer_id, source_id, claim_text, display_order.
- `resources`: id, title, description, url, resource_type, publisher, status.
- `answer_resources`: answer_id, resource_id, display_order.
- `content_sections`: id, answer_id, section_text, embedding, token_count.
- `related_questions`: question_id, related_question_id, display_order.

### Product and operations

- `conversations`: id, user_id nullable, anonymous_session_id, created_at, retention_expires_at.
- `messages`: id, conversation_id, role, content, confidence, safety_label, created_at.
- `message_citations`: message_id, content_section_id, source_id.
- `feedback`: id, message_id or answer_id, helpful, reason, comment, created_at.
- `bookmarks`: user_id, answer_id, created_at.
- `content_flags`: id, target_type, target_id, reason, status, resolved_by.
- `audit_log`: actor_id, action, target_type, target_id, metadata, created_at.

Store as little personal data as possible. Doubt questions may reveal sensitive religious, health, relationship, or identity information. Define deletion and retention rules before production.

## 6. Main user flow

```text
Welcome/Home
  → Search question OR browse categories
  → Normalize/classify the question
  → Safety check
  → Exact reviewed answer, if available
      OR retrieve approved passages and compose a cited explanation
  → Answer page
  → Related question / follow-up / resource / bookmark / feedback
```

If retrieval confidence is low, say that the library does not yet contain a reliable answer, show the closest reviewed topics, and offer to submit the question for review. Do not fill the gap with an unsupported answer.

## 7. Safety, trust, and quality rules

- Present the theological scope clearly instead of claiming to represent every Christian tradition.
- Label AI-composed responses and show their sources.
- Never fabricate a verse, quotation, source, person, date, or consensus.
- Show Bible passages with surrounding context or a link to it.
- Separate “Christians generally agree” from disputed interpretations.
- Use empathetic language without manipulating fear, shame, or certainty.
- Do not diagnose mental illness or give medical or legal advice.
- Detect self-harm, abuse, immediate danger, and medical emergencies; interrupt the normal answer flow with locally appropriate emergency and human-support guidance.
- Provide report, correction, and feedback paths on every answer.
- Test reading level mechanically, then have humans confirm that simplification did not distort meaning.
- Red-team prompt injection, hostile questions, source spoofing, and attempts to make the model ignore its approved library.

## 8. Screens and navigation

Use a simple bottom navigation on mobile and adaptive navigation on larger screens:

- Home: search, featured categories, recent or suggested questions.
- Explore: categories, filters, popular questions.
- Saved: bookmarked answers; local-only before accounts.
- About: method, beliefs/scope, editorial standards, privacy, help.

Additional screens:

- Search results and suggestions.
- Structured answer.
- Follow-up conversation.
- Resource details/external-link confirmation.
- Feedback/report form.
- Optional sign-in and account settings in a later release.
- Separate protected editorial web console.

## 9. Step-by-step delivery plan

### Phase 0 — Product decisions and governance

1. Write the one-sentence promise and target audience.
2. Define the theological scope and disputed-topic policy.
3. Select an initial Bible translation and confirm licensing.
4. Recruit content author/reviewer roles.
5. Write editorial, sourcing, reading-level, privacy, and crisis policies.
6. Select 50–100 launch questions and success measures.

Exit condition: the team can explain what counts as a publishable answer and who approves it.

### Phase 1 — UX prototype

1. Create low-fidelity flows for search, browse, answer, follow-up, and feedback.
2. Test the language and navigation with 5–8 target users.
3. Establish the visual system, accessibility targets, and responsive layouts.
4. Build a clickable prototype using realistic answer content.

Exit condition: users can find a useful answer without coaching.

### Phase 2 — Application foundation

1. Scaffold Ionic Angular with Capacitor, linting, tests, and environment configuration.
2. Add web/PWA, iOS, and Android targets.
3. Add routing, layouts, theme tokens, accessibility helpers, and error handling.
4. Configure CI for install, lint, unit test, and production build.
5. Establish development, staging, and production environments.

Exit condition: one small app builds in CI and runs on the web, an iOS simulator/device, and an Android emulator/device.

### Phase 3 — Curated content MVP

1. Create the database schema and Row Level Security policies.
2. Seed categories and the first 10–20 fully reviewed answers.
3. Build category browsing, filters, keyword search, answer pages, related questions, bookmarks, and feedback.
4. Create the protected editorial workflow; a simple internal console is sufficient initially.
5. Add analytics events without recording raw sensitive question text by default.

Exit condition: the app is valuable without AI.

### Phase 4 — Guided AI and follow-ups

1. Chunk and embed approved answer material.
2. Implement the server-side `/answer` pipeline.
3. Add exact-match-first retrieval, vector search, citations, confidence thresholds, and fallbacks.
4. Add contextual follow-ups with a short, controlled conversation window.
5. Add safety classification, rate limits, abuse protection, cost budgets, and evaluation logging.
6. Build a test set of at least 100 representative and adversarial questions.

Exit condition: responses pass citation, factuality, theology, safety, reading-level, latency, and cost thresholds.

### Phase 5 — Beta and launch

1. Run a private beta with diverse users and pastoral reviewers.
2. Fix the highest-frequency failed searches and unclear answers.
3. Complete privacy policy, terms, content licenses, account deletion, and support processes.
4. Add monitoring, backups, error reporting, dependency scanning, and an incident plan.
5. Prepare store listings, screenshots, age rating, privacy disclosures, and review notes.
6. Test low-connectivity behavior, small screens, tablets, keyboard navigation, and screen readers.
7. Release web first, then staged iOS and Android rollouts.

Exit condition: operational owners can correct content, respond to safety issues, and roll back a release.

## 10. Testing strategy

- Unit tests for services, classification rules, mappers, and UI logic.
- Component tests for search, answer rendering, citations, and error states.
- End-to-end tests for browse/search/answer/follow-up/feedback flows.
- Device tests on current and older supported iOS/Android versions.
- Accessibility checks plus manual screen-reader and keyboard testing.
- Database policy tests proving users cannot read or change another user’s private records.
- AI evaluation dataset with expected sources, forbidden claims, safety outcomes, and reading-level targets.
- Human review sampling of production answers and all low-confidence/flagged responses.

## 11. Initial success measures

- At least 70% of beta users reach a relevant reviewed answer.
- At least 80% of rated answers are marked helpful.
- Zero uncited Bible or historical claims in the evaluation set.
- Zero severe safety failures in release-blocking tests.
- Median response time below the product’s agreed target.
- AI cost per answered question stays below the agreed budget.
- Editors can publish a correction without shipping a new app build.

Do not optimize for time spent in the app. A successful session may be short because the user received a clear answer.

## 12. Recommended first milestone

Build a non-AI vertical slice around one category, “Does God exist?”, with 5–10 reviewed questions. It should include the real home search, category navigation, answer template, Bible references, cited evidence, related questions, bookmarking, and feedback.

This proves the user experience and content model before introducing generative variability. After that vertical slice is tested, add RAG and follow-ups behind a feature flag.

## 13. Decisions still needed

- Exact audience: children, teens, adults, new believers, long-time Christians, or a defined combination.
- Theological scope and handling of denominational differences.
- Bible translation and quotation license.
- Whether users can remain completely anonymous.
- Whether question history is stored, for how long, and whether it syncs across devices.
- Who authors and approves content.
- Initial launch countries, which affect crisis resources and privacy obligations.
- Brand name confirmation and availability checks.
- Budget for AI, hosting, content review, Apple developer enrollment, and Google Play enrollment.

These decisions should be recorded as short architecture/product decision records as they are made.
