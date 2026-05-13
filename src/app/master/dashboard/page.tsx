import { redirect } from "next/navigation";
import { getMasterSession, getMasterBookings, getMasterStats } from "../actions";
import MasterDashboardClient from "./MasterDashboardClient";

export default async function MasterDashboardPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const master = await getMasterSession();
  if (!master) {
    redirect("/master/login");
  }

  const filter = searchParams.filter || "today";
  const bookings = await getMasterBookings(master.id, filter);
  const stats = await getMasterStats(master.id);

  return (
    <MasterDashboardClient
      masterName={master.name}
      stats={stats}
      bookings={bookings}
      filter={filter}
    />
  );
}
