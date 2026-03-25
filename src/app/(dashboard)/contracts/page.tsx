import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContractGenerator from "@/components/contracts/contract-generator";
import type { Role } from "@/lib/types";

export default async function ContractsRoute() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Brokers cannot access contracts
  if (session.role === "broker") redirect("/dashboard");

  return (
    <ContractGenerator userRole={session.role as Role} />
  );
}
