import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const returnToUrl = new URL("/api/auth/steam/callback", request.url).toString()

  const steamLoginUrl = `https://steamcommunity.com/openid/login?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(
    returnToUrl,
  )}&openid.realm=${encodeURIComponent(
    new URL(request.url).origin,
  )}&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select`

  return NextResponse.redirect(steamLoginUrl)
}
