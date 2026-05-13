import { redirect } from "next/navigation";
import { getMasterSession } from "../actions";
import MasterLayout from "../_components/MasterLayout";
import MasterScheduleClient from "./MasterScheduleClient";

export default async function MasterSchedulePage() {
  const master = await getMasterSession();
  if (!master) {
    redirect("/master/login");
  }

  return (
    <MasterLayout masterName={master.name}>
      <MasterScheduleClient
        masterId={master.id}
        defaultStartTime={master.startTime}
        defaultEndTime={master.endTime}
        defaultWorkDays={master.workDays}
      />
    </MasterLayout>
  );
}
