import { google } from "googleapis"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL
    )

    // Set credentials
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    })

    // Get channel statistics
    const channelResponse = await youtube.channels.list({
      part: ["statistics", "snippet"],
      mine: true,
    })

    const channel = channelResponse.data.items?.[0]
    if (!channel) {
      return new NextResponse("No channel found", { status: 404 })
    }

    // Get video statistics
    const videosResponse = await youtube.search.list({
      part: ["snippet"],
      forMine: true,
      type: ["video"],
      maxResults: 50,
    })

    // Filter out any null or undefined video IDs and ensure they are strings
    const videoIds = videosResponse.data.items
      ?.map((item) => item.id?.videoId)
      .filter((id): id is string => id !== null && id !== undefined) || []
    
    const videoStatsResponse = await youtube.videos.list({
      part: ["statistics"],
      id: videoIds,
    })

    return NextResponse.json({
      channel: {
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        statistics: channel.statistics,
      },
      videos: videoStatsResponse.data.items?.map((video) => ({
        id: video.id,
        statistics: video.statistics,
      })),
    })
  } catch (error) {
    console.error("Error fetching YouTube data:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 