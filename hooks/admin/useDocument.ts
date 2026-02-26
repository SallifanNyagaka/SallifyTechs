import { useEffect, useState } from "react"
import { subscribeDocument } from "@/services/firestore"

export function useDocument<T>(path: string, id: string) {
  const [data, setData] = useState<(T & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeDocument<T>(
      path,
      id,
      (item) => {
        setData(item)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [path, id])

  return { data, loading, error }
}
