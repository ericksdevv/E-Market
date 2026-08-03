import { AuthFooter, AuthFrame } from "../auth-frame";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { erro, sucesso } = await searchParams;

  if (sucesso) {
    return (
      <AuthFrame mode="register">
        <meta httpEquiv="refresh" content="2;url=/mercado" />
        <div className="auth-success">
          <span className="auth-success-check">✓</span>
          <p>Conta criada com sucesso</p>
          <small>Seu mercado está pronto para você.</small>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame mode="register">
      <h1>Crie sua conta</h1>
      <p className="auth-subtitle">Informe seus dados para começar a comprar</p>
      <form
        className="auth-form auth-register-form"
        action="/api/session"
        method="post"
      >
        <input type="hidden" name="mode" value="register" />
        <label>
          Nome completo
          <input name="name" placeholder="Seu nome" required />
        </label>
        <div className="auth-two-columns">
          <label>
            E-mail
            <input
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </label>
          <label>
            CPF
            <input
              name="cpf"
              inputMode="numeric"
              placeholder="Somente números"
              required
            />
          </label>
        </div>
        <p className="auth-section-title">Endereço de entrega</p>
        <label>
          Rua / Avenida
          <input name="street" placeholder="Ex.: Av. Central" required />
        </label>
        <div className="auth-two-columns">
          <label>
            Número
            <input name="number" placeholder="123" required />
          </label>
          <label>
            Bairro
            <input name="neighborhood" placeholder="Seu bairro" required />
          </label>
        </div>
        <div className="auth-three-columns">
          <label>
            Cidade
            <input name="city" placeholder="Sua cidade" required />
          </label>
          <label>
            UF
            <input name="state" placeholder="CE" maxLength={2} required />
          </label>
          <label>
            CEP
            <input
              name="zipCode"
              inputMode="numeric"
              placeholder="00000000"
              required
            />
          </label>
        </div>
        <label>
          Senha
          <input
            name="password"
            type="password"
            placeholder="Crie uma senha forte"
            minLength={8}
            required
          />
        </label>
        <small className="auth-password-help">
          8+ caracteres, maiúscula, minúscula, número e símbolo.
        </small>
        {erro && (
          <p className="auth-error" role="alert">
            {erro}
          </p>
        )}
        <button className="auth-submit" type="submit">
          Criar conta
        </button>
      </form>
      <AuthFooter mode="register" />
    </AuthFrame>
  );
}
