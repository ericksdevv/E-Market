import { AuthFooter, AuthFrame } from "../auth-frame";
import { AuthSuccess } from "../auth-success";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; sucesso?: string }>;
}) {
  const { erro, sucesso } = await searchParams;

  if (sucesso) {
    return (
      <AuthFrame mode="register">
        <AuthSuccess
          title="Conta criada com sucesso"
          description="Seu mercado está pronto para você."
        />
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
          <input name="name" minLength={2} maxLength={120} autoComplete="name" required />
        </label>
        <div className="auth-two-columns">
          <label>
            E-mail
            <input
              name="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Celular
            <input
              name="phone"
              inputMode="tel"
              pattern="[0-9 ()+-]{10,16}"
              autoComplete="tel"
              required
            />
          </label>
        </div>
        <div className="auth-two-columns">
          <label>
            CPF
            <input
              name="cpf"
              inputMode="numeric"
              pattern="[0-9.-]{11,14}"
              required
            />
          </label>
          <span />
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
            minLength={8}
            maxLength={64}
            autoComplete="new-password"
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
