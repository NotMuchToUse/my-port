import type { SiteLanguage, SkillCategory } from '@/src/types/database';

export interface PortfolioDictionary {
  nav: {
    about: string;
    projects: string;
    stack: string;
    gallery: string;
    experience: string;
    contact: string;
    downloadCv: string;
    signIn: string;
    adminPanel: string;
    getInTouch: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    viewWork: string;
    contactMe: string;
    portraitCaptionRole: string;
    portraitEmpty: string;
    focusTitle: string;
    focusSubtitle: string;
    pillarLabels: {
      backend: string;
      databases: string;
      fullstack: string;
    };
    pillars: {
      backend: {
        title: string;
        metricValue: string;
        summary: string;
        bullets: [string, string];
      };
      databases: {
        title: string;
        metricValue: string;
        summary: string;
        bullets: [string, string];
      };
      fullstack: {
        title: string;
        metricValue: string;
        summary: string;
        bullets: [string, string];
      };
    };
    summaryLabels: {
      primary: string;
      data: string;
      runtime: string;
    };
  };
  projects: {
    kicker: string;
    heading: string;
    subheading: string;
    all: string;
    featured: string;
    inspectArchitecture: string;
    code: string;
    demo: string;
    emptyPrefix: string;
    showAll: string;
    modalOverview: string;
    modalHighlights: string;
    modalStack: string;
    viewSource: string;
    openDemo: string;
  };
  stack: {
    kicker: string;
    heading: string;
    subheading: string;
    categories: Record<SkillCategory, string>;
  };
  gallery: {
    kicker: string;
    heading: string;
    subheading: string;
    all: string;
    empty: string;
    zoomHint: string;
  };
  experience: {
    kicker: string;
    heading: string;
    subheading: string;
    all: string;
    work: string;
    education: string;
    current: string;
  };
  contact: {
    kicker: string;
    heading: string;
    subheading: string;
    emailLabel: string;
    locationLabel: string;
    nameLabel: string;
    namePlaceholder: string;
    emailFieldLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sending: string;
    send: string;
    successSupabase: string;
    successFallback: string;
    errorGeneric: string;
  };
  footer: {
    rightsPrefix: string;
    rightsSuffix: string;
    adminCms: string;
  };
}

export const DICTIONARY: Record<SiteLanguage, PortfolioDictionary> = {
  vi: {
    nav: {
      about: 'Giới thiệu',
      projects: 'Dự án',
      stack: 'Công nghệ',
      gallery: 'Thư viện ảnh',
      experience: 'Kinh nghiệm',
      contact: 'Liên hệ',
      downloadCv: 'Tải CV',
      signIn: 'Đăng nhập',
      adminPanel: 'Quản trị',
      getInTouch: 'Liên hệ ngay',
      openMenu: 'Mở menu điều hướng',
      closeMenu: 'Đóng menu điều hướng',
    },
    hero: {
      viewWork: 'Xem dự án tiêu biểu',
      contactMe: 'Liên hệ tôi',
      portraitCaptionRole: 'Ảnh hồ sơ',
      portraitEmpty: 'Chưa cập nhật ảnh chân dung',
      focusTitle: 'Trọng tâm Kỹ thuật',
      focusSubtitle: 'Thế mạnh hệ thống & triển khai',
      pillarLabels: {
        backend: 'Backend',
        databases: 'Cơ sở dữ liệu',
        fullstack: 'Full-Stack',
      },
      pillars: {
        backend: {
          title: 'Kiến trúc Backend',
          metricValue: 'API Chuẩn hóa',
          summary:
            'Thiết kế REST API bất biến (idempotent), xác thực webhook và hàng đợi xử lý nền với khả năng phục hồi lỗi ổn định.',
          bullets: [
            'Route handler TypeScript chặt chẽ trên Next.js & Express',
            'Kiểm soát đồng thời lạc quan & giới hạn tần suất truy cập',
          ],
        },
        databases: {
          title: 'Cơ sở dữ liệu Quan hệ',
          metricValue: 'PostgreSQL + RLS',
          summary:
            'Mô hình hóa lược đồ PostgreSQL chuẩn hóa với chỉ mục tổng hợp, toàn vẹn khóa ngoại và Row-Level Security.',
          bullets: [
            'Chính sách phân quyền đa người dùng Supabase RLS',
            'Phân trang con trỏ & tối ưu kế hoạch truy vấn',
          ],
        },
        fullstack: {
          title: 'Phát triển Full-Stack',
          metricValue: 'Next.js + TS',
          summary:
            'Giao diện TypeScript mạch lạc kết nối dữ liệu máy chủ, kiểm tra biểu mẫu và thẩm mỹ tối giản hiện đại.',
          bullets: [
            'Kiểm kiểu TypeScript đầu-cuối từ API tới giao diện',
            'Hệ thống giao diện chuẩn tiếp cận Tailwind & shadcn/ui',
          ],
        },
      },
      summaryLabels: {
        primary: 'Ngôn ngữ chính',
        data: 'Dữ liệu',
        runtime: 'Nền tảng',
      },
    },
    projects: {
      kicker: 'Dự án Kỹ thuật Tiêu biểu',
      heading: 'Dự án & Kiến trúc Hệ thống',
      subheading:
        'Các nền tảng backend hướng sản phẩm, quy trình tự động hóa và ứng dụng web full-stack. Chọn bất kỳ dự án nào để xem chi tiết kiến trúc.',
      all: 'Tất cả',
      featured: 'Nổi bật',
      inspectArchitecture: 'Xem kiến trúc',
      code: 'Mã nguồn',
      demo: 'Bản chạy thử',
      emptyPrefix: 'Không có dự án nào khớp với bộ lọc',
      showAll: 'Hiện tất cả dự án',
      modalOverview: 'Tổng quan Kiến trúc',
      modalHighlights: 'Điểm nhấn Kỹ thuật',
      modalStack: 'Công nghệ sử dụng',
      viewSource: 'Xem mã nguồn',
      openDemo: 'Mở bản chạy thử',
    },
    stack: {
      kicker: 'Năng lực Kỹ thuật',
      heading: 'Hệ sinh thái Công nghệ',
      subheading:
        'Công cụ và nền tảng kiến trúc được sử dụng xuyên suốt trong dịch vụ backend, cơ sở dữ liệu quan hệ và giao diện full-stack.',
      categories: {
        'Backend & Architecture': 'Backend & Kiến trúc',
        Frontend: 'Frontend',
        'Database & DevOps': 'Cơ sở dữ liệu & DevOps',
      },
    },
    gallery: {
      kicker: 'Khoảnh khắc & Hoạt động',
      heading: 'Thư viện ảnh',
      subheading:
        'Góc làm việc kỹ thuật, sơ đồ kiến trúc hệ thống và các buổi trao đổi chuyên môn.',
      all: 'Tất cả',
      empty: 'Chưa có hình ảnh nào trong danh mục này.',
      zoomHint: 'Nhấn để phóng to',
    },
    experience: {
      kicker: 'Hành trình',
      heading: 'Kinh nghiệm & Học vấn',
      subheading:
        'Quá trình thực tập kỹ thuật, triển khai hệ thống cho khách hàng và đào tạo chính quy.',
      all: 'Tất cả',
      work: 'Công việc',
      education: 'Học vấn',
      current: 'Hiện tại',
    },
    contact: {
      kicker: 'Kết nối Trực tiếp',
      heading: 'Cùng xây dựng hệ thống tin cậy',
      subheading:
        'Liên hệ trao đổi về cơ hội thực tập Backend/Full-Stack, vị trí lập trình viên hoặc hợp tác kỹ thuật.',
      emailLabel: 'Email',
      locationLabel: 'Địa điểm',
      nameLabel: 'Họ và tên',
      namePlaceholder: 'Phạm Linh',
      emailFieldLabel: 'Địa chỉ Email',
      emailPlaceholder: 'linh@congty.com',
      subjectLabel: 'Tiêu đề',
      subjectPlaceholder: 'Trao đổi cơ hội Thực tập Backend Developer',
      messageLabel: 'Nội dung tin nhắn',
      messagePlaceholder:
        'Chia sẻ chi tiết về vị trí, phạm vi dự án hoặc thời gian dự kiến.',
      sending: 'Đang gửi tin nhắn',
      send: 'Gửi tin nhắn',
      successSupabase:
        'Tin nhắn của bạn đã được lưu và gửi thông báo thành công. Cảm ơn bạn đã liên hệ.',
      successFallback:
        'Tin nhắn của bạn đã được ghi nhận vào hộp thư CMS. Cảm ơn bạn đã liên hệ.',
      errorGeneric: 'Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.',
    },
    footer: {
      rightsPrefix: 'Bản quyền 2026',
      rightsSuffix: 'Bảo lưu mọi quyền.',
      adminCms: 'Quản trị CMS',
    },
  },
  en: {
    nav: {
      about: 'About',
      projects: 'Projects',
      stack: 'Stack',
      gallery: 'Gallery',
      experience: 'Experience',
      contact: 'Contact',
      downloadCv: 'Download CV',
      signIn: 'Sign In',
      adminPanel: 'Admin',
      getInTouch: 'Get in Touch',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
    hero: {
      viewWork: 'View Selected Work',
      contactMe: 'Contact Me',
      portraitCaptionRole: 'Portrait',
      portraitEmpty: 'No portrait photo uploaded',
      focusTitle: 'Engineering Focus',
      focusSubtitle: 'Core systems & delivery strengths',
      pillarLabels: {
        backend: 'Backend',
        databases: 'Databases',
        fullstack: 'Full-Stack',
      },
      pillars: {
        backend: {
          title: 'Backend Architecture',
          metricValue: 'Strict Contracts',
          summary:
            'Idempotent REST APIs, webhook verification, and queue-backed workers built for predictable failure recovery.',
          bullets: [
            'Typed Next.js & Express route handlers',
            'Optimistic concurrency & rate-limit guards',
          ],
        },
        databases: {
          title: 'Relational Databases',
          metricValue: 'PostgreSQL + RLS',
          summary:
            'Normalized PostgreSQL schemas with composite indexing, foreign-key integrity, and Row-Level Security.',
          bullets: [
            'Multi-tenant Supabase RLS policies',
            'Cursor pagination & query plan tuning',
          ],
        },
        fullstack: {
          title: 'Full-Stack Delivery',
          metricValue: 'Next.js + TS',
          summary:
            'Clean TypeScript interfaces connecting server state, form validation, and minimalist editorial UI.',
          bullets: [
            'End-to-end TypeScript & schema validation',
            'Accessible shadcn/ui & Tailwind layouts',
          ],
        },
      },
      summaryLabels: {
        primary: 'Primary',
        data: 'Data',
        runtime: 'Runtime',
      },
    },
    projects: {
      kicker: 'Selected Engineering Work',
      heading: 'Projects & System Architecture',
      subheading:
        'Production-minded backend platforms, automated pipelines, and full-stack applications. Select any project to inspect its architecture details.',
      all: 'All',
      featured: 'Featured',
      inspectArchitecture: 'Inspect Architecture',
      code: 'Code',
      demo: 'Demo',
      emptyPrefix: 'No projects match',
      showAll: 'Show All Projects',
      modalOverview: 'Architectural Overview',
      modalHighlights: 'Key Engineering Highlights',
      modalStack: 'Technology Stack',
      viewSource: 'View Source',
      openDemo: 'Open Live Demo',
    },
    stack: {
      kicker: 'Technical Capabilities',
      heading: 'Technical Stack Matrix',
      subheading:
        'Tools and architectural foundations used across backend services, relational databases, and full-stack web interfaces.',
      categories: {
        'Backend & Architecture': 'Backend & Architecture',
        Frontend: 'Frontend',
        'Database & DevOps': 'Database & DevOps',
      },
    },
    gallery: {
      kicker: 'Moments & Craft',
      heading: 'Gallery',
      subheading:
        'Engineering workspace highlights, system architecture sessions, and technical milestones.',
      all: 'All',
      empty: 'No photos in this category yet.',
      zoomHint: 'Click to inspect',
    },
    experience: {
      kicker: 'Background',
      heading: 'Experience & Education',
      subheading:
        'Engineering internships, client systems delivery, and formal computer science training.',
      all: 'All',
      work: 'Work',
      education: 'Education',
      current: 'Current',
    },
    contact: {
      kicker: 'Direct Contact',
      heading: 'Let us build reliable systems together',
      subheading:
        'Reach out regarding backend or full-stack engineering internships, junior developer roles, or technical collaborations.',
      emailLabel: 'Email',
      locationLabel: 'Location',
      nameLabel: 'Your Name',
      namePlaceholder: 'Linh Pham',
      emailFieldLabel: 'Email Address',
      emailPlaceholder: 'linh@company.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Backend Developer Internship Inquiry',
      messageLabel: 'Message',
      messagePlaceholder:
        'Share details about the role, project scope, or timeline.',
      sending: 'Sending Message',
      send: 'Send Message',
      successSupabase:
        'Your message has been saved and notification queued. Thank you for reaching out.',
      successFallback:
        'Your message has been recorded in the CMS inbox. Thank you for reaching out.',
      errorGeneric: 'Unable to send your message right now. Please try again.',
    },
    footer: {
      rightsPrefix: 'Copyright 2026',
      rightsSuffix: 'All rights reserved.',
      adminCms: 'Admin CMS',
    },
  },
};
