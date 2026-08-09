"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { api } from "../api";
import { AuthFrame } from "../auth-frame";

function RecoveryForm() {
  const queryToken = useSearchParams().get("token") ?? "";
  const [resetToken, setResetToken] = useState(queryToken);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    try {
      const data = await api<{ message: string; resetToken?: string }>(
        "/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email }) },
      );
      setMessage(data.message);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Não foi possível continuar");
    } finally {
      setSubmitting(false);
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setError("As senhas não coincidem");
      setSubmitting(false);
      return;
    }
    try {
      const data = await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: resetToken, password }),
      });
      setMessage(data.message);
      setCompleted(true);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Não foi possível atualizar a senha");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthFrame mode="login">
      <h1>{resetToken ? "Crie uma nova senha" : "Recuperar senha"}</h1>
      <p className="auth-subtitle">
        {resetToken
          ? "Use uma senha diferente da anterior e mantenha seus dados protegidos."
          : "Informe o e-mail cadastrado para iniciar a recuperação."}
      </p>

      {!resetToken ? (
        <form className="auth-form" onSubmit={requestReset}>
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button className="auth-submit" disabled={submitting}>
            {submitting ? "Solicitando..." : "Continuar"}
          </button>
        </form>
      ) : completed ? (
        <Link className="auth-submit auth-submit-link" href="/login">
          Entrar com a nova senha
        </Link>
      ) : (
        <form className="auth-form" onSubmit={savePassword}>
          <label>
            Nova senha
            <input
              name="password"
              type="password"
              minLength={8}
              maxLength={64}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Confirmar nova senha
            <input
              name="confirmation"
              type="password"
              minLength={8}
              maxLength={64}
              autoComplete="new-password"
              required
            />
          </label>
          <p className="auth-password-help">
            Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.
          </p>
          <button className="auth-submit" disabled={submitting}>
            {submitting ? "Atualizando..." : "Salvar nova senha"}
          </button>
        </form>
      )}

      {message && <p className="save-feedback">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
      {!completed && (
        <p className="auth-switch">
          <Link href="/login">Voltar para o login</Link>
        </p>
      )}
    </AuthFrame>
  );
}

export default function RecoverPasswordPage() {
  return (
    <Suspense fallback={<div className="app-loading">Carregando...</div>}>
      <RecoveryForm />
    </Suspense>
  );
}
