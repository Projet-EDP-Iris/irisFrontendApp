import { useState } from "react";

// ── Iris orbit logo (bottom right) ────────────────────────
const IrisOrbitLogo = () => (
  <svg width="52" height="52" viewBox="0 0 58 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="orbitGrad" x1="25" y1="49" x2="25" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF3D00" /><stop offset="1" stopColor="#A05533" />
      </linearGradient>
    </defs>
    <path d="M36.8118 62.5754C36.2386 61.6164 36.296 61.1969 37.0986 60.1779C38.0732 59.0391 38.0732 59.0391 39.2199 60.2978C40.0225 61.1969 40.1372 61.6763 39.6784 61.8562C39.2773 61.976 38.9905 62.4555 38.9905 62.935C38.9905 64.1933 37.6721 63.9536 36.8118 62.5754Z" fill="url(#orbitGrad)" />
    <path d="M22.4792 52.5663C21.9632 51.6073 22.0205 51.1278 22.5938 50.6484C23.7978 49.5695 24.8871 51.2477 23.8551 52.6862C23.1098 53.7651 23.0525 53.7651 22.4792 52.5663Z" fill="url(#orbitGrad)" />
    <path d="M41.4557 48.4307C40.4811 47.8913 39.5064 47.1121 39.3344 46.6327C38.9332 45.6141 38.9906 45.6141 41.4557 46.6926C42.5451 47.1721 43.5198 47.4118 43.6915 47.292C43.8062 47.1721 44.7235 46.9923 45.6408 46.8724C49.5394 46.5727 47.3607 42.1378 39.3344 33.8069L34.9772 29.3718L33.3147 30.3907C31.2508 31.6493 29.1295 31.7092 26.6643 30.4506C24.3138 29.3119 23.3391 27.0344 23.5684 23.3185C23.7404 20.6215 23.6258 20.3817 21.5046 18.7635C20.2433 17.8645 18.982 17.0853 18.6953 17.0254C18.4087 17.0254 17.6634 16.5459 17.0327 16.0066C16.0008 14.9877 15.8861 14.9877 14.6248 16.6658C12.6182 19.3029 11.2423 24.3973 11.6436 28.1132C12.5609 37.5829 21.2179 45.2545 30.1042 44.4753C33.2573 44.1756 34.3467 44.775 31.9961 45.4343C28.9002 46.273 22.3645 45.7939 19.7273 44.5352C16.2301 42.7971 11.4143 37.7627 9.75171 34.1665C7.63047 29.5516 7.3438 23.2585 9.0064 18.344C9.75171 16.1264 10.5543 14.1486 10.8983 13.789C11.701 12.9499 10.2677 11.8711 6.99982 11.032C4.64923 10.4926 3.78928 10.4327 3.15864 11.032C1.95469 12.0509 2.06936 13.0098 3.73196 16.4261C5.33723 19.7824 5.27988 20.082 3.21597 17.9244C-0.338545 14.2085 -0.911854 11.5714 1.32405 9.35387C2.92932 7.79559 6.08251 7.67572 9.46505 8.99425C10.7263 9.53368 12.1023 9.9532 12.5036 9.9532C12.8476 10.0131 13.1916 10.3128 13.1916 10.6724C13.1916 11.1519 13.3062 11.1519 13.6502 10.6724C14.5675 9.234 21.1605 5.69788 24.0271 5.09855C28.2123 4.19953 31.5374 4.73896 36.4681 7.19626C39.4491 8.63467 41.2837 10.0731 42.9462 12.1708C44.265 13.789 45.297 15.4671 45.297 15.8867C45.297 16.3661 45.6982 17.2652 46.157 17.8645C46.7302 18.6436 47.0169 20.3817 46.9596 22.6592V26.3152L45.8129 22.2397C45.1823 19.9622 44.3224 17.6847 43.8635 17.2052C43.4051 16.7258 43.0036 16.1264 43.0036 15.8867C43.0036 14.8079 39.1053 11.4515 36.1813 10.0131C31.4801 7.67572 26.091 7.73565 21.8485 10.133C20.1286 11.1519 18.638 12.2307 18.5807 12.5304C18.466 12.89 20.0713 14.2685 22.1352 15.6469C25.747 18.1042 25.919 18.1642 28.3269 17.5049C30.4482 16.9055 31.0788 16.9655 33.0279 17.9844C35.4934 19.243 36.9266 21.7003 36.8692 24.5771C36.8119 26.1953 37.6145 27.334 41.9142 32.0089C49.8832 40.5794 51.7179 44.9548 48.8516 48.3708C47.7622 49.6894 43.9783 49.6894 41.4557 48.4307Z" fill="url(#orbitGrad)" />
    <path d="M2.41366 43.0967C2.01234 42.2576 1.43903 41.5983 1.03771 41.5983C0.69373 41.5983 0.865724 40.9989 1.55369 40.2797C2.18434 39.5005 2.87231 38.4819 3.0443 38.0024C3.21629 37.3431 3.50294 37.5829 3.96159 38.7813C4.30557 39.6803 4.82155 40.3996 5.16553 40.3996C5.45219 40.3996 5.73885 40.6992 5.73885 40.9989C5.73885 41.3585 5.33752 41.5983 4.8789 41.5983C4.42025 41.5983 4.01891 42.1377 4.01891 42.7371C4.01891 44.5352 3.10163 44.715 2.41366 43.0967Z" fill="url(#orbitGrad)" />
    <path d="M55.6165 40.3996C55.6165 39.98 55.158 39.2608 54.5848 38.7213C53.5528 37.7624 53.5528 37.6425 54.7566 36.4441L56.018 35.2454L57.1647 36.564C58.2537 37.8223 58.2537 37.8822 56.9353 39.4406C56.19 40.3396 55.6165 40.7592 55.6165 40.3996Z" fill="url(#orbitGrad)" />
    <path d="M53.3808 20.7413C52.9794 19.9022 52.9794 19.3029 53.5529 18.5237C54.2981 17.4449 54.3555 17.4449 54.9287 18.5837C55.3302 19.4228 55.3302 20.0221 54.7566 20.8012C54.0114 21.88 53.954 21.88 53.3808 20.7413Z" fill="url(#orbitGrad)" />
    <path d="M10.5544 1.38276C10.0957 0.543685 11.5863 -0.475195 12.2743 0.244014C12.7903 0.783421 12.2743 2.04203 11.4717 2.04203C11.185 2.04203 10.7837 1.74236 10.5544 1.38276Z" fill="url(#orbitGrad)" />
  </svg>
);

// ── Nav icon wrapper ───────────────────────────────────────
const NavIcon = ({ active = false, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
    style={active ? { background: "linear-gradient(135deg,#FF6B35,#E84000)" } : { background: "transparent" }}
  >
    {children}
  </button>
);

// ── SVG Icons ──────────────────────────────────────────────
const HamburgerIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const HomeIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const MailIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>;
const TaskIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>;
const ChartIcon      = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7"  width="4" height="14"/><rect x="17" y="3"  width="4" height="18"/></svg>;
const SunIcon        = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2"  x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2"  y1="12" x2="5"  y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/><line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/></svg>;
const GearIcon       = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const HistoryIcon    = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 16 14"/></svg>;
const PersonIcon     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const PowerIcon      = () => (
  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(60,20,0,0.7)" }}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
    <line x1="12" y1="2" x2="12" y2="12"/>
  </svg>
);

// ── Tasks View ────────────────────────────────────────────
const TASKS_DATA = [
  { id:1, title:"Projet Mood App — contribution du groupe",     icon:"mail",     meta:"e-mail de Clara — livrable\nvendredi", draft:false,
    subtasks:[{id:'s1',text:"Définir architecture (modules, états)",duration:"45 min"},{id:'s2',text:"Créer repo + structure initiale",duration:"30 min"},{id:'s3',text:"Coder ma partie (auth & mood form)",duration:"2h"},{id:'s4',text:"Écrire mini doc / critères de test",duration:"30 min"},{id:'s5',text:"Préparer point d'avancement",duration:"15 min"}] },
  { id:2, title:"Préparation réunion Marketing — campagne Q3",  icon:"calendar", meta:"Réunion Marketing — jeudi 14:00\n(visio)", draft:false, subtasks:[] },
  { id:3, title:"Répondre à la proposition de Thomas Martin",   icon:"mail",     meta:"e-mail de Thomas — réponse attendue avant\nmardi", draft:true, subtasks:[] },
];

const TasksView = () => {
  const [expanded,    setExpanded]    = useState<number | null>(null);
  const [accepted,    setAccepted]    = useState(new Set());
  const [openMenu,    setOpenMenu]    = useState<number | null>(null);
  const [checkedSubs, setCheckedSubs] = useState(new Set());

  const pending   = TASKS_DATA.filter(t => !accepted.has(t.id));
  const scheduled = TASKS_DATA.filter(t =>  accepted.has(t.id));

  const toggleSub = (id: string) => setCheckedSubs(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between px-8 pt-7 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{color:"rgba(255,255,255,0.9)"}}>Tasks</h1>
          <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.35)"}}>From your emails</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"/>
          <span className="text-xs" style={{color:"rgba(255,255,255,0.5)"}}>Synced with Google Tasks</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-8 overflow-y-auto pb-6" onClick={()=>setOpenMenu(null)}>
        {pending.map(task=>(
          <div key={task.id} className="rounded-2xl" style={{background:task.draft?"#5A3C0A":"#2E2010",border:task.draft?"1.5px solid rgba(232,132,42,0.5)":"1px solid rgba(255,255,255,0.07)"}}>
            {task.draft&&(
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-xs font-medium" style={{color:"#E8842A"}}>Plan brouillon — à valider</span>
              </div>
            )}
            <button className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer" onClick={e=>{e.stopPropagation();setExpanded(expanded===task.id?null:task.id);}}>
              <div>
                <p className="text-sm font-semibold" style={{color:"rgba(255,255,255,0.88)"}}>{task.title}</p>
                <div className="flex items-start gap-1.5 mt-1">
                  {task.icon==="mail"
                    ?<svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                    :<svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/></svg>}
                  <span className="text-xs whitespace-pre-line" style={{color:"rgba(255,255,255,0.35)"}}>{task.meta}</span>
                </div>
              </div>
              <svg className="w-5 h-5 flex-shrink-0 transition-transform" style={{color:"rgba(255,255,255,0.35)",transform:expanded===task.id?"rotate(90deg)":"none"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            {expanded===task.id&&task.subtasks.length>0&&(
              <div className="px-4 pb-2 flex flex-col gap-2.5">
                {task.subtasks.map(sub=>(
                  <label key={sub.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={checkedSubs.has(sub.id)} onChange={()=>toggleSub(sub.id)} className="w-4 h-4 rounded accent-orange-500 flex-shrink-0"/>
                    <span className="text-sm flex-1" style={{color:checkedSubs.has(sub.id)?"rgba(255,255,255,0.3)":"rgba(255,255,255,0.75)",textDecoration:checkedSubs.has(sub.id)?"line-through":"none"}}>{sub.text}</span>
                    <span className="text-xs flex-shrink-0" style={{color:"rgba(255,255,255,0.3)"}}>({sub.duration})</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2 relative" onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setAccepted(prev=>new Set([...prev,task.id]))} className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity" style={{background:"linear-gradient(90deg,#FF6B35,#E84000)",color:"white"}}>Accept plan</button>
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>
                <span className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>Plan 60 min</span>
              </div>
              <div className="relative">
                <button onClick={e=>{e.stopPropagation();setOpenMenu(openMenu===task.id?null:task.id);}} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/10 transition-colors" style={{color:"rgba(255,255,255,0.35)"}}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                {openMenu===task.id&&(
                  <div className="absolute right-0 bottom-10 rounded-xl shadow-2xl z-30 py-1 min-w-44" style={{background:"#3A2A14",border:"1px solid rgba(255,255,255,0.1)"}}>
                    {["Edit plan","Open event"].map(item=>(
                      <button key={item} onClick={()=>setOpenMenu(null)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 cursor-pointer transition-colors" style={{color:"rgba(255,255,255,0.8)"}}>{item}</button>
                    ))}
                    <button onClick={()=>setOpenMenu(null)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between" style={{color:"rgba(255,255,255,0.8)"}}>
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in Google Tasks
                      </div>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {scheduled.length>0&&(
          <div className="mt-1">
            <p className="text-xs font-medium mb-3 px-1" style={{color:"rgba(255,255,255,0.35)"}}>Scheduled ({scheduled.length})</p>
            <div className="flex flex-col gap-2">
              {scheduled.map(task=>(
                <div key={task.id} className="flex items-center justify-between px-4 py-3.5 rounded-2xl" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
                    <span className="text-sm" style={{color:"rgba(255,255,255,0.7)"}}>{task.title}</span>
                  </div>
                  <button className="text-xs font-medium cursor-pointer hover:opacity-80" style={{color:"#E8842A"}}>Open in native</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Analysis View ─────────────────────────────────────────
const WEEKLY_DATA = {
  Mon:[8,5,2], Tue:[12,8,3], Wed:[6,9,4], Thu:[10,11,3], Fri:[7,6,1], Sat:[2,3,1], Sun:[1,2,1],
};

const DonutChart = () => {
  const r=70,cx=90,cy=90,sw=28,circ=2*Math.PI*r;
  const [m,f,p]=[circ*0.42,circ*0.35,circ*0.23];
  const base="rotate(-90deg)";
  const s={transformOrigin:`${cx}px ${cy}px`,transform:base};
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A0E04" strokeWidth={sw}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7A3010" strokeWidth={sw} strokeDasharray={`${p} ${circ-p}`} strokeDashoffset={circ*0.25} style={s}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#CC4400" strokeWidth={sw} strokeDasharray={`${f} ${circ-f}`} strokeDashoffset={circ*0.25-p} style={s}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FF8C42" strokeWidth={sw} strokeDasharray={`${m} ${circ-m}`} strokeDashoffset={circ*0.25-p-f} style={s}/>
    </svg>
  );
};

const TrendLine = () => {
  const pts=[22,36,30,44,40,54,60,72];
  const w=340,h=80;
  const xs=pts.map((_,i)=>(i/(pts.length-1))*(w-40)+20);
  const mx=Math.max(...pts);
  const ys=pts.map(v=>h-8-((v/mx)*(h-20)));
  const d=xs.map((x,i)=>`${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="w-full">
      <path d={d} fill="none" stroke="#E8842A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x,i)=><circle key={i} cx={x} cy={ys[i]} r="4" fill="#E8842A"/>)}
    </svg>
  );
};

const ic=(v: number)=>v>=10?"#FF7722":v>=8?"#E86520":v>=6?"#C85010":v>=4?"#A04010":v>=2?"#7A3010":"#4A2010";

const DetailPanel = ({title,subtitle,drivers,toggleLabel,toggleSub,onClose}: any)=>(
  <div className="absolute top-0 right-0 h-full flex flex-col z-20 overflow-y-auto" style={{width:400,background:"#2A1A0A",borderLeft:"1px solid rgba(255,255,255,0.06)"}}>
    <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0" style={{background:"#2A1A0A"}}>
      <h2 className="text-lg font-bold" style={{color:"rgba(255,255,255,0.9)"}}>{title}</h2>
      <button onClick={onClose} className="cursor-pointer" style={{color:"rgba(255,255,255,0.4)"}}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div className="px-6 flex flex-col gap-5 pb-8">
      <p className="text-sm" style={{color:"rgba(255,255,255,0.5)"}}>{subtitle}</p>
      <div>
        <p className="text-xs font-semibold mb-3" style={{color:"rgba(255,255,255,0.45)"}}>Trend (last 4 weeks)</p>
        <div className="rounded-xl p-3" style={{background:"#362010"}}><TrendLine/></div>
      </div>
      <div>
        <p className="text-xs font-semibold mb-3" style={{color:"rgba(255,255,255,0.45)"}}>Top drivers</p>
        <div className="flex flex-col gap-2">
          {drivers.map((d: any)=>(
            <div key={d.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{background:"#362010"}}>
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
              <span className="text-sm flex-1" style={{color:"rgba(255,255,255,0.75)"}}>{d.label}</span>
              {d.action&&<button className="text-xs font-medium cursor-pointer hover:opacity-80 flex-shrink-0" style={{color:"#E8842A"}}>{d.action}</button>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-4 rounded-xl" style={{background:"#362010"}}>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{color:"rgba(255,255,255,0.85)"}}>{toggleLabel}</p>
            {title==="Actions converted"&&<span className="px-1.5 rounded-full text-xs font-bold" style={{background:"#E8842A",color:"white",fontSize:10}}>3</span>}
          </div>
          <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.4)"}}>{toggleSub}</p>
        </div>
        <div className="relative w-11 h-6 rounded-full flex-shrink-0" style={{background:"#1A1208"}}>
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full" style={{background:"#E8842A"}}/>
        </div>
      </div>
      <button onClick={onClose} className="w-full py-4 rounded-xl text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity" style={{background:"linear-gradient(90deg,#FF6B35,#E84000)"}}>Done</button>
    </div>
  </div>
);

const AnalysisView = () => {
  const [period,setPeriod]=useState("7 days");
  const [detail,setDetail]=useState<string | null>(null);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-start justify-between px-8 pt-7 pb-2 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{color:"rgba(255,255,255,0.9)"}}>Analysis & Insights</h1>
          <p className="text-xs mt-0.5" style={{color:"rgba(255,255,255,0.35)"}}>From your recent emails and events</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-400"/>
            <span className="text-xs" style={{color:"rgba(255,255,255,0.45)"}}>Synced: Google, Outlook, Apple</span>
          </div>
        </div>
        <div className="flex gap-1">
          {["Today","7 days","30 days"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className="px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              style={period===p?{border:"1.5px solid #E8842A",color:"#E8842A",background:"transparent"}:{border:"1.5px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.45)",background:"transparent"}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-6 mt-3">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Time saved */}
          <div className="rounded-2xl p-5" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{background:"rgba(232,132,42,0.15)"}}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/></svg>
            </div>
            <p className="text-xs mb-2" style={{color:"rgba(255,255,255,0.45)"}}>Time saved</p>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold" style={{color:"#FF8C42"}}>4h 30min</span>
              <span className="text-xs font-medium" style={{color:"#22C55E"}}>↑12%</span>
            </div>
            <div className="h-1 rounded-full mb-4" style={{background:"rgba(255,255,255,0.08)"}}>
              <div className="h-1 rounded-full" style={{width:"75%",background:"linear-gradient(90deg,#FF8C42,#FF5722)"}}/>
            </div>
            <button onClick={()=>setDetail("time")} className="text-xs font-medium cursor-pointer hover:opacity-80 flex items-center gap-1" style={{color:"#E8842A"}}>
              See details <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          {/* Actions converted */}
          <div className="rounded-2xl p-5" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{background:"rgba(232,132,42,0.15)"}}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <p className="text-xs mb-2" style={{color:"rgba(255,255,255,0.45)"}}>Actions converted</p>
            <p className="text-2xl font-bold mb-1" style={{color:"#FF8C42"}}>24</p>
            <p className="text-xs mb-3" style={{color:"rgba(255,255,255,0.35)"}}>emails → events/tasks</p>
            <div className="h-1.5 rounded-full mb-4" style={{background:"rgba(255,255,255,0.08)"}}>
              <div className="h-1.5 rounded-full" style={{width:"85%",background:"linear-gradient(90deg,#FF8C42,#CC3300)"}}/>
            </div>
            <button onClick={()=>setDetail("actions")} className="text-xs font-medium cursor-pointer hover:opacity-80 flex items-center gap-1" style={{color:"#E8842A"}}>
              See details <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Intent mix */}
          <div className="rounded-2xl p-5" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p className="text-sm font-semibold" style={{color:"rgba(255,255,255,0.85)"}}>Intent mix</p>
            <p className="text-xs mb-3" style={{color:"rgba(255,255,255,0.35)"}}>From your emails</p>
            <div className="flex items-center gap-3">
              <DonutChart/>
              <div className="flex flex-col gap-3">
                {[{label:"Meetings",pct:"42%",color:"#FF8C42"},{label:"Follow-ups",pct:"35%",color:"#CC4400"},{label:"Packages/Other",pct:"23%",color:"#7A3010"}].map(item=>(
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:item.color}}/>
                    <div>
                      <p className="text-xs font-medium" style={{color:"rgba(255,255,255,0.8)"}}>{item.label}</p>
                      <p className="text-xs" style={{color:"rgba(255,255,255,0.4)"}}>{item.pct}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Weekly rhythm */}
          <div className="rounded-2xl p-5" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p className="text-sm font-semibold" style={{color:"rgba(255,255,255,0.85)"}}>Weekly rhythm</p>
            <p className="text-xs mb-3" style={{color:"rgba(255,255,255,0.35)"}}>Best windows to propose or prepare</p>
            <table className="w-full text-center" style={{borderSpacing:"3px",borderCollapse:"separate"}}>
              <thead><tr>
                <th className="w-10"/>
                {["Morning","Afternoon","Evening"].map(h=><th key={h} className="text-xs pb-1.5" style={{color:"rgba(255,255,255,0.4)",fontWeight:400}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {Object.entries(WEEKLY_DATA).map(([day,vals])=>(
                  <tr key={day}>
                    <td className="text-xs py-0.5 text-left pr-2" style={{color:"rgba(255,255,255,0.35)"}}>{day}</td>
                    {vals.map((v,i)=>(
                      <td key={i} className="py-0.5">
                        <div className="w-full rounded-lg py-1 text-xs font-semibold" style={{background:ic(v),color:v>=6?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.5)"}}>{v}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detail==="time"&&<DetailPanel title="Time saved" subtitle="Iris has automated and optimized your recurring tasks this week." drivers={[{label:"Automatic creation of 12 events"},{label:"Coordinated 8 meetings without back-and-forth"},{label:"Scheduled 24 follow-ups"}]} toggleLabel="Daily time-saved summary" toggleSub="Receive a daily summary of time saved" onClose={()=>setDetail(null)}/>}
      {detail==="actions"&&<DetailPanel title="Actions converted" subtitle="Emails automatically converted into actionable items." drivers={[{label:"12 meeting invitations created",action:"Edit invite template"},{label:"9 follow-up tasks scheduled",action:"Set auto-send 9:00"},{label:"3 package tracking reminders",action:"Enable package reminders"}]} toggleLabel="Auto-convert emails" toggleSub="Automatically detect emails into tasks" onClose={()=>setDetail(null)}/>}
    </div>
  );
};

// ── Inbox View ────────────────────────────────────────────
const EMAILS = [
  {
    id: 1, initials: "MD", sender: "Marie Dubois",
    subject: "Réunion projet Q1 - disponibilités",
    tag: "Meeting", detail: "Propose 18 oct 10:00, visio; 2 participants",
    action: "Add to cal", actionType: "cal",
  },
  {
    id: 2, initials: "TM", sender: "Thomas Martin",
    subject: "Suivi devis - rappel",
    tag: "Follow-up", detail: "Rappel sur Devis #2024-156",
    action: "Create follow-up", actionType: "followup",
  },
  {
    id: 3, initials: "SB", sender: "Sophie Bernard",
    subject: "Proposition de créneau pour démo",
    tag: "Meeting", detail: "Propose 20 oct 15:00, bureaux Paris; 2 participants",
    action: "Add to cal", actionType: "cal",
  },
];

const INBOX_DATA = [
  { id:1, initials:"MD", sender:"Marie Dubois",   subject:"Réunion projet Q1 - disponibilités",    tag:"Meeting",   detail:"Propose 18 oct 10:00, visio; 2 participants", action:"Add to cal"       },
  { id:2, initials:"TM", sender:"Thomas Martin",  subject:"Suivi devis - rappel",                  tag:"Follow-up", detail:"Rappel sur Devis #2024-156",                  action:"Create follow-up" },
  { id:3, initials:"SB", sender:"Sophie Bernard", subject:"Proposition de créneau pour démo",      tag:"Meeting",   detail:"Propose 20 oct 15:00, bureaux Paris; 2 participants", action:"Prepare event" },
];

const InboxView = () => {
  const [tab,      setTab]      = useState("focused");
  const [scheduled,setScheduled]= useState(new Set());

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-7 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>Emails</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>From your emails</p>
        </div>
        {/* Summarizing pill */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#4A2E14", border: "1px solid rgba(232,132,42,0.3)" }}>
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span className="text-sm" style={{ color: "#E8842A" }}>Iris is summarizing your emails...</span>
          <svg className="w-4 h-4 flex-shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-8 mb-5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {[
          { id:"rdv",       label:"RDV",        count: INBOX_DATA.length - scheduled.size },
          { id:"action",    label:"Action",     count: 0 },
          { id:"attente",   label:"En attente", count: 0 },
          { id:"bonsplans", label:"Bons plans", count: 0 },
          { id:"info",      label:"Info",       count: 0 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border-b-2 -mb-px"
            style={{
              color: tab === t.id ? "#E8842A" : "rgba(255,255,255,0.45)",
              borderColor: tab === t.id ? "#E8842A" : "transparent",
              background: "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: tab === t.id ? "#E8842A" : "rgba(255,255,255,0.15)", color: tab === t.id ? "white" : "rgba(255,255,255,0.5)", fontSize: 10 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Email list */}
      <div className="flex flex-col gap-2 px-8 overflow-y-auto pb-6">
        {INBOX_DATA.filter(e=>!scheduled.has(e.id)).map(email=>(
          <div key={email.id} className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{background:"linear-gradient(135deg,#A05030,#7A3818)",color:"rgba(255,255,255,0.85)"}}>
              {email.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{color:"rgba(255,255,255,0.88)"}}>
                <span>{email.sender}</span>
                <span style={{color:"rgba(255,255,255,0.45)",fontWeight:400}}>· {email.subject}</span>
              </p>
              <p className="text-xs mt-0.5 truncate" style={{color:"rgba(255,255,255,0.35)"}}>
                <span style={{color:"rgba(232,132,42,0.7)"}}>{email.tag}</span>{" · "}{email.detail}
              </p>
            </div>
            <button onClick={()=>setScheduled(prev=>new Set([...prev,email.id]))} className="px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity" style={{background:"linear-gradient(90deg,#FF6B35,#E84000)",color:"white"}}>
              {email.action}
            </button>
            <button className="flex-shrink-0 cursor-pointer hover:opacity-70" style={{color:"rgba(255,255,255,0.35)"}}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
          </div>
        ))}

        {/* Scheduled section */}
        {scheduled.size>0&&(
          <div className="mt-2">
            <p className="text-xs font-medium mb-3 px-1" style={{color:"rgba(255,255,255,0.35)"}}>Scheduled ({scheduled.size})</p>
            <div className="flex flex-col gap-2">
              {INBOX_DATA.filter(e=>scheduled.has(e.id)).map(email=>(
                <div key={email.id} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl" style={{background:"#2E2010",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
                  <span className="text-sm" style={{color:"rgba(255,255,255,0.7)"}}>{email.sender} · {email.subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Settings Panel ────────────────────────────────────────
const SETTING_AVATARS = [
  { id: 0, bg: "linear-gradient(135deg,#FF6D3A,#FF4500)", icon: "person" },
  { id: 1, bg: "linear-gradient(135deg,#E53000,#CC2200)",  icon: "star"   },
  { id: 2, bg: "linear-gradient(135deg,#B87040,#8B5A2B)",  icon: "person2"},
  { id: 3, bg: "linear-gradient(135deg,#FF8050,#FF5722)",  icon: "person" },
  { id: 4, bg: "linear-gradient(135deg,#FF9060,#FF6533)",  icon: "person" },
];

const AvatarMini = ({ av, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className="rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all"
    style={{
      width: selected ? 44 : 38, height: selected ? 44 : 38,
      background: av.bg,
      boxShadow: selected ? "0 0 0 2px #4A2E14, 0 0 0 3.5px #E8842A" : "none",
    }}
  >
    {av.icon === "star"
      ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.9 6.1L22 9.3l-5 5 1.2 7-6.2-3.4L5.8 21.3l1.2-7-5-5 7.1-1.2z"/></svg>
      : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    }
  </button>
);

const DarkInput = ({ placeholder, value, onChange }: any) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
    style={{
      background: "#4A2E14",
      border: "1.5px solid rgba(232,132,42,0.4)",
      color: "rgba(255,255,255,0.8)",
    }}
  />
);

const DarkToggle = ({ on, onClick }: any) => (
  <button
    onClick={onClick}
    className="relative w-11 h-6 rounded-full flex-shrink-0 cursor-pointer transition-all"
    style={{ background: on ? "#1A1208" : "rgba(255,255,255,0.15)" }}
  >
    <div
      className="absolute top-1 w-4 h-4 rounded-full transition-all"
      style={{ background: on ? "#E8842A" : "rgba(255,255,255,0.5)", left: on ? "calc(100% - 20px)" : 4 }}
    />
  </button>
);

const ServiceRow = ({ icon, name, synced, on, onToggle }: any) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#5A3418" }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{name}</p>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Last sync: {synced}</p>
    </div>
    <DarkToggle on={on} onClick={onToggle} />
  </div>
);

const SettingsPanel = ({ onClose }: any) => {
  const [selAvatar, setSelAvatar] = useState(0);
  const [nom, setNom]             = useState("John Doe");
  const [email, setEmail]         = useState("");
  const [langue, setLangue]       = useState("");
  const [gmail, setGmail]         = useState(true);
  const [gcal, setGcal]           = useState(true);

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col z-20 overflow-y-auto"
      style={{ width: 360, background: "#3A2410", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0" style={{ background: "#3A2410" }}>
        <h2 className="text-xl font-bold" style={{ color: "#E8842A" }}>Paramètres</h2>
        <button onClick={onClose} className="cursor-pointer" style={{ color: "rgba(255,255,255,0.45)" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-8">

        {/* ── Profil section ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span className="text-sm font-semibold" style={{ color: "#E8842A" }}>Paramètres du profil</span>
          </div>

          {/* Avatar picker */}
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>Profile Icon</p>
          <div className="flex items-center gap-2 mb-4">
            {SETTING_AVATARS.map((av) => (
              <AvatarMini key={av.id} av={av} selected={selAvatar === av.id} onClick={() => setSelAvatar(av.id)} />
            ))}
          </div>

          {/* Nom */}
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>Nom</p>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#4A2E14", border: "1.5px solid rgba(232,132,42,0.5)", color: "rgba(255,255,255,0.85)" }}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>E-mail</p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#4A2E14", border: "1.5px solid rgba(232,132,42,0.25)", color: "rgba(255,255,255,0.85)" }}
            />
          </div>

          {/* Change password */}
          <button className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "#E8842A" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Changer le mot de passe
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

        {/* ── Langue section ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
            <span className="text-sm font-semibold" style={{ color: "#E8842A" }}>Langue</span>
          </div>
          <input
            type="text"
            placeholder=""
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#4A2E14", border: "1.5px solid rgba(232,132,42,0.4)", color: "rgba(255,255,255,0.85)" }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

        {/* ── Services connectés ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#E8842A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span className="text-sm font-semibold" style={{ color: "#E8842A" }}>Services connectés</span>
          </div>
          <div className="flex flex-col gap-2">
            <ServiceRow
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="white" opacity="0.85"/><path d="M2 6l10 7 10-7" stroke="#EA4335" strokeWidth="1.8" fill="none"/></svg>}
              name="Gmail" synced="2 min ago" on={gmail} onToggle={() => setGmail(p => !p)}
            />
            <ServiceRow
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" fill="#3B82F6" opacity="0.2" stroke="#3B82F6" strokeWidth="1.5"/><path d="M3 9h18" stroke="#3B82F6" strokeWidth="1.5"/><rect x="7" y="2" width="2" height="4" rx="1" fill="#3B82F6"/><rect x="15" y="2" width="2" height="4" rx="1" fill="#3B82F6"/></svg>}
              name="Google Calendar" synced="2 min ago" on={gcal} onToggle={() => setGcal(p => !p)}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// ── History data ──────────────────────────────────────────
const HISTORY = [
  { id: 1, type: "Événement", icon: "calendar", status: "ok",    time: "Aujourd'hui, 15:30", title: "Réunion projet Q1",    retry: false },
  { id: 2, type: "Tâche",     icon: "task",     status: "ok",    time: "Aujourd'hui, 12:00", title: "Relance devis client", retry: false },
  { id: 3, type: "Événement", icon: "calendar", status: "error", time: "Hier, 16:00",         title: "Démo produit",         retry: true  },
  { id: 4, type: "Tâche",     icon: "task",     status: "ok",    time: "Hier, 10:30",         title: "Suivi proposition",    retry: false },
];

const CalendarSmIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18"/><rect x="7" y="2" width="2" height="4" rx="1"/><rect x="15" y="2" width="2" height="4" rx="1"/>
  </svg>
);
const TaskSmIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>
  </svg>
);
const MailSmIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
  </svg>
);

// ── History Panel ─────────────────────────────────────────
const HistoryPanel = ({ filter, setFilter, onClose }: any) => (
  <div
    className="absolute top-0 right-0 h-full flex flex-col z-20"
    style={{ width: 360, background: "#3A2410", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <h2 className="text-xl font-bold" style={{ color: "#E8842A" }}>History</h2>
      <button onClick={onClose} className="cursor-pointer" style={{ color: "rgba(255,255,255,0.45)" }}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    {/* Filter tabs */}
    <div className="flex gap-2 px-6 mb-5">
      {["Aujourd'hui", "7 jours", "30 jours"].map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
          style={
            filter === f
              ? { border: "1.5px solid #E8842A", color: "#E8842A", background: "transparent" }
              : { border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.45)", background: "transparent" }
          }
        >
          {f}
        </button>
      ))}
    </div>

    {/* Items */}
    <div className="flex flex-col gap-3 px-4 overflow-y-auto">
      {HISTORY.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl p-4"
          style={{ background: "#4A2E14" }}
        >
          {/* Top row */}
          <div className="flex items-start gap-3">
            {/* Status dot */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: item.status === "ok" ? "#22C55E" : "#EAB308" }}
            >
              {item.status === "ok"
                ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Type + time */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5" style={{ color: "#E8842A" }}>
                  {item.icon === "calendar" ? <CalendarSmIcon /> : <TaskSmIcon />}
                  <span className="text-xs font-semibold">{item.type}</span>
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{item.time}</span>
              </div>

              {/* Title */}
              <p className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>{item.title}</p>

              {/* Source link */}
              <button className="flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "#E8842A" }}>
                <MailSmIcon />
                Voir l'e-mail source
              </button>

              {/* Retry button */}
              {item.retry && (
                <button
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80"
                  style={{ border: "1.5px solid #E8842A", color: "#E8842A", background: "transparent" }}
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────
const Toast = ({ message, onDone }: any) => {
  useState(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); });
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl z-50 animate-bounce-in"
      style={{ background: "#fff", minWidth: 180 }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#1A1A1A" }}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <span className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{message}</span>
    </div>
  );
};

export default function IrisDashboard() {
  const [activeNav,     setActiveNav]     = useState("home");
  const [powered,       setPowered]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [toast,         setToast]         = useState<string | null>(null);
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [historyFilter, setHistoryFilter] = useState("Aujourd'hui");
  const [settingsOpen,  setSettingsOpen]  = useState(false);

  const showToast = (msg: string) => setToast(msg);

  const navItems = [
    { id:"home",  label:"Accueil",  Icon:HomeIcon  },
    { id:"mail",  label:"E-mails",  Icon:MailIcon  },
    { id:"tasks", label:"Tâches",   Icon:TaskIcon  },
    { id:"chart", label:"Analyses", Icon:ChartIcon },
  ];
  const bottomItems = [
    { id:"sun",      label:"Mode clair", Icon:SunIcon     },
    { id:"settings", label:"Paramètres", Icon:GearIcon    },
    { id:"history",  label:"Historique", Icon:HistoryIcon },
  ];

  const handleNav = (id: string) => {
    setActiveNav(id);
    setSettingsOpen(id === "settings");
    setHistoryOpen(id === "history");
    if (id !== "settings") setSettingsOpen(false);
    if (id !== "history")  setHistoryOpen(false);
    if (id === "settings") { setSettingsOpen(true); setHistoryOpen(false); }
    if (id === "history")  { setHistoryOpen(true);  setSettingsOpen(false); }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none" style={{ background: "#2A1F14" }}>

      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <aside
        className="flex flex-col py-5 flex-shrink-0 z-10 transition-all duration-300"
        style={{ width: sidebarOpen ? 220 : 64, background: "#362818", borderRight: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="flex items-center justify-center mb-3 mx-auto cursor-pointer flex-shrink-0"
          style={{ width: 36, height: 36, color: "rgba(255,255,255,0.5)" }}
        >
          <HamburgerIcon />
        </button>

        {/* Avatar */}
        <div className={`flex items-center flex-shrink-0 mb-2 ${sidebarOpen ? "px-4 gap-3" : "justify-center"}`}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B35,#E84000)" }}>
            <PersonIcon />
          </div>
        </div>

        {/* MAIN label */}
        <div className={`mb-1 ${sidebarOpen ? "px-4" : "text-center"}`}>
          <span className="text-xs font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>MAIN</span>
        </div>

        {/* Main nav */}
        <div className="flex flex-col gap-1 px-2">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeNav === id && !settingsOpen && !historyOpen;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-all text-left"
                style={{
                  background: isActive ? "linear-gradient(90deg,#FF6B35,#E84000)" : "transparent",
                  color: isActive ? "white" : "rgba(255,255,255,0.45)",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center"><Icon /></span>
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Orange separator */}
        <div className="mx-4 my-3" style={{ height: 1, background: "rgba(232,100,0,0.5)" }} />

        <div className="flex-1" />

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 px-2">
          {bottomItems.map(({ id, label, Icon }) => {
            const isActive = (id === "settings" && settingsOpen) || (id === "history" && historyOpen);
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-all text-left"
                style={{
                  background: isActive ? "linear-gradient(90deg,#FF6B35,#E84000)" : "transparent",
                  color: isActive ? "white" : "rgba(255,255,255,0.45)",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center"><Icon /></span>
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="relative flex-1 flex overflow-hidden" style={{ flexDirection: "column" }}>

        {/* Emails view */}
        {activeNav === "mail" && !settingsOpen && !historyOpen && (
          <div className="flex-1 overflow-hidden flex flex-col"><InboxView /></div>
        )}
        {/* Tasks view */}
        {activeNav === "tasks" && !settingsOpen && !historyOpen && (
          <div className="flex-1 overflow-hidden flex flex-col"><TasksView /></div>
        )}
        {/* Analysis view */}
        {activeNav === "chart" && !settingsOpen && !historyOpen && (
          <div className="flex-1 overflow-hidden flex flex-col"><AnalysisView /></div>
        )}

        {/* Default dashboard (power button) */}
        {activeNav === "home" && (
        <div className="flex-1 flex items-center justify-center">
        {/* Concentric circles */}
        <div className="relative flex items-center justify-center">

          {/* Outer ring — very dark */}
          <div
            className="absolute rounded-full"
            style={{
              width: 520, height: 520,
              background: "radial-gradient(circle, rgba(90,45,10,0.45) 0%, rgba(30,15,5,0.0) 70%)",
            }}
          />

          {/* Middle ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 360, height: 360,
              background: "radial-gradient(circle, rgba(120,55,15,0.6) 0%, rgba(60,25,5,0.1) 70%)",
            }}
          />

          {/* Inner glow circle */}
          <div
            className="absolute rounded-full"
            style={{
              width: 260, height: 260,
              background: "radial-gradient(circle, rgba(150,60,10,0.7) 0%, rgba(80,30,5,0.2) 75%)",
            }}
          />

          {/* Power button circle */}
          <button
            onClick={() => { const next = !powered; setPowered(next); if (next) showToast("Bon retour!"); }}
            className="relative rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              width: 180, height: 180,
              background: powered
                ? "radial-gradient(circle at 40% 35%, #FF8C42, #E03000)"
                : "radial-gradient(circle at 40% 35%, #CC5520, #A03000)",
              boxShadow: powered
                ? "0 0 60px rgba(255,100,30,0.5), 0 0 120px rgba(200,60,0,0.3)"
                : "0 0 30px rgba(150,60,10,0.4)",
              border: "none",
            }}
          >
            <PowerIcon />
          </button>
        </div>

        {/* Bottom text */}
        <p
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-center whitespace-nowrap"
          style={{ color: "#FF7040" }}
        >
          {powered
            ? "Iris est active — analyse en cours…"
            : "Activer Iris pour analyser vos e-mails et préparer vos actions"}
        </p>

        {/* Bottom-right Iris branding */}
        <div className="absolute bottom-5 right-6 flex items-center gap-2">
          <IrisOrbitLogo />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-widest" style={{ color: "#D4621A" }}>IRIS</span>
            <span className="text-xs" style={{ color: "#7A4020", fontSize: 9 }}>v2.1.0</span>
          </div>
        </div>
        </div>
        )}

        {/* Settings panel */}
        {settingsOpen && (
          <SettingsPanel onClose={() => { setSettingsOpen(false); setActiveNav("home"); }} />
        )}

        {/* History sliding panel */}
        {historyOpen && (
          <HistoryPanel
            filter={historyFilter}
            setFilter={setHistoryFilter}
            onClose={() => { setHistoryOpen(false); setActiveNav("home"); }}
          />
        )}

      </main>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}