export const profile = {
  name: 'Benjamin Lab',
  headline: 'Aerospace Supply Chain & Operations Data Analyst',
  subhead:
    'Bridging quantitative data science — Python, SQL, Tableau — with real-world aerospace manufacturing workflows to optimize inventory, automate pipelines, and eliminate bottlenecks.',
  phone: '(619) 977-4542',
  email: 'benjaminmonroelab@gmail.com',
  linkedin: 'linkedin.com/in/benjamin-lab-monroe',
  linkedinUrl: 'https://linkedin.com/in/benjamin-lab-monroe',
  site: 'benjaminmonroelab.com',
  resumeHref: '/resume.pdf',
};

export const credentials = {
  degree: 'B.S. in Economics, Minor in Data Science',
  school: 'Cal Poly Humboldt',
  cert: 'ASCM CSCP Certificate Candidate',
  certNote: 'Exam scheduled September 2026',
};

export const metrics = [
  { value: '63', suffix: '%', label: 'Reduction in Inventory Stockouts' },
  { value: '58', suffix: '%', label: 'Pipeline Processing Time Reduction' },
  { value: '140', suffix: 'K+', label: 'Records Analyzed via SQL & Python' },
];

export const techGroups = [
  {
    tag: 'Data Pipelines & SQL',
    items: ['SQL', 'ERP Systems', 'Snowflake', 'FastAPI', 'Pandas', 'Advanced Excel'],
  },
  {
    tag: 'Geospatial & Analytics',
    items: ['GeoPandas', 'NetworkX', 'MapBox', 'ArcGIS', 'Scikit-learn'],
  },
  {
    tag: 'Visual BI & Frameworks',
    items: ['Tableau', 'Economics Modeling', 'Cost-Benefit Analysis'],
  },
];

export type Project = {
  code: string;
  name: string;
  problem: string;
  solution: string;
  stack: string[];
  roi: string;
  githubHref: string;
  demoHref: string | null;
};

export const projects: Project[] = [
  {
    code: 'WO-01',
    name: 'Dynamic Demand Forecasting & Reorder Engine',
    problem:
      'Static reorder points left parts either stocked out on the line or over-ordered and tying up working capital.',
    solution:
      'Built a demand forecasting model with dynamic safety-stock calculation that adjusts reorder points to lead-time variability and observed demand volatility.',
    stack: ['Python', 'Pandas', 'Scikit-Learn', 'Streamlit'],
    roi: 'Prevents stockouts — core driver behind the 63% stockout reduction',
    githubHref: '#',
    demoHref: null,
  },
  {
    code: 'WO-02',
    name: 'Aerospace Geospatial Route & Network Optimization',
    problem:
      'Supplier concentration and transit routing risk were tracked manually, with no visibility into which lanes were most exposed to delay.',
    solution:
      'Mapped the supplier network as a graph, scored node/route risk, and optimized transit lead times with shortest-path and centrality analysis over a live map layer.',
    stack: ['Python', 'GeoPandas', 'NetworkX', 'MapBox'],
    roi: 'Surfaces high-risk lanes before they cause a delivery miss',
    githubHref: '#',
    demoHref: null,
  },
  {
    code: 'WO-03',
    name: 'Automated ERP Bottleneck & AOG Short-Flow Dashboard',
    problem:
      'Bottleneck and shortage tracking lived in manually updated spreadsheets, a day or more behind the ERP.',
    solution:
      'Built a Snowflake-backed BI dashboard on top of a FastAPI ingestion layer that surfaces bottleneck and AOG short-part status in real time.',
    stack: ['Snowflake', 'SQL', 'Tableau', 'FastAPI'],
    roi: 'Replaces manual spreadsheet tracking with automated real-time BI',
    githubHref: '#',
    demoHref: null,
  },
];

export type ExperienceEntry = {
  company: string;
  title: string;
  /** Set only for non-traditional (unpaid/equity) arrangements — rendered as a visible qualifier under the title. */
  engagementType?: string;
  start: string;
  end: string;
  bullets: string[];
};

/** Bullets use **double-asterisk** markers around the phrase to bold — parsed by <BulletText>. */
export const experience: ExperienceEntry[] = [
  {
    company: 'LMI Aerospace',
    title: 'Supply Chain Data Analyst (Customer Support Rep)',
    start: 'Aug 2026',
    end: 'Present',
    bullets: [
      'Automated a routine reporting task using **Python and SQL connected to the ERP**, cutting reporting time by **~70%**.',
      'Used the ERP system to manage end-to-end delivery schedules and logistics tracking for aerospace components, coordinating across manufacturing teams to prevent bottlenecks.',
      'Analyzed shipping lead times, vendor performance, and production backlogs to forecast delivery risk and brief stakeholders.',
    ],
  },
  {
    company: 'mLab Supply',
    title: 'Supply Chain & Procurement Analyst',
    engagementType: 'Contract — Equity-Based Engagement',
    start: 'May 2025',
    end: 'Aug 2026',
    bullets: [
      'Modeled supplier markets to inform sourcing and procurement decisions.',
      'Automated Python/SQL reporting, **saving 10 hrs/week**.',
      'Built inventory forecasting that **cut stockouts by 63%**.',
      'Optimized ERP workflows for a **35% efficiency gain**.',
    ],
  },
  {
    company: 'Ix Startup',
    title: 'Data Analyst',
    engagementType: 'Contract — Equity-Based Engagement',
    start: 'Jan 2026',
    end: 'Apr 2026',
    bullets: [
      'Ran economic market analysis to support business decisions.',
      'Built a data pipeline that **reduced processing time by 58%**.',
      'Delivered SQL/Python/Excel dashboards for stakeholder reporting.',
    ],
  },
  {
    company: 'IRAR CPH',
    title: 'Research Analyst Intern',
    start: 'Jan 2025',
    end: 'May 2025',
    bullets: [
      'Queried and analyzed **140,000+ rows** in SQL and Python.',
      'Built predictive models in Scikit-learn.',
      'Improved retention tracking by **12%**.',
    ],
  },
];
