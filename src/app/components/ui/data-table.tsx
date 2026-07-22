import type { ReactNode } from "react";
import { type } from "./scale";

/* ------------------------------------------------------------------ *
 * DataTable — IBM Carbon data-table spec, Linear density.
 *   · 40px rows (dense) / 48px rows (comfortable)
 *   · sticky header
 *   · numeric + date columns right-aligned
 *   · monospace for IDs / codes
 *   · hover row highlight only — NO zebra striping
 * ------------------------------------------------------------------ */

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  mono?: boolean;
  width?: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getKey,
  onRowClick,
  density = "dense",
  empty = "No records.",
}: {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  density?: "dense" | "comfortable";
  empty?: string;
}) {
  const rowH = density === "dense" ? "h-10" : "h-12";
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-pramaan-elevated">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`h-8 border-b border-pramaan-border px-3 text-pramaan-text-secondary ${
                  c.align === "right" ? "text-right" : "text-left"
                }`}
                style={{ ...type.eyebrow, width: c.width }}
              >
                {c.header.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`${rowH} border-b border-pramaan-border/60 transition-colors hover:bg-pramaan-hover ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((c) => {
                const content = c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key];
                return (
                  <td
                    key={c.key}
                    className={`px-3 text-pramaan-text ${c.align === "right" ? "text-right" : "text-left"} ${
                      c.mono ? "tnum font-mono text-pramaan-text-secondary" : ""
                    }`}
                    style={c.mono ? type.caption : type.body}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-pramaan-text-secondary" style={type.body}>
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
