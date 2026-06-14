export interface PlatformModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  external: boolean;
  /** For external modules: the full URL to open in a new tab. */
  url?: string;
  /** For internal modules: whether clicking launches the in-app canvas view. */
  launchesCanvas?: boolean;
  provider?: string;
  /** Browser tab title shown when this module is active. */
  pageTitle?: string;
  status: 'active' | 'coming_soon' | 'beta';
  launchMessage?: string;
  icon: string;
  features: string[];
  journeyLabel?: string;
  ctaText?: string;
}

export const platformModules: PlatformModule[] = [
  {
    id: 'workflow-studio',
    name: 'NodeCraft AI',
    description: 'Knowledge becomes valuable when you apply it.\n\nDesign AI workflows, automate repetitive tasks, connect powerful tools, and build real-world projects that strengthen your portfolio and practical skills.\n\nTransform ideas into working systems without complexity.',
    enabled: true,
    external: false,
    launchesCanvas: true,
    provider: 'NodeCraft AI',
    pageTitle: 'NodeCraft AI | Visual Workflow Builder',
    status: 'active',
    icon: '⚡',
    features: ['Visual Workflow Builder', 'AI Automation', 'Node-Based Canvas', 'Project Creation'],
    journeyLabel: 'STEP 2 — BUILD',
    ctaText: 'Start Building'
  },
  {
    id: 'knowledge-hub',
    name: 'Knowledge Hub',
    description: 'Every great project starts with learning.\n\nUpload PDFs, research papers, class notes, books, and study materials. Use AI to summarize content, generate smart notes, ask questions, and instantly understand complex topics.\n\nTurn scattered information into organized knowledge.',
    enabled: true,
    external: true,
    url: 'https://gnosisapp-theta.vercel.app',
    provider: 'Gnosis',
    pageTitle: 'Gnosis | Knowledge Hub',
    status: 'active',
    icon: '📚',
    features: ['Document Chat', 'AI Summaries', 'Smart Notes', 'Research Workspace'],
    journeyLabel: 'STEP 1 — LEARN',
    ctaText: 'Start Learning'
  },
  {
    id: 'career-suite',
    name: 'CareerOS',
    description: 'Your skills deserve opportunities.\n\nConvert your learning and projects into a professional resume that stands out. Generate ATS-optimized resumes, improve job applications, and present your achievements with confidence.\n\nTurn your work into career opportunities.',
    enabled: true,
    external: true,
    url: 'https://careeros-six.vercel.app/',
    provider: 'FlowForge',
    pageTitle: 'FlowForge CareerOS',
    status: 'active',
    icon: '💼',
    features: ['AI Resume Builder', 'ATS Optimization', 'Professional PDF Export', 'Career Growth Tools'],
    journeyLabel: 'STEP 3 — GET HIRED',
    ctaText: 'Launch CareerOS'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Deep insights into your personal productivity and workflow efficiency.',
    enabled: false,
    external: false,
    status: 'coming_soon',
    icon: '📊',
    features: ['Usage Tracking', 'Efficiency Metrics', 'AI Recommendations']
  },
  {
    id: 'team-collab',
    name: 'Team Collaboration',
    description: 'Share workflows, knowledge bases, and agents across your organization.',
    enabled: false,
    external: false,
    status: 'coming_soon',
    icon: '👥',
    features: ['Shared Workspaces', 'Role-based Access', 'Multiplayer Editing']
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Discover and install pre-built workflows, agents, and templates from the community.',
    enabled: false,
    external: false,
    status: 'coming_soon',
    icon: '🛒',
    features: ['Community Templates', 'Creator Monetization', 'Verified Agents']
  }
];
