import { redirect } from "next/navigation";

export default function CloseShiftPage() {
  redirect("/dashboard/sales");
}
