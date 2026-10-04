import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ChevronRight,
  CircleDashed,
  FileText,
  FileWarning,
  Gavel,
  Landmark,
  LayoutGrid,
  ListTodo,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const roleOptions = ['Magistrat', 'Procureur', 'Enquêteur', 'Avocat', 'Médecin légiste', 'Greffe'];

const fallbackData = {
  caseData: {
    id: 'CR-2026-004281',
    title: 'Affaire Martin — Enquête préliminaire',
    status: 'En cours',
    priority: 'Élevée',
    type: 'Enquête préliminaire',
    jurisdiction: 'Tribunal judiciaire de Paris',
    opened_on: '12 septembre 2026',
    last_activity: "Aujourd'hui, 09:42",
    completion: 72,
    deadline_count: 2,
    missing_elements: 4,
    pending_actions: 7,
    demo_label: 'Demo — données fictives',
    demo_fictitious: true,
  },
  alerts: [
    {
      id: 'toxicology',
      title: 'Rapport toxicologique en retard',
      description: 'Demandé le 18/09/2026 — retard de 1 jour sur l’échéance prévue.',
      severity: 'critical',
      target: 'document',
    },
    {
      id: 'missing_photo',
      title: 'Pièce référencée mais absente',
      description: "Le PV d'audition mentionne 'Photographie 17' mais elle n'est pas présente.",
      severity: 'high',
      target: 'document-intelligence',
    },
    {
      id: 'deadline_72h',
      title: 'Délai procédural proche',
      description: 'La prochaine échéance critique est dans 72 heures.',
      severity: 'medium',
      target: 'deadline',
    },
  ],
  intelligence: {
    risk_level: 'ÉLEVÉ',
    available_reasons: [
      {
        title: 'Rapport toxicologique en retard',
        details: 'Demandé le 18/09/2026 • Échéance prévue : 03/10/2026 • Retard : 1 jour',
      },
      {
        title: "Pièce référencée mais absente",
        details: "Le PV d'audition mentionne 'Photographie 17' • Aucun fichier correspondant détecté dans le dossier.",
      },
      {
        title: 'Délai procédural proche',
        details: 'Prochaine échéance critique dans 72 heures.',
      },
    ],
    recommended_action: 'Relancer le laboratoire médico-légal et vérifier la présence de la photographie 17 avant la prochaine échéance.',
    blockage_main: 'Rapport toxicologique non reçu.',
    impact_estimated: '2 étapes dépendantes.',
    responsible: 'Médecin légiste.',
    last_action: 'Demande envoyée le 18/09/2026.',
    next_action: 'Préparer une relance.',
    chain: ['Dossier', 'Expertise toxicologique', 'Rapport non reçu', 'Analyse des preuves impossible', 'Validation parquet retardée'],
  },
  timeline: [
    { id: 'signalement', title: 'Signalement', status: 'completed', label: '✓', responsible: 'Police nationale', start_date: '10/09/2026', deadline: '12/09/2026', required_documents: ['Plainte initiale'], dependencies: ['Déclaration de la victime'], blockers: [], details: 'Signalement enregistré et transmis au parquet.' },
    { id: 'ouverture_enquete', title: "Ouverture de l'enquête", status: 'completed', label: '✓', responsible: 'Procureur', start_date: '12/09/2026', deadline: '13/09/2026', required_documents: ['Ordonnance d’ouverture'], dependencies: ['Signalement'], blockers: [], details: 'Ouverture validée et enquête formellement lancée.' },
    { id: 'auditions', title: 'Auditions', status: 'completed', label: '✓', responsible: 'Enquêteur', start_date: '14/09/2026', deadline: '22/09/2026', required_documents: ['PV d’audition'], dependencies: ['Ouverture de l’enquête'], blockers: [], details: 'Plusieurs auditions ont été menées et un fichier photo est référencé.' },
    { id: 'expertise_toxicologique', title: 'Expertise médico-légale', status: 'delayed', label: '⚠', responsible: 'Médecin légiste', start_date: '18/09/2026', deadline: '03/10/2026', required_documents: ['Rapport toxicologique'], dependencies: ['Auditions', 'Réquisition labo'], blockers: ['Laboratoire retardé'], details: 'Le rapport est attendu mais n’est pas encore reçu. Le délai est désormais critique.' },
    { id: 'analyse_preuves', title: 'Analyse des preuves', status: 'in_progress', label: '◐', responsible: 'Enquêteur', start_date: '25/09/2026', deadline: '05/10/2026', required_documents: ['Preuves physiques', 'Photographie 17'], dependencies: ['Expertise médico-légale'], blockers: ['Documentation incomplète'], details: 'Le traitement des éléments matériels est bloqué par la pièce manquante.' },
    { id: 'validation_parquet', title: 'Validation parquet', status: 'upcoming', label: '○', responsible: 'Procureur', start_date: '06/10/2026', deadline: '09/10/2026', required_documents: ['Synthèse du dossier'], dependencies: ['Analyse des preuves'], blockers: ['Expertise non finalisée'], details: 'Validation hiérarchique prévue après réception de l’ensemble des pièces.' },
    { id: 'orientation', title: 'Orientation', status: 'upcoming', label: '○', responsible: 'Magistrat', start_date: '10/10/2026', deadline: '14/10/2026', required_documents: ['Décision d’orientation'], dependencies: ['Validation parquet'], blockers: ['Délai de validation'], details: 'Le dossier attend la validation de l’étape précédente pour l’orientation finale.' },
  ],
  actors: [
    { name: 'Magistrat', person: 'Marie Dupont', status: '2 actions requises', kind: 'warning', visibility: ['Magistrat', 'Procureur', 'Greffe'] },
    { name: 'Procureur', person: 'Thomas Bernard', status: 'En attente d’expertise', kind: 'neutral', visibility: ['Procureur', 'Magistrat'] },
    { name: 'Enquêteur', person: 'Capitaine Martin', status: '1 pièce manquante', kind: 'danger', visibility: ['Enquêteur', 'Procureur'] },
    { name: 'Médecin légiste', person: 'Dr. Claire Robert', status: 'Rapport en retard', kind: 'warning', visibility: ['Médecin légiste', 'Magistrat'] },
    { name: 'Avocat', person: 'Me Sophie Laurent', status: 'Nouvelle pièce disponible', kind: 'success', visibility: ['Avocat', 'Greffe'] },
    { name: 'Greffe', person: 'Greffe', status: 'Aucune action', kind: 'success', visibility: ['Greffe', 'Magistrat'] },
  ],
  documents: [
    { document: 'PV_Audition_03.pdf', type: 'PV d’audition', date: '18/09/2026', author: 'Enquêteur', status: '✓ Vérifié', analysis: 'Vérifié' },
    { document: 'Rapport_Toxicologie.pdf', type: 'Expertise', date: '03/10/2026', author: 'Médecin légiste', status: '⚠ En attente', analysis: 'À examiner' },
    { document: 'Photo_17.jpg', type: 'Preuve', date: '—', author: '—', status: '🔴 Manquante', analysis: 'Manquant' },
    { document: 'Requisition_Labo.pdf', type: 'Réquisition', date: '18/09/2026', author: 'Procureur', status: '✓ Vérifié', analysis: 'Référence détectée' },
  ],
  deadlines: [
    { id: 'deadline-72h', label: 'Validation magistrat', status: 'critical', when: 'Dans 72 h', date: '07/10/2026', responsible: 'Magistrat', dependency: 'Rapport toxicologique reçu', consequence: 'Blocage potentialisé de l’orientation' },
    { id: 'deadline-5d', label: 'Transmission expertise', status: 'warning', when: 'Dans 5 jours', date: '09/10/2026', responsible: 'Médecin légiste', dependency: 'Photo 17 récupérée', consequence: 'Retard sur l’analyse des preuves' },
    { id: 'deadline-11d', label: 'Notification partie', status: 'info', when: 'Dans 11 jours', date: '15/10/2026', responsible: 'Greffe', dependency: 'Validation du parquet', consequence: 'Risque de délais de notification' },
    { id: 'deadline-finished', label: 'Demande laboratoire', status: 'done', when: 'Terminée', date: '18/09/2026', responsible: 'Procureur', dependency: 'Réquisition validée', consequence: 'Sans effet direct' },
  ],
  agents: [
    { name: 'Document Agent', purpose: 'Detect missing documents, extract metadata, identify references.', status: 'Active', last_run: '09:30', observations: 18, recommendations: 4 },
    { name: 'Deadline Agent', purpose: 'Monitor procedural deadlines and pending actions.', status: 'Active', last_run: '09:31', observations: 27, recommendations: 5 },
    { name: 'Evidence Agent', purpose: 'Cross-reference evidence, documents and references.', status: 'Active', last_run: '09:32', observations: 12, recommendations: 2 },
    { name: 'Workflow Agent', purpose: 'Understand dependencies and identify the next procedural action.', status: 'Active', last_run: '09:34', observations: 21, recommendations: 4 },
    { name: 'Notification Agent', purpose: 'Prepare reminders and notifications.', status: 'Human approval required', last_run: '09:18', observations: 9, recommendations: 2 },
  ],
  roleViews: {
    Magistrat: { focus: 'Validation et décision', tasks: ['Valider la relance au laboratoire', 'Confirmer la priorisation de l’expertise', 'Examiner la prochaine décision d’orientation'], visible_actors: ['Magistrat', 'Procureur', 'Médecin légiste'] },
    Procureur: { focus: 'Ordonnancement et demande', tasks: ['Contrôler les pièces envoyées', 'Suivre la demande de laboratoire', 'Préparer la relance de l’expertise'], visible_actors: ['Procureur', 'Enquêteur', 'Médecin légiste'] },
    Enquêteur: { focus: 'Investigation et pièces à compléter', tasks: ['Rechercher la photographie 17', 'Vérifier les références du PV d’audition', 'Compléter la synthèse d’enquête'], visible_actors: ['Enquêteur', 'Procureur', 'Avocat'] },
    Avocat: { focus: 'Consultation et pièces', tasks: ['Vérifier la disponibilité de la nouvelle pièce', 'Contrôler les dates de notification', 'Préparer une demande de compléments'], visible_actors: ['Avocat', 'Greffe', 'Magistrat'] },
    'Médecin légiste': { focus: 'Expertise et délais scientifiques', tasks: ['Confirmer l’échéance de l’analyse toxicologique', 'Informuler du statut du rapport', 'Identifier les éléments manquants'], visible_actors: ['Médecin légiste', 'Procureur', 'Magistrat'] },
    Greffe: { focus: 'Formalités d’instruction', tasks: ['Préparer la notification de partie', 'Contrôler le calendrier interne', 'Archiver les éléments validés'], visible_actors: ['Greffe', 'Magistrat', 'Procureur'] },
  },
};

const sidebarItems = [
  { name: 'Tableau de bord', icon: LayoutGrid, key: 'dashboard' },
  { name: 'Mes dossiers', icon: BriefcaseBusiness, key: 'cases' },
  { name: 'Alertes', icon: AlertTriangle, key: 'alerts' },
  { name: 'Tâches', icon: ListTodo, key: 'tasks' },
  { name: 'Documents', icon: FileText, key: 'documents' },
  { name: 'Chronologie', icon: CalendarClock, key: 'timeline' },
  { name: 'Acteurs', icon: Users, key: 'actors' },
  { name: 'Agents IA', icon: Sparkles, key: 'agents' },
  { name: 'Administration', icon: Building2, key: 'admin' },
];

const chartData = [
  { name: 'J-7', value: 20 },
  { name: 'J-5', value: 28 },
  { name: 'J-3', value: 48 },
  { name: 'J-1', value: 66 },
  { name: 'Aujourd’hui', value: 72 },
];

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [role, setRole] = useState('Magistrat');
  const [selectedStep, setSelectedStep] = useState('expertise_toxicologique');
  const [selectedActor, setSelectedActor] = useState('Magistrat');
  const [blockingOpen, setBlockingOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [apiData, setApiData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [caseResponse, timelineResponse, docsResponse, actorsResponse, deadlineResponse, alertsResponse, intelligenceResponse, agentsResponse] = await Promise.all([
          fetch('/api/cases/CR-2026-004281'),
          fetch('/api/cases/CR-2026-004281/timeline'),
          fetch('/api/cases/CR-2026-004281/documents'),
          fetch('/api/cases/CR-2026-004281/actors'),
          fetch('/api/cases/CR-2026-004281/deadlines'),
          fetch('/api/cases/CR-2026-004281/alerts'),
          fetch('/api/cases/CR-2026-004281/intelligence'),
          fetch('/api/cases/CR-2026-004281/agents'),
        ]);

        if (!caseResponse.ok || !timelineResponse.ok) {
          throw new Error('API unavailable');
        }

        const [casePayload, timelinePayload, docsPayload, actorsPayload, deadlinesPayload, alertsPayload, intelligencePayload, agentsPayload] = await Promise.all([
          caseResponse.json(),
          timelineResponse.json(),
          docsResponse.json(),
          actorsResponse.json(),
          deadlineResponse.json(),
          alertsResponse.json(),
          intelligenceResponse.json(),
          agentsResponse.json(),
        ]);

        const merged = {
          caseData: { ...fallbackData.caseData, ...casePayload },
          timeline: timelinePayload.timeline || fallbackData.timeline,
          actors: actorsPayload.actors || fallbackData.actors,
          documents: docsPayload.documents || fallbackData.documents,
          deadlines: deadlinesPayload.deadlines || fallbackData.deadlines,
          alerts: alertsPayload.alerts || fallbackData.alerts,
          intelligence: intelligencePayload.intelligence || fallbackData.intelligence,
          agents: agentsPayload.agents || fallbackData.agents,
          roleViews: fallbackData.roleViews,
        };
        setApiData(merged);
      } catch (error) {
        setApiData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const caseData = apiData?.caseData ?? fallbackData.caseData;
  const actors = apiData?.actors ?? fallbackData.actors;
  const timeline = apiData?.timeline ?? fallbackData.timeline;
  const documents = apiData?.documents ?? fallbackData.documents;
  const deadlines = apiData?.deadlines ?? fallbackData.deadlines;
  const alerts = apiData?.alerts ?? fallbackData.alerts;
  const intelligence = apiData?.intelligence ?? fallbackData.intelligence;
  const agents = apiData?.agents ?? fallbackData.agents;
  const roleView = apiData?.roleViews?.[role] ?? fallbackData.roleViews[role] ?? { tasks: [], visible_actors: [] };
  const visibleActors = (actors || []).filter(
    (actor) => roleView?.visible_actors?.includes(actor.name) || actor.name === selectedActor,
  );

  const selectedStepDetails = useMemo(
    () => (timeline || []).find((step) => step.id === selectedStep) ?? (timeline || [])[3],
    [timeline, selectedStep],
  );

  const selectedActorDetails = useMemo(
    () => (actors || []).find((actor) => actor.name === selectedActor) ?? (actors || [])[0],
    [actors, selectedActor],
  );

  useEffect(() => {
    if (!roleView?.visible_actors?.length) {
      return;
    }
    setSelectedActor((current) => (roleView.visible_actors.includes(current) ? current : roleView.visible_actors[0]));
  }, [role, roleView]);

  const handleAlertClick = (id) => {
    if (id === 'toxicology') {
      setActiveSection('dashboard');
      setSelectedStep('expertise_toxicologique');
      setSelectedActor('Médecin légiste');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (id === 'missing_photo') {
      setActiveSection('dashboard');
      setSelectedStep('analyse_preuves');
      setSelectedActor('Enquêteur');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (id === 'deadline_72h') {
      setBlockingOpen(true);
      setSelectedStep('validation_parquet');
    }
  };

  const openDraft = async () => {
    try {
      const response = await fetch('/api/cases/CR-2026-004281/actions/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: selectedActor, user_role: role }),
      });
      const payload = await response.json();
      setDraftText(payload.draft || '');
    } catch (error) {
      setDraftText(`Objet : Relance du rapport toxicologique\n\nBonjour,\n\nLe dossier CR-2026-004281 nécessite ...`);
    }
    setDraftOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex max-w-[1700px]">
        <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-200 bg-slate-900 p-5 text-slate-50 lg:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">CaseFlow</div>
              <div className="text-xs text-slate-400">Case intelligence</div>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(({ name, icon: Icon, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  activeSection === key
                    ? 'bg-slate-700 text-white ring-1 ring-slate-600'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            <div className="font-semibold">Mode démo</div>
            <div className="mt-1 text-xs text-amber-200/80">Données fictives</div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-soft backdrop-blur sm:p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                  {caseData.demo_label}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  <input
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Rechercher dans le dossier..."
                    aria-label="Recherche globale"
                  />
                </div>
                <button type="button" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <UserCircle2 className="h-8 w-8 text-slate-500" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-800">Élodie Martin</div>
                    <div className="text-[11px] text-slate-500">Chef de pôle</div>
                  </div>
                </div>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                  aria-label="Sélection du rôle"
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-soft">
              Chargement du dossier de démonstration…
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && (
                <>
                  <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                          Dossier actif
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dossier {caseData.id}</h1>
                        <p className="mt-1 text-lg text-slate-600">{caseData.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {caseData.status}
                        </span>
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          {caseData.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                      <MetaChip label="Type" value={caseData.type} />
                      <MetaChip label="Juridiction" value={caseData.jurisdiction} />
                      <MetaChip label="Ouverture" value={caseData.opened_on} />
                      <MetaChip label="Dernière activité" value={caseData.last_activity} />
                      <MetaChip label="Priorité" value={caseData.priority} />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      <KpiCard title="État du dossier" value={`${caseData.completion}% complet`} context="72% complet" tone="blue" />
                      <KpiCard title="Échéances" value={`${caseData.deadline_count} critiques`} context="2 critiques" tone="amber" />
                      <KpiCard title="Éléments manquants" value={`${caseData.missing_elements}`} context="4" tone="rose" />
                      <KpiCard title="Actions en attente" value={`${caseData.pending_actions}`} context="7" tone="slate" />
                    </div>
                  </section>

                  <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-6">
                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold text-slate-900">Intelligence du dossier</h2>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-600">Risque de retard :</span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {intelligence.risk_level}
                              </span>
                            </div>
                          </div>
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500 to-amber-400 p-[2px]">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-lg font-bold text-red-600">
                              72h
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          <div>
                            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Pourquoi ?</h3>
                            {(intelligence.available_reasons || []).map((reason) => (
                              <div key={reason.title} className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-slate-800">{reason.title}</div>
                                    <div className="mt-1 text-sm text-slate-600">{reason.details}</div>
                                  </div>
                                  <AlertTriangle className="mt-1 h-4 w-4 text-amber-500" />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">Action recommandée</div>
                            <p className="mt-2 text-sm text-slate-700">{intelligence.recommended_action}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button type="button" onClick={() => setActiveSection('documents')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700">
                            Voir les éléments
                          </button>
                          <button type="button" onClick={openDraft} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            Préparer une relance
                          </button>
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                          <h2 className="text-2xl font-semibold text-slate-900">Chronologie procédurale</h2>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">{timeline.length} étapes</span>
                        </div>

                        <div className="space-y-4">
                          {(timeline || []).map((step) => (
                            <button
                              type="button"
                              key={step.id}
                              onClick={() => setSelectedStep(step.id)}
                              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                                selectedStep === step.id
                                  ? 'border-sky-200 bg-sky-50'
                                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                {step.label}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-medium text-slate-800">{step.title}</div>
                                  <span className="text-xs uppercase tracking-[0.12em] text-slate-500">{step.status}</span>
                                </div>
                                <div className="mt-1 text-sm text-slate-600">{step.responsible}</div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {selectedStepDetails && (
                          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Étape sélectionnée</div>
                                <div className="mt-1 text-lg font-semibold text-slate-900">{selectedStepDetails.title}</div>
                              </div>
                              <span className="rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                                {selectedStepDetails.status}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <DetailItem label="Responsable" value={selectedStepDetails.responsible} />
                              <DetailItem label="Date de début" value={selectedStepDetails.start_date} />
                              <DetailItem label="Échéance" value={selectedStepDetails.deadline} />
                              <DetailItem label="Pièces requises" value={selectedStepDetails.required_documents.join(', ')} />
                              <DetailItem label="Dépendances" value={selectedStepDetails.dependencies.join(', ')} />
                              <DetailItem label="Blocages" value={selectedStepDetails.blockers.length ? selectedStepDetails.blockers.join(', ') : 'Aucun'} />
                            </div>
                          </div>
                        )}
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">Pourquoi ce dossier est-il bloqué ?</h3>
                          </div>
                          <button type="button" onClick={() => setBlockingOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                            Analyse
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-700">Blocage principal</div>
                          <div className="mt-2 text-base font-medium text-slate-800">{intelligence.blockage_main}</div>
                          <div className="mt-4 text-sm text-slate-600">Impact estimé : {intelligence.impact_estimated}</div>
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                        <h3 className="text-xl font-semibold text-slate-900">Documents potentiellement manquants</h3>
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">Photographie 17</div>
                              <div className="mt-1 text-sm text-slate-600">Source : PV_Audition_03.pdf</div>
                            </div>
                            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                              Confiance 94%
                            </div>
                          </div>

                          <blockquote className="mt-4 border-l-2 border-slate-300 pl-3 text-sm italic text-slate-600">
                            &ldquo;Voir photographie 17 jointe au présent procès-verbal.&rdquo;
                          </blockquote>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">Rechercher</button>
                            <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">Marquer comme trouvé</button>
                            <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700">Créer une demande</button>
                          </div>
                        </div>
                      </section>

                      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-slate-900">Échéances</h3>
                          <CalendarClock className="h-5 w-5 text-slate-500" />
                        </div>

                        <div className="space-y-3">
                          {(deadlines || []).map((deadline) => (
                            <div key={deadline.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <StatusDot status={deadline.status} />
                                  <div className="font-medium text-slate-800">{deadline.label}</div>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">{deadline.when}</span>
                              </div>
                              <div className="mt-2 text-sm text-slate-600">Date : {deadline.date}</div>
                              <div className="text-sm text-slate-600">Responsable : {deadline.responsible}</div>
                              <div className="text-sm text-slate-600">Dépendance : {deadline.dependency}</div>
                              <div className="text-sm text-slate-600">Conséquence : {deadline.consequence}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 h-24 rounded-xl border border-slate-200 bg-slate-50 p-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip />
                              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#colorValue)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                    </div>
                  </div>

                  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Acteurs du dossier</h2>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Vue multi-acteurs
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {(actors || []).map((actor) => (
                        <button
                          key={actor.name}
                          type="button"
                          onClick={() => setSelectedActor(actor.name)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selectedActor === actor.name
                              ? 'border-sky-200 bg-sky-50 shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{actor.name}</div>
                              <div className="text-sm text-slate-600">{actor.person}</div>
                            </div>
                            <StatusPill value={actor.status} kind={actor.kind} />
                          </div>
                          <div className="mt-4 text-xs text-slate-500">Rôle autorisé : {actor.visibility.join(', ')}</div>
                        </button>
                      ))}
                    </div>

                    {selectedActorDetails && (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Vue contextuelle</div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">{selectedActorDetails.name}</div>
                          </div>
                          <StatusPill value={selectedActorDetails.status} kind={selectedActorDetails.kind} />
                        </div>
                        <div className="mt-4 md:grid md:grid-cols-2 md:gap-4">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Actions visibles</div>
                            <ul className="mt-2 space-y-2 text-sm text-slate-700">
                              {(roleView.tasks || []).map((task) => (
                                <li key={task} className="flex items-start gap-2">
                                  <ArrowRight className="mt-0.5 h-4 w-4 text-sky-600" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 md:mt-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Contrôle d’accès</div>
                            <div className="mt-2 text-sm text-slate-700">{selectedActorDetails.name} voit uniquement les éléments liés à son autorisation selon le rôle sélectionné : {role}.</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
                      <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                        Intelligence documentaire
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="pb-3 pr-4 font-medium">Document</th>
                            <th className="pb-3 pr-4 font-medium">Type</th>
                            <th className="pb-3 pr-4 font-medium">Date</th>
                            <th className="pb-3 pr-4 font-medium">Auteur</th>
                            <th className="pb-3 pr-4 font-medium">Statut</th>
                            <th className="pb-3 pr-4 font-medium">Analyse IA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(documents || []).map((doc) => (
                            <tr key={doc.document} className="border-b border-slate-100 align-top">
                              <td className="py-3 pr-4 font-medium text-slate-800">{doc.document}</td>
                              <td className="py-3 pr-4 text-slate-600">{doc.type}</td>
                              <td className="py-3 pr-4 text-slate-600">{doc.date}</td>
                              <td className="py-3 pr-4 text-slate-600">{doc.author}</td>
                              <td className="py-3 pr-4 text-slate-600">{doc.status}</td>
                              <td className="py-3 pr-4">
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                  {doc.analysis}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}

              {activeSection === 'agents' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-3xl font-semibold text-slate-900">Agents IA</h2>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Orchestration future
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(agents || []).map((agent) => (
                      <div key={agent.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-lg font-semibold text-slate-900">{agent.name}</div>
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
                            {agent.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{agent.purpose}</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Dernière exécution</div>
                            <div className="mt-1 text-slate-700">{agent.last_run}</div>
                          </div>
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Observations</div>
                            <div className="mt-1 text-slate-700">{agent.observations}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Recommandations</div>
                            <div className="mt-1 text-slate-700">{agent.recommendations}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {blockingOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg border-l border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Analyse du blocage</div>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Analyse du blocage</h3>
            </div>
            <button type="button" onClick={() => setBlockingOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              Fermer
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2 text-sm font-medium text-slate-600">
              {(intelligence.chain || []).map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                  {index < (intelligence.chain || []).length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <InfoRow label="Blocage principal" value={intelligence.blockage_main} />
            <InfoRow label="Impact estimé" value={intelligence.impact_estimated} />
            <InfoRow label="Responsable" value={intelligence.responsible} />
            <InfoRow label="Dernière action" value={intelligence.last_action} />
            <InfoRow label="Prochaine action suggérée" value={intelligence.next_action} />
          </div>

          <button type="button" onClick={openDraft} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
            Préparer la relance
          </button>
        </div>
      )}

      {draftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Recommandation</div>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Relance préparée</h3>
              </div>
              <button type="button" onClick={() => setDraftOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
                Fermer
              </button>
            </div>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              rows={12}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-sky-300"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setDraftOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                Fermer
              </button>
              <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Prévisualiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, context, tone }) {
  const tones = {
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em]">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{context}</div>
    </div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm text-slate-700">{value}</div>
    </div>
  );
}

function StatusPill({ value, kind }) {
  const styles = {
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    neutral: 'border-slate-200 bg-slate-100 text-slate-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[kind]}`}>{value}</span>;
}

function StatusDot({ status }) {
  const map = {
    critical: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-yellow-400',
    done: 'bg-emerald-500',
  };

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[status] ?? 'bg-slate-400'}`} />;
}

export default App;
