import { redirect } from "next/navigation";
import { getMasterSession, getMasterSlotsForMonth } from "../actions";
import MasterSlotsClient from "./MasterSlotsClient";

export default async function MasterSlotsPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const master = await getMasterSession();
  if (!master) {
    redirect("/master/login");
  }

  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year, 10) : now.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month, 10) : now.getMonth() + 1;

  const slotsByDate = await getMasterSlotsForMonth(master.id, year, month);

  return (
    <MasterSlotsClient
      masterId={master.id}
      workDays={master.workDays}
      startTime={master.startTime}
      endTime={master.endTime}
      slotsByDate={slotsByDate}
      year={year}
      month={month}
    />
  );
}
