# Firestore Security Spec — Sử Thi Số 4.0

## 1. Data Invariants
1. **Unique Identity & Role Integrity**: Every `/users/{userId}` document matches `request.auth.uid`. A student registering a profile MUST start with `role: 'student'` and `totalScore: 0`. Students can NEVER self-promote to `'teacher'` or `'admin'`.
2. **No Unnecessary PII**: No phone numbers, citizen IDs, or home addresses exist in the schema. User profiles are readable ONLY by the owner, the student's matched `teacherUid`, or an `admin`.
3. **Immutable Recorded Scores**:
   - `/quizAttempts/{attemptId}` is create-only for students (`score` bounded `[0, maxScore]`); students can NEVER update or delete recorded attempts.
   - `/users/{userId}.totalScore` CANNOT be modified by students during profile updates.
   - `/learningProgress/{progressId}` enforces monotonic `scoreEarned` (`incoming().scoreEarned >= existing().scoreEarned && incoming().scoreEarned <= 200`) and prevents reverting a `'completed'` module back to `'not_started'`.
4. **Scoped Teacher Access**: Teachers can read/list ONLY `users`, `classes`, `learningProgress`, `quizAttempts`, `badges`, and `assignments` belonging to `teacherUid == request.auth.uid`. Students can read/list ONLY their own documents (`studentUid == request.auth.uid`), never peer records.
5. **Relational Join Verification**: When a student sets `classId` on `/users/{userId}`, `exists(/databases/.../classes/$(incoming().classId))` and `teacherUid` matching the parent class document are enforced by rules.

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. **Privilege Escalation on Create**: Student creates `/users/{uid}` with `role: 'teacher'` or `role: 'admin'`.
2. **Self-Score Tampering on User Doc**: Student updates `/users/{uid}` changing `totalScore: 9999`.
3. **Ghost Field Injection (Shadow Update)**: Student creates `/users/{uid}` with extra field `isVerifiedTeacher: true`.
4. **Email Spoofing**: Caller uses unverified email claim (`email_verified: false`) matching admin email to read `/users`.
5. **Blanket List Scraping**: Student queries `collection(db, 'users')` or `collection(db, 'quizAttempts')` without `where('studentUid', '==', auth.uid)`.
6. **Attempt Score Editing**: Student calls `updateDoc` on `/quizAttempts/{attemptId}` to change `score` from `2` to `10`.
7. **Orphan Class Spoofing**: Student updates `/users/{uid}` with non-existent `classId: 'FAKE999'` or spoofed `teacherUid`.
8. **Score Inflation on QuizAttempt**: Student creates `/quizAttempts/{id}` with `score: 5000` when `maxScore: 20` (`score > maxScore`).
9. **Reverting Completed Progress / Inflating Points**: Student updates `/learningProgress/{id}` setting `scoreEarned: 9999`.
10. **Cross-Teacher Data Read**: Teacher A tries to `get` or `list` Teacher B's `/classes/{classId}` or student `/quizAttempts`.
11. **Oversized String Poisoning (DoW)**: Attacker creates `/users/{uid}` with 50KB `displayName` or 500-char `classId`.
12. **Fake Teacher Assignment / Padlet Defacement**: Student tries to create `/assignments/{id}` or overwrite `/teacherSettings/global`.
