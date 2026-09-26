import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Code2, Sparkles, Users } from 'lucide-react';
import { getGetStudentRosterQueryKey, useCreateStudent, useGetStudentRoster } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';

const ROSTER = ['Aadhi Kailash', 'Anirudh Ram', 'Ajay', 'Mehabob', 'Varshika'];
type GradeCode = '11' | '8A' | '8B';

export default function Home() {
  const [, setLocation] = useLocation();
  const [grade, setGrade] = useState<'11' | '8' | null>(null);
  const [section, setSection] = useState<'8A' | '8B' | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const createStudent = useCreateStudent();
  const rosterCode: GradeCode = grade === '11' ? '11' : (section ?? '8A');
  const rosterQuery = useGetStudentRoster(rosterCode, { query: { enabled: Boolean(grade === '11' || section), queryKey: getGetStudentRosterQueryKey(rosterCode) } });
  const roster = useMemo(() => {
    const savedNames = rosterQuery.data ?? [];
    if (grade === '11') return [...ROSTER, ...savedNames.filter((name) => !ROSTER.includes(name))];
    return savedNames;
  }, [grade, rosterQuery.data]);
  const activeName = showCustom ? customName.trim() : selectedName;

  function chooseGrade(nextGrade: '11' | '8') {
    setGrade(nextGrade);
    setSection(null);
    setSelectedName('');
    setCustomName('');
    setShowCustom(false);
  }

  function chooseSection(nextSection: '8A' | '8B') {
    setSection(nextSection);
    setSelectedName('');
    setCustomName('');
    setShowCustom(false);
  }

  function goBack() {
    if (grade === '8' && section) {
      setSection(null);
      setSelectedName('');
      setShowCustom(false);
      return;
    }
    setGrade(null);
    setSection(null);
    setSelectedName('');
    setShowCustom(false);
  }

  function startQuest() {
    if (!activeName || !grade || (grade === '8' && !section)) return;
    createStudent.mutate(
      { data: { name: activeName, grade: rosterCode } },
      {
        onSuccess: (student) => {
          window.localStorage.setItem('pythonQuestStudentId', String(student.id));
          setLocation('/play');
        },
      },
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="relative min-h-[100dvh]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-secondary/50 sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/55 sm:h-96 sm:w-96" />
        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-10 lg:px-16">
          <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-primary ink-shadow-sm">
              <Code2 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Python classroom</p>
              <p className="text-lg font-extrabold tracking-tight">Python Quest</p>
            </div>
          </Link>
          <Link href="/teacher" className="hidden items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-sm font-semibold transition hover:bg-foreground hover:text-background sm:flex" data-testid="link-teacher-dashboard">
            <Users size={15} />
            Teacher view
          </Link>
        </header>

        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-14 pt-8 sm:px-10 sm:pb-20 lg:grid-cols-[1.1fr_.9fr] lg:px-16 lg:pt-14">
          <div className="animate-rise">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-card px-3 py-1.5 font-mono-ui text-[11px] font-medium uppercase tracking-[0.18em] ink-shadow-sm">
              <Sparkles size={13} className="text-secondary" />
              10 missions. One Python brain.
            </div>
            <h1 className="max-w-3xl text-balance text-[clamp(3.4rem,9vw,7.8rem)] font-extrabold leading-[.86] tracking-[-.07em]">
              Build your
              <span className="relative mx-2 inline-block whitespace-nowrap text-secondary">
                Python
                <span className="absolute -bottom-1 left-1 right-0 h-2 -rotate-2 bg-primary" />
              </span>
              instincts.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A focused coding adventure for the ideas that matter. Pick a mission, write the code, see the result, and keep moving.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6 font-mono-ui text-xs uppercase tracking-[.16em] text-muted-foreground">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> live progress</span>
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-secondary" /> 30 lives per level</span>
            </div>
          </div>

          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -inset-3 rotate-2 rounded-[2rem] bg-secondary/25" />
            <div className="relative overflow-hidden rounded-[1.65rem] border-2 border-foreground bg-card p-6 ink-shadow sm:p-8">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Player checkpoint</p>
                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                        {!grade ? 'Choose your grade' : grade === '8' && !section ? 'Choose your class' : 'Who is coding?'}
                      </h2>
                    </div>
                    {grade && <button type="button" onClick={goBack} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-back-grade"><ArrowLeft size={13} /> Back</button>}
                  </div>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary">
                  <BookOpen size={20} />
                </div>
              </div>
              {!grade && (
                <div className="grid gap-2.5">
                  <button type="button" onClick={() => chooseGrade('11')} className="flex items-center justify-between rounded-xl border-2 border-foreground bg-primary px-4 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5" data-testid="button-grade-11">
                    11th Grade <ArrowRight size={16} />
                  </button>
                  <button type="button" onClick={() => chooseGrade('8')} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-foreground" data-testid="button-grade-8">
                    8th Grade <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {grade === '8' && !section && (
                <div className="grid gap-2.5">
                  <button type="button" onClick={() => chooseSection('8A')} className="flex items-center justify-between rounded-xl border-2 border-foreground bg-primary px-4 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5" data-testid="button-grade-8a">
                    8th Grade A <ArrowRight size={16} />
                  </button>
                  <button type="button" onClick={() => chooseSection('8B')} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-foreground" data-testid="button-grade-8b">
                    8th Grade B <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {((grade === '11') || (grade === '8' && section)) && (
                <>
                <p className="mb-3 font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">{grade === '11' ? '11th Grade' : section === '8A' ? '8th Grade A' : '8th Grade B'}</p>
                <div className="grid grid-cols-2 gap-2.5">
                {roster.map((name) => (
                  <button
                    key={name}
                    type="button"
                    data-testid={`button-roster-${name.toLowerCase()}`}
                    onClick={() => { setSelectedName(name); setShowCustom(false); }}
                    className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      !showCustom && selectedName === name ? 'border-foreground bg-primary ink-shadow-sm' : 'border-border bg-background hover:-translate-y-0.5 hover:border-foreground'
                    }`}
                  >
                    {name}
                    {!showCustom && selectedName === name ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-muted group-hover:bg-secondary" />}
                  </button>
                ))}
                </div>
              <button
                type="button"
                data-testid="button-custom-name"
                onClick={() => { setShowCustom(true); setSelectedName(''); }}
                className={`mt-2.5 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  showCustom ? 'border-foreground bg-primary ink-shadow-sm' : 'border-border bg-background hover:border-foreground'
                }`}
              >
                Someone else
                {showCustom ? <Check size={16} /> : <span className="font-mono-ui text-xs text-muted-foreground">type a name</span>}
              </button>
              {showCustom && (
                <input
                  autoFocus
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') startQuest(); }}
                  data-testid="input-custom-name"
                  maxLength={80}
                  placeholder="Your first name"
                  className="mt-3 w-full rounded-xl border-2 border-foreground bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-4"
                />
              )}
              <button
                type="button"
                data-testid="button-start-quest"
                onClick={startQuest}
                disabled={!activeName || createStudent.isPending}
                className="mt-6 flex w-full items-center justify-between rounded-xl border-2 border-foreground bg-foreground px-5 py-4 text-left text-sm font-bold text-background transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{createStudent.isPending ? 'Opening your quest...' : 'Start / resume quest'}</span>
                <ArrowRight size={18} />
              </button>
              {createStudent.isError && <p className="mt-3 text-sm font-semibold text-destructive" data-testid="status-start-error">Could not open the quest. Try again.</p>}
              <p className="mt-4 text-center font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">Your progress follows your name</p>
              </>
              )}
            </div>
          </div>
        </section>
        <footer className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 pb-8 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:px-10 lg:px-16">
          <span>Made for curious minds</span>
          <span>Write it. Run it. Remember it.</span>
        </footer>
      </div>
    </main>
  );
}