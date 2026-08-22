export const TOOLS = [
  {
    href: "/tools/check-ssl",
    title: "Live SSL checker",
    body: "Issuer, expiry, SANs, and hostname match for a public site.",
  },
  {
    href: "/tools/decode-certificate",
    title: "SSL certificate decoder",
    body: "Read a PEM .crt locally — subject, dates, fingerprint.",
  },
  {
    href: "/tools/decode-csr",
    title: "CSR decoder",
    body: "Inspect a certificate signing request before you send it.",
  },
  {
    href: "/tools/convert",
    title: "PEM / DER / PFX converter",
    body: "Convert certificate formats in this tab. Keys never upload.",
  },
  {
    href: "/tools/validate-chain",
    title: "Certificate chain validator",
    body: "Check the trust path and spot a missing intermediate.",
  },
  {
    href: "/tools/security-headers",
    title: "HSTS & security headers checker",
    body: "See HSTS, CSP, and clickjacking headers on a live site.",
  },
  {
    href: "/tools/ssl-expiry",
    title: "Bulk SSL expiry monitor",
    body: "Check certificate days-left on several public hostnames.",
  },
  {
    href: "/tools/ct-lookup",
    title: "Certificate Transparency lookup",
    body: "See recently logged public certificates for a domain.",
  },
  {
    href: "/tools/subdomains",
    title: "Subdomain finder",
    body: "List public names from CT logs plus a short DNS guess list.",
  },
  {
    href: "/tools/nmap",
    title: "Web port check + nmap commands",
    body: "Probe 80/443/8080/8443 on a public host, then copy nmap for the rest.",
  },
  {
    href: "/tools/ssh-keygen",
    title: "SSH key generator",
    body: "Make an RSA or ECDSA key pair in the browser.",
  },
  {
    href: "/tools/openssl",
    title: "OpenSSL command cheat sheet",
    body: "Copy openssl req / x509 / pkcs12 commands.",
  },
] as const;

export const GUIDES = [
  {
    href: "/guides/self-signed-ssl-localhost",
    title: "Self-signed SSL for localhost HTTPS",
    body: "Why browsers warn, how SANs work, and how to generate a localhost certificate.",
  },
  {
    href: "/guides/chrome-err-cert-authority-invalid",
    title: "Fix NET::ERR_CERT_AUTHORITY_INVALID",
    body: "What Chrome is telling you, and the safe way to trust a lab or localhost cert.",
  },
  {
    href: "/guides/trust-self-signed-windows",
    title: "Trust a self-signed certificate on Windows",
    body: "Install a Root CA or leaf cert in the Windows certificate store.",
  },
  {
    href: "/guides/trust-self-signed-macos",
    title: "Trust a self-signed certificate on macOS",
    body: "Add a local CA to Keychain Access and mark it trusted.",
  },
  {
    href: "/guides/trust-self-signed-linux",
    title: "Trust a self-signed certificate on Linux",
    body: "Install a private CA into the system trust store on Debian, RHEL, and Arch.",
  },
  {
    href: "/guides/generate-csr-online",
    title: "Generate a CSR without sending the key",
    body: "What a certificate signing request is, and how to create one in the browser.",
  },
  {
    href: "/guides/local-certificate-authority",
    title: "Make a local CA and sign host certs",
    body: "Trust one Root CA, then issue host certificates for every internal service.",
  },
  {
    href: "/guides/mkcert-alternative",
    title: "mkcert alternative in the browser",
    body: "When mkcert is right, when a browser workshop is safer, and how the files compare.",
  },
  {
    href: "/guides/openssl-vs-online-generator",
    title: "OpenSSL vs an online certificate generator",
    body: "Use OpenSSL in CI. Use a local-in-the-tab generator when you do not want to paste a key.",
  },
] as const;

export const WORKS_WITH = [
  {
    category: "Networking & security",
    headline: "HTTPS for the box you actually manage.",
    line: "Give Cisco ASA, ISE, and IOS-XE web UIs — plus pfSense, OPNsense, UniFi, and MikroTik — a cert you minted locally, with no OpenSSL on the appliance.",
    badges: ["Cisco ASA", "Cisco ISE", "Cisco IOS-XE", "pfSense", "OPNsense", "UniFi Network", "MikroTik"],
  },
  {
    category: "Virtualization & NAS",
    headline: "Stop clicking through hypervisor warnings.",
    line: "Issue a host cert for Proxmox, ESXi/vCenter, TrueNAS, Synology, or QNAP and trust your own Root CA once.",
    badges: ["Proxmox VE", "VMware ESXi", "vCenter", "XCP-ng", "TrueNAS", "Synology DSM", "QNAP QTS"],
  },
  {
    category: "Containers",
    headline: "Ingress and registries that look finished.",
    line: "Put a SAN-correct leaf on Portainer, Rancher, NGINX/Traefik ingress, or a private Harbor registry.",
    badges: ["Portainer", "Rancher", "NGINX Ingress", "Traefik", "Docker Registry", "Harbor"],
  },
  {
    category: "CI/CD & dev tools",
    headline: "Internal Git and Jenkins without the padlock tax.",
    line: "Generate the cert GitLab, Gitea, Jenkins, or Nexus expect — key stays on your build box.",
    badges: ["Jenkins", "GitLab", "Gitea", "Nexus", "Artifactory"],
  },
  {
    category: "Monitoring",
    headline: "Dashboards should not serve a warning.",
    line: "Grafana, Prometheus, Zabbix, and Uptime Kuma sit on RFC1918 more often than not. A local CA is the right trust model.",
    badges: ["Grafana", "Prometheus", "Zabbix", "Uptime Kuma"],
  },
  {
    category: "Home automation",
    headline: "Home Assistant over HTTPS, without a public CA.",
    line: "Mint a cert for Home Assistant or Node-RED that matches the hostname you actually type.",
    badges: ["Home Assistant", "Node-RED"],
  },
  {
    category: "Storage & backup",
    headline: "Object stores and sync boxes on TLS you control.",
    line: "Nextcloud, MinIO, ownCloud, and Veeam consoles need a name that matches. Generate it here; keep the key there.",
    badges: ["MinIO", "Nextcloud", "ownCloud", "Veeam"],
  },
  {
    category: "Security & remote access",
    headline: "Vaults and VPN portals with a private PKI.",
    line: "Vaultwarden, FreeIPA, OpenVPN Access Server, and WireGuard UIs should not ship the vendor default cert forever.",
    badges: ["Vaultwarden", "Bitwarden", "FreeIPA", "OpenVPN AS", "WireGuard"],
  },
  {
    category: "Media servers",
    headline: "Jellyfin and Plex without the browser fight.",
    line: "A self-signed or CA-signed host cert for the hostname on your LAN — not a leaked key on someone else’s form.",
    badges: ["Jellyfin", "Plex", "Emby"],
  },
  {
    category: "Admin & DNS",
    headline: "The little admin UIs you open every day.",
    line: "phpMyAdmin, pgAdmin, and Pi-hole deserve HTTPS too. Two minutes, no OpenSSL.",
    badges: ["phpMyAdmin", "pgAdmin", "Pi-hole"],
  },
] as const;
