import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import { notify } from "../../../lib/toast";
import Layout from "../../../components/Layout";
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  TD,
  TH,
  Table,
  Textarea,
} from "../../../components/UI";
import {
  DUE_STAGES,
  MUST_TYPES,
  PRIORITIES,
  REQUIREMENT_TYPES,
} from "../../../lib/enums";

export default function RequirementDetails() {
  const { requirementId } = useParams();
  const [req, setReq] = useState(null);
  const [prereqs, setPrereqs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [addPrereq, setAddPrereq] = useState("");
  const [assignRole, setAssignRole] = useState("");
  const [assignMandatory, setAssignMandatory] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    try {
      const d = await api.get(`/api/requirements/${requirementId}`);
      setReq(d);
      setPrereqs(d.prerequisite_ids || []);
      const a = await api.get(
        `/api/role-matrix/assignments?requirement_id=${requirementId}`
      );
      setAssignments(a.items || []);
      const r = await api.get("/api/job-roles?limit=200");
      setRoles(r.items || []);
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [requirementId]);

  const update = (k) => (e) => setReq({ ...req, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/api/requirements/${requirementId}`, {
        title: req.title,
        description: req.description,
        requirement_type: req.requirement_type,
        must_type: req.must_type,
        priority: req.priority,
        due_stage: req.due_stage || null,
        competency: req.competency || null,
        assessment_topic: req.assessment_topic || null,
        source_document_id: req.source_document_id
          ? Number(req.source_document_id)
          : null,
        source_section: req.source_section || null,
      });
      notify.success("Requirement saved.");
      await load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const doAddPrereq = async () => {
    if (!addPrereq) return;
    setBusy(true);
    try {
      await api.post(`/api/requirements/${requirementId}/prerequisites`, {
        prerequisite_id: Number(addPrereq),
      });
      setAddPrereq("");
      notify.success("Prerequisite added.");
      await load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removePrereq = async (id) => {
    if (!confirm("Remove this prerequisite link?")) return;
    setBusy(true);
    try {
      await api.del(`/api/requirements/${requirementId}/prerequisites/${id}`);
      notify.info("Prerequisite removed.");
      await load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const assign = async () => {
    if (!assignRole) return;
    setBusy(true);
    try {
      await api.post("/api/role-matrix/assignments", {
        job_role_id: Number(assignRole),
        requirement_id: Number(requirementId),
        is_mandatory: assignMandatory,
      });
      setAssignRole("");
      notify.success("Role assignment added.");
      await load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const unassign = async (id) => {
    if (!confirm("Remove this role assignment?")) return;
    setBusy(true);
    try {
      await api.del(`/api/role-matrix/assignments/${id}`);
      notify.info("Assignment removed.");
      await load();
    } catch (err) {
      setError(err.message);
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!req) {
    return (
      <Layout mode="admin">
        {error && <Alert type="error">{error}</Alert>}
        <p className="text-sm text-gray-600">Loading...</p>
      </Layout>
    );
  }

  const roleName = (id) => roles.find((r) => r.id === id)?.name || `#${id}`;

  return (
    <Layout mode="admin">
      <PageHeader
        title={`${req.req_code} — ${req.title}`}
        actions={
          <Link to="/admin/requirements">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />
      {error && <Alert type="error">{error}</Alert>}

      <Card className="mb-4">
        <h2 className="text-sm font-semibold mb-2">Edit</h2>
        <Field label="Title">
          <Input value={req.title || ""} onChange={update("title")} />
        </Field>
        <Field label="Description">
          <Textarea
            value={req.description || ""}
            onChange={update("description")}
            rows={2}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={req.requirement_type || ""} onChange={update("requirement_type")}>
              {REQUIREMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Must type" hint={`Mandatory: ${req.is_mandatory_derived ? "yes" : "no"}`}>
            <Select value={req.must_type || ""} onChange={update("must_type")}>
              {MUST_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={req.priority || ""} onChange={update("priority")}>
              {PRIORITIES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Due stage">
            <Select value={req.due_stage || ""} onChange={update("due_stage")}>
              <option value="">—</option>
              {DUE_STAGES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Competency">
            <Input value={req.competency || ""} onChange={update("competency")} />
          </Field>
          <Field label="Assessment topic">
            <Input value={req.assessment_topic || ""} onChange={update("assessment_topic")} />
          </Field>
          <Field label="Source document ID">
            <Input
              type="number"
              value={req.source_document_id || ""}
              onChange={update("source_document_id")}
            />
          </Field>
          <Field label="Source section">
            <Input value={req.source_section || ""} onChange={update("source_section")} />
          </Field>
        </div>
        <Button onClick={save} disabled={busy}>
          Save
        </Button>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold mb-2">
          Prerequisites ({prereqs.length})
        </h2>
        {prereqs.length === 0 && <p className="text-sm text-gray-500">None.</p>}
        <ul className="text-sm space-y-1 mb-2">
          {prereqs.map((id) => (
            <li key={id}>
              #{id}{" "}
              <Link to={`/admin/requirements/${id}`} className="underline">
                view
              </Link>{" "}
              <Button
                variant="ghost"
                onClick={() => removePrereq(id)}
                disabled={busy}
              >
                remove
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Prerequisite requirement ID"
            value={addPrereq}
            onChange={(e) => setAddPrereq(e.target.value)}
          />
          <Button onClick={doAddPrereq} disabled={busy || !addPrereq}>
            Add
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold mb-2">
          Assigned to roles ({assignments.length})
        </h2>
        <Table>
          <thead>
            <tr>
              <TH>Role</TH>
              <TH>Mandatory</TH>
              <TH>Priority</TH>
              <TH>Stage</TH>
              <TH></TH>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <TD>{roleName(a.job_role_id)}</TD>
                <TD>{a.is_mandatory ? "yes" : "no"}</TD>
                <TD>{a.priority_override || "—"}</TD>
                <TD>{a.due_stage_override || "—"}</TD>
                <TD>
                  <Button
                    variant="ghost"
                    onClick={() => unassign(a.id)}
                    disabled={busy}
                  >
                    Remove
                  </Button>
                </TD>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <TD className="text-gray-500">Not assigned.</TD>
              </tr>
            )}
          </tbody>
        </Table>
        <div className="flex gap-2 mt-3">
          <Select value={assignRole} onChange={(e) => setAssignRole(e.target.value)}>
            <option value="">Select role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <label className="text-sm flex items-center gap-1 whitespace-nowrap">
            <input
              type="checkbox"
              checked={assignMandatory}
              onChange={(e) => setAssignMandatory(e.target.checked)}
            />
            Mandatory
          </label>
          <Button onClick={assign} disabled={busy || !assignRole}>
            Assign
          </Button>
        </div>
      </Card>
    </Layout>
  );
}