import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const openid_assoc_handle = searchParams.get("openid.assoc_handle")
  const openid_signed = searchParams.get("openid.signed")
  const openid_sig = searchParams.get("openid.sig")
  const openid_mode = searchParams.get("openid.mode")
  const openid_ns = searchParams.get("openid.ns")
  const openid_op_endpoint = searchParams.get("openid.op_endpoint")
  const openid_claimed_id = searchParams.get("openid.claimed_id")
  const openid_identity = searchParams.get("openid.identity")
  const openid_return_to = searchParams.get("openid.return_to")
  const openid_response_nonce = searchParams.get("openid.response_nonce")

  if (openid_mode === "cancel") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!openid_claimed_id) {
    return NextResponse.json({ error: "OpenID claimed ID not found" }, { status: 400 })
  }

  // Extract SteamID from claimed_id
  const steamIdMatch = openid_claimed_id.match(
    /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/,
  )
  if (!steamIdMatch || !steamIdMatch[1]) {
    return NextResponse.json({ error: "Invalid SteamID format" }, { status: 400 })
  }
  const steamId = steamIdMatch[1]

  // Verify the OpenID response
  const verificationParams = new URLSearchParams()
  verificationParams.append("openid.assoc_handle", openid_assoc_handle || "")
  verificationParams.append("openid.signed", openid_signed || "")
  verificationParams.append("openid.sig", openid_sig || "")
  verificationParams.append("openid.mode", "check_authentication")
  verificationParams.append("openid.ns", openid_ns || "")
  verificationParams.append("openid.op_endpoint", openid_op_endpoint || "")
  verificationParams.append("openid.claimed_id", openid_claimed_id || "")
  verificationParams.append("openid.identity", openid_identity || "")
  verificationParams.append("openid.return_to", openid_return_to || "")
  verificationParams.append("openid.response_nonce", openid_response_nonce || "")

  try {
    const verificationResponse = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verificationParams.toString(),
    })

    const verificationText = await verificationResponse.text()

    if (verificationText.includes("is_valid:true")) {
      // Authentication successful, set cookie and redirect
      cookies().set("steamId", steamId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
      return NextResponse.redirect(new URL("/", request.url))
    } else {
      return NextResponse.json({ error: "Steam authentication failed" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error during Steam authentication callback:", error)
    return NextResponse.json({ error: "Authentication failed due to server error" }, { status: 500 })
  }
}
