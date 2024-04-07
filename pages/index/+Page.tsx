import React from "react";
import { Counter } from "./Counter";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const ctx = usePageContext()

  return (
    <>
      <h1>My Vike app</h1>
      <h3>User info:</h3>
      <pre>
        {ctx.user ? JSON.stringify(ctx.user) : "Signed Out"}
      </pre>
      This page is:
      <ul>
        <li>Rendered to HTML.</li>
        <li>
          Interactive. <Counter />
        </li>
      </ul>
    </>
  );
}
