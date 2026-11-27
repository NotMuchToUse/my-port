import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAlbumPhotos,
  computeAdminOverviewStats,
  extractGalleryCategories,
  extractTopTechTags,
  filterProjects,
  formatExperiencePeriod,
  getVisibleGalleryItems,
  groupSkillsByCategory,
  isSafeUrl,
  resolveGalleryTitle,
  slugifyTitle,
  sortExperiences,
  sortMessagesNewestFirst,
  validateContactForm,
  validateExperienceInput,
  validateGalleryItemInput,
  validateLoginInput,
  validateProjectInput,
  validateSkillInput,
} from './portfolioLogic';
import {
  SEED_EXPERIENCES,
  SEED_GALLERY_ITEMS,
  SEED_MESSAGES,
  SEED_PROJECTS,
  SEED_SKILLS,
} from './mockData';

test('filterProjects returns all projects sorted by display_order', () => {
  const result = filterProjects(SEED_PROJECTS, 'All');
  assert.equal(result.length, SEED_PROJECTS.length);
  assert.equal(result[0].slug, 'my-logistics-multi-platform-ecosystem');
});

test('filterProjects filters featured projects accurately', () => {
  const featured = filterProjects(SEED_PROJECTS, 'Featured');
  assert.equal(featured.length, 2);
  assert.ok(featured.every((p) => p.is_featured));
});

test('filterProjects filters case-insensitively by tech tag', () => {
  const redisProjects = filterProjects(SEED_PROJECTS, 'redis');
  assert.equal(redisProjects.length, 1);
  assert.equal(redisProjects[0].slug, 'automated-ai-seo-pipeline');
});

test('extractTopTechTags returns bounded unique tags by frequency', () => {
  const tags = extractTopTechTags(SEED_PROJECTS, 4);
  assert.equal(tags.length, 4);
  assert.ok(tags.includes('TypeScript'));
  assert.ok(tags.includes('PostgreSQL'));
});

test('groupSkillsByCategory preserves all three architectural categories', () => {
  const groups = groupSkillsByCategory(SEED_SKILLS);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].category, 'Backend & Architecture');
  assert.equal(groups[1].category, 'Frontend');
  assert.equal(groups[2].category, 'Database & DevOps');
  assert.ok(groups[0].items.length > 0);
});

test('sortExperiences separates work and education entries', () => {
  const work = sortExperiences(SEED_EXPERIENCES, 'work');
  const edu = sortExperiences(SEED_EXPERIENCES, 'education');
  assert.equal(work.length, 2);
  assert.equal(edu.length, 1);
  assert.equal(edu[0].type, 'education');
});

test('validateContactForm returns localized Vietnamese and English errors and accepts valid submissions', () => {
  const invalidVi = validateContactForm(
    {
      sender_name: 'A',
      sender_email: 'not-an-email',
      subject: 'Hi',
      message: 'Short',
    },
    'vi'
  );
  assert.equal(invalidVi.valid, false);
  assert.ok(invalidVi.errors.sender_name?.includes('tối thiểu'));
  assert.ok(invalidVi.errors.sender_email?.includes('hợp lệ'));

  const invalidEn = validateContactForm(
    {
      sender_name: 'A',
      sender_email: 'not-an-email',
      subject: 'Hi',
      message: 'Short',
    },
    'en'
  );
  assert.equal(invalidEn.valid, false);
  assert.ok(invalidEn.errors.sender_name?.includes('at least 2'));

  const valid = validateContactForm({
    sender_name: 'Linh Pham',
    sender_email: 'linh@company.com',
    subject: 'Junior Backend Role',
    message: 'We would like to discuss a backend engineering role with you.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateProjectInput and slugifyTitle enforce required CMS constraints', () => {
  const bad = validateProjectInput({
    title: 'X',
    role: '',
    summary: 'Too short',
    description: 'Also short',
    tech_stack: [],
    highlights: [],
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.title);
  assert.ok(bad.errors.tech_stack);

  assert.equal(
    slugifyTitle('My-Logistics Multi-Platform Ecosystem!'),
    'my-logistics-multi-platform-ecosystem'
  );
});

test('filterProjects and extractTopTechTags tolerate missing tech_stack arrays', () => {
  const partialProject = {
    ...SEED_PROJECTS[0],
    tech_stack: undefined as unknown as string[],
  };
  assert.doesNotThrow(() => filterProjects([partialProject], 'TypeScript'));
  assert.doesNotThrow(() => extractTopTechTags([partialProject], 3));
});

test('computeAdminOverviewStats and sortMessagesNewestFirst summarize CMS state', () => {
  const stats = computeAdminOverviewStats(
    SEED_PROJECTS,
    SEED_SKILLS,
    [
      ...SEED_MESSAGES,
      {
        id: 'msg-2',
        sender_name: 'An',
        sender_email: 'an@example.com',
        subject: 'Hello',
        message: 'Checking in regarding availability.',
        is_read: true,
        created_at: '2026-11-26T10:00:00.000Z',
      },
    ],
    SEED_GALLERY_ITEMS
  );

  assert.equal(stats.totalProjects, SEED_PROJECTS.length);
  assert.equal(stats.featuredProjects, 2);
  assert.equal(stats.totalSkills, SEED_SKILLS.length);
  assert.equal(stats.unreadMessages, 1);
  assert.equal(stats.totalGalleryItems, SEED_GALLERY_ITEMS.length);

  const sorted = sortMessagesNewestFirst([
    SEED_MESSAGES[0],
    {
      id: 'msg-newer',
      sender_name: 'New',
      sender_email: 'new@example.com',
      subject: 'Newer',
      message: 'Newer inquiry text.',
      is_read: false,
      created_at: '2026-11-26T12:00:00.000Z',
    },
  ]);
  assert.equal(sorted[0].id, 'msg-newer');
});

test('validateLoginInput, validateSkillInput, and validateExperienceInput enforce field rules', () => {
  const badLogin = validateLoginInput({ email: 'bad', password: '123' });
  assert.equal(badLogin.valid, false);
  assert.ok(badLogin.errors.email);
  assert.ok(badLogin.errors.password);

  const goodLogin = validateLoginInput({
    email: 'admin@example.com',
    password: 'secret-password',
  });
  assert.equal(goodLogin.valid, true);

  const badSkill = validateSkillInput({
    name: '',
    category: 'Frontend',
    level_label: 'A',
    display_order: -1,
  });
  assert.equal(badSkill.valid, false);

  const badExp = validateExperienceInput({
    title: 'A',
    organization: 'B',
    period: '26',
    type: 'work',
    description: 'short',
    display_order: 1,
  });
  assert.equal(badExp.valid, false);
});

test('formatExperiencePeriod avoids duplicating Present on range strings', () => {
  assert.equal(
    formatExperiencePeriod({
      start_date: '2025 - Present',
      end_date: null,
      is_current: false,
    }),
    '2025 - Present'
  );
  assert.equal(
    formatExperiencePeriod({
      start_date: '2025 - 2027',
      end_date: null,
      is_current: false,
    }),
    '2025 - 2027'
  );
  assert.equal(
    formatExperiencePeriod({
      start_date: '2025-06',
      end_date: null,
      is_current: true,
    }),
    '2025-06 to Present'
  );
});

test('gallery filtering, category extraction, and URL safety validation work accurately', () => {
  const itemsWithHidden = [
    ...SEED_GALLERY_ITEMS,
    {
      id: 'gal-hidden',
      title: 'Hidden Photo',
      caption: 'Not public',
      category: 'Riêng tư',
      image_url: '/src/assets/images/gallery_architecture_desk_1795760812725.jpg',
      display_order: 5,
      is_visible: false,
      created_at: '2026-11-20T00:00:00.000Z',
    },
  ];

  const allVisible = getVisibleGalleryItems(itemsWithHidden, 'All');
  assert.equal(allVisible.length, SEED_GALLERY_ITEMS.length);

  const cats = extractGalleryCategories(itemsWithHidden);
  assert.ok(!cats.includes('Riêng tư'));
  assert.equal(cats.length, 4);

  const filtered = getVisibleGalleryItems(itemsWithHidden, 'Kiến trúc');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'gal-1');

  assert.equal(isSafeUrl('https://example.com/cv.pdf'), true);
  assert.equal(isSafeUrl('/Nguyen-Quoc-Khang-CV.pdf'), true);
  assert.equal(isSafeUrl('javascript:alert(1)'), false);
  assert.equal(isSafeUrl('data:text/html,<script>alert(1)</script>'), false);

  const badGal = validateGalleryItemInput({
    title: '',
    caption: '',
    category: '',
    image_url: 'javascript:alert(1)',
    display_order: 1,
  });
  assert.equal(badGal.valid, false);
  assert.ok(badGal.errors.image_url);

  const quickGal = validateGalleryItemInput({
    title: '',
    image_url: 'https://example.com/photo.jpg',
    display_order: 1,
  });
  assert.equal(quickGal.valid, true);

  assert.equal(
    resolveGalleryTitle('', '/images/1732680000-desk-setup.jpg', 1732680000000),
    'desk setup'
  );
  assert.ok(
    resolveGalleryTitle('  ', 'data:image/png;base64,abc', 1732680000000).startsWith('Photo ')
  );

  const album = buildAlbumPhotos(itemsWithHidden, {
    'gal-1': { width: 1600, height: 900 },
  });
  assert.equal(album.length, SEED_GALLERY_ITEMS.length);
  assert.equal(album[0].width, 1600);
  assert.equal(album[0].height, 900);
});
