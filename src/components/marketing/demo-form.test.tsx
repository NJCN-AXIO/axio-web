import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DemoForm } from "./demo-form";

describe("DemoForm static delivery", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("submits directly to a configured Formspree form", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_DEMO_FORM_ENDPOINT",
      "https://formspree.io/f/example",
    );

    render(<DemoForm />);

    expect(screen.getByRole("form")).toHaveAttribute(
      "action",
      "https://formspree.io/f/example",
    );
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("does not submit personal data when no external form is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_FORM_ENDPOINT", "");

    render(<DemoForm />);

    const form = screen.getByRole("form");
    expect(form).not.toHaveAttribute("action", "/api/demo-requests");
    expect(screen.getByRole("button")).toBeDisabled();
    expect(form).not.toHaveAttribute("method", "post");
    for (const field of [
      ...screen.getAllByRole("textbox"),
      ...screen.getAllByRole("combobox"),
    ]) {
      expect(field).toBeDisabled();
    }
  });
});
