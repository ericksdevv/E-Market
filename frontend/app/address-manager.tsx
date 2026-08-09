"use client";

import { FormEvent, useState } from "react";
import { api } from "./api";

export type Address = {
  id: number;
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
};

export function AddressManager({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => setAddresses(await api<Address[]>("/addresses"));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      label: String(form.get("label") ?? "").trim() || undefined,
      zipCode: String(form.get("zipCode") ?? ""),
      street: String(form.get("street") ?? ""),
      number: String(form.get("number") ?? ""),
      complement: String(form.get("complement") ?? "").trim() || undefined,
      neighborhood: String(form.get("neighborhood") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      isDefault: form.get("isDefault") === "on",
    };
    try {
      await api(editing ? `/addresses/${editing.id}` : "/addresses", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      await reload();
      setEditing(null);
      setShowForm(false);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Não foi possível salvar o endereço");
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (address: Address) => {
    setBusy(true);
    setError("");
    try {
      await api(`/addresses/${address.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...address, isDefault: true }),
      });
      await reload();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Não foi possível atualizar o endereço");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (address: Address) => {
    if (!window.confirm(`Remover o endereço ${address.label || address.street}?`)) return;
    setBusy(true);
    setError("");
    try {
      await api(`/addresses/${address.id}`, { method: "DELETE" });
      await reload();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Não foi possível remover o endereço");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel address-manager">
      <div className="panel-title">
        <div>
          <h2>Endereços</h2>
          <p>Gerencie os locais disponíveis no checkout.</p>
        </div>
        <button
          className="secondary"
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm((value) => !value);
          }}
        >
          {showForm && !editing ? "Fechar" : "Novo endereço"}
        </button>
      </div>

      <div className="address-list">
        {addresses.map((address) => (
          <article className="address-card" key={address.id}>
            <div>
              <b>{address.label || "Endereço"}</b>
              {address.isDefault && <span className="account-chip">Principal</span>}
              <p>
                {address.street}, {address.number}
                {address.complement ? `, ${address.complement}` : ""}
                <br />
                {address.neighborhood} · {address.city}/{address.state} · {address.zipCode}
              </p>
            </div>
            <div className="address-actions">
              {!address.isDefault && (
                <button disabled={busy} onClick={() => void makeDefault(address)}>
                  Tornar principal
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => {
                  setEditing(address);
                  setShowForm(true);
                }}
              >
                Editar
              </button>
              <button className="danger-link" disabled={busy} onClick={() => void remove(address)}>
                Remover
              </button>
            </div>
          </article>
        ))}
      </div>

      {showForm && (
        <form className="address-form address-manager-form" key={editing?.id ?? "new"} onSubmit={save}>
          <input name="label" defaultValue={editing?.label ?? ""} placeholder="Nome (Casa, Trabalho)" />
          <input name="zipCode" defaultValue={editing?.zipCode ?? ""} placeholder="CEP" required />
          <input name="street" defaultValue={editing?.street ?? ""} placeholder="Rua" required />
          <input name="number" defaultValue={editing?.number ?? ""} placeholder="Número" required />
          <input name="complement" defaultValue={editing?.complement ?? ""} placeholder="Complemento" />
          <input name="neighborhood" defaultValue={editing?.neighborhood ?? ""} placeholder="Bairro" required />
          <input name="city" defaultValue={editing?.city ?? ""} placeholder="Cidade" required />
          <input name="state" defaultValue={editing?.state ?? ""} placeholder="UF" maxLength={2} required />
          <label className="address-default-field">
            <input name="isDefault" type="checkbox" defaultChecked={editing?.isDefault ?? false} />
            Usar como endereço principal
          </label>
          <div className="address-form-actions">
            <button className="primary" disabled={busy}>
              {busy ? "Salvando..." : "Salvar endereço"}
            </button>
            {editing && (
              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setShowForm(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
