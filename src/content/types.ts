import type { PublicRelease } from "../config/public-release";

export type Locale = "zh-CN";

export type CapabilityStatus = "NOW" | "NEXT";

export type NavigationLink = {
  readonly label: string;
  readonly href: string;
};

export type CapabilityItem = {
  readonly label: string;
  readonly status: CapabilityStatus;
};

export type CapabilityGroup = {
  readonly id: string;
  readonly title: string;
  readonly items: readonly CapabilityItem[];
};

export type OperatingLoopStep = {
  readonly title: string;
  readonly detail: string;
};

export type ProofValue = {
  readonly value: string;
  readonly label: string;
};

export type PackageOption = {
  readonly name: "Starter" | "Professional" | "Team";
  readonly chineseName: "启航版" | "专业版" | "团队版";
  readonly audience: string;
  readonly description: string;
  readonly annualPrice: string;
  readonly launchPrice: string;
  readonly launchLabel: string;
  readonly delivery: string;
  readonly limits: readonly string[];
  readonly featured: boolean;
};

export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly priority: boolean;
};

export type FaqGroup = {
  readonly id: string;
  readonly title: string;
  readonly items: readonly FaqItem[];
};

export type EvidenceIconKey = "supervisor" | "collection" | "pricing" | "risk";

export type HomeEvidenceItem = {
  readonly label: string;
  readonly detail: string;
  readonly iconKey: EvidenceIconKey;
};

export type HomeContent = {
  readonly loopTitle: string;
  readonly loopDescription: string;
  readonly evidenceTitle: string;
  readonly evidenceDescription: string;
  readonly evidenceItems: readonly HomeEvidenceItem[];
  readonly capabilitiesTitle: string;
  readonly capabilitiesDescription: string;
  readonly safetyTitle: string;
  readonly safetyDescription: string;
  readonly safetyPoints: readonly {
    readonly title: string;
    readonly description: string;
  }[];
  readonly packagesTitle: string;
  readonly packagesDescription: string;
  readonly finalTitle: string;
  readonly finalDescription: string;
};

export type SiteContent = {
  readonly brand: { readonly name: string; readonly subtitle: string };
  readonly navigation: readonly NavigationLink[];
  readonly hero: {
    readonly title: string;
    readonly subtitle: string;
    readonly description: string;
    readonly primaryCta: NavigationLink;
    readonly secondaryCta: NavigationLink;
  };
  readonly proofValues: readonly ProofValue[];
  readonly operatingLoop: readonly OperatingLoopStep[];
  readonly packages: readonly PackageOption[];
  readonly publicRelease: PublicRelease;
  readonly faqGroups: readonly FaqGroup[];
  readonly capabilityGroups: readonly CapabilityGroup[];
  readonly home: HomeContent;
  readonly footer: {
    readonly boundary: string;
    readonly links: readonly NavigationLink[];
    readonly copyright: string;
  };
};
