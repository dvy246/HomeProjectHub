interface QA {
  q: string;
  a: string;
}

interface HowToStep {
  name: string;
  text: string;
  imageUrl?: string;
}

interface CalculatorInfo {
  name: string;
  description: string;
  formula: string;
  url: string;
}

const SITE_URL = "https://homeplanninghub.com";

export function webSiteSchema(name: string, description: string) {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function aboutPageSchema() {
  return {
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about/#about-page`,
    name: "About HomePlanningHub",
    description: "Free home improvement planning calculators and project estimating guides for homeowners and DIY builders.",
    url: `${SITE_URL}/about/`,
  };
}

export function webPageSchema(opts: {
  url: string;
  topicName: string;
  topicUrl?: string;
}) {
  return {
    "@type": "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    about: {
      "@type": "Thing",
      name: opts.topicName,
      ...(opts.topicUrl ? { sameAs: opts.topicUrl } : {}),
    },
  };
}

export function webApplicationSchema(name: string, description: string, url: string) {
  return {
    "@type": "WebApplication",
    "@id": `${url}#webapp`,
    url,
    name,
    description,
    applicationCategory: "Utilities",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
  };
}

export function breadcrumbListSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqPageSchema(qas: QA[], pageUrl?: string) {
  return {
    "@type": "FAQPage",
    ...(pageUrl ? { "@id": `${pageUrl}#faq` } : {}),
    mainEntity: qas.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };
}

export function mathSolverSchema(calc: CalculatorInfo) {
  return {
    "@type": "MathSolver",
    "@id": `${calc.url}#math-solver`,
    name: calc.name,
    description: calc.description,
    url: calc.url,
    potentialAction: {
      "@type": "SolveAction",
      target: `${calc.url}?equation={equation}`,
    },
  };
}

export function howToSchema(name: string, description: string, steps: HowToStep[], imageUrl?: string) {
  return {
    "@type": "HowTo",
    name,
    description,
    ...(imageUrl ? { image: { "@type": "ImageObject", url: imageUrl } } : {}),
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      ...(step.imageUrl ? { image: { "@type": "ImageObject", url: step.imageUrl } } : {}),
    })),
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  url?: string;
}) {
  return {
    "@type": "Article",
    "@id": opts.url ? `${opts.url}#article` : `${SITE_URL}/article/#article`,
    headline: opts.headline,
    description: opts.description,
    author: { "@type": "Person", name: opts.author },
    publisher: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "HomePlanningHub" },
    datePublished: opts.datePublished,
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    ...(opts.imageUrl ? { image: { "@type": "ImageObject", url: opts.imageUrl } } : {}),
  };
}

export function contactPageSchema() {
  return {
    "@type": "ContactPage",
    "@id": `${SITE_URL}/contact/#contact-page`,
    name: "Contact HomePlanningHub",
    description: "Get in touch with the HomePlanningHub team for questions, feedback, or business inquiries.",
    url: `${SITE_URL}/contact/`,
  };
}

export function graphSchema(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
