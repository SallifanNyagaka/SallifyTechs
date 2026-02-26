import { useEffect, useState } from "react"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { firestore } from "@/lib/firebase"

type AdminRole = "admin" | "super-admin" | "editor" | "viewer" | null

function isKnownAdminEmail(email?: string | null) {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  const envEmails = String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
  const emergencyEmails = [
    "nyagakasallifan@gmail.com",
  ]
  return [...emergencyEmails, ...envEmails].includes(normalized)
}

function normalizeRole(value: unknown): AdminRole {
  const role = String(value || "").trim().toLowerCase()
  if (role === "admin") return "admin"
  if (role === "super-admin" || role === "super_admin" || role === "superadmin") return "super-admin"
  if (role === "editor") return "editor"
  if (role === "viewer") return "viewer"
  return null
}

async function resolveUserRole(uid: string, email?: string | null): Promise<AdminRole> {
  try {
    const byUid = await getDoc(doc(firestore, "users", uid))
    if (byUid.exists()) {
      const data = byUid.data() as { role?: AdminRole }
      return normalizeRole(data.role)
    }
  } catch {
    // Continue to other strategies in case rules block this path.
  }

  if (!email) return null

  try {
    const byEmailSnap = await getDocs(
      query(collection(firestore, "users"), where("email", "==", email), limit(1))
    )
    if (!byEmailSnap.empty) {
      const data = byEmailSnap.docs[0].data() as { role?: AdminRole }
      return normalizeRole(data.role)
    }
  } catch {
    // Some rules allow get by known ID but block collection queries.
  }

  // Backward-compatible fallback for installations that use fixed doc IDs.
  for (const fixedId of ["super-admin", "admin"]) {
    try {
      const fixedDoc = await getDoc(doc(firestore, "users", fixedId))
      if (!fixedDoc.exists()) continue
      const fixedData = fixedDoc.data() as { role?: AdminRole; email?: string }
      if (email && String(fixedData.email || "").toLowerCase() !== String(email).toLowerCase()) continue
      const fixedRole = normalizeRole(fixedData.role || fixedId)
      if (fixedRole) return fixedRole
    } catch {
      // Try the next fixed role document.
    }
  }

  // Last-resort fallback for environments where Firestore rules block role reads.
  if (isKnownAdminEmail(email)) return "admin"

  return null
}

export function useAuth() {
  const [user, setUser] = useState(() => auth.currentUser)
  const [role, setRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | undefined

    const syncState = async (nextUser: typeof auth.currentUser) => {
      if (!mounted) return
      setUser(nextUser)

      if (!nextUser) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const resolvedRole = await resolveUserRole(nextUser.uid, nextUser.email)
        if (!mounted) return
        setRole(resolvedRole)
      } catch {
        if (!mounted) return
        setRole(null)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    const bootstrap = async () => {
      try {
        if (typeof auth.authStateReady === "function") {
          await auth.authStateReady()
        }
      } catch {
        // Ignore and proceed with current auth state snapshot.
      }
      if (!mounted) return

      await syncState(auth.currentUser)
      if (!mounted) return

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        void syncState(nextUser)
      })
    }

    void bootstrap()

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [])

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)
  const signOutUser = logout

  return { user, role, loading, login, logout, signOutUser }
}
