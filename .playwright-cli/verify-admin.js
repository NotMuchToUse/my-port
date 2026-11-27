async page => {
  const SUPABASE_HOST = 'https://umoddoixslqsyiccrgch.supabase.co/**';

  // Stateful in-memory Supabase store for Playwright verification
  const now = new Date().toISOString();
  const db = {
    profile_settings: [
      {
        id: 'profile-1',
        full_name: 'Nguyen Quoc Khang',
        role_title: 'Full-Stack & Backend Web Developer',
        tagline: 'Building resilient backend architectures, clean APIs, and modern web applications.',
        bio: 'Software engineering student specializing in Backend architecture, relational databases, and full-stack web ecosystems.',
        location: 'Can Tho, Vietnam',
        email: 'khang.dev@example.com',
        github_url: 'https://github.com/nguyenquockhang',
        linkedin_url: 'https://linkedin.com/in/nguyenquockhang',
        cv_url: '#contact',
        availability_text: 'Open to Internship & Junior Developer Opportunities',
        is_available: true,
        updated_at: now,
      },
    ],
    projects: [
      {
        id: 'proj-1',
        slug: 'my-logistics-ecosystem',
        title: 'My-Logistics Multi-Platform Ecosystem',
        role: 'Backend & Architecture Lead',
        summary: 'Distributed parcel routing, driver dispatch, and merchant settlement platform.',
        description: 'Multi-tenant logistics system built with strict RBAC and PostgreSQL indexing.',
        tech_stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Supabase'],
        highlights: ['Modeled 18 normalized PostgreSQL tables with RLS policies.'],
        repo_url: 'https://github.com/nguyenquockhang/my-logistics',
        github_url: 'https://github.com/nguyenquockhang/my-logistics',
        live_url: 'https://my-logistics-demo.example.com',
        thumbnail_url: null,
        is_featured: true,
        display_order: 1,
        created_at: now,
      },
      {
        id: 'proj-2',
        slug: 'automated-ai-seo-pipeline',
        title: 'Automated AI SEO Pipeline',
        role: 'Full-Stack Engineer',
        summary: 'Scheduled crawling, semantic clustering, and structured metadata publishing workflow.',
        description: 'Queue-backed editorial pipeline with human-in-the-loop diff inspection.',
        tech_stack: ['TypeScript', 'PostgreSQL', 'Redis'],
        highlights: ['Engineered async worker queue with dead-letter recovery.'],
        repo_url: 'https://github.com/nguyenquockhang/seo-pipeline',
        github_url: 'https://github.com/nguyenquockhang/seo-pipeline',
        live_url: null,
        thumbnail_url: null,
        is_featured: true,
        display_order: 2,
        created_at: now,
      },
      {
        id: 'proj-3',
        slug: 'modern-ecommerce-admin-suite',
        title: 'Modern E-Commerce & Admin Suite',
        role: 'Full-Stack Developer',
        summary: 'Storefront and inventory management dashboard built with modular MVC structure.',
        description: 'Full-featured storefront and inventory management dashboard.',
        tech_stack: ['Vue 3', 'TypeScript', 'Tailwind CSS'],
        highlights: ['Clean component architecture following MVC separation.'],
        repo_url: null,
        github_url: null,
        live_url: null,
        thumbnail_url: null,
        is_featured: false,
        display_order: 3,
        created_at: now,
      },
    ],
    skills: [
      {
        id: 'sk-1',
        name: 'PHP & Laravel',
        category: 'Backend & Architecture',
        level_label: 'Production',
        proficiency: 'Production',
        context: 'REST APIs, queue workers, MVC services',
        display_order: 1,
      },
      {
        id: 'sk-2',
        name: 'TypeScript',
        category: 'Frontend',
        level_label: 'Production',
        proficiency: 'Production',
        context: 'Strict end-to-end typing across API and UI',
        display_order: 2,
      },
      {
        id: 'sk-3',
        name: 'PostgreSQL & Supabase',
        category: 'Database & DevOps',
        level_label: 'Production',
        proficiency: 'Production',
        context: 'Schema normalization, indexing, RLS policies',
        display_order: 3,
      },
    ],
    experiences: [
      {
        id: 'exp-1',
        type: 'work',
        title: 'Freelance Web Developer & Technical Consultant',
        organization: 'Independent / Remote',
        location: 'Can Tho, Vietnam',
        period: '2025 - Present',
        start_date: '2025 - Present',
        end_date: null,
        is_current: true,
        summary: 'Deploying and maintaining PHP/Laravel web applications for clients.',
        description: 'Deploying and maintaining PHP/Laravel web applications for clients.',
        highlights: [],
        display_order: 1,
      },
      {
        id: 'exp-2',
        type: 'education',
        title: 'Web Programming Major (Cohort WD21301)',
        organization: 'FPT Polytechnic Can Tho',
        location: 'Can Tho, Vietnam',
        period: '2025 - 2027',
        start_date: '2025 - 2027',
        end_date: null,
        is_current: false,
        summary: 'Focused on full-stack web engineering and relational database design.',
        description: 'Focused on full-stack web engineering and relational database design.',
        highlights: [],
        display_order: 2,
      },
    ],
    contact_messages: [
      {
        id: 'msg-1',
        sender_name: 'Minh Tran',
        sender_email: 'minh.tran@techcorp.vn',
        subject: 'Backend Engineering Internship Opportunity',
        message: 'Hello Khang, we reviewed your logistics system project and would like to invite you for a technical interview.',
        is_read: false,
        created_at: now,
      },
      {
        id: 'msg-2',
        sender_name: 'Lan Vo',
        sender_email: 'lan@studio.dev',
        subject: 'Technical Collaboration',
        message: 'Interested in collaborating on a Next.js + Supabase dashboard.',
        is_read: true,
        created_at: '2026-11-20T09:00:00.000Z',
      },
    ],
  };

  const mockUser = {
    id: '00000000-0000-0000-0000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin@example.com',
  };

  let signedIn = false;

  await page.route(SUPABASE_HOST, async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const headers = req.headers();
    const accept = headers['accept'] || '';
    const isSingle = accept.includes('application/vnd.pgrst.object+json');

    // Auth endpoints
    if (url.pathname.startsWith('/auth/v1/token')) {
      signedIn = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-jwt-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser,
        }),
      });
    }

    if (url.pathname === '/auth/v1/user') {
      return route.fulfill({
        status: signedIn ? 200 : 401,
        contentType: 'application/json',
        body: JSON.stringify(signedIn ? mockUser : { error: 'Unauthorized' }),
      });
    }

    if (url.pathname === '/auth/v1/logout') {
      signedIn = false;
      return route.fulfill({ status: 204, body: '' });
    }

    // PostgREST endpoints
    if (url.pathname.startsWith('/rest/v1/')) {
      const table = url.pathname.replace('/rest/v1/', '');
      const rows = db[table];
      if (!rows) {
        return route.fulfill({ status: 404, body: JSON.stringify({ message: 'Unknown table' }) });
      }

      const eqFilters = {};
      for (const [k, v] of url.searchParams.entries()) {
        if (v.startsWith('eq.')) {
          eqFilters[k] = v.slice(3);
        }
      }

      const matchesFilter = row =>
        Object.entries(eqFilters).every(([k, val]) => String(row[k]) === val);

      if (method === 'GET') {
        let result = rows.filter(matchesFilter);
        const orderParam = url.searchParams.get('order');
        if (orderParam) {
          const [col, dir] = orderParam.split('.');
          result = [...result].sort((a, b) => {
            if (a[col] < b[col]) return dir === 'desc' ? 1 : -1;
            if (a[col] > b[col]) return dir === 'desc' ? -1 : 1;
            return 0;
          });
        }
        const body = isSingle ? (result[0] ?? null) : result;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      }

      if (method === 'POST') {
        const payload = req.postDataJSON();
        const items = Array.isArray(payload) ? payload : [payload];
        const created = items.map((item, idx) => {
          const id = item.id || `${table}-${Date.now()}-${idx}`;
          const existingIdx = rows.findIndex(r => r.id === id);
          const record = { id, created_at: now, ...item };
          if (existingIdx >= 0) {
            rows[existingIdx] = { ...rows[existingIdx], ...record };
            return rows[existingIdx];
          }
          rows.push(record);
          return record;
        });
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(isSingle ? created[0] : created),
        });
      }

      if (method === 'PATCH') {
        const patch = req.postDataJSON();
        const updated = [];
        for (let i = 0; i < rows.length; i++) {
          if (matchesFilter(rows[i])) {
            rows[i] = { ...rows[i], ...patch };
            updated.push(rows[i]);
          }
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(isSingle ? (updated[0] ?? null) : updated),
        });
      }

      if (method === 'DELETE') {
        const remaining = rows.filter(r => !matchesFilter(r));
        db[table] = remaining;
        return route.fulfill({ status: 204, body: '' });
      }
    }

    return route.continue();
  });

  // 1. Visit /admin/login and sign in
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/admin/login');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();
  await page.getByRole('heading', { name: 'Dashboard Overview' }).waitFor({ timeout: 10000 });
  await page.screenshot({ path: '.playwright-cli/admin-r3-overview.png', type: 'png' });

  // 2. Quick action: Add New Project -> Create -> Edit -> Delete via ConfirmDialog
  await page.getByRole('button', { name: 'Add New Project' }).click();
  await page.getByLabel('Project Title').fill('Cloud Telemetry Router');
  const autoSlug = await page.getByLabel('Slug (auto-generated)').inputValue();
  if (autoSlug !== 'cloud-telemetry-router') {
    throw new Error(`Expected auto-slug cloud-telemetry-router, got ${autoSlug}`);
  }
  await page.getByLabel('Card Summary').fill('High-throughput telemetry ingestion service built in TypeScript.');
  await page.getByLabel('Architectural Description').fill('Streams structured event payloads to PostgreSQL with automatic batching and retries.');
  await page.getByLabel('Tech Stack Tags').fill('Go');
  await page.getByRole('button', { name: 'Add Tag' }).click();
  await page.getByRole('textbox', { name: 'Highlight 1' }).fill('Sustained 10k events per second with bounded memory.');
  await page.getByRole('button', { name: 'Create Project' }).click();
  await page.getByText('Cloud Telemetry Router', { exact: true }).waitFor({ timeout: 5000 });
  await page.screenshot({ path: '.playwright-cli/admin-r3-projects.png', type: 'png' });

  // Edit project
  await page.getByRole('button', { name: 'Edit project Cloud Telemetry Router' }).click();
  await page.getByLabel('Project Title').fill('Cloud Telemetry Router v2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Cloud Telemetry Router v2', { exact: true }).waitFor({ timeout: 5000 });

  // Delete project with ConfirmDialog
  await page.getByRole('button', { name: 'Delete project Cloud Telemetry Router v2' }).click();
  await page.getByRole('heading', { name: 'Delete Project' }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Deleted project "Cloud Telemetry Router v2".').waitFor({ timeout: 5000 });

  // 3. Skills & Stack CRUD
  await page.getByRole('button', { name: 'Skills & Stack' }).click();
  await page.getByRole('button', { name: 'Add Skill' }).click();
  await page.getByLabel('Skill Name').fill('GraphQL');
  await page.getByLabel('Level Label').fill('Advanced');
  await page.getByLabel('Context').fill('Typed schema federation');
  await page.getByRole('button', { name: 'Add Skill' }).last().click();
  await page.getByText('GraphQL', { exact: true }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Move GraphQL up' }).click();
  await page.getByRole('button', { name: 'Delete skill GraphQL' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Deleted skill "GraphQL".').waitFor({ timeout: 5000 });

  // 4. Experience CRUD
  await page.getByRole('button', { name: 'Experience', exact: true }).click();
  await page.getByRole('button', { name: 'Add Entry' }).click();
  await page.getByLabel('Role or Degree Title').fill('Platform Intern');
  await page.getByLabel('Organization').fill('Acme Cloud');
  await page.getByLabel('Description').fill('Built telemetry ingestion pipelines and automated alerts.');
  await page.getByRole('button', { name: 'Add Entry' }).last().click();
  await page.getByText('Platform Intern', { exact: true }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'Delete experience Platform Intern' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByText('Deleted "Platform Intern".').waitFor({ timeout: 5000 });

  // 5. Profile & Hero Editor
  await page.getByRole('button', { name: 'Profile & Hero' }).click();
  await page.getByRole('switch', { name: 'Toggle availability status' }).click();
  await page.getByRole('button', { name: 'Save Profile Settings' }).click();
  await page.getByText('Profile and hero settings saved.').waitFor({ timeout: 5000 });

  // 6. Messages Inbox
  await page.getByRole('button', { name: /Messages/ }).click();
  await page.getByRole('heading', { name: 'Contact Messages Inbox' }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: 'View', exact: true }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 5000 });
  await page.screenshot({ path: '.playwright-cli/admin-r3-messages.png', type: 'png' });
  await page.getByRole('button', { name: 'Close modal' }).click();

  // 7. Mobile viewport & collapsible sidebar
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open admin navigation' }).click();
  await page.getByRole('button', { name: 'Close sidebar' }).waitFor({ timeout: 5000 });
  await page.screenshot({ path: '.playwright-cli/admin-r3-mobile.png', type: 'png' });

  // Sign Out
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.getByRole('heading', { name: 'Admin Sign In' }).waitFor({ timeout: 5000 });

  return {
    ok: true,
    finalPath: new URL(page.url()).pathname,
    remainingProjects: db.projects.length,
    remainingSkills: db.skills.length,
    remainingExperiences: db.experiences.length,
    profileAvailable: db.profile_settings[0].is_available,
    unreadAfterView: db.contact_messages.filter(m => !m.is_read).length,
  };
}
