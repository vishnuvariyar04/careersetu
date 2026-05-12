import { redirect } from "next/navigation"

export default function DashboardRoot({
  params,
}: {
  params: { company_id: string }
}) {
  redirect(`/company/${params.company_id}/dashboard/analytics`)
}