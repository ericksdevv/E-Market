"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api } from "../api";
import { AuthFrame } from "../auth-frame";

export default function RecoverPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const request = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    try {
      const data = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Não foi possível continuar",
      );
    }
  };

  return (
    <AuthFrame mode="login">
      <h1>Recuperar senha</h1>
      <p className="auth-subtitle">
        Informe o e-mail cadastrado. Se a conta existir, enviaremos as próximas
        instruções.
      </p>
      <form className="auth-form" onSubmit={request}>
        <label>
          E-mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <button className="auth-submit">Solicitar recuperação</button>
      </form>
      {message && <p className="save-feedback">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
      <p className="auth-switch">
        <Link href="/login">Voltar para o login</Link>
      </p>
    </AuthFrame>
  );
}
