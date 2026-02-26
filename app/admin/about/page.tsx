"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import EditorLayout from "@/components/admin/EditorLayout"
import FormBuilder from "@/components/admin/FormBuilder"
import ImageUploader from "@/components/admin/ImageUploader"
import DataTable from "@/components/admin/DataTable"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import LoadingSkeleton from "@/components/admin/LoadingSkeleton"
import { useDocument } from "@/hooks/admin/useDocument"
import { useCollection } from "@/hooks/admin/useCollection"
import { upsertDocument, removeDocument } from "@/services/firestore"
import { useToast } from "@/components/admin/ToastProvider"

type Action = { label?: string; href?: string }

type AboutHero = {
  title?: string
  tagline?: string
  description?: string
  heroImage?: string
  primaryCTA?: Action
  secondaryCTA?: Action
}

type AboutJourney = {
  title?: string
  description?: string
  highlights?: string[]
}

type AboutDifferent = {
  title?: string
  description?: string
  uniqueSellingPoints?: string[]
  technologies?: string[]
  industries?: string[]
  approach?: string
}

type AboutSectionMeta = { title?: string; description?: string }

type AboutCta = {
  title?: string
  description?: string
  primaryCTA?: Action
  secondaryCTA?: Action
  backgroundImage?: string
}

type TeamMember = {
  id?: string
  name?: string
  role?: string
  bio?: string
  image?: string
  skills?: string[]
  order?: number
}

type StatItem = {
  id?: string
  label?: string
  value?: number
  suffix?: string
  order?: number
}

type ValueItem = {
  id?: string
  title?: string
  description?: string
  icon?: string
  order?: number
}

type Certification = {
  id?: string
  name?: string
  logo?: string
  category?: string
  order?: number
}

type ClientItem = {
  id?: string
  name?: string
  logo?: string
  website?: string
  order?: number
}

type Testimonial = {
  id?: string
  name?: string
  company?: string
  role?: string
  message?: string
  image?: string
  rating?: number
  order?: number
}

function setByPath<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".")
  const clone: Record<string, unknown> = { ...obj }
  let cursor: Record<string, unknown> = clone

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i]
    const next = cursor[key]
    if (!next || typeof next !== "object") cursor[key] = {}
    cursor = cursor[key] as Record<string, unknown>
  }

  cursor[keys[keys.length - 1]] = value
  return clone as T
}

function parseCsv(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function serializeCsv(values?: string[]) {
  return (values || []).join(", ")
}

export default function AboutManager() {
  const { notify } = useToast()

  const hero = useDocument<AboutHero>("aboutPage", "hero")
  const journey = useDocument<AboutJourney>("aboutPage", "journey")
  const different = useDocument<AboutDifferent>("aboutPage", "different")
  const valuesMeta = useDocument<AboutSectionMeta>("aboutPage", "values")
  const teamMeta = useDocument<AboutSectionMeta>("aboutPage", "team")
  const statsMeta = useDocument<AboutSectionMeta>("aboutPage", "companyStats")
  const certMeta = useDocument<AboutSectionMeta>("aboutPage", "certifications")
  const clientsMeta = useDocument<AboutSectionMeta>("aboutPage", "clients")
  const testimonialsMeta = useDocument<AboutSectionMeta>("aboutPage", "testimonials")
  const cta = useDocument<AboutCta>("aboutPage", "cta")

  const team = useCollection<TeamMember>("team")
  const stats = useCollection<StatItem>("companyStats")
  const values = useCollection<ValueItem>("values")
  const certs = useCollection<Certification>("certifications")
  const clients = useCollection<ClientItem>("clients")
  const testimonials = useCollection<Testimonial>("testimonials")

  const [heroValues, setHeroValues] = useState<AboutHero>({})
  const [journeyValues, setJourneyValues] = useState<AboutJourney>({})
  const [differentValues, setDifferentValues] = useState<AboutDifferent>({})
  const [valuesMetaValues, setValuesMetaValues] = useState<AboutSectionMeta>({})
  const [teamMetaValues, setTeamMetaValues] = useState<AboutSectionMeta>({})
  const [statsMetaValues, setStatsMetaValues] = useState<AboutSectionMeta>({})
  const [certMetaValues, setCertMetaValues] = useState<AboutSectionMeta>({})
  const [clientsMetaValues, setClientsMetaValues] = useState<AboutSectionMeta>({})
  const [testimonialsMetaValues, setTestimonialsMetaValues] = useState<AboutSectionMeta>({})
  const [ctaValues, setCtaValues] = useState<AboutCta>({})

  const [teamItem, setTeamItem] = useState<TeamMember>({})
  const [statItem, setStatItem] = useState<StatItem>({})
  const [valueItem, setValueItem] = useState<ValueItem>({})
  const [certItem, setCertItem] = useState<Certification>({})
  const [clientItem, setClientItem] = useState<ClientItem>({})
  const [testimonialItem, setTestimonialItem] = useState<Testimonial>({})

  const [deleteTarget, setDeleteTarget] = useState<{ path: string; id: string } | null>(null)

  useEffect(() => {
    const nextValue = hero.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setHeroValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [hero.data])
  useEffect(() => {
    const nextValue = journey.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setJourneyValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [journey.data])
  useEffect(() => {
    const nextValue = different.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setDifferentValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [different.data])
  useEffect(() => {
    const nextValue = valuesMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setValuesMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [valuesMeta.data])
  useEffect(() => {
    const nextValue = teamMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setTeamMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [teamMeta.data])
  useEffect(() => {
    const nextValue = statsMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setStatsMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [statsMeta.data])
  useEffect(() => {
    const nextValue = certMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setCertMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [certMeta.data])
  useEffect(() => {
    const nextValue = clientsMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setClientsMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [clientsMeta.data])
  useEffect(() => {
    const nextValue = testimonialsMeta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setTestimonialsMetaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [testimonialsMeta.data])
  useEffect(() => {
    const nextValue = cta.data
    if (!nextValue) return
    const frame = requestAnimationFrame(() => setCtaValues(nextValue))
    return () => cancelAnimationFrame(frame)
  }, [cta.data])

  const pageLoading = [
    hero.loading,
    journey.loading,
    different.loading,
    valuesMeta.loading,
    teamMeta.loading,
    statsMeta.loading,
    certMeta.loading,
    clientsMeta.loading,
    testimonialsMeta.loading,
    cta.loading,
    team.loading,
    stats.loading,
    values.loading,
    certs.loading,
    clients.loading,
    testimonials.loading,
  ].some(Boolean)

  const saveDoc = async <T,>(path: string, id: string, data: T, message: string) => {
    await upsertDocument(path, id, data)
    notify(message)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await removeDocument(deleteTarget.path, deleteTarget.id)
    setDeleteTarget(null)
    notify("Item deleted")
  }

  const loading = useMemo(() => pageLoading, [pageLoading])

  if (loading) return <LoadingSkeleton rows={14} />

  return (
    <div className="space-y-10">
      <EditorLayout
        title="About Page Content"
        subtitle="Manage every Firestore source used by the About page."
        actions={<Link href="/about" className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-body)]">Preview About Page</Link>}
      >
        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Hero</h3>
            <FormBuilder
              fields={[
                { name: "title", label: "Title" },
                { name: "tagline", label: "Tagline" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "primaryCTA.label", label: "Primary CTA Label" },
                { name: "primaryCTA.href", label: "Primary CTA Link" },
                { name: "secondaryCTA.label", label: "Secondary CTA Label" },
                { name: "secondaryCTA.href", label: "Secondary CTA Link" },
              ]}
              values={heroValues as unknown as Record<string, unknown>}
              onChange={(name, value) => setHeroValues((p) => setByPath(p as Record<string, unknown>, name, value) as AboutHero)}
            />
            <ImageUploader folder="media/about" label="Hero Image" onUploaded={(url) => setHeroValues((p) => ({ ...p, heroImage: url }))} />
            <button onClick={() => saveDoc("aboutPage", "hero", heroValues, "Hero updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Hero</button>
          </section>

          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Journey</h3>
            <FormBuilder
              fields={[
                { name: "title", label: "Section Title" },
                { name: "description", label: "Long Story", type: "textarea" },
              ]}
              values={journeyValues as unknown as Record<string, unknown>}
              onChange={(name, value) => setJourneyValues((p) => setByPath(p as Record<string, unknown>, name, value) as AboutJourney)}
            />
            <label className="block text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
              Highlights (comma-separated)
              <input
                value={serializeCsv(journeyValues.highlights)}
                onChange={(e) => setJourneyValues((p) => ({ ...p, highlights: parseCsv(e.target.value) }))}
                className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]"
              />
            </label>
            <button onClick={() => saveDoc("aboutPage", "journey", journeyValues, "Journey updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Journey</button>
          </section>

          <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)] md:col-span-2">
            <h3 className="text-lg font-semibold">What Makes Us Different</h3>
            <FormBuilder
              fields={[
                { name: "title", label: "Title" },
                { name: "description", label: "Description", type: "textarea" },
                { name: "approach", label: "Approach" },
              ]}
              values={differentValues as unknown as Record<string, unknown>}
              onChange={(name, value) => setDifferentValues((p) => setByPath(p as Record<string, unknown>, name, value) as AboutDifferent)}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Unique Selling Points
                <input value={serializeCsv(differentValues.uniqueSellingPoints)} onChange={(e) => setDifferentValues((p) => ({ ...p, uniqueSellingPoints: parseCsv(e.target.value) }))} className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]" />
              </label>
              <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Technologies
                <input value={serializeCsv(differentValues.technologies)} onChange={(e) => setDifferentValues((p) => ({ ...p, technologies: parseCsv(e.target.value) }))} className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]" />
              </label>
              <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">
                Industries
                <input value={serializeCsv(differentValues.industries)} onChange={(e) => setDifferentValues((p) => ({ ...p, industries: parseCsv(e.target.value) }))} className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]" />
              </label>
            </div>
            <button onClick={() => saveDoc("aboutPage", "different", differentValues, "Differentiation updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Differentiation</button>
          </section>
        </div>
      </EditorLayout>

      <EditorLayout title="About Section Headers" subtitle="Meta headings/descriptions for values, team, stats, certifications, clients and testimonials.">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Values Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={valuesMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setValuesMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "values", valuesMetaValues, "Values header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Values Header</button>
          </section>
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Team Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={teamMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setTeamMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "team", teamMetaValues, "Team header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Team Header</button>
          </section>
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Stats Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={statsMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setStatsMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "companyStats", statsMetaValues, "Stats header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Stats Header</button>
          </section>
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Certifications Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={certMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setCertMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "certifications", certMetaValues, "Certifications header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Certifications Header</button>
          </section>
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Clients Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={clientsMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setClientsMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "clients", clientsMetaValues, "Clients header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Clients Header</button>
          </section>
          <section className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] p-5 dark:border-[var(--color-border)] dark:bg-[var(--color-footer)]">
            <h3 className="text-lg font-semibold">Testimonials Header</h3>
            <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "description", label: "Description", type: "textarea" }]} values={testimonialsMetaValues as unknown as Record<string, unknown>} onChange={(n,v)=>setTestimonialsMetaValues((p)=>({ ...p, [n]: v as string }))} />
            <button onClick={() => saveDoc("aboutPage", "testimonials", testimonialsMetaValues, "Testimonials header updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Testimonials Header</button>
          </section>
        </div>
      </EditorLayout>

      <EditorLayout title="About CTA" subtitle="Bottom call-to-action banner for the About page.">
        <div className="grid gap-6 md:grid-cols-2">
          <FormBuilder
            fields={[
              { name: "title", label: "Title" },
              { name: "description", label: "Description", type: "textarea" },
              { name: "primaryCTA.label", label: "Primary CTA Label" },
              { name: "primaryCTA.href", label: "Primary CTA Link" },
              { name: "secondaryCTA.label", label: "Secondary CTA Label" },
              { name: "secondaryCTA.href", label: "Secondary CTA Link" },
            ]}
            values={ctaValues as unknown as Record<string, unknown>}
            onChange={(name, value) => setCtaValues((p) => setByPath(p as Record<string, unknown>, name, value) as AboutCta)}
          />
          <div className="space-y-4">
            <ImageUploader folder="media/about" label="CTA Background" onUploaded={(url)=>setCtaValues((p)=>({ ...p, backgroundImage: url }))} />
            <button onClick={() => saveDoc("aboutPage", "cta", ctaValues, "About CTA updated")} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save About CTA</button>
          </div>
        </div>
      </EditorLayout>

      <EditorLayout title="Collections" subtitle="Manage About page list content in Firestore collections.">
        <div className="space-y-10">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Team (collection: team)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "name", label: "Name" }, { name: "role", label: "Role" }, { name: "bio", label: "Bio", type: "textarea" }, { name: "order", label: "Order", type: "number" }]} values={teamItem as unknown as Record<string, unknown>} onChange={(n,v)=>setTeamItem((p)=>({ ...p, [n]: v as never }))} />
                <label className="text-sm font-medium text-[var(--color-body)] dark:text-[var(--color-subheading)]">Skills (comma-separated)
                  <input value={serializeCsv(teamItem.skills)} onChange={(e)=>setTeamItem((p)=>({ ...p, skills: parseCsv(e.target.value) }))} className="mt-2 w-full rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border)] bg-[var(--color-section)] dark:bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-heading)] dark:text-[var(--color-heading)]" />
                </label>
                <ImageUploader folder="media/team" label="Profile Image" onUploaded={(url)=>setTeamItem((p)=>({ ...p, image: url }))} />
                <button onClick={async()=>{ const id = teamItem.id || `${Date.now()}`; await upsertDocument("team", id, { ...teamItem, id }); setTeamItem({}); notify("Team member saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Team Member</button>
              </div>
              <DataTable data={team.data} columns={[{ header: "Name", accessor: (r)=>r.name }, { header: "Role", accessor: (r)=>r.role }, { header: "Order", accessor: (r)=>r.order }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setTeamItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "team", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Company Stats (collection: companyStats)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "label", label: "Label" }, { name: "value", label: "Value", type: "number" }, { name: "suffix", label: "Suffix" }, { name: "order", label: "Order", type: "number" }]} values={statItem as unknown as Record<string, unknown>} onChange={(n,v)=>setStatItem((p)=>({ ...p, [n]: v as never }))} />
                <button onClick={async()=>{ const id = statItem.id || `${Date.now()}`; await upsertDocument("companyStats", id, { ...statItem, id }); setStatItem({}); notify("Stat saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Stat</button>
              </div>
              <DataTable data={stats.data} columns={[{ header: "Label", accessor: (r)=>r.label }, { header: "Value", accessor: (r)=>r.value }, { header: "Order", accessor: (r)=>r.order }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setStatItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "companyStats", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Values (collection: values)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "title", label: "Title" }, { name: "icon", label: "Icon" }, { name: "description", label: "Description", type: "textarea" }, { name: "order", label: "Order", type: "number" }]} values={valueItem as unknown as Record<string, unknown>} onChange={(n,v)=>setValueItem((p)=>({ ...p, [n]: v as never }))} />
                <button onClick={async()=>{ const id = valueItem.id || `${Date.now()}`; await upsertDocument("values", id, { ...valueItem, id }); setValueItem({}); notify("Value saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Value</button>
              </div>
              <DataTable data={values.data} columns={[{ header: "Title", accessor: (r)=>r.title }, { header: "Icon", accessor: (r)=>r.icon }, { header: "Order", accessor: (r)=>r.order }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setValueItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "values", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Certifications (collection: certifications)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "name", label: "Name" }, { name: "category", label: "Category" }, { name: "order", label: "Order", type: "number" }]} values={certItem as unknown as Record<string, unknown>} onChange={(n,v)=>setCertItem((p)=>({ ...p, [n]: v as never }))} />
                <ImageUploader folder="media/certifications" label="Logo" onUploaded={(url)=>setCertItem((p)=>({ ...p, logo: url }))} />
                <button onClick={async()=>{ const id = certItem.id || `${Date.now()}`; await upsertDocument("certifications", id, { ...certItem, id }); setCertItem({}); notify("Certification saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Certification</button>
              </div>
              <DataTable data={certs.data} columns={[{ header: "Name", accessor: (r)=>r.name }, { header: "Category", accessor: (r)=>r.category }, { header: "Order", accessor: (r)=>r.order }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setCertItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "certifications", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Clients (collection: clients)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "name", label: "Name" }, { name: "website", label: "Website" }, { name: "order", label: "Order", type: "number" }]} values={clientItem as unknown as Record<string, unknown>} onChange={(n,v)=>setClientItem((p)=>({ ...p, [n]: v as never }))} />
                <ImageUploader folder="media/clients" label="Client Logo" onUploaded={(url)=>setClientItem((p)=>({ ...p, logo: url }))} />
                <button onClick={async()=>{ const id = clientItem.id || `${Date.now()}`; await upsertDocument("clients", id, { ...clientItem, id }); setClientItem({}); notify("Client saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Client</button>
              </div>
              <DataTable data={clients.data} columns={[{ header: "Name", accessor: (r)=>r.name }, { header: "Website", accessor: (r)=>r.website }, { header: "Order", accessor: (r)=>r.order }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setClientItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "clients", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Testimonials (collection: testimonials)</h3>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <FormBuilder fields={[{ name: "name", label: "Name" }, { name: "role", label: "Role" }, { name: "company", label: "Company" }, { name: "rating", label: "Rating", type: "number" }, { name: "message", label: "Message", type: "textarea" }, { name: "order", label: "Order", type: "number" }]} values={testimonialItem as unknown as Record<string, unknown>} onChange={(n,v)=>setTestimonialItem((p)=>({ ...p, [n]: v as never }))} />
                <ImageUploader folder="media/testimonials" label="Avatar" onUploaded={(url)=>setTestimonialItem((p)=>({ ...p, image: url }))} />
                <button onClick={async()=>{ const id = testimonialItem.id || `${Date.now()}`; await upsertDocument("testimonials", id, { ...testimonialItem, id }); setTestimonialItem({}); notify("Testimonial saved") }} className="rounded-xl bg-[var(--color-footer)] px-4 py-2 text-sm font-semibold text-[var(--color-on-dark)]">Save Testimonial</button>
              </div>
              <DataTable data={testimonials.data} columns={[{ header: "Name", accessor: (r)=>r.name }, { header: "Company", accessor: (r)=>r.company }, { header: "Rating", accessor: (r)=>r.rating }, { header: "Actions", accessor: (r)=><div className="flex gap-2"><button onClick={()=>setTestimonialItem(r)} className="text-xs font-semibold text-[var(--color-body)]">Edit</button><button onClick={()=>setDeleteTarget({ path: "testimonials", id: r.id || "" })} className="text-xs font-semibold text-red-500">Delete</button></div> }]} />
            </div>
          </section>
        </div>
      </EditorLayout>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete item"
        description="This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
