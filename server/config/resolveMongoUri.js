import dns from 'node:dns';
import { promisify } from 'node:util';

const resolveSrv = promisify(dns.resolveSrv);

/** Use reliable public DNS for Atlas SRV lookups (local routers + some cloud DNS fail SRV). */
export function configureMongoDns() {
  const servers = (process.env.DNS_SERVERS?.split(',') ?? [])
    .map((entry) => entry.trim())
    .filter(Boolean);

  dns.setServers(servers.length ? servers : ['8.8.8.8', '1.1.1.1']);
}

/** @deprecated use configureMongoDns */
export function setupMongoDns(uri) {
  if (uri?.startsWith('mongodb+srv://')) {
    configureMongoDns();
  }
}

/**
 * Expand mongodb+srv:// to mongodb:// with explicit hosts.
 * Vercel's default DNS sometimes fails SRV lookups inside the MongoDB driver.
 */
export async function expandSrvUri(uri) {
  if (!uri?.startsWith('mongodb+srv://')) return uri;

  configureMongoDns();

  const withoutProtocol = uri.slice('mongodb+srv://'.length);
  const atIndex = withoutProtocol.lastIndexOf('@');
  if (atIndex === -1) return uri;

  const credentials = withoutProtocol.slice(0, atIndex);
  const rest = withoutProtocol.slice(atIndex + 1);
  const slashIndex = rest.indexOf('/');
  const hostname = slashIndex === -1 ? rest.split('?')[0] : rest.slice(0, slashIndex);
  const pathAndQuery = slashIndex === -1 ? '/cashflow' : rest.slice(slashIndex);

  const records = await resolveSrv(`_mongodb._tcp.${hostname}`);
  if (!records?.length) {
    throw new Error(`No SRV records for _mongodb._tcp.${hostname}`);
  }

  const hosts = records.map((record) => `${record.name}:${record.port}`).join(',');
  const [dbPath, queryString = ''] = pathAndQuery.split('?');
  const params = new URLSearchParams(queryString);

  if (!params.has('ssl')) params.set('ssl', 'true');
  if (!params.has('authSource')) params.set('authSource', 'admin');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');

  return `mongodb://${credentials}@${hosts}${dbPath || '/cashflow'}?${params.toString()}`;
}

export async function resolveMongoUri(uri) {
  const direct = process.env.MONGODB_URI_STANDARD?.trim();
  if (direct) return direct;

  if (uri.startsWith('mongodb+srv://')) {
    configureMongoDns();
  }

  if (uri.startsWith('mongodb+srv://') && process.env.VERCEL) {
    try {
      return await expandSrvUri(uri);
    } catch (error) {
      console.warn('SRV expand failed, using mongodb+srv URI:', error.message);
      return uri;
    }
  }

  return uri;
}
