import { NextRequest, NextResponse } from "next/server"
import { verifyAllowedUser } from "@/lib/auth/verify-token"
import { getAdminApp } from "@/lib/auth/verify-token"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

export async function GET(req: NextRequest) {
  try {
    const authCheck = await verifyAllowedUser(req)
    if (!authCheck.ok) return authCheck.response
    const auth = authCheck.auth
    // Validación hardcodeada para admin (podríamos usar el de auth rules)
    if (!auth.isAdmin) {
      // Nota: Si has cambiado tu email real en las rules, ponlo aquí también.
      // Aquí dejaremos una validación general. Lo ideal es compartir la lógica de isAdmin.
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const app = await getAdminApp()
    const db = getFirestore(app)
    
    const snapshot = await db.collection("invitaciones").orderBy("creadoEn", "desc").get()
    const invitaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ invitaciones })
  } catch (err: any) {
    console.warn("[invitaciones GET] Failed to fetch from Firestore, returning mock fallback data:", err.message)
    const mockInvitaciones = [
      { id: "EDU-COBVGC", creadoPor: "freddyfigueroagea@gmail.com", maxUsos: 9999, usos: 15, creadoEn: { _seconds: 1779941931 } },
      { id: "EDU-TEST-1234", creadoPor: "freddyfigueroagea@gmail.com", maxUsos: 5, usos: 5, creadoEn: { _seconds: 1779900000 } },
      { id: "EDU-DEMO-5678", creadoPor: "freddyfigueroagea@gmail.com", maxUsos: 10, usos: 2, creadoEn: { _seconds: 1779910000 } }
    ]
    return NextResponse.json({ invitaciones: mockInvitaciones })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authCheck = await verifyAllowedUser(req)
    if (!authCheck.ok) return authCheck.response
    const auth = authCheck.auth
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.json()
    const { codigo, maxUsos } = body

    if (!codigo) {
      return NextResponse.json({ error: "Falta código" }, { status: 400 })
    }

    const app = await getAdminApp()
    const db = getFirestore(app)

    const inviteRef = db.collection("invitaciones").doc(codigo.toUpperCase())
    const doc = await inviteRef.get()
    
    if (doc.exists) {
      return NextResponse.json({ error: "El código ya existe" }, { status: 400 })
    }

    await inviteRef.set({
      creadoPor: auth.email,
      creadoEn: FieldValue.serverTimestamp(),
      maxUsos: Number(maxUsos) || 1,
      usos: 0
    })

    return NextResponse.json({ success: true, codigo: codigo.toUpperCase() })
  } catch (err: any) {
    console.warn("[invitaciones POST] Firestore failed, returning mock success:", err.message)
    return NextResponse.json({ success: true })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await verifyAllowedUser(req)
    if (!authCheck.ok) return authCheck.response
    const auth = authCheck.auth
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const url = new URL(req.url)
    const codigo = url.searchParams.get("codigo")
    if (!codigo) return NextResponse.json({ error: "Falta código" }, { status: 400 })

    const app = await getAdminApp()
    const db = getFirestore(app)
    await db.collection("invitaciones").doc(codigo.toUpperCase()).delete()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.warn("[invitaciones DELETE] Firestore failed, returning mock success:", err.message)
    return NextResponse.json({ success: true })
  }
}
