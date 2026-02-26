"use client"

import React, { useEffect, useRef, useState } from "react"

type Column<T> = { header: string; accessor: (row: T) => React.ReactNode }

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyLabel = "No records found.",
}: {
  columns: Column<T>[]
  data: T[]
  emptyLabel?: string
}) {
  const topScrollRef = useRef<HTMLDivElement | null>(null)
  const tableScrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollWidth, setScrollWidth] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)

  useEffect(() => {
    const element = tableScrollRef.current
    if (!element) return

    const syncSize = () => {
      setScrollWidth(element.scrollWidth)
      setClientWidth(element.clientWidth)
    }

    syncSize()

    const observer = new ResizeObserver(syncSize)
    observer.observe(element)

    return () => observer.disconnect()
  }, [data, columns.length])

  useEffect(() => {
    const top = topScrollRef.current
    const bottom = tableScrollRef.current
    if (!top || !bottom) return

    let lock = false
    const onTopScroll = () => {
      if (lock) return
      lock = true
      bottom.scrollLeft = top.scrollLeft
      lock = false
    }
    const onBottomScroll = () => {
      if (lock) return
      lock = true
      top.scrollLeft = bottom.scrollLeft
      lock = false
    }

    top.addEventListener("scroll", onTopScroll)
    bottom.addEventListener("scroll", onBottomScroll)

    return () => {
      top.removeEventListener("scroll", onTopScroll)
      bottom.removeEventListener("scroll", onBottomScroll)
    }
  }, [])

  if (!data.length) {
    return <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-section)] p-6 text-sm text-[var(--color-muted)]">{emptyLabel}</div>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-section)] shadow-sm">
      {scrollWidth > clientWidth ? (
        <div
          ref={topScrollRef}
          className="w-full overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-section-alt)]"
          aria-label="Horizontal scroll for table"
        >
          <div className="h-4" style={{ width: scrollWidth }} />
        </div>
      ) : null}

      <div ref={tableScrollRef} className="w-full overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-[var(--color-section-alt)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <tr>{columns.map((c) => <th key={c.header} className="px-4 py-3">{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-t border-[var(--color-border)]">
                {columns.map((c) => <td key={c.header} className="px-4 py-3 text-[var(--color-body)]">{c.accessor(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}