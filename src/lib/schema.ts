interface QA {
  q: string;
  a: string;
}

interface HowToStep {
  heading: string;
  text: string;
  imageUrl?: string;
}

interface CalculatorInfo {
  name: string;
  description: string;
  formula: string;
  url: string;
}

const SITE_URL = "https://homeprojecthub.com";

export function webSiteSchema(name: string, description: string) {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name,
    description,
  };
}

export function webApplicationSchema(name: string, description: string, url: string) {
  return {
    "@type": "WebApplication",
    "@id": `${url}#webapp`,
    url,
    name,
    description,
    applicationCategory: "Multimedia",
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
      name: step.heading,
      text: step.text,
      ...(step.imageUrl ? { image: { "@type": "ImageObject", url: step.imageUrl } } : {}),
    })),
  };
}

export function graphSchema(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
