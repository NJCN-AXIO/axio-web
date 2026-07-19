import { render, screen } from "@testing-library/react";

import HomePage from "./page";

it("renders the approved first-viewport identity", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "AXIO 智核" }),
  ).toBeVisible();
  expect(screen.getByText("跨境电商店群全自动化运营系统")).toBeVisible();
});
