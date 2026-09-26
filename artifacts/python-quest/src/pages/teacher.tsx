import { Activity, ArrowLeft, Check, CircleAlert, Clock3, Code2, RefreshCw, ShieldAlert, Sparkles, Users, Zap } from 'lucide-react';
import { getGetTeacherDashboardQueryKey, useGetTeacherDashboard } from '@workspace/api-client-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';

function timeSince(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr ago`;
  return `${Math.round(minutes / 1440)} days ago`;
}

function statusStyle(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'bg-primary text-foreground';
  if (normalized.includes('idle')) return 'bg-muted text-muted-foreground';
  return 'bg-secondary/25 text-foreground';
}

export default function Teacher() {
  const [pin, setPin] = useState('');
  const [submittedPin, setSubmittedPin] = useState('');
  const { data, isLoading, isError, refetch, isFetching } = useGetTeacherDashboard({
    query: { enabled: submittedPin.length > 0, retry: false, queryKey: getGetTeacherDashboardQueryKey() },
    request: { headers: { 'x-teacher-pin': submittedPin } },
  });

  if (!submittedPin) return <TeacherGate pin={pin} setPin={setPin} onSubmit={() => setSubmittedPin(pin)} />;
  if (isLoading) return <TeacherSkeleton />;
  if (isError) return <TeacherGate pin={pin} setPin={setPin} onSubmit={() => { setSubmittedPin(''); setTimeout(() => setSubmittedPin(pin), 0); }} invalid />;

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <header className="border-b-2 border-foreground bg-foreground text-background">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-foreground transition hover:bg-secondary" data-testid="link-teacher-home"><Code2 size={21} /></Link>
            <div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-background/55">Classroom command</p><h1 className="text-lg font-extrabold sm:text-xl">Teacher dashboard</h1></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono-ui text-[10px] uppercase tracking-[.16em] text-background/50 sm:inline">Grade XI · Informatics Practices</span>
            <button type="button" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh-dashboard" className="grid h-10 w-10 place-items-center rounded-xl border border-background/25 text-background transition hover:bg-background/10 disabled:opacity-50"><RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /></button>
          </div>
        </div>
      </header>

      <div className="quest-grid min-h-[calc(100dvh-81px)]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Link href="/" className="mb-4 inline-flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground transition hover:text-foreground" data-testid="link-back-to-start"><ArrowLeft size={13} /> Student start</Link>
              <h2 className="text-4xl font-extrabold tracking-[-.05em] sm:text-6xl">See the room<br /><span className="text-secondary">come alive.</span></h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">A quick read on who is coding, who is close to a milestone, and where a focus check might be useful.</p>
            </div>
            <div className="rounded-2xl border-2 border-foreground bg-card px-5 py-4 ink-shadow-sm"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Quest pulse</p><p className="mt-1 text-sm font-bold"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary align-middle" />Live classroom data</p></div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Users size={18} />} label="Quest members" value={data?.totalStudents ?? 0} detail={`${data?.activeToday ?? 0} active today`} tone="primary" testId="stat-total-students" />
            <StatCard icon={<Activity size={18} />} label="Active today" value={data?.activeToday ?? 0} detail="students in motion" tone="aqua" testId="stat-active-today" />
            <StatCard icon={<Check size={18} />} label="Quest complete" value={data?.completedQuest ?? 0} detail="all 10 missions" tone="orange" testId="stat-completed-quest" />
            <StatCard icon={<Zap size={18} />} label="Average XP" value={data?.averageXp ?? 0} detail="across the room" tone="ink" testId="stat-average-xp" />
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_350px]">
            <section className="overflow-hidden rounded-2xl border-2 border-foreground bg-card ink-shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground px-5 py-5 sm:px-6">
                <div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">Roster intelligence</p><h3 className="mt-1 text-xl font-extrabold">Student progress</h3></div>
                <span className="rounded-full border border-foreground/20 bg-background px-3 py-1.5 font-mono-ui text-[10px] uppercase tracking-wider">{data?.students?.length ?? 0} records</span>
              </div>
              {data?.students?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                     <thead><tr className="border-b border-border font-mono-ui text-[10px] uppercase tracking-[.15em] text-muted-foreground"><th className="px-6 py-4 font-medium">Student</th><th className="px-4 py-4 font-medium">Class</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">XP / level</th><th className="px-4 py-4 font-medium">Missions</th><th className="px-4 py-4 font-medium">Lives</th><th className="px-6 py-4 text-right font-medium">Focus checks</th></tr></thead>
                    <tbody>
                      {data.students.map((student) => {
                        const completedPercent = Math.min(100, (student.completedLevels / 10) * 100);
                        return <tr key={student.id} className="group border-b border-border/70 transition last:border-0 hover:bg-background/70" data-testid={`row-student-${student.id}`}>
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-extrabold">{student.name.slice(0, 1).toUpperCase()}</span><div><p className="font-bold">{student.name}</p><p className="font-mono-ui text-[10px] text-muted-foreground">{timeSince(student.lastSeenAt)}</p></div></div></td>
                           <td className="px-4 py-4"><span className="rounded-full bg-primary/50 px-2.5 py-1 font-mono-ui text-[10px] font-medium">{student.grade === '11' ? '11th' : student.grade}</span></td>
                          <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-ui text-[10px] uppercase tracking-wider ${statusStyle(student.status)}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{student.status}</span></td>
                          <td className="px-4 py-4"><p className="font-mono-ui text-xs font-medium">{student.xp} XP</p><p className="mt-1 text-xs text-muted-foreground">Level {student.level}</p></td>
                          <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completedPercent}%` }} /></div><span className="font-mono-ui text-xs">{student.completedLevels}/10</span></div></td>
                          <td className="px-4 py-4"><div className="flex items-center gap-1.5 font-mono-ui text-xs"><span className={`h-2 w-2 rounded-full ${student.lives < 10 ? 'bg-secondary' : 'bg-primary'}`} />{student.lives}</div></td>
                          <td className="px-6 py-4 text-right">{student.tabSwitches > 0 ? <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/20 px-2.5 py-1.5 font-mono-ui text-[10px] font-medium text-foreground"><ShieldAlert size={13} />{student.tabSwitches}</span> : <span className="font-mono-ui text-xs text-muted-foreground">clear</span>}</td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyState />}
            </section>

            <section className="rounded-2xl border-2 border-foreground bg-foreground p-5 text-background sm:p-6">
              <div className="flex items-center justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-background/55">Live feed</p><h3 className="mt-1 text-xl font-extrabold">Recent activity</h3></div><Sparkles size={19} className="text-primary" /></div>
              {data?.recentActivity?.length ? <div className="mt-7 space-y-5">{data.recentActivity.slice(0, 8).map((item, index) => <div key={`${item.createdAt}-${index}`} className="flex gap-3" data-testid={`activity-item-${index}`}><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="text-sm leading-snug text-background/90"><strong className="text-background">{item.studentName}</strong> {item.event}</p><p className="mt-1 font-mono-ui text-[10px] text-background/45">Mission {String(item.levelId).padStart(2, '0')} · {timeSince(item.createdAt)}</p></div></div>)}</div> : <div className="mt-8 rounded-xl border border-background/15 p-4 text-sm text-background/60" data-testid="empty-activity">Activity will appear as students make their first moves.</div>}
              <div className="mt-8 border-t border-background/15 pt-5"><div className="flex items-center gap-2 text-xs text-background/60"><Clock3 size={14} /> Updated when you refresh</div></div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function TeacherGate({ pin, setPin, onSubmit, invalid = false }: { pin: string; setPin: (value: string) => void; onSubmit: () => void; invalid?: boolean }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md rounded-2xl border-2 border-foreground bg-card p-7 ink-shadow sm:p-9">
        <div className="mb-7 flex items-center justify-between">
          <Link href="/" className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-foreground"><Code2 size={21} /></Link>
          <ShieldAlert size={20} className="text-secondary" />
        </div>
        <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-muted-foreground">Teacher access</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Enter the classroom PIN</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The student view stays open without a login. This dashboard is only for the teacher.</p>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="mt-7">
          <label htmlFor="teacher-pin" className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">PIN</label>
          <input id="teacher-pin" type="password" inputMode="numeric" autoComplete="new-password" autoFocus value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-2 w-full rounded-xl border-2 border-foreground bg-background px-4 py-3 font-mono-ui text-lg tracking-[.4em] outline-none focus:ring-4 focus:ring-primary/40" placeholder="••••" data-testid="input-teacher-pin" />
          {invalid && <p className="mt-3 text-sm font-semibold text-destructive" data-testid="status-invalid-teacher-pin">That PIN is not correct.</p>}
          <button type="submit" disabled={pin.length !== 4} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 font-bold text-background transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-submit-teacher-pin">Open teacher dashboard <ArrowLeft className="rotate-180" size={16} /></button>
        </form>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, detail, tone, testId }: { icon: ReactNode; label: string; value: number; detail: string; tone: 'primary' | 'aqua' | 'orange' | 'ink'; testId: string }) {
  const toneClass = { primary: 'bg-primary', aqua: 'bg-accent/25', orange: 'bg-secondary/35', ink: 'bg-foreground text-background' }[tone];
  return <div className={`rounded-2xl border-2 border-foreground p-5 transition hover:-translate-y-1 ${toneClass}`} data-testid={testId}><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl border border-foreground/20">{icon}</span><span className="font-mono-ui text-[10px] uppercase tracking-[.16em] opacity-60">01</span></div><p className="mt-7 font-mono-ui text-[10px] uppercase tracking-[.16em] opacity-65">{label}</p><p className="mt-1 text-4xl font-extrabold tracking-[-.05em]">{value}</p><p className="mt-1 text-xs font-medium opacity-70">{detail}</p></div>;
}

function EmptyState() {
  return <div className="m-6 rounded-2xl border-2 border-dashed border-border p-10 text-center" data-testid="empty-students"><Users className="mx-auto mb-3 text-muted-foreground" size={26} /><p className="font-bold">No students yet.</p><p className="mt-1 text-sm text-muted-foreground">The roster will fill in when students start their quest.</p></div>;
}

function TeacherSkeleton() {
  return <main className="min-h-[100dvh] bg-background p-6 sm:p-12"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-10 w-56 rounded-lg bg-muted" /><div className="mt-16 h-16 w-96 max-w-full rounded-lg bg-muted" /><div className="mt-10 grid gap-3 sm:grid-cols-4"><div className="h-36 rounded-2xl bg-muted" /><div className="h-36 rounded-2xl bg-muted" /><div className="h-36 rounded-2xl bg-muted" /><div className="h-36 rounded-2xl bg-muted" /></div><div className="mt-8 h-96 rounded-2xl bg-muted" /></div></main>;
}

function TeacherError({ onRetry }: { onRetry: () => void }) {
  return <main className="grid min-h-[100dvh] place-items-center bg-background p-6"><div className="max-w-md rounded-2xl border-2 border-foreground bg-card p-8 text-center ink-shadow"><CircleAlert className="mx-auto mb-4 text-secondary" size={32} /><h1 className="text-2xl font-extrabold">Dashboard data missed a beat.</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The classroom feed is not available right now.</p><button type="button" onClick={onRetry} data-testid="button-retry-teacher" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:bg-secondary hover:text-foreground">Try again <RefreshCw size={15} /></button></div></main>;
}