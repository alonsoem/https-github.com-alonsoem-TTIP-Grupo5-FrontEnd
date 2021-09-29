/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import MainCalc from "../components/MainCalc";

global.localStorage = {
  getItem: () => undefined,
};

const history = createMemoryHistory();
history.push("/");

const server = setupServer();

const setup = () => {
  return render(
    <MemoryRouter>
      <MainCalc history={history} />
    </MemoryRouter>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("Layout works", () => {
  const { container } = setup();

  expect(container.querySelector('[type="submit"]')).toHaveTextContent(
    "Enviar"
  );
});

test("No input throws error", async () => {
  server.use(
    rest.post("http://localhost:8080/tax/calculate", (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  const { container } = setup();

  fireEvent.click(container.querySelector('[type="submit"]'));

  await waitFor(() => screen.getByRole("alert"));

  expect(screen.getByRole("alert")).toHaveTextContent("error");
});

test("Amount input should have a $ in front of the input", () => {
  const { container } = setup();

  const input = container.querySelector('[value="$"]');

  expect(input.value).toBe("$");
});
