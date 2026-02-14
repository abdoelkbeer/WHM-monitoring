import axios from 'axios';

export type WHMAccount = { domain: string; user: string; ip: string; plan?: string };

export async function fetchWhmAccounts(host: string, token: string) {
  const url = `https://${host}:2087/json-api/listaccts?api.version=1`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `whm root:${token}` },
    timeout: 15_000,
    validateStatus: () => true
  });

  if (!data?.data?.acct) {
    throw new Error('WHM response missing accounts');
  }

  return data.data.acct as WHMAccount[];
}
