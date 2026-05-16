# Deploy on DigitalOcean with Docker Compose

This guide deploys the API, MySQL, Kafka, worker, and Nginx on one Ubuntu Droplet.

## 1. Create a Droplet

Use Ubuntu LTS. Choose at least 2 GB RAM; 4 GB is more comfortable because Kafka is memory-hungry.

Open these firewall ports:

- `22` for SSH
- `80` for HTTP
- `443` later if you add SSL

## 2. SSH into the Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## 3. Install Docker

```bash
apt update
apt install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Clone the project

```bash
git clone YOUR_GITHUB_REPO_URL
cd Job-Schedular-System
```

## 5. Create production environment file

```bash
cp .env.production.example .env.production
nano .env.production
```

Change every placeholder value. Keep database passwords simple enough for a URL, or URL-encode special characters.

## 6. Build and start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Check containers:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Check logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```

The API log should show:

```txt
Server running on http://0.0.0.0:8080
```

## 7. Test from the Droplet

```bash
curl http://localhost/
```

Expected:

```json
{"message":"Job Scheduler with Kafka - Ready for millions users!"}
```

## 8. Test from your laptop

```bash
curl http://YOUR_DROPLET_IP/
```

If this fails, check the DigitalOcean cloud firewall and Ubuntu firewall.

## 9. Update deployment later

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## Useful Commands

API logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
```

Worker logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f worker
```

Stop everything:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
```

Stop and delete database volume:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down -v
```

