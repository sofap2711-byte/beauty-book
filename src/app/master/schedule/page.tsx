import { redirect } from "next/navigation";
import { getMasterSession } from "../actions";
import MasterScheduleClient from "./MasterScheduleClient";

export default async function MasterSchedulePage() {
  const master = await getMasterSession();
  if (!master) {
    redirect("/master/login");
  }

  return (
    <MasterScheduleClient
      masterId={master.id}
      initialData={{
        workDays: master.workDays,
        startTime: master.startTime,
        endTime: master.endTime,
        breakStart: master.breakStart,
        breakEnd: master.breakEnd,
      }}
    />
  );
}
