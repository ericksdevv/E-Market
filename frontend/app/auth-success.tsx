"use client";

import { useEffect } from "react";
import { MarketIcon } from "./icons";

export function AuthSuccess({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  useEffect(() => {
    const leaveTimeout = window.setTimeout(() => {
      document.documentElement.classList.add("auth-transition-out");
    }, 1_650);
    const navigationTimeout = window.setTimeout(() => {
      window.location.replace("/mercado");
    }, 2_250);

    return () => {
      window.clearTimeout(leaveTimeout);
      window.clearTimeout(navigationTimeout);
      document.documentElement.classList.remove("auth-transition-out");
    };
  }, []);

  return (
    <>
      <meta httpEquiv="refresh" content="3;url=/mercado" />
      <div className="auth-success" role="status">
        <span className="auth-success-check">
          <MarketIcon name="check" />
        </span>
        <p>{title}</p>
        <small>{description}</small>
      </div>
    </>
  );
}
