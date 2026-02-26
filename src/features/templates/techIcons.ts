const ICON_MAP: Record<string, string> = {
  html: 'logos:html-5',
  html5: 'logos:html-5',
  css: 'logos:css-3',
  css3: 'logos:css-3',
  sass: 'logos:sass',
  scss: 'logos:sass',
  tailwind: 'logos:tailwindcss-icon',
  tailwindcss: 'logos:tailwindcss-icon',
  bootstrap: 'logos:bootstrap',
  vue: 'logos:vue',
  vuejs: 'logos:vue',
  react: 'logos:react',
  redux: 'logos:redux',
  next: 'logos:nextjs-icon',
  nextjs: 'logos:nextjs-icon',
  nuxt: 'logos:nuxt-icon',
  nuxtjs: 'logos:nuxt-icon',
  angular: 'logos:angular-icon',
  svelte: 'logos:svelte-icon',
  typescript: 'logos:typescript-icon',
  ts: 'logos:typescript-icon',
  javascript: 'logos:javascript',
  js: 'logos:javascript',
  node: 'logos:nodejs-icon',
  nodejs: 'logos:nodejs-icon',
  express: 'simple-icons:express',
  fastify: 'simple-icons:fastify',
  nest: 'logos:nestjs',
  nestjs: 'logos:nestjs',
  django: 'logos:django-icon',
  flask: 'simple-icons:flask',
  vite: 'logos:vitejs',
  webpack: 'logos:webpack',
  babel: 'logos:babel',
  rollup: 'simple-icons:rollupdotjs',
  eslint: 'logos:eslint',
  prettier: 'simple-icons:prettier',
  vitest: 'logos:vitest',
  jest: 'logos:jest',
  playwright: 'logos:playwright',
  cypress: 'logos:cypress-icon',
  npm: 'logos:npm-icon',
  pnpm: 'logos:pnpm',
  yarn: 'logos:yarn',
  pinia: 'logos:pinia',
  docker: 'logos:docker-icon',
  kubernetes: 'logos:kubernetes',
  k8s: 'logos:kubernetes',
  terraform: 'logos:terraform-icon',
  linux: 'logos:linux-tux',
  aws: 'logos:aws',
  amazonwebservices: 'logos:aws',
  gcp: 'logos:google-cloud',
  googlecloud: 'logos:google-cloud',
  azure: 'logos:microsoft-azure',
  microsoftazure: 'logos:microsoft-azure',
  mysql: 'logos:mysql',
  postgresql: 'logos:postgresql',
  postgres: 'logos:postgresql',
  mongodb: 'logos:mongodb-icon',
  mariadb: 'logos:mariadb-icon',
  sqlite: 'simple-icons:sqlite',
  redis: 'logos:redis',
  elasticsearch: 'logos:elasticsearch',
  graphql: 'logos:graphql',
  rabbitmq: 'logos:rabbitmq-icon',
  kafka: 'logos:apache-kafka',
  apachekafka: 'logos:apache-kafka',
  spring: 'logos:spring-icon',
  springboot: 'logos:spring-icon',
  python: 'logos:python',
  go: 'logos:go',
  golang: 'logos:go',
  rust: 'logos:rust',
  php: 'logos:php',
  kotlin: 'logos:kotlin-icon',
  swift: 'logos:swift',
  'c++': 'logos:c-plusplus',
  cplusplus: 'logos:c-plusplus',
  'c#': 'logos:c-sharp',
  csharp: 'logos:c-sharp',
  nginx: 'logos:nginx',
  github: 'logos:github-icon',
  gitlab: 'logos:gitlab',
  jenkins: 'logos:jenkins',
  postman: 'logos:postman-icon',
  swagger: 'simple-icons:swagger',
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[.\-_/()\s]/g, '')
    .trim();

export const getTechIcon = (label: string): string | undefined => {
  const normalized = normalize(label);
  if (ICON_MAP[normalized]) {
    return ICON_MAP[normalized];
  }
  // Fallback to Simple Icons naming convention for uncommon technologies.
  if (normalized.length > 1) {
    return `simple-icons:${normalized}`;
  }
  return undefined;
};

export const splitTechValues = (text: string): string[] =>
  text
    .split(/[，,\/|·\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
