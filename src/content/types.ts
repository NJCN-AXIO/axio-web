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

export type ProofValue = {
  readonly value: string;
  readonly label: string;
};

export type PackageOption = {
  readonly name: "Starter" | "Professional" | "Enterprise";
  readonly audience: string;
  readonly description: string;
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
  readonly operatingLoop: readonly string[];
  readonly packages: readonly PackageOption[];
  readonly capabilityGroups: readonly CapabilityGroup[];
  readonly footer: {
    readonly boundary: string;
    readonly links: readonly NavigationLink[];
    readonly copyright: string;
  };
};
