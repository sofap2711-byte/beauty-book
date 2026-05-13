import { redirect } from "next/navigation";
import { getMasterSession } from "../actions";
import MasterDiaryClient from "./MasterDiaryClient";

export default async function MasterDiaryPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const master = await getMasterSession();
  if (!master) {
    redirect("/master/login");
  }

  const today = new Date().toISOString().split("T")[0];
  const date = searchParams.date || today;

  return (
    <MasterDiaryClient
      masterId={master.id}
      masterName={master.name}
      startTime={master.startTime}
      endTime={master.endTime}
      initialDate={date}
    />
  );
}
