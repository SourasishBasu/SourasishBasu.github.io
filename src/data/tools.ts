// Tool logos, grouped as in the design. Icons live in public/icons/tools/
// (simple-icons 16.37.0, CC0; devicon 2.18.0, MIT). They're drawn as CSS masks
// in each tool's brand colour.

export interface Tool {
  name: string;
  /** File stem in public/icons/tools/. */
  icon: string;
  /** Brand colour the logo is drawn in. */
  color: string;
}

export interface ToolGroup {
  title: string;
  /** Dark tiles (daily drivers). */
  dark?: boolean;
  tools: Tool[];
}

export const groups: ToolGroup[] = [
  {
    title: 'Cloud and clusters',
    tools: [
      { name: 'AWS', icon: 'aws', color: '#FF9900' },
      { name: 'Azure', icon: 'azure', color: '#0089D6' },
      { name: 'Google Cloud', icon: 'googlecloud', color: '#4285F4' },
      { name: 'Kubernetes', icon: 'kubernetes', color: '#326CE5' },
      { name: 'Terraform', icon: 'terraform', color: '#844FBA' },
      { name: 'Ansible', icon: 'ansible', color: '#EE0000' },
    ],
  },
  {
    title: 'Delivery and orchestration',
    tools: [
      { name: 'Argo CD', icon: 'argocd', color: '#EF7B4D' },
      { name: 'Temporal', icon: 'temporal', color: '#141619' },
      { name: 'GitHub Actions', icon: 'githubactions', color: '#2088FF' },
      { name: 'Docker', icon: 'docker', color: '#2496ED' },
    ],
  },
  {
    title: 'Observability and data',
    tools: [
      { name: 'Grafana', icon: 'grafana', color: '#F46800' },
      { name: 'VictoriaMetrics', icon: 'victoriametrics', color: '#621773' },
      { name: 'Prometheus', icon: 'prometheus', color: '#E6522C' },
      { name: 'Loki', icon: 'loki', color: '#F7A900' },
      { name: 'OpenTelemetry', icon: 'opentelemetry', color: '#425CC7' },
      { name: 'Snowflake', icon: 'snowflake', color: '#29B5E8' },
    ],
  },
  {
    title: 'Languages',
    tools: [
      { name: 'Go', icon: 'go', color: '#00ADD8' },
      { name: 'Python', icon: 'python', color: '#3776AB' },
      { name: 'TypeScript', icon: 'typescript', color: '#3178C6' },
      { name: 'Bash', icon: 'gnubash', color: '#4EAA25' },
      { name: 'PostgreSQL', icon: 'postgresql', color: '#4169E1' },
    ],
  },
  {
    title: 'Daily drivers',
    dark: true,
    tools: [
      { name: 'Claude Code', icon: 'claude', color: '#D97757' },
      { name: 'opencode', icon: 'opencode', color: '#FFFFFF' },
      { name: 'Cursor', icon: 'cursor', color: '#FFFFFF' },
      { name: 'Ghostty', icon: 'ghostty', color: '#8A9BFF' },
      { name: 'Model Context Protocol', icon: 'modelcontextprotocol', color: '#FFFFFF' },
    ],
  },
];
