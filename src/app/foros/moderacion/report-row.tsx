"use client";

import { useTransition } from "react";
import { updateReportStatusAction, moderateThreadAction, moderatePostAction } from "./actions";
import Link from "next/link";

export default function ReportRow({
  report,
}: {
  report: {
    id: string;
    created_at: string;
    target_type: "thread" | "post";
    target_id: string;
    reason: string;
    status: "open" | "reviewing" | "resolved" | "dismissed";
    link: string;
    title: string;
    hidden: boolean;
  };
}) {
  const [pending, startTransition] = useTransition();

  const setStatus = (status: "open" | "reviewing" | "resolved" | "dismissed") => {
    const fd = new FormData();
    fd.set("report_id", report.id);
    fd.set("status", status);
    startTransition(async () => {
      await updateReportStatusAction(fd);
    });
  };

  const toggleHide = (hide: boolean) => {
    const fd = new FormData();
    if (report.target_type === "thread") {
      fd.set("thread_id", report.target_id);
      fd.set("hide", String(hide));
      startTransition(async () => {
        await moderateThreadAction(fd);
      });
    } else {
      fd.set("post_id", report.target_id);
      fd.set("hide", String(hide));
      startTransition(async () => {
        await moderatePostAction(fd);
      });
    }
  };

  return (
    <tr className="border-b">
      <td className="p-2 whitespace-nowrap">{new Date(report.created_at).toLocaleString()}</td>
      <td className="p-2 whitespace-nowrap">
        <span className="inline-block px-2 py-0.5 rounded border text-xs">
          {report.target_type}
        </span>
      </td>
      <td className="p-2">
        <div className="text-sm">{report.reason}</div>
        <div className="text-xs text-gray-500">
          <Link className="underline" href={report.link} target="_blank">Ver: {report.title || "Contenido"}</Link>
        </div>
      </td>
      <td className="p-2">
        <select
          className="border rounded px-2 py-1 text-sm"
          defaultValue={report.status}
          disabled={pending}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="open">open</option>
          <option value="reviewing">reviewing</option>
          <option value="resolved">resolved</option>
          <option value="dismissed">dismissed</option>
        </select>
      </td>
      <td className="p-2 whitespace-nowrap">
        {report.hidden ? (
          <button
            className="px-3 py-1 rounded border text-green-700"
            disabled={pending}
            onClick={() => toggleHide(false)}
          >
            Restaurar
          </button>
        ) : (
          <button
            className="px-3 py-1 rounded border text-red-700"
            disabled={pending}
            onClick={() => toggleHide(true)}
          >
            Ocultar
          </button>
        )}
      </td>
    </tr>
  );
}
