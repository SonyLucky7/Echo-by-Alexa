import React from "react";
import { OrderKanban } from "@/components/staff/OrderKanban";

export const metadata = {
  title: "Kitchen Live Kanban | ECHO Staff Operations",
};

export default function StaffOrdersPage() {
  return <OrderKanban />;
}
