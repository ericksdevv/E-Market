'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '../api';
import { AuthFrame } from '../auth-frame';

export default function RecoverPasswordPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const request = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    try { const data = await api<{ message: string; resetToken?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); setMessage(data.message); if (data.resetToken) setToken(data.resetToken); }
    catch (value) { setError(value instanceof Error ? value.message : 'Não foi possível continuar'); }
  };
  const reset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const password = String(new FormData(event.currentTarget).get('password') ?? '');
    try { const data = await api<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }); setMessage(data.message); setToken(''); }
    catch (value) { setError(value instanceof Error ? value.message : 'Não foi possível atualizar a senha'); }
  };
  return <AuthFrame mode="login"><h1>Recuperar senha</h1><p className="auth-subtitle">{token ? 'Crie uma nova senha segura.' : 'Informe o e-mail cadastrado.'}</p>{token ? <form className="auth-form" onSubmit={reset}><label>Nova senha<input name="password" type="password" minLength={8} required placeholder="Maiúscula, número e símbolo"/></label><button className="auth-submit">Atualizar senha</button></form> : <form className="auth-form" onSubmit={request}><label>E-mail<input name="email" type="email" required placeholder="seu@email.com"/></label><button className="auth-submit">Continuar</button></form>}{message && <p className="save-feedback">{message}</p>}{error && <p className="auth-error">{error}</p>}<p className="auth-switch"><Link href="/login">Voltar para o login</Link></p></AuthFrame>;
}
