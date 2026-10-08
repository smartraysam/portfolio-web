import { BlogPost, BlogCategory } from '../types/blog';

/**
 * Technical Engineering Blog Posts
 * 
 * To add a new post:
 * 1. Add an object to the `blogPosts` array below with the required fields:
 *    - `slug`: unique URL-safe identifier (e.g. "building-distributed-consensus-go")
 *    - `title`, `subtitle`, `excerpt`, `publishedAt`, `readTime`
 *    - `category`, `difficulty`, `tags`
 *    - `sections`: structured sections with headings, paragraphs, code snippets, callouts, and comparison tables.
 *    - `keyTakeaways`: quick bullet points summarizing the technical core.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "multi-drm-video-streaming-aws-mediaconvert-axinom-shaka",
    title: "Building Multi-DRM Video Streaming with AWS MediaConvert, Axinom, and Shaka Player: Architecture, Gotchas, and Hard-Won Lessons",
    subtitle: "A deep dive into implementing production-grade Multi-DRM (Widevine, PlayReady, and Apple FairPlay) across DASH and HLS, the subtle pitfalls of Safari EME, and how to conquer common DRM errors.",
    excerpt: "Engineering studio-grade multi-DRM video streaming across Chrome, Safari, Edge, and iOS. From AWS MediaConvert SPEKE v2.0 key exchange with Axinom to resolving Shaka Error 4044, certificate CORS proxies, and WebKit EME polyfills.",
    publishedAt: "October 8, 2026",
    readTime: "11 min read",
    category: "Distributed Systems",
    difficulty: "Deep Dive",
    featured: true,
    tags: ["Multi-DRM", "AWS MediaConvert", "Axinom DRM", "Shaka Player", "Apple FairPlay", "Widevine", "HLS / DASH", "Video Streaming"],
    author: {
      name: "Adeseluka Toba Samuel",
      role: "Lead Distributed Systems Engineer",
      github: "https://github.com/smartraysam",
      twitter: "https://twitter.com/smartraysam"
    },
    metricsHighlight: [
      { label: "DRM Formats", value: "3 Systems", subtext: "Widevine, PlayReady & FairPlay" },
      { label: "Manifest Pipelines", value: "DASH + HLS", subtext: "CENC & SAMPLE-AES encrypted" },
      { label: "Key Exchange", value: "SPEKE v2.0", subtext: "MediaConvert to Axinom Key Service" },
      { label: "Cross-Platform", value: "100%", subtext: "Chrome, Safari, Firefox & Edge" }
    ],
    keyTakeaways: [
      "Route streams intelligently by browser capabilities: serve DASH (.mpd) with Widevine / PlayReady to Chromium, Firefox, and Edge; serve HLS (.m3u8) with FairPlay to Safari and iOS.",
      "Never enable allowCrossSiteCredentials globally in Shaka Player; scope credentials strictly to CDN manifest and segment requests so third-party DRM licensing endpoints do not fail CORS preflight checks.",
      "Always install shaka.polyfill.PatchedMediaKeysApple before initializing Shaka Player on WebKit/Safari to resolve EME demuxer and multi-key licensing initialization issues.",
      "AWS MediaConvert formats FairPlay skd URIs with both Content ID and Key ID (skd://<contentId>:<keyId>); Shaka Player's built-in FairPlay handler with serverCertificateUri handles certificate acquisition and SPC formatting cleanly.",
      "Proxy Apple FairPlay application certificates (fairplay.cer) through your Next.js backend API route to eliminate cross-origin CORS blocks when hosted on cloud storage."
    ],
    sections: [
      {
        id: "multi-drm-architecture",
        heading: "1. The Multi-DRM Goal & Architecture Overview",
        paragraphs: [
          "Delivering premium encrypted video across all modern platforms requires a Multi-DRM strategy: Widevine Modular for Google Chrome, Firefox, Android, and Android TV; PlayReady for Microsoft Edge and Windows; and FairPlay Streaming (FPS) for Apple Safari, iOS, iPadOS, and macOS.",
          "To protect content, our media pipeline encodes raw video into DASH (CENC) and HLS (SAMPLE-AES) using AWS Elemental MediaConvert, integrated with Axinom DRM Key & Licensing Service via SPEKE v2.0 (Secure Packager and Encoder Key Exchange).",
          "While the high-level architecture seems straightforward on paper, bridging cloud encoding, tokenized license issuance, CloudFront signed cookies, and client-side player execution in Shaka Player presented complex, low-level integration hurdles across browser Encrypted Media Extensions (EME)."
        ],
        callout: {
          type: "architecture",
          title: "Multi-DRM Topology Flow",
          message: "MediaConvert calls Axinom Key Service via SPEKE v2.0 during encoding to encrypt DASH (.mpd) and HLS (.m3u8) segments. At runtime, the client web app requests a playback session from the backend, receiving an AxDRM JWT entitlement token and CloudFront signed cookies. The player streams encrypted segments from CloudFront CDN and exchanges the JWT token with Axinom DRM License Server for decryption keys / Content Key Context (CKC)."
        }
      },
      {
        id: "error-4044-hls-key-length",
        heading: "2. Challenge 1: The Infamous Shaka Error 4044 (HLS_AES_128_INVALID_KEY_LENGTH)",
        paragraphs: [
          "When loading the HLS master playlist on Safari or Chrome, the player threw Shaka Error 4044 when encountering the #EXT-X-KEY tag in the HLS manifest: #EXT-X-KEY:METHOD=SAMPLE-AES,URI=\"skd://18ee480b-90a7-4c0d-85bf-334b5378bacd:6BE40FA70DD3E2972C153A920213E71E\",KEYFORMAT=\"com.apple.streamingkeydelivery\",KEYFORMATVERSIONS=\"1\",IV=0x...",
          "Root Cause: The player attempted to process the stream as clear AES-128 or unhandled clear key encryption rather than routing the initialization data to the Apple FairPlay EME (com.apple.fps) key system.",
          "Solution: Explicitly configure drm.servers[\"com.apple.fps\"] and drm.advanced[\"com.apple.fps\"]. Furthermore, direct Safari to HLS (application/x-mpegURL) and Chromium/Firefox browsers to DASH (application/dash+xml), ensuring each browser activates its native hardware DRM engine."
        ],
        callout: {
          type: "warning",
          title: "Avoid Stream Mismatches",
          message: "Attempting to feed FairPlay-encrypted HLS streams to Chromium or Widevine DASH streams to Safari triggers demuxer and key-length mismatch errors. Always perform runtime browser user-agent and MediaSource capability detection to route the proper manifest."
        }
      },
      {
        id: "skd-content-id-trap",
        heading: "3. Challenge 2: The skd:// Content ID Extraction & Licensing Trap",
        paragraphs: [
          "When requesting FairPlay licenses, Axinom's FairPlay License Server returned HTTP 400/500 errors when attempting to generate a Server Playback Context (SPC) response.",
          "Root Cause: AWS MediaConvert outputs HLS manifests formatted with both the Content ID and Key ID separated by a colon: URI=\"skd://18ee480b-90a7-4c0d-85bf-334b5378bacd:6BE40FA70DD3E2972C153A920213E71E\". When parsing the initData, if the application sends the entire combined string to the license server, the license server fails to locate the asset key because it only recognizes the base UUID (18ee480b-90a7-4c0d-85bf-334b5378bacd).",
          "Solution: Shaka Player's built-in FairPlay handler automatically trims and formats the URI if serverCertificateUri is provided in drm.advanced[\"com.apple.fps\"], eliminating messy manual regex parsing on the client."
        ],
        callout: {
          type: "insight",
          title: "SPEKE v2.0 Key ID Separation",
          message: "SPEKE v2.0 allows encoding multiple audio/video renditions with different Key IDs under a single Content ID. Always ensure your license server implementation matches your packager's Content ID formatting."
        }
      },
      {
        id: "fairplay-cert-cors-proxy",
        heading: "4. Challenge 3: Solving Certificate CORS via Next.js Server Proxy",
        paragraphs: [
          "Safari requires the Apple FairPlay Application Secret Key Certificate (fairplay.cer) to generate the licensing challenge. Fetching the .cer directly from Azure Blob Storage or Amazon S3 caused browser CORS rejection: 'Access to fetch at https://.../fairplay.cer from origin http://localhost:3000 has been blocked by CORS policy.'",
          "To solve this cleanly without complicating cloud bucket CORS headers or exposing private bucket endpoints, we implemented a dedicated Next.js Server Proxy route."
        ],
        codeSnippet: {
          language: "typescript",
          filename: "src/app/api/drm/fairplay-cert/route.ts",
          code: `import { NextResponse } from "next/server";

export async function GET() {
  const certUrl = process.env.FAIRPLAY_CERT_URL;
  if (!certUrl) {
    return new NextResponse("FairPlay Certificate URL not configured", { status: 500 });
  }

  const res = await fetch(certUrl);
  if (!res.ok) {
    return new NextResponse("Failed to fetch FairPlay Certificate", { status: res.status });
  }

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=86400", // Cache cert for 24h
    },
  });
}`
        },
        callout: {
          type: "tip",
          title: "Cache the Application Certificate",
          message: "Application certificates change very rarely (typically on annual renewals). Setting a 24-hour Cache-Control header avoids redundant upstream fetches on every video playback initialization."
        }
      },
      {
        id: "cloudfront-signed-cookies-cors",
        heading: "5. Challenge 4: CloudFront Signed Cookies vs DRM License CORS Credentials",
        paragraphs: [
          "To protect raw video segments, we use CloudFront Signed Cookies (CloudFront-Policy, CloudFront-Signature, CloudFront-Key-Pair-Id). Enabling cross-site credentials globally on the Shaka NetworkingEngine broke external DRM license requests because CORS security forbids credentials on wildcard or cross-origin third-party license endpoints.",
          "Solution: Scope allowCrossSiteCredentials strictly to media segments and manifests, and pass DRM authorization tokens as request headers instead."
        ],
        codeSnippet: {
          language: "typescript",
          filename: "player/shaka_request_filter.ts",
          code: `// ✅ CORRECT: Scoped credentials & headers filter
player.getNetworkingEngine().registerRequestFilter((type, request) => {
  // Allow signed cookies ONLY for CDN video manifests and segment chunks
  if (
    type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
    type === shaka.net.NetworkingEngine.RequestType.SEGMENT
  ) {
    request.allowCrossSiteCredentials = true;
  } else {
    // Keep credentials disabled for third-party DRM servers (prevents CORS preflight failure)
    request.allowCrossSiteCredentials = false;
  }

  // Attach DRM Entitlement Token to License Acquisition
  if (type === shaka.net.NetworkingEngine.RequestType.LICENSE && drmConfig?.token) {
    request.headers["X-AxDRM-Message"] = drmConfig.token;
  }
});`
        }
      },
      {
        id: "safari-error-3016-patched-mediakeys",
        heading: "6. Challenge 5: Safari Error 3016 & The PatchedMediaKeysApple Polyfill",
        paragraphs: [
          "On Safari, videos threw Shaka Error 3016 (DEMUXER_ERROR_COULD_NOT_PARSE / VIDEO_ERROR). Setting useNativeHlsForFairPlay: true handed playback over to Safari's native <video> tag, bypassing Shaka's request filter, which meant the required X-AxDRM-Message JWT token was never sent with the license request.",
          "Root Cause: Apple's modern WebKit EME implementation has subtle quirks with multi-key streams. Shaka Player provides a specialized polyfill—shaka.polyfill.PatchedMediaKeysApple—to standardize Apple's prefixed WebKit EME layer.",
          "Solution: Install both standard polyfills and PatchedMediaKeysApple before initializing the player, and avoid useNativeHlsForFairPlay so Shaka's Media Source Extensions (MSE) and EME pipeline manage FairPlay decryption reliably."
        ],
        codeSnippet: {
          language: "typescript",
          filename: "player/install_polyfills.ts",
          code: `import shaka from "shaka-player";

// 1. Install all standard browser polyfills
shaka.polyfill.installAll();

// 2. Explicitly install Apple FairPlay EME polyfill for WebKit
if (shaka.polyfill?.PatchedMediaKeysApple?.install) {
  shaka.polyfill.PatchedMediaKeysApple.install();
}`
        },
        callout: {
          type: "insight",
          title: "Why MSE + EME Beats Native HLS on Desktop Safari",
          message: "Using Shaka's MSE pipeline for FairPlay allows you to retain full control over network request interceptors, license header injection (X-AxDRM-Message), dynamic ABR adaptation, and custom error handling."
        }
      },
      {
        id: "hardened-player-implementation",
        heading: "7. The Final Hardened Shaka Player Implementation",
        paragraphs: [
          "Combining all the fixes together yields a robust, studio-grade video player component capable of seamlessly negotiating Widevine, PlayReady, and FairPlay across all target browsers."
        ],
        codeSnippet: {
          language: "tsx",
          filename: "src/components/VideoPlayer.tsx",
          code: `import React, { useEffect, useRef } from "react";
import shaka from "shaka-player";

interface DRMConfig {
  token?: string;
  fairplayUrl?: string;
  widevineUrl?: string;
  playreadyUrl?: string;
}

interface VideoPlayerProps {
  src: string;
  drmConfig?: DRMConfig;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, drmConfig }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Install polyfills including Apple FairPlay EME patch
    shaka.polyfill.installAll();
    if (shaka.polyfill?.PatchedMediaKeysApple?.install) {
      shaka.polyfill.PatchedMediaKeysApple.install();
    }

    const video = videoRef.current;
    if (!video || !shaka.Player.isBrowserSupported()) return;

    const player = new shaka.Player();
    player.attach(video);

    // 2. Configure DRM servers & Certificate Proxy
    player.configure({
      drm: {
        servers: {
          "com.apple.fps": drmConfig?.fairplayUrl || process.env.NEXT_PUBLIC_FAIRPLAY_URL,
          "com.widevine.alpha": drmConfig?.widevineUrl || process.env.NEXT_PUBLIC_WIDEVINE_URL,
          "com.microsoft.playready": drmConfig?.playreadyUrl || process.env.NEXT_PUBLIC_PLAYREADY_URL,
        },
        advanced: {
          "com.apple.fps": {
            serverCertificateUri: "/api/drm/fairplay-cert",
          },
        },
      },
    });

    // 3. Register Request Filters for Scoped Credentials & Token Auth
    player.getNetworkingEngine().registerRequestFilter((type, request) => {
      // Scope cookies strictly to CDN manifest and video chunks
      if (
        type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
        type === shaka.net.NetworkingEngine.RequestType.SEGMENT
      ) {
        request.allowCrossSiteCredentials = true;
      } else {
        request.allowCrossSiteCredentials = false;
      }

      // Attach DRM Entitlement Token to License Acquisition
      if (type === shaka.net.NetworkingEngine.RequestType.LICENSE && drmConfig?.token) {
        request.headers["X-AxDRM-Message"] = drmConfig.token;
      }
    });

    // 4. Load Stream with error logging
    player.load(src).catch((err) => {
      console.error("DRM Playback Error:", err);
    });

    return () => {
      player.destroy();
    };
  }, [src, drmConfig]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      className="w-full h-full rounded-xl bg-black shadow-2xl"
    />
  );
};`
        }
      },
      {
        id: "drm-developer-checklist",
        heading: "8. Summary Checklist for Multi-DRM Engineers",
        paragraphs: [
          "Here is the essential quick-reference checklist for shipping reliable Multi-DRM video streaming pipelines:"
        ],
        comparisonTable: {
          headers: ["Implementation Step", "Production Requirement", "Engineering Rationale"],
          rows: [
            ["1. Stream Routing", "Serve .mpd (DASH) to Chrome/Firefox/Edge, .m3u8 (HLS) to Safari/iOS", "Matches each browser's native hardware DRM capabilities (Widevine vs FairPlay)."],
            ["2. Polyfill Setup", "Call shaka.polyfill.PatchedMediaKeysApple.install()", "Eliminates Safari demuxer and WebKit EME initialization crashes."],
            ["3. Certificate Proxy", "Proxy .cer files through Next.js backend (/api/drm/fairplay-cert)", "Eliminates cross-origin CORS blocks on Apple FairPlay certificates."],
            ["4. Scoped Credentials", "Keep allowCrossSiteCredentials = false for DRM license URLs", "Prevents third-party licensing endpoints from rejecting CORS preflights."],
            ["5. Entitlement Headers", "Pass X-AxDRM-Message: <JWT> in Shaka LICENSE request filter", "Authenticates playback rights securely against Axinom DRM services."]
          ]
        },
        callout: {
          type: "insight",
          title: "Conclusion",
          message: "Multi-DRM implementation requires precise orchestration across encoding, token security, CDN rules, and player runtime. By understanding the EME lifecycle and configuring polyfills correctly, you can achieve smooth, studio-grade video playback across every device."
        }
      }
    ]
  },
  {
    slug: "zero-lag-live-video-streaming-aws-ivs-go",
    title: "Zero-Lag Live Video at Scale: Architecting Sub-2s Streaming with AWS IVS, Go & SQS",
    subtitle: "How we scaled Fenris to 10,000+ concurrent viewers across Africa with adaptive HLS transcoding, Tus resumable chunking, and Redis pub/sub chat backplane.",
    excerpt: "Engineering a low-latency live broadcast and DRM-protected on-demand video system over variable bandwidth cellular uplinks. From Tus resumable chunking to asynchronous MediaConvert pipelines that cut infra spend by 28%.",
    publishedAt: "September 15, 2026",
    readTime: "9 min read",
    category: "Distributed Systems",
    difficulty: "Architecture Design",
    featured: true,
    tags: ["AWS IVS", "Go (Golang)", "MediaConvert", "WebSockets", "Redis", "Distributed Systems"],
    author: {
      name: "Adeseluka Toba Samuel",
      role: "Lead Distributed Systems Engineer",
      github: "https://github.com/smartraysam",
      twitter: "https://twitter.com/smartraysam"
    },
    metricsHighlight: [
      { label: "End-to-End Latency", value: "< 1.8s", subtext: "Glass-to-glass broadcast delay" },
      { label: "Concurrent Viewers", value: "10,000+", subtext: "Stress tested under live conditions" },
      { label: "Transcoding Savings", value: "28%", subtext: "Serverless S3/SNS MediaConvert vs EC2" },
      { label: "Chat Fan-out", value: "< 85ms", subtext: "Clustered Redis pub/sub backplane" }
    ],
    keyTakeaways: [
      "Traditional HLS introduces 6-15 seconds of chunk buffer lag. AWS IVS ultra-low latency reduces this to under 2 seconds without requiring custom WebRTC SFU infrastructure.",
      "Never run dedicated FFmpeg EC2 instances for asynchronous video transcoding unless you have 24/7 100% capacity utilization; event-driven AWS MediaConvert cut monthly compute costs by 28%.",
      "For mobile upload in emerging markets with spotty 3G/4G coverage, HTTP multi-part uploads fail catastrophically. The open Tus protocol with chunk verification is non-negotiable.",
      "Scaling interactive live chat beyond 3,000 viewers requires decoupling WebSocket state from HTTP application servers via Redis Pub/Sub cluster."
    ],
    sections: [
      {
        id: "the-challenge",
        heading: "1. The Low-Latency Streaming Conundrum",
        paragraphs: [
          "Building live streaming platforms for audiences in developing markets presents a ruthless paradox: users demand the interactive immediacy of Twitch or TikTok (< 2s delay for live auctions and superchats), yet their mobile upload uplinks and viewer downlinks frequently suffer from packet jitter, sudden cell tower handovers, and bandwidth throttling.",
          "When we architected Fenris, our initial prototype relied on traditional RTMP ingest pushed to an EC2 cluster running NGINX with the RTMP-module, segmenting video into 4-second HLS chunks. The result? A glass-to-glass latency of 12 to 18 seconds. Viewers reacted to chat comments long after the host had moved on, destroying real-time monetization."
        ],
        callout: {
          type: "insight",
          title: "The Latency vs Reliability Trade-off",
          message: "WebRTC offers sub-500ms latency but struggles with massive viewer fan-out (thousands of viewers require expensive Selective Forwarding Units (SFUs) and heavy server egress). Low-Latency HLS (LL-HLS) and AWS IVS strike the sweet spot: sub-2 second latency broadcast over existing worldwide CDN edge caches."
        }
      },
      {
        id: "ingest-architecture",
        heading: "2. Ingestion Pipeline & Fault-Tolerant Mobile Uploads",
        paragraphs: [
          "For live broadcasts, broadcasters stream via RTMPS straight into AWS Interactive Video Service (IVS) ingest endpoints with strict CBR (Constant Bitrate) and 2-second keyframe intervals. But for on-demand video (VOD) replays and creator uploads, mobile connectivity failures were causing 35% of large video uploads to abort halfway.",
          "To solve this, we deployed a custom Go ingest daemon implementing the Tus.io open protocol. When a creator uploads a 2GB 4K video file, the client sends binary chunks with SHA-256 checksums and resumable offset headers. If the creator enters an elevator or switches Wi-Fi networks, the upload pauses seamlessly and resumes from the exact byte offset upon reconnection."
        ],
        codeSnippet: {
          language: "go",
          filename: "ingest/tus_resumable_handler.go",
          code: `package ingest

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"strconv"
)

// HandleResumableChunk verifies byte offsets and streams chunk to S3 staging
func (s *UploadService) HandleResumableChunk(w http.ResponseWriter, r *http.Request) {
	uploadID := r.Header.Get("Upload-Id")
	uploadOffset, err := strconv.ParseInt(r.Header.Get("Upload-Offset"), 10, 64)
	if err != nil {
		http.Error(w, "Invalid Upload-Offset header", http.StatusBadRequest)
		return
	}

	session, err := s.store.GetSession(r.Context(), uploadID)
	if err != nil || session.CurrentOffset != uploadOffset {
		// Conflict: client and server disagree on byte boundary
		w.Header().Set("Upload-Offset", strconv.FormatInt(session.CurrentOffset, 10))
		http.Error(w, "Offset mismatch, resume from server offset", http.StatusConflict)
		return
	}

	// Stream chunk directly to S3 multi-part part upload without buffering entire file in RAM
	partNumber := session.NextPartNumber()
	etag, bytesWritten, err := s.s3Uploader.StreamPart(r.Context(), session.S3UploadID, partNumber, r.Body)
	if err != nil {
		http.Error(w, "Failed writing S3 chunk", http.StatusBadGateway)
		return
	}

	// Atomically increment offset in Redis session
	session.CurrentOffset += bytesWritten
	s.store.SaveSession(r.Context(), session)

	w.Header().Set("Upload-Offset", strconv.FormatInt(session.CurrentOffset, 10))
	w.WriteHeader(http.StatusNoContent)
}`
        }
      },
      {
        id: "transcoding-economics",
        heading: "3. Cutting Transcoding Costs by 28% via Event-Driven MediaConvert",
        paragraphs: [
          "Early in production, we maintained four `c5.2xlarge` EC2 instances running automated FFmpeg transcoding workers listening on an SQS queue. Because video uploads peaked during evening hours (7 PM - 11 PM), these compute nodes sat idle or under-utilized 70% of the day, yet incurred flat monthly AWS bills exceeding $1,800.",
          "We completely removed the EC2 worker cluster in favor of serverless AWS Elemental MediaConvert orchestrated via S3 ObjectCreated events and AWS SNS. When a raw video arrives in the S3 ingest bucket, an SNS event triggers a Go Lambda that constructs a multi-bitrate HLS job specification (1080p, 720p, 480p, 360p with AES-128 DRM encryption)."
        ],
        comparisonTable: {
          headers: ["Architecture Metric", "Dedicated EC2 FFmpeg Cluster", "Serverless AWS MediaConvert (Event-Driven)"],
          rows: [
            ["Baseline Monthly Cost", "$1,840 / mo flat compute", "$0 idle cost; pay only per processed video minute"],
            ["Spike Concurrency", "Queue bottlenecks during surges", "Instantly auto-scales across 100+ parallel jobs"],
            ["Operational Overhead", "OS patching, FFmpeg security updates", "Zero maintenance serverless managed pipeline"],
            ["Total Monthly Spend", "$2,100 / mo average", "$1,510 / mo average (28% overall cost reduction)"]
          ]
        },
        callout: {
          type: "tip",
          title: "Pro-Tip: Adaptive Bitrate Ladders for Mobile",
          message: "On mobile-first audiences, do not encode 4K HLS renditions by default. Cap master playlists at 1080p @ 4.5Mbps and provide aggressive low-tier fallbacks (360p @ 400kbps, audio-only AAC @ 64kbps). This prevents video stalls when cellular signals dip to 2G/EDGE."
        }
      },
      {
        id: "chat-scaling",
        heading: "4. Scaling Interactive Chat: Clustered WebSockets & Redis Pub/Sub",
        paragraphs: [
          "A live broadcast without chat is just television. But when 5,000+ viewers flooded a single live room, our monolithic WebSocket server began dropping socket frames and heartbeats because of event-loop blocking on JSON serialization.",
          "We decoupled the WebSocket connection handlers across horizontal NestJS pods. Each pod holds client TCP socket connections, while chat room broadcasts are published to a Redis Pub/Sub channel keyed by room ID (`live:room:{roomId}:chat`)."
        ],
        codeSnippet: {
          language: "typescript",
          filename: "gateway/live_chat.gateway.ts",
          code: `import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class LiveChatGateway {
  constructor(private readonly redis: RedisService) {}

  @SubscribeMessage('send_comment')
  async handleComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; message: string; authorId: string }
  ) {
    // 1. Rate-limit message velocity per user (max 3 comments / 5 seconds)
    const allowed = await this.redis.rateLimitUser(\`chat:rate:\${payload.authorId}\`, 3, 5);
    if (!allowed) {
      client.emit('chat_error', { code: 'RATE_LIMITED', message: 'You are chatting too fast' });
      return;
    }

    // 2. Publish to Redis channel; all connected gateway pods fan-out to local room sockets
    const envelope = JSON.stringify({
      id: crypto.randomUUID(),
      ...payload,
      timestamp: Date.now()
    });

    await this.redis.pubClient.publish(\`live:room:\${payload.roomId}:chat\`, envelope);
  }
}`
        }
      },
      {
        id: "summary",
        heading: "5. Production Reflections & What's Next",
        paragraphs: [
          "Shipping live streaming is one of the most humbling distributed systems challenges because latency and buffering are visceral—users notice within 500 milliseconds if something is wrong. By choosing the right abstractions—AWS IVS for distribution, Tus for resilient ingest, and decoupled Redis pub/sub for chat—we achieved enterprise broadcast resilience on a lean cloud budget.",
          "Next up on our roadmap: implementing client-side WebAssembly video pre-processors to generate instant animated previews before uploads even hit the network."
        ]
      }
    ]
  },
  {
    slug: "pgvector-vs-dedicated-vector-db-multi-tenant-saas",
    title: "PgVector vs Dedicated Vector DBs: Designing Multi-Tenant RAG at Sub-200ms",
    subtitle: "Why we abandoned Pinecone and integrated pgvector directly into PostgreSQL for SellersPro AI Sales Reps.",
    excerpt: "A deep dive into why standalone vector databases introduce painful synchronization lag, dual-authorization complexity, and unnecessary costs in multi-tenant SaaS—and how PostgreSQL with pgvector HNSW indexing solved it.",
    publishedAt: "August 28, 2026",
    readTime: "8 min read",
    category: "AI & LLMs",
    difficulty: "Deep Dive",
    featured: true,
    tags: ["PgVector", "PostgreSQL", "RAG", "OpenAI", "Multi-Tenancy", "TypeScript"],
    author: {
      name: "Adeseluka Toba Samuel",
      role: "Lead Systems & AI Engineer",
      github: "https://github.com/smartraysam",
      twitter: "https://twitter.com/smartraysam"
    },
    metricsHighlight: [
      { label: "Vector Search p95", value: "< 24ms", subtext: "Cosine distance with merchant tenant filters" },
      { label: "Inventory Sync Delay", value: "0ms", subtext: "Immediate ACID transactional consistency" },
      { label: "Hallucination Rate", value: "< 0.2%", subtext: "Strict schema grounding & stock checks" },
      { label: "Database Stack", value: "Single PG", subtext: "Zero external SaaS vector DB subscriptions" }
    ],
    keyTakeaways: [
      "Running a separate standalone vector database (Pinecone, Qdrant, Milvus) introduces the dreaded Dual-Write Problem: updating product inventory in PostgreSQL while syncing embeddings to an external vector DB inevitably leads to stale out-of-stock AI recommendations.",
      "PostgreSQL's pgvector extension with Hierarchical Navigable Small World (HNSW) indexing achieves sub-25ms query latency on hundreds of thousands of vectors while staying inside the same ACID transaction.",
      "Multi-tenant data isolation is trivial in Postgres: index on `(merchant_id, embedding vector_cosine_ops)` to ensure vectors from one merchant never leak to another tenant.",
      "Grounding LLM prompts with exact stock counts and structured function-calling payloads drops AI hallucinations from 7.4% down to under 0.2%."
    ],
    sections: [
      {
        id: "the-dual-write-trap",
        heading: "1. The Multi-Tenant Vector Database Trap",
        paragraphs: [
          "When we began architecting the autonomous AI Sales Representative for SellersPro—a SaaS platform where independent Nigerian merchants sell fashion, electronics, and groceries—every tutorial and blog post recommended the same pattern: keep relational data in PostgreSQL, and push product embeddings to a cloud vector database like Pinecone.",
          "Within three weeks of staging testing, this pattern broke down under real merchant usage. A merchant would update an iPhone from 'In Stock (Qty: 2)' to 'Sold Out (Qty: 0)'. If the background webhook syncing vectors to Pinecone delayed by even 90 seconds, the AI sales agent would enthusiastically negotiate a price with a customer and recommend an item that could no longer be fulfilled.",
          "Worse, Pinecone's multi-tenancy model required managing thousands of metadata namespaces or metadata filter expressions that degraded query speeds and complicated our data migration tooling."
        ],
        callout: {
          type: "warning",
          title: "The Dual-Write Problem in AI Applications",
          message: "Whenever your application updates state in two disjoint data stores without two-phase commit, one will eventually fail or lag behind the other. In e-commerce, eventual consistency on product availability destroys buyer trust."
        }
      },
      {
        id: "pgvector-hnsw-architecture",
        heading: "2. Consolidating into PostgreSQL with pgvector",
        paragraphs: [
          "We eliminated the external vector database entirely and enabled the `pgvector` extension directly inside our primary PostgreSQL instance. Product titles, descriptions, categories, pricing, stock levels, and their 1536-dimensional OpenAI `text-embedding-3-small` embeddings now live in the exact same table row.",
          "When a merchant updates a product title or toggles inventory, the database transaction updates both the relational columns and the vector column atomically. Stale embeddings are mathematically impossible."
        ],
        codeSnippet: {
          language: "sql",
          filename: "db/migrations/004_create_product_embeddings.sql",
          code: `-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Product catalog with vector embeddings column
CREATE TABLE merchant_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price_cents INT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT NOT NULL DEFAULT 0,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW Index for ultra-fast approximate nearest neighbor cosine search
CREATE INDEX idx_products_hnsw_cosine 
ON merchant_products 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Composite B-tree index for instant tenant filtering
CREATE INDEX idx_products_merchant_stock 
ON merchant_products (merchant_id, in_stock);`
        }
      },
      {
        id: "rag-retrieval-query",
        heading: "3. Sub-25ms Tenant-Isolated RAG Retrieval",
        paragraphs: [
          "When a prospective buyer asks the storefront AI sales widget: *'Do you have any blue linen shirts in size Large under 35,000 Naira that can ship today?'*, the Next.js API route generates an embedding for the user prompt and queries PostgreSQL directly.",
          "Notice how easily we combine relational filters (`merchant_id = $1`, `in_stock = true`, `price_cents <= 3500000`) with vector cosine similarity (`1 - (embedding <=> $queryVector)`) in a single query execution plan:"
        ],
        codeSnippet: {
          language: "typescript",
          filename: "lib/ai/retrieve_context.ts",
          code: `import { sql } from '@/lib/db';
import { generateEmbedding } from '@/lib/ai/openai';

export interface RetrievedProduct {
  id: string;
  title: string;
  priceCents: number;
  stockQuantity: number;
  similarity: number;
}

export async function retrieveRelevantProducts(
  merchantId: string,
  userQuery: string,
  maxBudget?: number
): Promise<RetrievedProduct[]> {
  // 1. Generate normalized 1536-dim embedding vector
  const queryVector = await generateEmbedding(userQuery);

  // 2. Query Postgres with strict tenant isolation and cosine similarity rank
  const vectorStr = \`[\${queryVector.join(',')}]\`;

  const results = await sql<RetrievedProduct[]>\`
    SELECT 
      id,
      title,
      price_cents AS "priceCents",
      stock_quantity AS "stockQuantity",
      1 - (embedding <=> \${vectorStr}::vector) AS similarity
    FROM merchant_products
    WHERE merchant_id = \${merchantId}
      AND in_stock = true
      AND stock_quantity > 0
      \${maxBudget ? sql\`AND price_cents <= \${maxBudget * 100}\` : sql\`\`}
    ORDER BY embedding <=> \${vectorStr}::vector ASC
    LIMIT 6;
  \`;

  return results;
}`
        }
      },
      {
        id: "hallucination-elimination",
        heading: "4. Eliminating Hallucinations with Structured Tool Calling",
        paragraphs: [
          "Retrieving the right vector chunks is only half the battle. If you feed those chunks into an LLM and ask it to respond in free-form prose, it will occasionally invent return policies or promise discounts the merchant never authorized.",
          "We constrained the AI sales agent using OpenAI structured outputs and function calling. The model is forbidden from answering availability questions without citing the exact database `product_id` returned by the retrieval stage."
        ],
        callout: {
          type: "tip",
          title: "Architecture Rule: Treat LLMs as Compute, Not State",
          message: "Never trust an LLM to remember stock levels, prices, or shipping rates across conversational turns. Always re-fetch live state and enforce JSON schema responses."
        }
      },
      {
        id: "conclusion",
        heading: "5. Key Takeaways & Recommendations",
        paragraphs: [
          "For 95% of web applications and SaaS platforms, adding a dedicated vector database before saturating PostgreSQL is premature optimization that creates operational debt.",
          "With pgvector's HNSW index, PostgreSQL easily handles millions of vectors with sub-30ms retrieval, zero data duplication, standard SQL migrations, and the full power of PostgreSQL security and backup tooling."
        ]
      }
    ]
  },
  {
    slug: "bulletproof-payment-webhooks-idempotency-redis-paystack",
    title: "Event-Driven Financial Ledgers: Building Bulletproof Webhook Pipelines with Paystack & Redis",
    subtitle: "Guaranteeing exactly-once order settlement, handling network timeouts, and preventing double-credits across distributed payment gateways.",
    excerpt: "In distributed payments, duplicate webhooks and network retries are a certainty, not an exception. Here is how we engineered atomic idempotency locks and double-entry ledgers for resQ360 and SellersPro.",
    publishedAt: "July 19, 2026",
    readTime: "7 min read",
    category: "Full-Stack",
    difficulty: "Practical Guide",
    tags: ["Fintech", "Redis", "Paystack", "Webhooks", "PostgreSQL", "Transactions"],
    author: {
      name: "Adeseluka Toba Samuel",
      role: "Lead Distributed Systems Engineer",
      github: "https://github.com/smartraysam",
      twitter: "https://twitter.com/smartraysam"
    },
    metricsHighlight: [
      { label: "Duplicate Charges", value: "0.00%", subtext: "Over 50,000+ real transactions processed" },
      { label: "Lock Acquisition", value: "< 2ms", subtext: "Atomic Redis SETNX with automatic TTL" },
      { label: "Reconciliation", value: "Real-time", subtext: "Double-entry accounting journal entries" },
      { label: "Webhook Ack", value: "< 150ms", subtext: "Immediate HTTP 200 with async job queue" }
    ],
    keyTakeaways: [
      "Payment gateway webhook retry loops (e.g. Paystack, Stripe) will hammer your API endpoints during network jitter. If your webhook handler is not strictly idempotent, you will double-credit merchant balances or dispatch duplicate emergency responders.",
      "Acquire an atomic distributed lock in Redis using `SET key value NX EX 30` before executing any ledger write. If the lock is already taken, safely return HTTP 200 to acknowledge delivery.",
      "Never process heavy business logic synchronously inside the webhook HTTP handler. Verify the cryptographic HMAC signature, push the event to a reliable queue (BullMQ / SQS), and respond with HTTP 200 immediately.",
      "Maintain an immutable double-entry ledger in PostgreSQL. Never execute `UPDATE accounts SET balance = balance + 5000`; always insert debit and credit journal lines with a balance constraint."
    ],
    sections: [
      {
        id: "the-webhook-problem",
        heading: "1. The Anatomy of a Webhook Race Condition",
        paragraphs: [
          "When a customer pays for an emergency medical dispatch on resQ360 or buys goods on SellersPro, Paystack dispatches a `charge.success` HTTP POST request to our webhook URL.",
          "Now imagine this scenario: Paystack sends the webhook. Your server receives it and starts writing the database transaction. But right before your server returns the `HTTP 200 OK` header, a transient network packet drop causes the connection to time out on Paystack's end.",
          "According to standard webhook contract specifications, Paystack assumes the request failed and immediately retries 4 seconds later. If your handler blindly creates an order and credits a wallet, you just credited the user twice for a single payment."
        ],
        callout: {
          type: "warning",
          title: "The Golden Rule of Payment Webhooks",
          message: "Assume every payment event will be delivered at least twice, occasionally out of order, and sometimes 6 hours late."
        }
      },
      {
        id: "atomic-redis-locks",
        heading: "2. Distributed Idempotency via Redis SETNX",
        paragraphs: [
          "To guarantee exactly-once processing, we implement an atomic distributed lock in Redis before touching any relational database row. We key the lock by the unique payment reference (`evt:lock:{reference}`) using the atomic `SET ... NX EX` command.",
          "If two webhook attempts arrive concurrently at two different Node.js pods, only the first pod will acquire the lock; the second pod will receive a `null` response and safely exit without duplicate side effects."
        ],
        codeSnippet: {
          language: "typescript",
          filename: "services/webhook_idempotency.service.ts",
          code: `import crypto from 'crypto';
import { Redis } from 'ioredis';

export class PaymentWebhookHandler {
  constructor(
    private readonly redis: Redis,
    private readonly paystackSecret: string
  ) {}

  /**
   * Validates HMAC-SHA512 signature from Paystack header
   */
  public verifySignature(rawBody: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.paystackSecret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }

  /**
   * Processes charge.success event with strict atomic idempotency
   */
  public async handleChargeSuccess(event: { reference: string; amount: number; metadata: any }) {
    const lockKey = \`lock:paystack:ref:\${event.reference}\`;
    const processedKey = \`processed:paystack:ref:\${event.reference}\`;

    // 1. Check if this reference was already completed previously
    const alreadyProcessed = await this.redis.get(processedKey);
    if (alreadyProcessed) {
      // Event was already settled in ledger; return success to stop gateway retries
      return { status: 'already_processed', reference: event.reference };
    }

    // 2. Acquire atomic distributed lock (30 second auto-expiry prevents deadlock)
    const acquired = await this.redis.set(lockKey, 'locked', 'EX', 30, 'NX');
    if (!acquired) {
      // Another worker pod is currently executing this reference
      return { status: 'in_flight_concurrent', reference: event.reference };
    }

    try {
      // 3. Execute database double-entry ledger settlement inside ACID transaction
      await this.executeLedgerSettlement(event);

      // 4. Mark permanently processed for 7 days
      await this.redis.set(processedKey, 'true', 'EX', 60 * 60 * 24 * 7);
      return { status: 'success', reference: event.reference };
    } finally {
      // Release temporary in-flight lock
      await this.redis.del(lockKey);
    }
  }

  private async executeLedgerSettlement(event: any) {
    // Write double-entry transaction to Postgres...
  }
}`
        }
      },
      {
        id: "double-entry-accounting",
        heading: "3. Never UPDATE Balance: Double-Entry Ledgers",
        paragraphs: [
          "A classic junior engineer mistake in fintech is updating balance columns directly: `UPDATE wallets SET balance = balance + 1000 WHERE user_id = '...'`. If an audit is requested, you have no way to prove where that money came from or why.",
          "In both resQ360 and SellersPro, balances are computed views over an append-only ledger. Every financial movement generates two balancing entries: a Debit to an Asset account and a Credit to a Liability/Revenue account."
        ],
        callout: {
          type: "insight",
          title: "Double-Entry Invariant",
          message: "Sum of all Debits must equal Sum of all Credits across the entire ledger at all times. A database constraint verifying this invariant on every batch commit makes ghost money mathematically impossible."
        }
      },
      {
        id: "summary",
        heading: "4. Summary Checklist for Production Webhooks",
        paragraphs: [
          "Before shipping any financial webhook to production, verify:",
          "1. Is the HMAC secret validated using constant-time string comparison (`timingSafeEqual`) to prevent timing attacks?",
          "2. Does the endpoint respond in under 200ms so the gateway doesn't trigger timeouts?",
          "3. Are distributed locks acquired atomically before checking database state?",
          "4. Is every ledger action recorded in an immutable journal table?"
        ]
      }
    ]
  },
  {
    slug: "debugging-gnome-memory-leaks-gjs-linux",
    title: "Eliminating Memory Leaks in GNOME Shell Compositor Extensions: C-Pointer Lifecycles in GJS",
    subtitle: "How we diagnosed and fixed compositor RAM bloat for the HP Dev One Linux developer workstation (planned to reach 50,000+ developer machines before device discontinuation by HP).",
    excerpt: "Deep dive into debugging the GNOME Shell Mutter compositor, tracing circular C-pointer bindings in GJS signal disconnect listeners, and shipping seamless OTA Debian package updates.",
    publishedAt: "June 04, 2026",
    readTime: "7 min read",
    category: "Linux & Systems",
    difficulty: "Post-Mortem",
    tags: ["Linux", "GNOME Shell", "C / C++", "JavaScript (GJS)", "Operating Systems", "Debian"],
    author: {
      name: "Adeseluka Toba Samuel",
      role: "Systems & Linux Engineer (ex-HP Dev One)",
      github: "https://github.com/smartraysam",
      twitter: "https://twitter.com/smartraysam"
    },
    metricsHighlight: [
      { label: "Target Reach", value: "50,000+", subtext: "Planned to reach (Device discontinued by HP)" },
      { label: "Compositor Uptime", value: "Weeks", subtext: "Zero memory growth across continuous use" },
      { label: "RAM Overhead", value: "0.0 MB", subtext: "Embedded in Mutter compositor thread" },
      { label: "Distribution", value: "OTA Deb", subtext: "Automated APT repository updates" }
    ],
    keyTakeaways: [
      "GNOME Shell runs an embedded SpiderMonkey JavaScript engine (GJS) that bridges JavaScript objects to native C GObject libraries via GObject Introspection.",
      "Unlike pure JavaScript where the garbage collector cleans up circular closures, GJS wrappers around native C GObject pointers will leak if signal handlers retain references to outer scope closures without explicit disconnects.",
      "When external monitors are plugged in or display resolution changes occur, Mutter triggers a cascade of layout signals. Uncollected closures caused GNOME Shell memory to climb from 180MB to 1.4GB over 72 hours.",
      "Explicitly storing GObject signal IDs and disconnecting them in the extension's `disable()` lifecycle hook completely eliminated the leak."
    ],
    sections: [
      {
        id: "the-hp-devone-context",
        heading: "1. The Context: Flagship Linux Hardware",
        paragraphs: [
          "During my engineering work with Hewlett-Packard (HP Inc.) on the HP Dev One—a developer-focused Linux laptop powered by Pop!_OS and AMD Ryzen 7 PRO processors that was later discontinued by HP—our team was tasked with building native desktop workflow enhancements for developer productivity.",
          "Rather than running a heavy background Electron daemon that would consume 150MB to 300MB of developer RAM just to show a few quick application shortcuts, we chose to write a native GNOME Shell extension in GJS that runs directly inside the compositor process."
        ],
        callout: {
          type: "insight",
          title: "Why Native Compositor Extensions Matter",
          message: "Writing directly into the desktop compositor yields zero process overhead and instant 60fps animations. However, because the extension executes inside the compositor thread, any memory leak or uncaught crash freezes the entire desktop graphical session."
        }
      },
      {
        id: "the-memory-leak-discovery",
        heading: "2. The 1.4GB Memory Creep Bug",
        paragraphs: [
          "During QA soak testing, power users who frequently connected their laptops to multi-monitor USB-C docking stations noticed that GNOME Shell's resident set size (RSS) steadily grew over 3 to 4 days: starting at ~180MB on fresh boot, climbing to 650MB after a day of multi-monitor hotplugs, and occasionally surpassing 1.4GB, causing noticeable frame stutters.",
          "Using Linux kernel memory profilers and GJS heap inspector tools, we traced the leak to our display change listener. Every time an external 4K monitor was connected or disconnected, Mutter emitted a `monitors-changed` signal. Our extension registered a callback, but the callback closed over a UI container widget that held references back to the GObject signal emitter, preventing SpiderMonkey and GObject reference counting from releasing the allocation."
        ],
        codeSnippet: {
          language: "javascript",
          filename: "extensions/hpdevone-shortcuts/extension.js",
          code: `// --- THE BUGGY CODE (Leaked C-pointer GObject wrappers) ---
class BadShortcutManager {
  enable() {
    this._container = new St.BoxLayout();
    
    // Leaks: signal listener closure retains reference to this._container
    // Even if disabled, the GObject binding in Mutter never decrements ref count
    Main.layoutManager.connect('monitors-changed', () => {
      this._rebuildLauncherUI(this._container);
    });
  }
}

// --- THE FIXED PRODUCTION CODE ---
class BulletproofShortcutManager {
  enable() {
    this._container = new St.BoxLayout();
    this._signalIds = [];

    // Store signal connection ID explicitly
    const id = Main.layoutManager.connect('monitors-changed', this._onMonitorsChanged.bind(this));
    this._signalIds.push({ emitter: Main.layoutManager, id });
  }

  _onMonitorsChanged() {
    if (!this._container) return;
    this._rebuildLauncherUI();
  }

  disable() {
    // 1. Explicitly disconnect all native GObject signals
    for (const { emitter, id } of this._signalIds) {
      if (emitter && id) {
        emitter.disconnect(id);
      }
    }
    this._signalIds = [];

    // 2. Destroy UI widgets and nullify all references to break circular GC chains
    if (this._container) {
      this._container.destroy();
      this._container = null;
    }
  }
}`
        }
      },
      {
        id: "testing-and-deployment",
        heading: "3. Verification & Over-The-Air Debian Distribution",
        paragraphs: [
          "To prove the fix was rock-solid, we automated display hotplug simulation scripts using `xrandr` and Wayland virtual display drivers, cycling resolutions 5,000 times consecutively over a 12-hour automated test harness.",
          "Compositor RSS remained completely flat at 178MB +/- 4MB across all 5,000 cycles. We signed the updated package and deployed it via HP's automated Debian APT repository pipeline, planned to reach 50,000+ developer machines before the hardware line was discontinued by HP."
        ],
        callout: {
          type: "tip",
          title: "Key Takeaway for Native Desktop Engineering",
          message: "Whenever JavaScript interfaces with native C/C++ runtimes (whether in GJS, Node.js N-API addons, or React Native TurboModules), remember that garbage collectors cannot see unmanaged C allocations. Always provide explicit lifecycle teardown."
        }
      }
    ]
  }
];

// Helper functions for consuming blog data
export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getAllCategories(): BlogCategory[] {
  const categories = new Set<BlogCategory>();
  blogPosts.forEach((post) => categories.add(post.category));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
}
