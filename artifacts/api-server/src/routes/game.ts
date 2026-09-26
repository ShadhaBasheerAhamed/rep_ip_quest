import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, attemptsTable, progressTable, studentsTable } from "@workspace/db";
import { executePython } from "../services/code-executor";
import { validateChallenge } from "../services/challenge-engine";
import {
  CreateStudentBody,
  CreateStudentResponse,
  SubmitChallengeBody,
  SubmitChallengeParams,
  SubmitChallengeResponse,
  GetGameLevelsResponse,
  GetLeaderboardResponse,
  GetStudentRosterParams,
  GetStudentRosterResponse,
  GetStudentParams,
  GetStudentResponse,
  RunStudentCodeBody,
  RunStudentCodeParams,
  RunStudentCodeResponse,
  GetTeacherDashboardResponse,
  RecordStudentAttemptBody,
  RecordStudentAttemptParams,
  RecordStudentAttemptResponse,
  SaveStudentProgressBody,
  SaveStudentProgressParams,
  SaveStudentProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const levels = [
  {
    id: 1,
    title: "The Syntax Gate",
    chapter: "Python foundations",
    difficulty: "Warm-up",
    xp: 100,
    mission: "Repair the launch console with valid identifiers, print statements, and arithmetic operators.",
    skills: ["Identifiers", "print()", "Arithmetic operators", "Floor division"],
    questionCount: 10,
  },
  {
    id: 2,
    title: "Input Lab",
    chapter: "Input and decisions",
    difficulty: "Easy",
    xp: 140,
    mission: "Build a number scanner that accepts values, calculates results, and spots even numbers.",
    skills: ["input()", "int()", "Variables", "if-else", "Modulo"],
    questionCount: 8,
  },
  {
    id: 3,
    title: "Loop Trail",
    chapter: "Repetition",
    difficulty: "Easy",
    xp: 160,
    mission: "Guide the explorer through a pattern grid using for loops, range(), and end.",
    skills: ["for loop", "range()", "end=", "Nested loops", "Patterns"],
    questionCount: 8,
  },
  {
    id: 4,
    title: "String Forest",
    chapter: "Strings",
    difficulty: "Steady",
    xp: 180,
    mission: "Decode messages with indexing, slicing, and a vowel-counting scanner.",
    skills: ["Indexing", "Slicing", "Negative index", "String traversal"],
    questionCount: 8,
  },
  {
    id: 5,
    title: "List Workshop",
    chapter: "Lists",
    difficulty: "Steady",
    xp: 200,
    mission: "Organise the supply list with indexing, len(), append(), insert(), and extend().",
    skills: ["List indexing", "len()", "append()", "insert()", "extend()"],
    questionCount: 10,
  },
  {
    id: 6,
    title: "Decision Arena",
    chapter: "Conditionals and loops",
    difficulty: "Challenge",
    xp: 220,
    mission: "Compare values, search collections, and choose the right branch every time.",
    skills: ["if-elif-else", "for loop", "Largest of three", "Smallest element"],
    questionCount: 8,
  },
  {
    id: 7,
    title: "Dictionary District",
    chapter: "Dictionaries",
    difficulty: "Challenge",
    xp: 240,
    mission: "Run a student records desk using keys, values, items, get(), and dictionary updates.",
    skills: ["Dictionary syntax", "Keys and values", "get()", "Add/change/delete"],
    questionCount: 10,
  },
  {
    id: 8,
    title: "Data Splitter",
    chapter: "Lists with loops",
    difficulty: "Hard",
    xp: 270,
    mission: "Split raw scores into even and odd lists, then find extremes without max() or min().",
    skills: ["List building", "Filtering", "Accumulator logic", "for loop"],
    questionCount: 8,
  },
  {
    id: 9,
    title: "Nested Maze",
    chapter: "Advanced list skills",
    difficulty: "Hard",
    xp: 300,
    mission: "Navigate nested lists, remove duplicates in order, and find the second-largest value.",
    skills: ["Nested lists", "Nested slicing", "Distinct values", "Order preservation"],
    questionCount: 8,
  },
  {
    id: 10,
    title: "The Term-I Boss",
    chapter: "Full program practice",
    difficulty: "Boss",
    xp: 400,
    mission: "Build a complete marks register by combining the Python skills from the trail.",
    skills: ["Dictionary CRUD", "Aggregation", "Average", "Highest mark", "Exam programs"],
    questionCount: 12,
  },
] as const;

function profileFor(
  student: typeof studentsTable.$inferSelect,
  progress: Array<typeof progressTable.$inferSelect>,
) {
  return {
    id: student.id,
    name: student.name,
    grade: student.grade as "11" | "8A" | "8B",
    xp: student.xp,
    level: student.currentLevel,
    lives: student.lives,
    completedLevels: progress.filter((item) => item.completed).map((item) => item.levelId),
    streak: student.streak,
    lastSeenAt: student.lastSeenAt,
  };
}

router.get("/game/levels", (_req, res): void => {
  res.json(GetGameLevelsResponse.parse(levels));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(studentsTable)
    .where(and(eq(studentsTable.name, parsed.data.name.trim()), eq(studentsTable.grade, parsed.data.grade)))
    .limit(1);

  let student = existing;
  if (student) {
    [student] = await db
      .update(studentsTable)
      .set({ lastSeenAt: new Date() })
      .where(eq(studentsTable.id, student.id))
      .returning();
  } else {
    [student] = await db
      .insert(studentsTable)
      .values({ name: parsed.data.name.trim(), grade: parsed.data.grade })
      .returning();
  }

  const progress = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.studentId, student.id));
  res.status(201).json(CreateStudentResponse.parse(profileFor(student, progress)));
});

router.get("/students/roster/:grade", async (req, res): Promise<void> => {
  const params = GetStudentRosterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const students = await db
    .select({ name: studentsTable.name })
    .from(studentsTable)
    .where(eq(studentsTable.grade, params.data.grade));
  const names = [...new Set(students.map((student) => student.name))].sort((a, b) => a.localeCompare(b));
  res.json(GetStudentRosterResponse.parse(names));
});

router.get("/students/:studentId", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.studentId))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const progress = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.studentId, student.id));
  res.json(GetStudentResponse.parse(profileFor(student, progress)));
});

router.post("/students/:studentId/progress", async (req, res): Promise<void> => {
  const params = SaveStudentProgressParams.safeParse(req.params);
  const parsed = SaveStudentProgressBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = params.success ? "Invalid progress body" : params.error.message;
    res.status(400).json({ error });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.studentId))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(progressTable)
    .where(
      and(
        eq(progressTable.studentId, student.id),
        eq(progressTable.levelId, parsed.data.levelId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(progressTable)
      .set({
        xpEarned: Math.max(existing.xpEarned, parsed.data.xpEarned),
        livesRemaining: parsed.data.livesRemaining,
        completed: existing.completed || parsed.data.completed,
        tabSwitches: Math.max(existing.tabSwitches, parsed.data.tabSwitches ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(progressTable.id, existing.id));
  } else {
    await db.insert(progressTable).values({
      studentId: student.id,
      levelId: parsed.data.levelId,
      xpEarned: parsed.data.xpEarned,
      livesRemaining: parsed.data.livesRemaining,
      completed: parsed.data.completed,
      tabSwitches: parsed.data.tabSwitches ?? 0,
    });
  }

  const xpToAdd = existing?.completed ? 0 : parsed.data.xpEarned;
  const [updatedStudent] = await db
    .update(studentsTable)
    .set({
      xp: student.xp + xpToAdd,
      currentLevel: Math.max(student.currentLevel, parsed.data.completed ? parsed.data.levelId + 1 : parsed.data.levelId),
      lives: parsed.data.livesRemaining,
      lastSeenAt: new Date(),
    })
    .where(eq(studentsTable.id, student.id))
    .returning();

  const progress = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.studentId, student.id));
  res.json(SaveStudentProgressResponse.parse(profileFor(updatedStudent, progress)));
});

router.post("/students/:studentId/attempts", async (req, res): Promise<void> => {
  const params = RecordStudentAttemptParams.safeParse(req.params);
  const parsed = RecordStudentAttemptBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = params.success ? "Invalid attempt body" : params.error.message;
    res.status(400).json({ error });
    return;
  }

  const [student] = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.studentId))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const [attempt] = await db
    .insert(attemptsTable)
    .values({
      studentId: student.id,
      levelId: parsed.data.levelId,
      questionId: parsed.data.questionId,
      correct: parsed.data.correct,
      answer: parsed.data.answer,
      tabSwitchDetected: parsed.data.tabSwitchDetected ?? false,
    })
    .returning();
  res.status(201).json(RecordStudentAttemptResponse.parse(attempt));
});

router.post("/students/:studentId/run", async (req, res): Promise<void> => {
  const params = RunStudentCodeParams.safeParse(req.params);
  const parsed = RunStudentCodeBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = params.success ? "Invalid code body" : params.error.message;
    res.status(400).json({ error });
    return;
  }

  const [student] = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.studentId))
    .limit(1);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const result = await validateChallenge(parsed.data.levelId, parsed.data.code, executePython);
  res.json(RunStudentCodeResponse.parse(result));
});

router.post("/challenges/:challengeId/submit", async (req, res): Promise<void> => {
  const params = SubmitChallengeParams.safeParse(req.params);
  const parsed = SubmitChallengeBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    const error = params.success ? "Invalid challenge body" : params.error.message;
    res.status(400).json({ error });
    return;
  }

  const result = await validateChallenge(params.data.challengeId, parsed.data.code, executePython);
  res.json(SubmitChallengeResponse.parse(result));
});

router.get("/leaderboard", async (_req, res): Promise<void> => {
  const students = await db.select().from(studentsTable).orderBy(desc(studentsTable.xp), desc(studentsTable.lastSeenAt)).limit(20);
  const progress = await db.select().from(progressTable);
  const completedByStudent = new Map<number, number>();
  for (const item of progress) {
    if (item.completed) completedByStudent.set(item.studentId, (completedByStudent.get(item.studentId) ?? 0) + 1);
  }
  res.json(
    GetLeaderboardResponse.parse(
      students.map((student, index) => ({
        rank: index + 1,
        name: student.name,
        xp: student.xp,
        level: student.currentLevel,
        completedLevels: completedByStudent.get(student.id) ?? 0,
      })),
    ),
  );
});

router.get("/teacher/dashboard", async (req, res): Promise<void> => {
  const teacherPin = process.env.TEACHER_PIN ?? "0626";
  if (req.header("x-teacher-pin") !== teacherPin) {
    res.status(401).json({ error: "Teacher PIN required" });
    return;
  }
  const students = await db.select().from(studentsTable).orderBy(desc(studentsTable.lastSeenAt));
  const progress = await db.select().from(progressTable);
  const attempts = await db.select().from(attemptsTable).orderBy(desc(attemptsTable.createdAt)).limit(12);
  const progressByStudent = new Map<number, typeof progress>();
  for (const item of progress) {
    const items = progressByStudent.get(item.studentId) ?? [];
    items.push(item);
    progressByStudent.set(item.studentId, items);
  }
  const nameById = new Map(students.map((student) => [student.id, student.name]));
  const summaries = students.map((student) => {
    const studentProgress = progressByStudent.get(student.id) ?? [];
    const tabSwitches = studentProgress.reduce((sum, item) => sum + item.tabSwitches, 0);
    return {
      id: student.id,
      name: student.name,
      grade: student.grade as "11" | "8A" | "8B",
      xp: student.xp,
      level: student.currentLevel,
      lives: student.lives,
      completedLevels: studentProgress.filter((item) => item.completed).length,
      lastSeenAt: student.lastSeenAt,
      status: Date.now() - student.lastSeenAt.getTime() < 15 * 60 * 1000 ? "online" : "away",
      tabSwitches,
    };
  });
  const averageXp = students.length
    ? Math.round(students.reduce((sum, student) => sum + student.xp, 0) / students.length)
    : 0;
  const activities = attempts.map((attempt) => ({
    studentName: nameById.get(attempt.studentId) ?? "Student",
    event: attempt.tabSwitchDetected
      ? "Flagged a tab switch"
      : attempt.correct
        ? "Solved a coding challenge"
        : "Made an attempt",
    levelId: attempt.levelId,
    createdAt: attempt.createdAt,
  }));
  res.json(
    GetTeacherDashboardResponse.parse({
      totalStudents: students.length,
      activeToday: students.filter((student) => Date.now() - student.lastSeenAt.getTime() < 24 * 60 * 60 * 1000).length,
      completedQuest: summaries.filter((student) => student.completedLevels >= levels.length).length,
      averageXp,
      students: summaries,
      recentActivity: activities,
    }),
  );
});

export default router;