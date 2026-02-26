import { useEffect, useState } from "react"
import { subscribeCollection } from "@/services/firestore"

export function useCollection<T>(path: string) {
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeCollection<T>(
      path,
      (items) => {
        setData(items)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [path])

  return { data, loading, error }
}
