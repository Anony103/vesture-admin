import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { Container } from "../components/shared/container";
import { Panel } from "../components/shared/panel";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_ORGANISATIONS } from "@/constants/query-keys";
import { Organisation, OrganisationInput, OrganisationService } from "@/services/organisation-service";

const problemOf = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.data?.message ?? "Something went wrong." : "Something went wrong.";

/** What a customer will be asked to type: the prefix is already in the field, so they add the digits. */
const example = (o: { prefix: string }) => `${o.prefix}1234567`;

const Organisations = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new OrganisationService(token), [token]);
  const client = useQueryClient();

  const list = useQuery({
    queryKey: [GET_ORGANISATIONS],
    queryFn: async () => (await service.getAll())?.data ?? [],
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [openRegistration, setOpenRegistration] = useState(false);
  /** the organisation being renamed or re-prefixed, if any */
  const [editing, setEditing] = useState<Organisation | null>(null);

  const reset = () => {
    setName("");
    setPrefix("");
    setOpenRegistration(false);
    setEditing(null);
  };

  const save = useMutation({
    mutationFn: async (input: OrganisationInput) => (editing ? service.update(editing.id, input) : service.create(input)),
    onSuccess: (response) => {
      toast.success(response?.message ?? "Saved");
      reset();
      client.invalidateQueries({ queryKey: [GET_ORGANISATIONS] });
    },
    onError: (error) => toast.error(problemOf(error)),
  });

  const toggle = useMutation({
    mutationFn: async (o: Organisation) => service.update(o.id, { active: !o.active }),
    onSuccess: (response) => {
      toast.success(response?.message ?? "Saved");
      client.invalidateQueries({ queryKey: [GET_ORGANISATIONS] });
    },
    onError: (error) => toast.error(problemOf(error)),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    save.mutate({ name, prefix, ...(editing ? {} : { openRegistration }) });
  };

  const startEdit = (o: Organisation) => {
    setEditing(o);
    setName(o.name);
    setPrefix(o.prefix);
    setOpenRegistration(o.openRegistration);
  };

  const rows = list.data ?? [];

  return (
    <Container>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title="Organisations"
          subtitle="What customers can pick at public-sector sign-up. The prefix is put in front of the IPPIS number for them."
        >
          {list.isLoading ? (
            <p className="text-sm text-fg3">Loading…</p>
          ) : list.error ? (
            <p className="text-sm text-danger">{problemOf(list.error)}</p>
          ) : (
            <div className="v-table-wrap">
              <div className="v-table-scroll">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Organisation</th>
                      <th>Prefix</th>
                      <th>Numbers</th>
                      <th>Status</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((o) => (
                      <tr key={o.id}>
                        <td className="font-medium">{o.name}</td>
                        <td>
                          <span className="v-chip v-chip-brand">{o.prefix}</span>
                        </td>
                        <td className="text-xs text-fg2">
                          {o.openRegistration
                            ? `Issued at sign-up, next ${o.prefix}${String(o.nextNumber).padStart(6, "0")}`
                            : `From the staff sheet, e.g. ${example(o)}`}
                        </td>
                        <td>
                          <span className={`v-chip ${o.active ? "v-chip-ok" : "v-chip-warn"}`}>{o.active ? "Shown" : "Hidden"}</span>
                        </td>
                        <td className="whitespace-nowrap text-right">
                          <button type="button" className="v-btn v-btn-ghost v-btn-sm" onClick={() => startEdit(o)}>
                            Edit
                          </button>{" "}
                          <button type="button" className="v-btn v-btn-ghost v-btn-sm" disabled={toggle.isPending} onClick={() => toggle.mutate(o)}>
                            {o.active ? "Hide" : "Show"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={5} className="text-center text-sm text-fg3">
                          No organisations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>

        <Panel title={editing ? `Edit ${editing.name}` : "Add an organisation"} subtitle="Hiding one removes it from sign-up; customers who already have it keep it.">
          <form className="space-y-3" onSubmit={submit}>
            <label className="block text-xs text-fg3">
              Name
              <input className="v-field mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Federal Fire Service" required />
            </label>
            <label className="block text-xs text-fg3">
              IPPIS prefix
              <input
                className="v-field mt-1 uppercase"
                value={prefix}
                maxLength={6}
                onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="e.g. FFS"
                required
              />
            </label>
            {!editing && (
              <label className="flex items-start gap-2 text-xs text-fg2">
                <input type="checkbox" className="mt-0.5" checked={openRegistration} onChange={(e) => setOpenRegistration(e.target.checked)} />
                <span>
                  Open registration: no staff sheet. Vesture issues each customer a number (prefix, then 000001, 000002…), like the Public organisation.
                </span>
              </label>
            )}
            {editing && editing.openRegistration && (
              <p className="text-xs text-fg3">Numbers already issued keep their old prefix; new ones use this one.</p>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" className="v-btn v-btn-primary" disabled={save.isPending}>
                {save.isPending ? "Saving…" : editing ? "Save changes" : "Add organisation"}
              </button>
              {editing && (
                <button type="button" className="v-btn v-btn-ghost" onClick={reset}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Panel>
      </div>
    </Container>
  );
};

export default Organisations;
