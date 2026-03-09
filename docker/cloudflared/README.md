# Cloudflare Tunnel Setup Guide

This guide walks you through setting up a Cloudflare Tunnel to securely expose your FYI Multi-City application to the internet without opening any ports on your firewall.

## Prerequisites

- Cloudflare account (free tier works)
- Domain(s) added to Cloudflare (kingston.fyi, ottawa.fyi, montreal.fyi)
- DNS managed by Cloudflare

## Overview

Cloudflare Tunnel creates a secure, encrypted connection from your homelab to Cloudflare's edge network. Benefits:
- No open ports on your firewall
- DDoS protection
- SSL/TLS handled by Cloudflare
- Traffic is encrypted end-to-end

## Setup Steps

### Step 1: Install Cloudflare Tunnel (Dashboard Method - Recommended)

1. Log in to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Tunnels**
3. Click **Create a tunnel**
4. Choose **Cloudflared** as connector type
5. Name your tunnel (e.g., `fyi-multi-city`)
6. Click **Save tunnel**

### Step 2: Get Your Tunnel Token

After creating the tunnel, Cloudflare will display a command like:

```bash
cloudflared service install <YOUR_TUNNEL_TOKEN>
```

Copy the `<YOUR_TUNNEL_TOKEN>` value. This is a long base64 string.

### Step 3: Configure Environment Variable

Add the token to your Docker environment:

```bash
# In docker/.env file
TUNNEL_TOKEN=<YOUR_TUNNEL_TOKEN>
```

### Step 4: Configure Public Hostnames in Cloudflare Dashboard

In the Cloudflare Dashboard, configure public hostnames for your tunnel:

1. Click on your tunnel name
2. Go to **Public Hostname** tab
3. Add the following entries:

| Subdomain | Domain       | Type | URL                  |
|-----------|--------------|------|----------------------|
| (empty)   | kingston.fyi | HTTP | http://nextjs:3000   |
| (empty)   | ottawa.fyi   | HTTP | http://nextjs:3000   |
| (empty)   | montreal.fyi | HTTP | http://nextjs:3000   |

**Important Settings:**
- Service Type: HTTP
- URL: `http://nextjs:3000` (Docker service name)
- Enable "HTTP Host Header" option if available
- Set the Host Header to match the domain (e.g., `kingston.fyi`)

### Step 5: Verify DNS Records

Cloudflare automatically creates CNAME records pointing to your tunnel. Verify in DNS settings:

```
kingston.fyi  CNAME  <tunnel-id>.cfargotunnel.com
ottawa.fyi    CNAME  <tunnel-id>.cfargotunnel.com
montreal.fyi  CNAME  <tunnel-id>.cfargotunnel.com
```

### Step 6: Start Your Stack

```bash
./scripts/start-dev.sh
# or
./scripts/start-prod.sh
```

The cloudflared container will automatically connect to Cloudflare.

## Configuration File (Alternative Method)

If you prefer using a configuration file instead of the dashboard:

1. Place `config.yml` in this directory
2. Create tunnel manually:
   ```bash
   cloudflared tunnel create fyi-multi-city
   ```
3. This creates a credentials file (keep it secure!)
4. Update `config.yml` with your TUNNEL_ID
5. Mount the config in docker-compose

See `config.yml` in this directory for the template.

## Troubleshooting

### Tunnel Not Connecting

```bash
# Check cloudflared logs
docker logs cloudflared

# Verify token is set
docker exec cloudflared printenv TUNNEL_TOKEN | head -c 20
```

### Domain Not Resolving

- Check DNS propagation: `dig kingston.fyi`
- Verify CNAME record exists in Cloudflare DNS
- Ensure tunnel is "Healthy" in Cloudflare Dashboard

### 502 Bad Gateway

- Ensure Next.js container is running: `docker ps`
- Check internal network connectivity
- Verify service name is `nextjs` in docker-compose
- Check Next.js is listening on port 3000

### Wrong City Displaying

- Verify Host header preservation in tunnel config
- Check middleware is reading correct header
- Test with curl:
  ```bash
  curl -H "Host: ottawa.fyi" http://localhost:3000
  ```

## Security Notes

1. **Keep TUNNEL_TOKEN secure** - Anyone with this token can route traffic
2. **Never commit** `.env` file with token to git
3. **Rotate tokens** if compromised via Cloudflare Dashboard
4. **Monitor tunnel** in Zero Trust Dashboard for suspicious activity

## Additional Resources

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Zero Trust Dashboard](https://one.dash.cloudflare.com/)
- [Tunnel FAQ](https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/)
