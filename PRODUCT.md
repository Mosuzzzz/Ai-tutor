# Product

## Register

product

## Product Direction

AI Tutor is a **Personal AI Study Workspace**. The core product is for one authenticated user who wants to upload learning material, understand it faster, ask questions grounded in that material, create a personal review quiz, and track their own learning progress.

The main experience does not split into teacher and student roles. Role-based administration, classroom assignment, tenant management, sharing to students, and teacher-only publishing are not part of the core product direction.

## Primary User

The primary user is an individual learner, reviewer, tutor user, employee trainee, or self-study user who has documents they need to understand and revisit.

They may be in a school, university, training program, or workplace, but the product should still feel personal:

- my documents
- my summaries
- my AI chat
- my review quizzes
- my learning analytics

## Core User Flow

```text
Register/Login
  -> My Study Dashboard
  -> Upload Document
  -> Read Summary
  -> Chat With Document
  -> Generate Review Quiz
  -> Take Quiz
  -> Review Score And Analytics
```

Each step should naturally lead to the next one. The user should never need to understand teacher/student permissions to complete the core study flow.

## Product Vocabulary

Use these terms consistently across the app:

| Concept | Preferred Thai Copy | Notes |
| --- | --- | --- |
| Workspace | พื้นที่เรียนของฉัน | Personal, not classroom/admin |
| Documents | เอกสารของฉัน | Uploaded by the current user |
| Summary | สรุปเอกสาร | AI summary of the selected document |
| Chat | แชทกับเอกสาร | Grounded in one selected document |
| Quiz | ควิซทบทวน | Personal review quiz, not assigned exam |
| Score | คะแนนของฉัน | Result from the user's own attempt |
| Analytics | สถิติการทบทวน | Personal learning progress |

Avoid core UI terms that imply role split, such as "แดชบอร์ดครู", "แดชบอร์ดนักเรียน", "รอครูแชร์", "ผู้สอนเท่านั้น", "เผยแพร่ให้นักเรียน", or "ภาพรวมห้องเรียน".

## Product Purpose

AI Tutor helps users convert learning material into an active study loop:

1. Upload a document.
2. Get a trustworthy summary.
3. Ask AI questions with document context.
4. Generate a review quiz from the same material.
5. Take the quiz and learn from the result.
6. See personal analytics that point to what to review next.

Success means the user can move through this loop without losing confidence in the interface, the source document, or the safety of their data.

## Brand Personality

Trustworthy, premium, intelligent, and warm. The interface should feel like a polished learning companion for serious study, not a generic AI SaaS dashboard.

The product should be calm enough for focused review, but still feel capable and modern. Use restraint, clear hierarchy, and thoughtful Thai copy instead of loud visual effects.

## Design Principles

1. Earn trust before delight.
Every screen should make data scope, actions, and AI states feel safe and understandable.

2. Make the study path visible.
The user should always know the next useful action: upload, summarize, ask, quiz, or review progress.

3. Personal first.
Every core page should answer "What can I do with my learning material now?"

4. Thai content must feel first-class.
Layouts must handle Thai labels, long filenames, markdown summaries, citations, and educational copy without awkward wrapping.

5. AI must be honest.
If the backend cannot summarize, cite, answer, or generate a useful quiz yet, the UI must show that state clearly instead of pretending the result is complete.

6. Premium means controlled, not loud.
Use restrained color, strong typography, consistent spacing, and precise states instead of saturated decoration or generic AI gradients.

## Out Of Core Scope

These can become later modules, but should not shape the core screens right now:

- Teacher dashboard
- Student dashboard as a separate role experience
- Classroom management
- Assigning quizzes to students
- Sharing summaries to a class
- Tenant/global admin analytics
- Social login providers
- Public course marketplace
- Real PDF export/share workflows

## Accessibility & Security Expectations

The product targets WCAG AA for contrast, focus visibility, keyboard navigation, and accessible names. Dialogs and document-library popups must support keyboard use and safe focus behavior.

Authentication and API calls must follow the frontend security baseline:

- use HttpOnly Secure cookie session boundaries
- avoid token storage in `localStorage` or `sessionStorage`
- use same-origin BFF routes for state-changing actions
- keep backend endpoint details, tokens, storage URLs, and raw IDs out of user-facing DOM where they are not needed
- validate backend responses before rendering
