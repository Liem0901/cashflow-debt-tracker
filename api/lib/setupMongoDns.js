import dns from 'node:dns';

/** Some routers refuse SRV queries from Node; public DNS resolves Atlas SRV records. */
export function setupMongoDns(uri) {
  if (!uri?.startsWith('mongodb+srv://')) return;

  const servers = process.env.DNS_SERVERS?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  dns.setServers(servers?.length ? servers : ['8.8.8.8', '1.1.1.1']);
}
