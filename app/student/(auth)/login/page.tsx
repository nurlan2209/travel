import { redirect } from "next/navigation";

export default function StudentLoginPage() {
  redirect("/?auth=1");
}
