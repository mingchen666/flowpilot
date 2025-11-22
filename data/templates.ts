import type { DiagramTemplate } from "@/types/template";

/**
 * Phase 1: High-impact templates (Must-have)
 * Starting with 6 most useful templates
 */
export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // 1. Employee Onboarding Flow
  {
    id: "employee-onboarding",
    title: "Employee Onboarding Flow",
    description: "新员工入职流程，从Offer到正式开始工作",
    category: "business",
    tags: ["HR", "Onboarding", "Process"],
    difficulty: "beginner",
    isPopular: true,
    icon: "UserPlus",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "5 min",
    prompt: `Create an employee onboarding flowchart from offer acceptance to first day:
- Pre-onboarding: Background check → Contract signing → IT setup request
- Day 1: Welcome meeting → Office tour → Equipment setup → Access provisioning
- Week 1: Team introductions → Training sessions → Goal setting
- Swimlanes: HR, IT, Manager, New Employee
- Decision points: Background check pass/fail, Equipment ready Y/N
- Use soft blue/green colors, clear timeline indicators
- Keep it clean and professional with proper spacing`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 2. API Request/Response Flow
  {
    id: "api-flow",
    title: "API Request/Response Flow",
    description: "API调用的完整生命周期，包含认证、请求、响应",
    category: "development",
    tags: ["API", "Backend", "Integration"],
    difficulty: "intermediate",
    isPopular: true,
    icon: "Workflow",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "10 min",
    prompt: `Create API request/response sequence diagram:
- Actors: Client, API Gateway, Auth Service, Backend Service, Database
- Flow:
  1. Client → API Gateway: POST /api/users (with JWT token)
  2. API Gateway → Auth Service: Validate token
  3. Auth Service → API Gateway: Token valid (200 OK)
  4. API Gateway → Backend Service: Forward request
  5. Backend Service → Database: Query user data
  6. Database → Backend Service: Return results
  7. Backend Service → API Gateway: Response payload
  8. API Gateway → Client: 200 OK with data
- Add error paths: Invalid token (401), Service timeout (504)
- Include request/response headers, latency indicators
- Use sequence diagram style with lifelines`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "clarity"],
      diagramTypes: ["sequence"],
    },
  },

  // 3. Business Decision Tree
  {
    id: "decision-tree",
    title: "Business Decision Tree",
    description: "商业决策流程，包含多个决策节点和结果评估",
    category: "business",
    tags: ["Strategy", "Decision Making", "Analysis"],
    difficulty: "intermediate",
    isPopular: true,
    icon: "GitBranch",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "10 min",
    prompt: `Create a business decision tree for "Should we launch product in new market?":
- Root decision: Market size > $10M? (Yes/No)
- Branch 1 (Yes): Competition level? (High/Medium/Low)
  - High: ROI calculation → Go/No-Go
  - Medium: Risk assessment → Go/No-Go  
  - Low: Fast track launch
- Branch 2 (No): Alternative markets analysis
- Include probability percentages, expected outcomes
- Use rectangular decision nodes, diamond shapes for questions
- Color code outcomes: Green (Go), Red (No-Go), Yellow (Review)
- Add clear labels and decision criteria`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 4. Customer Journey Map
  {
    id: "customer-journey",
    title: "Customer Journey Map",
    description: "客户体验旅程，包含阶段、触点、情绪曲线",
    category: "business",
    tags: ["CX", "Journey", "Touchpoints"],
    difficulty: "intermediate",
    icon: "Route",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "10 min",
    prompt: `Create a customer journey map for SaaS product:
- Stages: Awareness → Consideration → Purchase → Onboarding → Retention
- For each stage:
  - Customer actions (e.g., "Searches for solution", "Reads reviews")
  - Touchpoints (e.g., "Google Ads", "Product website", "Email")
  - Emotions (positive/neutral/negative indicators)
  - Pain points (highlighted in red)
  - Opportunities (highlighted in green)
- Add emotion curve line across all stages
- Use timeline visualization, friendly icons
- Keep it colorful but professional`,
    brief: {
      intent: "draft",
      tone: "playful",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["journey"],
    },
  },

  // 5. Agile Sprint Workflow
  {
    id: "agile-sprint",
    title: "Agile Sprint Workflow",
    description: "Scrum敏捷开发的完整Sprint流程",
    category: "development",
    tags: ["Agile", "Scrum", "Sprint"],
    difficulty: "beginner",
    icon: "Repeat",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "8 min",
    prompt: `Create an Agile Sprint workflow (2-week cycle):
- Sprint Planning: Backlog refinement → Story selection → Task breakdown → Capacity planning
- Daily activities: Daily standup → Development → Code review → Testing
- Sprint ceremonies timeline:
  - Day 1: Sprint Planning (2-4 hours)
  - Daily: Standups (15 min)
  - Mid-sprint: Backlog grooming
  - Last day: Sprint Review → Sprint Retrospective
- Deliverables: Potentially shippable increment
- Swimlanes: PO, Scrum Master, Dev Team, QA
- Include velocity tracking, burndown chart reference
- Use iterative flow visualization`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["activity"],
    },
  },

  // 6. Bug Triage Process
  {
    id: "bug-triage",
    title: "Bug Triage Process",
    description: "Bug处理流程，从报告到修复验证",
    category: "development",
    tags: ["QA", "Bug Tracking", "Process"],
    difficulty: "beginner",
    icon: "Bug",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "8 min",
    prompt: `Create bug triage workflow:
- Report: User/QA reports bug → Auto-create ticket
- Triage: QA Lead reviews
  - Duplicate? → Close & link to original
  - Valid bug? → Continue
- Severity assessment:
  - Critical (P0): Immediate fix, escalate to on-call
  - High (P1): Assign to current sprint
  - Medium (P2): Add to backlog
  - Low (P3): Add to tech debt list
- Assignment: Auto-assign by component → Engineer picks up
- Development: Fix → Create PR → Code review → Merge
- Verification: Deploy to staging → QA verification → Deploy to prod
- Closure: Verify in prod → Update ticket → Notify reporter
- Swimlanes: Reporter, QA Lead, Engineering, DevOps
- Color code by priority levels`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 7. Git Branching Strategy
  {
    id: "git-branching",
    title: "Git Branching Strategy",
    description: "Git工作流，包含feature、develop、release、hotfix分支",
    category: "development",
    tags: ["Git", "Version Control", "DevOps"],
    difficulty: "intermediate",
    isPopular: true,
    icon: "GitBranch",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "10 min",
    prompt: `Create a Git branching strategy diagram (Gitflow):
- Main branches: main (production), develop (integration)
- Supporting branches:
  - Feature branches: Branch from develop → Merge back to develop
  - Release branches: Branch from develop → Merge to main + develop
  - Hotfix branches: Branch from main → Merge to main + develop
- Typical flow:
  1. Create feature/new-feature from develop
  2. Develop → Commit → Push
  3. Pull request → Code review → Merge to develop
  4. Create release/v1.2.0 from develop
  5. Test → Bug fixes → Merge to main
  6. Tag v1.2.0 → Deploy
- Use different colors for branch types, show merge directions
- Add clear labels for each branch type
- Include timeline/sequence indicators`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["activity"],
    },
  },

  // 8. Approval Workflow
  {
    id: "approval-workflow",
    title: "Approval Workflow",
    description: "多层级审批流程，适用于采购、请假、报销等场景",
    category: "business",
    tags: ["Workflow", "Approval", "Process"],
    difficulty: "beginner",
    icon: "CheckCircle",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "5 min",
    prompt: `Create a multi-level approval workflow for purchase requests:
- Start: Employee submits request
- Decision 1: Amount < $1,000? 
  - Yes: Direct manager approval → End
  - No: Continue to Decision 2
- Decision 2: Amount < $10,000?
  - Yes: Department head approval → Finance review → End
  - No: VP approval → CFO approval → CEO approval → End
- Each approval can reject (returns to employee) or approve (continues)
- Swimlanes: Employee, Manager, Department Head, Finance, Executives
- Add parallel paths for urgent requests
- Color code: Green for approved, Red for rejected, Yellow for pending
- Include clear decision criteria and approval limits`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 9. CI/CD Pipeline
  {
    id: "cicd-pipeline",
    title: "CI/CD Pipeline",
    description: "持续集成/持续部署流水线，从代码提交到生产发布",
    category: "development",
    tags: ["CI/CD", "DevOps", "Automation"],
    difficulty: "advanced",
    icon: "Zap",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "15 min",
    prompt: `Create a comprehensive CI/CD pipeline:
- Trigger: Git push to main branch
- CI Stage:
  - Checkout code
  - Install dependencies
  - Run linting
  - Run unit tests (parallel)
  - Run integration tests (parallel)
  - Build artifacts
  - Security scanning (SAST/DAST)
- CD Stage:
  - Deploy to staging environment
  - Run smoke tests
  - Manual approval gate
  - Deploy to production (blue-green deployment)
  - Health check
  - Rollback capability
- Include success/failure paths, notification steps
- Show parallel execution where possible
- Add icons for each tool (Jenkins, Docker, K8s, etc.)
- Color code stages by status`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 10. Organizational Chart
  {
    id: "org-chart",
    title: "Organizational Chart",
    description: "公司组织架构图，展示层级关系和汇报线",
    category: "business",
    tags: ["Org Chart", "Structure", "Hierarchy"],
    difficulty: "beginner",
    icon: "Building",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "5 min",
    prompt: `Create a clean organizational chart for a tech startup:
- CEO at top
- C-Level: CTO, CPO, CFO, CMO (report to CEO)
- Engineering (under CTO): Frontend Team, Backend Team, DevOps Team
- Product (under CPO): Product Managers, Designers, Researchers
- Finance (under CFO): Accounting, FP&A
- Marketing (under CMO): Growth, Content, Brand
- Use hierarchical tree layout, consistent spacing
- Color code by department, show headcount in each team
- Add clear reporting lines
- Keep it professional and balanced`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["component"],
    },
  },

  // 11. Mind Map (Brainstorming)
  {
    id: "mindmap-brainstorm",
    title: "Mind Map (Brainstorming)",
    description: "发散思维导图，用于头脑风暴和创意整理",
    category: "creative",
    tags: ["Brainstorming", "Ideation", "Creativity"],
    difficulty: "beginner",
    isNew: true,
    icon: "Lightbulb",
    gradient: {
      from: "#f59e0b",
      to: "#d97706",
    },
    estimatedTime: "5 min",
    prompt: `Create a brainstorming mind map for "Product Innovation Ideas":
- Center node: "Product Innovation 2025"
- Main branches (Level 1):
  - New Features
  - User Experience
  - Business Model
  - Technology Stack
  - Marketing Channels
- Sub-branches (Level 2-3):
  - New Features:
    - AI-powered recommendations → Personalization engine
    - Social sharing → Viral loops
    - Mobile app → Offline mode
  - User Experience:
    - Onboarding redesign → Interactive tutorial
    - Accessibility → Screen reader support
    - Performance → Sub-second loading
  - Business Model:
    - Freemium tier → Feature comparison
    - Enterprise plan → Custom SLA
    - Marketplace → Revenue sharing
- Use organic shapes, varied colors, playful icons
- Add "hot" indicators for high-priority ideas
- Include connections between related ideas across branches`,
    brief: {
      intent: "draft",
      tone: "playful",
      focus: ["hierarchy", "flow"],
      diagramTypes: ["mindmap"],
    },
  },

  // 12. Product Development Lifecycle
  {
    id: "product-lifecycle",
    title: "Product Development Lifecycle",
    description: "产品从概念到发布的完整生命周期",
    category: "product",
    tags: ["Product", "Lifecycle", "Development"],
    difficulty: "intermediate",
    icon: "Package",
    gradient: {
      from: "#ec4899",
      to: "#be185d",
    },
    estimatedTime: "12 min",
    prompt: `Create product development lifecycle:
- Discovery phase:
  - Market research → User interviews → Competitor analysis
  - Problem validation: Is this a real problem? (Yes/No)
- Definition phase:
  - User personas → User stories → Feature prioritization
  - PRD creation → Design specs → Tech specs
- Design phase:
  - Wireframes → Mockups → Prototype → Usability testing
  - Design approval gate
- Development phase:
  - Sprint planning → Agile development → QA testing
- Launch phase:
  - Beta testing → Feedback collection → Production release
  - Marketing campaign → User onboarding
- Growth phase:
  - Analytics monitoring → A/B testing → Feature iteration
- Include feedback loops from each phase back to discovery
- Add decision gates and quality checkpoints
- Color code by phase type`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["activity"],
    },
  },

  // 13. Microservices Communication
  {
    id: "microservices",
    title: "Microservices Communication",
    description: "微服务架构的服务间通信模式",
    category: "development",
    tags: ["Microservices", "Architecture", "Communication"],
    difficulty: "advanced",
    icon: "Network",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "15 min",
    prompt: `Create microservices communication diagram:
- Services: API Gateway, User Service, Order Service, Payment Service, Notification Service, Inventory Service
- Communication patterns:
  - Synchronous: REST API calls (solid lines)
  - Asynchronous: Message queue (dashed lines)
  - Event-driven: Event bus (dotted lines)
- Example flows:
  1. Client → API Gateway → Order Service
  2. Order Service → Payment Service (sync REST)
  3. Order Service → Inventory Service (sync REST)
  4. Order Service → Message Queue → Notification Service (async)
  5. Payment Service → Event Bus → Analytics Service (event)
- Show protocols (HTTP, gRPC, RabbitMQ, Kafka)
- Include service registry, load balancer, circuit breaker patterns
- Color code by communication type
- Add latency indicators`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["component"],
    },
  },

  // 14. User Story Mapping
  {
    id: "user-story-mapping",
    title: "User Story Mapping",
    description: "用户故事地图，按用户旅程组织功能需求",
    category: "product",
    tags: ["Agile", "User Stories", "Planning"],
    difficulty: "intermediate",
    icon: "Map",
    gradient: {
      from: "#ec4899",
      to: "#be185d",
    },
    estimatedTime: "10 min",
    prompt: `Create user story map for online shopping app:
- User activities (top level, left to right):
  - Browse products → Search → View details → Add to cart → Checkout → Track order
- User tasks (below each activity):
  - Browse: Filter by category, Sort by price, View recommendations
  - Search: Keyword search, Voice search, Barcode scan
  - View details: Read description, Check reviews, See related items
  - Add to cart: Select quantity, Choose variants, Save for later
  - Checkout: Enter shipping, Select payment, Apply coupon
  - Track: View status, Contact support, Request return
- Priority levels (vertical):
  - MVP (top row, must-have)
  - Release 2 (middle row)
  - Future (bottom row, nice-to-have)
- Use sticky note style, color code by priority
- Keep it organized and easy to scan`,
    brief: {
      intent: "draft",
      tone: "playful",
      focus: ["hierarchy", "flow"],
      diagramTypes: ["mindmap"],
    },
  },

  // 15. Incident Response Runbook
  {
    id: "incident-response",
    title: "Incident Response Runbook",
    description: "安全事件响应流程，从检测到恢复",
    category: "security",
    tags: ["Security", "Incident", "SRE"],
    difficulty: "advanced",
    icon: "Shield",
    gradient: {
      from: "#10b981",
      to: "#059669",
    },
    estimatedTime: "15 min",
    prompt: `Create incident response runbook:
- Detection phase:
  - Monitoring alert triggers OR User report
  - On-call engineer receives page
  - Initial assessment: Severity level (P0/P1/P2/P3)
- Triage phase:
  - P0 (Critical): Assemble war room, notify executives
  - P1 (High): Assign incident commander, create incident channel
  - P2/P3: Standard on-call handling
- Investigation:
  - Collect logs → Identify root cause → Assess impact scope
  - Parallel: Customer communication, Status page update
- Containment:
  - Isolate affected systems → Implement temporary fix
  - Decision: Can we patch in place OR Need rollback?
- Resolution:
  - Deploy fix → Verify in staging → Rollout to production
  - Monitor key metrics → Confirm resolution
- Post-mortem:
  - Write incident report → Blameless review → Action items
  - Update runbook → Share learnings
- Swimlanes: On-call, Incident Commander, Engineering, Communications, Leadership
- Include escalation paths, communication templates
- Color code by severity`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 16. Network Architecture
  {
    id: "network-architecture",
    title: "Network Architecture",
    description: "企业网络拓扑，包含DMZ、防火墙、VPC等",
    category: "security",
    tags: ["Network", "Infrastructure", "Security"],
    difficulty: "advanced",
    icon: "Server",
    gradient: {
      from: "#10b981",
      to: "#059669",
    },
    estimatedTime: "15 min",
    prompt: `Create enterprise network architecture:
- External zone (Internet):
  - Users → CDN → WAF → Load Balancer
- DMZ (Demilitarized Zone):
  - Public-facing web servers
  - Reverse proxy / API Gateway
  - Firewall rules: Only ports 80/443 open
- Internal zone (Private VPC):
  - Application servers (private subnet)
  - Database cluster (isolated subnet)
  - Internal services (message queue, cache)
- Management zone:
  - Bastion host (jump server)
  - Monitoring & logging servers
  - Admin workstations
- Security layers:
  - Firewall between each zone
  - VPN for remote access
  - IDS/IPS sensors
  - Network segmentation with VLANs
- Show IP ranges, security groups, traffic flow arrows
- Include backup/DR site connection
- Use professional network diagram symbols`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["deployment"],
    },
  },

  // 17. Feature Release Process
  {
    id: "feature-release",
    title: "Feature Release Process",
    description: "新功能发布的完整流程，从开发到上线",
    category: "development",
    tags: ["Release", "Feature", "Deployment"],
    difficulty: "intermediate",
    icon: "Rocket",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "10 min",
    prompt: `Create feature release process:
- Development phase:
  - Feature planning → Design review → Development → Code review
- Testing phase:
  - Unit tests → Integration tests → QA testing
  - Decision: Pass/Fail (if fail, return to development)
- Pre-release:
  - Feature flag configuration
  - Deploy to staging → Stakeholder demo → Feedback
- Release:
  - Gradual rollout: 5% → 25% → 50% → 100%
  - Monitor metrics at each stage
  - Decision points: Continue/Pause/Rollback
- Post-release:
  - User feedback collection → Analytics review → Iteration planning
- Swimlanes: PM, Engineering, QA, DevOps, Support
- Include rollback procedures
- Add monitoring checkpoints`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 18. SWOT to Action Plan
  {
    id: "swot-analysis",
    title: "SWOT to Action Plan",
    description: "SWOT分析转化为可执行的行动计划",
    category: "business",
    tags: ["Strategy", "Planning", "Analysis"],
    difficulty: "intermediate",
    icon: "Target",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "10 min",
    prompt: `Create a SWOT analysis with action plan conversion:
- Four quadrants: Strengths, Weaknesses, Opportunities, Threats
- Each quadrant has 3-4 items
- Center: Strategic objectives
- Connections from SWOT to actions:
  - Strengths + Opportunities → Growth strategies
  - Strengths + Threats → Defensive strategies
  - Weaknesses + Opportunities → Improvement areas
  - Weaknesses + Threats → Contingency plans
- Use color coding, clear labels for each action
- Add priority indicators (High/Medium/Low)
- Keep it strategic and actionable
- Include timeline estimates`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["mindmap"],
    },
  },

  // 19. A/B Test Planning
  {
    id: "ab-testing",
    title: "A/B Test Planning",
    description: "A/B测试设计，包含假设、变量、成功指标",
    category: "product",
    tags: ["Testing", "Experimentation", "Analytics"],
    difficulty: "intermediate",
    icon: "TestTube",
    gradient: {
      from: "#ec4899",
      to: "#be185d",
    },
    estimatedTime: "10 min",
    prompt: `Create A/B test planning flow:
- Hypothesis: "Changing CTA button color from blue to green will increase conversion by 15%"
- Test setup:
  - Control group (50%): Blue button
  - Treatment group (50%): Green button
  - Sample size calculation: Need 10,000 users per variant
  - Duration: Run for 2 weeks
- Metrics:
  - Primary: Conversion rate (%)
  - Secondary: Click-through rate, Time on page, Bounce rate
- Implementation:
  - Feature flag setup → Traffic splitting → Event tracking
- Monitoring:
  - Daily checks → Statistical significance test → Early stopping rules
- Analysis:
  - Calculate lift → Confidence interval → P-value
  - Decision: Ship winner / Continue testing / Iterate
- Rollout: Gradual deployment of winner
- Include decision tree for edge cases (e.g., no clear winner, negative results)`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["clarity", "hierarchy"],
      diagramTypes: ["activity"],
    },
  },

  // 20. Database Schema Design
  {
    id: "database-schema",
    title: "Database Schema Design",
    description: "数据库关系模型，包含表、字段、关系",
    category: "development",
    tags: ["Database", "ERD", "Schema"],
    difficulty: "intermediate",
    icon: "Database",
    gradient: {
      from: "#8b5cf6",
      to: "#6d28d9",
    },
    estimatedTime: "10 min",
    prompt: `Create an e-commerce database schema (ERD):
- Tables:
  - Users: id (PK), email, password_hash, created_at
  - Products: id (PK), name, description, price, inventory
  - Orders: id (PK), user_id (FK), status, total_amount, created_at
  - OrderItems: id (PK), order_id (FK), product_id (FK), quantity, price
  - Categories: id (PK), name, parent_id (FK - self-referencing)
  - Reviews: id (PK), product_id (FK), user_id (FK), rating, comment
- Relationships:
  - Users 1:N Orders
  - Orders 1:N OrderItems
  - Products 1:N OrderItems
  - Products 1:N Reviews
  - Users 1:N Reviews
  - Categories 1:N Products (many-to-many via junction table)
- Show PK/FK, data types, indexes, constraints
- Use standard ERD notation
- Add cardinality labels`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["component"],
    },
  },

  // 21. Security Audit Flow
  {
    id: "security-audit",
    title: "Security Audit Flow",
    description: "安全审计流程，从范围定义到报告发布",
    category: "security",
    tags: ["Security", "Audit", "Compliance"],
    difficulty: "intermediate",
    icon: "ShieldCheck",
    gradient: {
      from: "#10b981",
      to: "#059669",
    },
    estimatedTime: "10 min",
    prompt: `Create security audit workflow:
- Planning phase:
  - Define audit scope → Select frameworks (SOC2, ISO27001, etc.)
  - Create audit checklist → Schedule interviews
- Data collection:
  - Document review: Policies, procedures, architecture diagrams
  - Technical scans: Vulnerability scan, Penetration test, Code review
  - Interviews: IT team, Security team, Management
- Assessment:
  - Control evaluation: Effective / Needs improvement / Ineffective
  - Risk rating: Critical / High / Medium / Low
  - Evidence gathering: Screenshots, logs, configurations
- Findings:
  - Identify gaps → Map to compliance requirements
  - Recommend remediation actions → Prioritize by risk
- Reporting:
  - Draft audit report → Review with stakeholders → Finalize
  - Present to leadership → Issue formal report
- Remediation tracking:
  - Create action plan → Assign owners → Set deadlines
  - Follow-up audits → Verify closure
- Swimlanes: Auditor, IT/Security team, Management`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 22. Access Control Matrix
  {
    id: "access-control",
    title: "Access Control Matrix",
    description: "基于角色的访问控制(RBAC)权限矩阵",
    category: "security",
    tags: ["Security", "RBAC", "Permissions"],
    difficulty: "intermediate",
    icon: "Lock",
    gradient: {
      from: "#10b981",
      to: "#059669",
    },
    estimatedTime: "10 min",
    prompt: `Create RBAC access control matrix:
- Roles (rows):
  - Admin: Full system access
  - Manager: Department-level access
  - Developer: Code & dev environment access
  - Analyst: Read-only data access
  - Guest: Limited public access
- Resources (columns):
  - User management, Configuration, Code repository, Production DB
  - Staging environment, Analytics dashboard, Financial reports, Audit logs
- Permissions (cells):
  - C (Create), R (Read), U (Update), D (Delete), X (Execute)
- Matrix layout:
  - Admin: CRUDX for all resources
  - Manager: CRUD for department resources, R for others
  - Developer: CRUDX for code/staging, R for prod
  - Analyst: R for analytics/reports, no access to configs
  - Guest: R for public resources only
- Include approval workflows:
  - Elevated access request → Manager approval → Time-limited grant
  - Show inheritance relationships between roles
- Color code: Green (allowed), Red (denied), Yellow (requires approval)`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["component"],
    },
  },

  // 23. Workshop Facilitation
  {
    id: "workshop-facilitation",
    title: "Workshop Facilitation",
    description: "工作坊流程设计，包含破冰、活动、产出",
    category: "creative",
    tags: ["Workshop", "Facilitation", "Collaboration"],
    difficulty: "intermediate",
    icon: "Users",
    gradient: {
      from: "#f59e0b",
      to: "#d97706",
    },
    estimatedTime: "10 min",
    prompt: `Create a 2-hour workshop facilitation flow:
- Pre-work (before workshop):
  - Send agenda → Prepare materials → Set up tools (Miro, Zoom)
- Introduction (15 min):
  - Welcome & context → Icebreaker activity → Review objectives
- Activity 1: Problem framing (30 min):
  - Individual brainstorm (5 min) → Pair sharing (10 min) → Group discussion (15 min)
  - Output: Problem statements
- Break (10 min)
- Activity 2: Solution ideation (40 min):
  - Crazy 8s rapid sketching → Vote on ideas → Converge to top 3
  - Output: Solution concepts
- Activity 3: Action planning (20 min):
  - Identify next steps → Assign owners → Set timelines
  - Output: Action plan
- Wrap-up (5 min):
  - Recap key decisions → Share artifacts → Schedule follow-up
- Include facilitator tips, timing cues, backup activities
- Show parallel tracks for virtual vs. in-person variations`,
    brief: {
      intent: "draft",
      tone: "playful",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },

  // 24. Strategic Canvas
  {
    id: "strategic-canvas",
    title: "Strategic Canvas",
    description: "战略画布，综合展示商业策略全貌",
    category: "creative",
    tags: ["Strategy", "Business Model", "Planning"],
    difficulty: "advanced",
    icon: "Layers",
    gradient: {
      from: "#f59e0b",
      to: "#d97706",
    },
    estimatedTime: "15 min",
    prompt: `Create a strategic canvas combining multiple frameworks:
- Center: Company vision & mission
- Quadrant 1 (Top-left): Market analysis
  - TAM/SAM/SOM → Growth trends → Competitive landscape
- Quadrant 2 (Top-right): Value proposition
  - Customer segments → Jobs-to-be-done → Unique value
- Quadrant 3 (Bottom-left): Business model
  - Revenue streams → Cost structure → Key partnerships
- Quadrant 4 (Bottom-right): Execution plan
  - OKRs → Key initiatives → Roadmap milestones
- Connecting elements:
  - From market analysis to value prop: Insights arrows
  - From value prop to business model: Monetization paths
  - From business model to execution: Resource allocation
- Include KPIs for each quadrant
- Use enterprise color scheme, clear hierarchy
- Add "strategic bets" highlights for high-risk/high-reward initiatives`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "clarity"],
      diagramTypes: ["mindmap"],
    },
  },

  // 25. Design System Workflow
  {
    id: "design-system",
    title: "Design System Workflow",
    description: "设计系统的创建、维护和使用流程",
    category: "product",
    tags: ["Design System", "UX", "Collaboration"],
    difficulty: "advanced",
    icon: "Palette",
    gradient: {
      from: "#ec4899",
      to: "#be185d",
    },
    estimatedTime: "12 min",
    prompt: `Create design system workflow:
- Foundation layer:
  - Design tokens: Colors, Typography, Spacing, Shadows
  - Guidelines: Accessibility, Tone of voice, Principles
- Component layer:
  - Atoms: Button, Input, Icon, Badge
  - Molecules: Form field, Card header, Search bar
  - Organisms: Navigation, Form, Data table
- Documentation:
  - Storybook → Component specs → Usage guidelines → Code examples
- Contribution process:
  - Designer proposes new component → Design review → Prototype
  - Engineer builds → Code review → Tests → Publish to npm
  - Update Figma library → Update Storybook → Announce to team
- Consumption workflow:
  - Product team requests component → Check library first
  - Found: Use existing → Customize via props
  - Not found: Submit request OR build custom (with review)
- Swimlanes: Design team, Engineering, Product teams
- Show feedback loops for improvements`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["hierarchy", "flow"],
      diagramTypes: ["component"],
    },
  },

  // 26. Analytics Dashboard Flow
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard Flow",
    description: "数据分析仪表板的数据流和交互逻辑",
    category: "product",
    tags: ["Analytics", "Dashboard", "Data"],
    difficulty: "intermediate",
    icon: "BarChart",
    gradient: {
      from: "#ec4899",
      to: "#be185d",
    },
    estimatedTime: "10 min",
    prompt: `Create analytics dashboard data flow:
- Data sources:
  - Application DB → ETL pipeline → Data warehouse
  - Event tracking → Real-time stream → Analytics DB
  - External APIs → Cache layer → Aggregation service
- Processing layer:
  - Scheduled jobs: Daily/weekly/monthly aggregations
  - Real-time processing: User sessions, Live metrics
- Dashboard components:
  - KPI cards: Users, Revenue, Conversion rate, Churn
  - Charts: Time series (line), Distribution (bar), Cohorts (heatmap)
  - Filters: Date range, Segment, Region, Platform
- Interaction flow:
  - User selects filter → Query builder → Cache check
  - Cache hit: Return cached data (fast path)
  - Cache miss: Query DB → Transform data → Update cache → Return
- Include latency SLAs, refresh strategies, drill-down paths
- Add data quality checkpoints`,
    brief: {
      intent: "draft",
      tone: "enterprise",
      focus: ["flow", "hierarchy"],
      diagramTypes: ["component"],
    },
  },

  // 27. Meeting Decision Flow
  {
    id: "meeting-decision",
    title: "Meeting Decision Flow",
    description: "会议决策流程，从议题讨论到行动项分配",
    category: "business",
    tags: ["Meeting", "Decision", "Action Items"],
    difficulty: "beginner",
    isNew: true,
    icon: "MessageSquare",
    gradient: {
      from: "#3b82f6",
      to: "#1d4ed8",
    },
    estimatedTime: "5 min",
    prompt: `Create a meeting decision flow:
- Agenda review → Discussion → Decision point
- Decision outcomes:
  - Approved: Create action items → Assign owners → Set deadlines
  - Needs more info: Schedule follow-up → Assign research tasks
  - Rejected: Document reasons → Archive
- Parallel track: Meeting notes → Share with stakeholders
- Post-meeting: Track action items → Send reminder before deadline
- Use swimlanes for roles: Facilitator, Participants, Action owners
- Include decision criteria and voting mechanisms
- Add follow-up tracking loop`,
    brief: {
      intent: "draft",
      tone: "balanced",
      focus: ["flow", "clarity"],
      diagramTypes: ["activity"],
    },
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DiagramTemplate | undefined {
  return DIAGRAM_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: string
): DiagramTemplate[] {
  if (category === "all") {
    return DIAGRAM_TEMPLATES;
  }
  return DIAGRAM_TEMPLATES.filter(
    (template) => template.category === category
  );
}

/**
 * Get popular templates
 */
export function getPopularTemplates(): DiagramTemplate[] {
  return DIAGRAM_TEMPLATES.filter((template) => template.isPopular);
}

/**
 * Get new templates
 */
export function getNewTemplates(): DiagramTemplate[] {
  return DIAGRAM_TEMPLATES.filter((template) => template.isNew);
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): DiagramTemplate[] {
  const lowerQuery = query.toLowerCase();
  return DIAGRAM_TEMPLATES.filter(
    (template) =>
      template.title.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
