import { ContactSection } from '@/src/components/ContactSection';
import { ExperienceSection } from '@/src/components/ExperienceSection';
import { Footer } from '@/src/components/Footer';
import { GallerySection } from '@/src/components/GallerySection';
import { HeroSection } from '@/src/components/HeroSection';
import { Navbar } from '@/src/components/Navbar';
import { ProjectsSection } from '@/src/components/ProjectsSection';
import { StackSection } from '@/src/components/StackSection';
import type {
  ContactMessage,
  PortfolioData,
  SiteLanguage,
} from '@/src/types/database';

interface PortfolioPageProps {
  data: PortfolioData;
  language: SiteLanguage;
  isAuthenticated: boolean;
  onLanguageChange: (lang: SiteLanguage) => void;
  onNavigate: (path: '/' | '/admin' | '/admin/login') => void;
  onMessageSubmitted: (message: ContactMessage) => void;
}

export function PortfolioPage({
  data,
  language,
  isAuthenticated,
  onLanguageChange,
  onNavigate,
  onMessageSubmitted,
}: PortfolioPageProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B]">
      <Navbar
        monogram={data.profile.monogram}
        fullName={data.profile.full_name}
        cvUrl={data.profile.cv_url}
        cvFileName={data.profile.cv_file_name}
        showGallery={data.profile.show_gallery}
        language={language}
        isAuthenticated={isAuthenticated}
        onLanguageChange={onLanguageChange}
        onNavigate={onNavigate}
      />

      <main>
        <HeroSection profile={data.profile} language={language} />
        <ProjectsSection projects={data.projects} language={language} />
        <StackSection skills={data.skills} language={language} />
        {data.profile.show_gallery && (
          <GallerySection items={data.galleryItems} language={language} />
        )}
        <ExperienceSection
          experiences={data.experiences}
          language={language}
        />
        <ContactSection
          profile={data.profile}
          language={language}
          onMessageSubmitted={onMessageSubmitted}
        />
      </main>

      <Footer
        profile={data.profile}
        language={language}
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
      />
    </div>
  );
}
