// Selected projects, verbatim from the design (Work.dc.html projects()).
// [Bracketed] text is a placeholder until the real figure or role is supplied.

export interface Project {
  id: 'amd' | 'fse' | 'observ' | 'vault' | 'rag';
  name: string;
  what: string;
  kind: string;
  when: string;
  team: string;
  detail: string;
  stack: string[];
  highlight: string;
  link: string;
  /** Terminal preview for the spec sheet. */
  term: string;
}

export const projects: Project[] = [
  {
    id: 'amd',
    name: 'GPU inference stack',
    what: 'Terraform and Ansible standing up ROCm machines that serve models with vLLM',
    kind: 'Infra',
    when: 'Oct 2025',
    team: 'AMD hackathon · 3xcaffeine',
    detail:
      'Infrastructure for an AMD hackathon: Terraform provisions the GPU machines, Ansible roles install ROCm and the AMD GPU driver, and vLLM serves the models, quantized ones included. A Modal deployment and benchmark scripts sit alongside.',
    stack: ['Terraform', 'Ansible', 'ROCm', 'vLLM', 'Modal'],
    highlight: '[Model served and the throughput you measured]',
    link: 'https://github.com/3xcaffeine/amd-hackathon',
    term: '$ terraform apply\n  + gpu machine       [gpu-slug]\n\n$ ansible-playbook site.yml\n  rocm                installed\n  amdgpu              module loaded\n\n$ vllm serve [model] --quantization [q]\n  ready on :8000\n\n$ python benchmark.py\n  tokens/s            [n]',
  },
  {
    id: 'fse',
    name: 'Frontier SWE OpenEnv',
    what: 'Long-horizon coding environments for training and evaluating agents',
    kind: 'Agent envs',
    when: 'Apr 2026',
    team: 'With 3xcaffeine',
    detail:
      'A family of long-horizon software-engineering environments for OpenEnv, packaged as Docker images and published to Hugging Face Spaces. The coding agent runs as a harness inside each task container, and every episode is scored in layers: gates, tests, then LLM judges.',
    stack: ['Python', 'FastMCP', 'OpenEnv', 'Docker', 'Hugging Face'],
    highlight: '[Your part: the pi harness adapter, the scoring layers or the Spaces]',
    link: 'https://github.com/3xcaffeine/frontier-swe-openenv',
    term: '$ curl -X POST $ENV/reset\n  task      [task-id]\n  phase     planning\n\n$ curl -X POST $ENV/step\n  agent     pi, running in the container\n  step 01   submit_plan        ok\n  step 02   submit_subtask     ok\n  step 03   advance            ok\n\n  gates  pass   L1 [score]   L2 [score]\n  episode reward             [n]',
  },
  {
    id: 'observ',
    name: 'Observ',
    what: 'An API observability suite with an LLM that explains the errors',
    kind: 'Observability',
    when: 'Mar 2025',
    team: 'Solo',
    detail:
      'Two hosts. One runs a containerised API under Locust load, shipping metrics to Prometheus and logs through Promtail to Loki. The other runs Grafana dashboards with email alerts, plus an analyzer that hands the error history to Gemini 2.0 Flash and publishes a written breakdown behind NGINX.',
    stack: ['Prometheus', 'Loki', 'Grafana', 'Locust', 'Gemini', 'Docker'],
    highlight: 'Threshold alerts by email, and a report that says which errors to fix first.',
    link: 'https://github.com/SourasishBasu/Observ',
    term: '$ docker compose up -d\n  api-host        api + locust ([n] users)\n  observability   prometheus  loki  grafana\n\n$ curl localhost/report\n  window      last 24h\n  errors      [n]   5xx [n]   4xx [n]\n  worst       [endpoint]   [error]\n  analysis    gemini-2.0-flash\n\n  > [recommended fix]',
  },
  {
    id: 'vault',
    name: 'VaultAssist',
    what: 'An MCP server that gives assistants 50+ Google Workspace tools',
    kind: 'MCP',
    when: 'Aug 2025',
    team: 'With 3xcaffeine',
    detail:
      'A secure MCP server in TypeScript that exposes Gmail, Drive, Calendar, Docs, Sheets, Slides and Tasks through OAuth 2.1, with sequential thinking and graph-backed memory, so a personal AI assistant can work across them in plain language.',
    stack: ['TypeScript', 'MCP', 'OAuth 2.1', 'Docker', 'GitHub Actions'],
    highlight: 'Container builds and deploys run through GitHub Actions.',
    link: 'https://github.com/3xcaffeine/mcp-server',
    term: '$ docker run vaultassist\n  auth      OAuth 2.1      ok\n  memory    graph store    ok\n  tools     50+\n\n  gmail  drive  calendar  docs\n  sheets  slides  tasks\n\n> "[a request that spans two apps]"\n  [tool] -> [tool]        ok\n\n  [sample session]',
  },
  {
    id: 'rag',
    name: 'RAGnarok',
    what: 'A RAG assistant that answers from text, audio, images and PDFs',
    kind: 'RAG',
    when: 'Feb – May 2025',
    team: 'With 3xcaffeine',
    detail: 'An AI documentation assistant that answers from your own material using retrieval-augmented generation, whatever form it comes in.',
    stack: ['FastAPI', 'LlamaIndex', 'AstraDB', 'Docker', 'DigitalOcean'],
    highlight: 'Built for the RAGnarok track of AISoC Chronos. Switches between Gemini and DeepSeek R1 Distill 70B.',
    link: 'https://github.com/3xcaffeine/RAGnarok',
    term: '> ask "[your question]"\n\n  input     pdf + audio\n  embed     nomic-embed-text\n  retrieve  AstraDB, [k] chunks\n  model     Gemini | DeepSeek R1 Distill 70B\n\n  answer    [grounded answer]\n  sources   [doc] p.[n], [doc] p.[n]',
  },
];
