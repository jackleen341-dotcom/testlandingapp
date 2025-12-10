import React from 'react';
import { Section } from '../types';

interface PageRendererProps {
  sections: Section[];
  preview?: boolean;
}

const HeroSection: React.FC<{ content: any }> = ({ content }) => (
  <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 text-center">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
        {content.title || "Your Hero Title"}
      </h1>
      <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
        {content.subtitle || "Subheadline goes here. Explain your value proposition clearly."}
      </p>
      {content.buttonText && (
        <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg md:px-10 transition-colors">
          {content.buttonText}
        </button>
      )}
    </div>
  </section>
);

const FeaturesSection: React.FC<{ content: any }> = ({ content }) => (
  <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900">{content.title || "Features"}</h2>
        {content.subtitle && <p className="mt-4 text-lg text-slate-500">{content.subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.items?.map((item: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">{item.icon || "✨"}</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection: React.FC<{ content: any }> = ({ content }) => (
  <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-12">{content.title || "What People Say"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {content.items?.map((item: any, idx: number) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <p className="text-lg text-slate-700 italic mb-4">"{item.description}"</p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {item.name ? item.name[0] : 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">{item.name || "User Name"}</p>
                <p className="text-sm text-slate-500">{item.role || "Customer"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection: React.FC<{ content: any }> = ({ content }) => (
  <section className="bg-indigo-700 py-16 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-extrabold text-white mb-4">{content.title || "Ready to get started?"}</h2>
      <p className="text-indigo-100 text-lg mb-8">{content.text || "Join us today and transform your workflow."}</p>
      {content.buttonText && (
        <button className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:text-lg transition-colors">
          {content.buttonText}
        </button>
      )}
    </div>
  </section>
);

const FooterSection: React.FC<{ content: any }> = ({ content }) => (
  <footer className="bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto text-center">
      <p className="text-slate-400">
        {content.text || `© ${new Date().getFullYear()} All rights reserved.`}
      </p>
    </div>
  </footer>
);

export const PageRenderer: React.FC<PageRendererProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return <div className="py-20 text-center text-slate-400">Empty Page</div>;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {sections.map((section) => {
        switch (section.type) {
          case 'hero': return <HeroSection key={section.id} content={section.content} />;
          case 'features': return <FeaturesSection key={section.id} content={section.content} />;
          case 'testimonials': return <TestimonialsSection key={section.id} content={section.content} />;
          case 'cta': return <CTASection key={section.id} content={section.content} />;
          case 'footer': return <FooterSection key={section.id} content={section.content} />;
          default: return null;
        }
      })}
    </div>
  );
};