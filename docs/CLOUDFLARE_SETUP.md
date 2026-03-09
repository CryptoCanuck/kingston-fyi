# Cloudflare Tunnel Setup Guide

Complete guide to setting up Cloudflare Tunnel for the FYI Multi-City Platform.

## Overview

Cloudflare Tunnel creates a secure, encrypted connection from your homelab to Cloudflare's edge network, eliminating the need to open firewall ports or expose your server's IP address.

### Benefits
- No open ports on your firewall
- DDoS protection
- SSL/TLS termination at edge
- Global CDN
- Zero Trust security
- Free with any Cloudflare plan

## Prerequisites

1. **Cloudflare Account** (free tier works)
2. **Domains** added to Cloudflare
   - kingston.fyi
   - ottawa.fyi
   - montreal.fyi
3. **DNS** managed by Cloudflare
4. **Docker** installed on your server

## Step-by-Step Setup

### Step 1: Access Cloudflare Zero Trust Dashboard

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/)
2. Sign in with your Cloudflare account
3. If first time, follow onboarding steps

### Step 2: Create a Tunnel

1. Navigate to **Networks** → **Tunnels**
2. Click **Create a tunnel**
3. Select **Cloudflared** as the connector
4. Name your tunnel: `fyi-multi-city`
5. Click **Save tunnel**

### Step 3: Copy Tunnel Token

After creating the tunnel, you'll see installation instructions. Look for:

```bash
cloudflared service install <YOUR_TOKEN_HERE>
```

The token is a long base64-encoded string. **Copy this entire token**.

### Step 4: Configure Environment

1. Edit `docker/.env`:
```bash
TUNNEL_TOKEN=eyJhIjoiNWE2ZDM4Y2Q...  # Paste your token here
```

2. Or set during secret generation:
```bash
./scripts/generate-secrets.sh
# Then manually edit docker/.env to add TUNNEL_TOKEN
```

### Step 5: Configure Public Hostnames

In the Cloudflare Dashboard:

1. Click on your tunnel name (`fyi-multi-city`)
2. Go to **Public Hostname** tab
3. Click **Add a public hostname**

Add these entries:

#### Kingston.FYI
- **Subdomain**: (leave empty)
- **Domain**: kingston.fyi
- **Type**: HTTP
- **URL**: `http://nextjs:3000`

Click **Additional application settings** → **HTTP Settings**:
- Enable **HTTP Host Header**: `kingston.fyi`

Save and repeat for:

#### Ottawa.FYI
- Domain: ottawa.fyi
- URL: `http://nextjs:3000`
- Host Header: `ottawa.fyi`

#### Montreal.FYI
- Domain: montreal.fyi
- URL: `http://nextjs:3000`
- Host Header: `montreal.fyi`

### Step 6: Verify DNS Records

Cloudflare automatically creates CNAME records. Verify in DNS settings:

```
Type    Name           Content
CNAME   kingston.fyi   <tunnel-id>.cfargotunnel.com
CNAME   ottawa.fyi     <tunnel-id>.cfargotunnel.com
CNAME   montreal.fyi   <tunnel-id>.cfargotunnel.com
```

### Step 7: Start Production Stack

```bash
./scripts/start-prod.sh
```

The script will:
1. Validate your TUNNEL_TOKEN
2. Start all services
3. Connect cloudflared to Cloudflare
4. Wait for services to be healthy

### Step 8: Verify Connection

In Cloudflare Dashboard:
1. Go to **Networks** → **Tunnels**
2. Your tunnel should show "Healthy" status
3. Green indicator means connected

Test your domains:
```bash
curl -I https://kingston.fyi
curl -I https://ottawa.fyi
curl -I https://montreal.fyi
```

## Advanced Configuration

### Custom Origins

If you need to route specific paths differently:

```yaml
# In Cloudflare Dashboard or config file
Subdomain: api
Domain: kingston.fyi
Service: http://supabase-kong:8000
```

### Access Control

Add Zero Trust policies:
1. Go to **Access** → **Applications**
2. Add application for admin routes
3. Configure authentication requirements

### Load Balancing

For multiple servers:
1. Create additional tunnels
2. Use Cloudflare Load Balancing
3. Route traffic across tunnels

## Troubleshooting

### Tunnel Not Connecting

Check cloudflared logs:
```bash
docker logs cloudflared
```

Common issues:
- Invalid token → Regenerate in dashboard
- Network issues → Check internet connection
- DNS not propagated → Wait 5-10 minutes

### 502 Bad Gateway

1. Verify Next.js is running:
```bash
docker ps | grep nextjs
docker logs nextjs
```

2. Check service name matches:
   - URL in Cloudflare must be `http://nextjs:3000`
   - Not `localhost` or IP address

3. Verify internal network:
```bash
docker network inspect fyi-network
```

### Wrong City Displaying

Host header not preserved:
1. In Cloudflare tunnel settings
2. Ensure "HTTP Host Header" is set
3. Or use "No TLS Verify" if needed

### SSL Certificate Errors

Usually auto-resolved by Cloudflare. If persistent:
1. Check SSL/TLS mode in Cloudflare dashboard
2. Should be "Full" or "Full (Strict)"
3. Cloudflare manages certificates automatically

## Security Best Practices

### Token Security
- Never commit TUNNEL_TOKEN to git
- Rotate token if compromised
- Use environment variables only

### Network Security
- Keep all ports internal
- Only cloudflared talks to Cloudflare
- Use Zero Trust policies for admin access

### Monitoring
- Enable Cloudflare analytics
- Monitor tunnel health
- Set up alerting for disconnections

## Alternative: Config File Method

Instead of token-based setup, you can use a configuration file:

1. Install cloudflared locally:
```bash
# macOS
brew install cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
```

2. Login to Cloudflare:
```bash
cloudflared tunnel login
```

3. Create tunnel:
```bash
cloudflared tunnel create fyi-multi-city
```

4. This creates `~/.cloudflared/<tunnel-id>.json`

5. Copy credentials to `docker/cloudflared/`

6. Update docker-compose to use config file instead of token

**Note**: Token method is simpler and recommended for most users.

## Useful Commands

```bash
# Check tunnel status (requires cloudflared CLI)
cloudflared tunnel info <tunnel-id>

# List tunnels
cloudflared tunnel list

# View tunnel logs
docker logs -f cloudflared

# Test domain resolution
dig kingston.fyi
nslookup ottawa.fyi

# Test with specific Host header
curl -H "Host: kingston.fyi" http://localhost:3000
```

## Support Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Zero Trust Dashboard](https://one.dash.cloudflare.com/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Tunnel FAQ](https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/)
