import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { makeInterfaces, type InterfaceRow } from '../data';

export type InterfaceProperties = { name: string; mtu: string; comment: string; enabled: boolean; arp: string; loopProtect: boolean };
type Store = { interfaces: InterfaceRow[]; properties: Record<string, InterfaceProperties>; add: () => void; updateProperties: (id: string, draft: InterfaceProperties) => void; setStatus: (ids: string[], status: InterfaceRow['status']) => void; remove: (ids: string[]) => void; refresh: () => void };
const NetworkContext = createContext<Store | null>(null);

export function NetworkStoreProvider({ children }: { children: ReactNode }) {
  const [interfaces, setInterfaces] = useState(() => makeInterfaces(10000));
  const [properties, setProperties] = useState<Record<string, InterfaceProperties>>({});
  const refresh = () => setInterfaces((current) => current.map((row, index) => index < 12 ? { ...row, rx: `${(12 + ((index * 73 + Date.now() / 1000) % 900)).toFixed(1)} KiB/s`, tx: `${(4 + ((index * 41 + Date.now() / 1000) % 700)).toFixed(1)} KiB/s` } : row));
  useEffect(() => { if (new URLSearchParams(location.search).has('freeze')) return; const timer = window.setInterval(refresh, 2000); return () => window.clearInterval(timer); }, []);
  const store = useMemo<Store>(() => ({
    interfaces, properties,
    add: () => setInterfaces((current) => [{ id: `if-new-${Date.now()}`, name: `interface-new-${current.length + 1}`, type: 'Ethernet', status: 'Disabled', address: '—', rx: '0.0 KiB/s', tx: '0.0 KiB/s' }, ...current]),
    updateProperties: (id, draft) => { setProperties((current) => ({ ...current, [id]: draft })); setInterfaces((current) => current.map((row) => row.id === id ? { ...row, name: draft.name, status: draft.enabled ? (row.status === 'Disabled' ? 'Running' : row.status) : 'Disabled' } : row)); },
    setStatus: (ids, status) => setInterfaces((current) => current.map((row) => ids.includes(row.id) ? { ...row, status } : row)),
    remove: (ids) => setInterfaces((current) => current.filter((row) => !ids.includes(row.id))), refresh,
  }), [interfaces, properties]);
  return <NetworkContext.Provider value={store}>{children}</NetworkContext.Provider>;
}

export function useNetworkStore() { const value = useContext(NetworkContext); if (!value) throw new Error('NetworkStoreProvider is missing'); return value; }
