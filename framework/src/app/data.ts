export type InterfaceRow = {
  id: string; name: string; type: string; status: 'Running' | 'Disabled' | 'Warning'; address: string; rx: string; tx: string;
};

const types = ['Ethernet', 'VLAN', 'Bridge', 'Tunnel', 'Wireless'];
const addresses = ['10.10.0.1/24', '172.16.8.1/24', '192.168.40.1/24', '10.42.0.2/30', '—'];

export function makeInterfaces(count = 10000): InterfaceRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `if-${index + 1}`,
    name: index < 6 ? ['ether1-uplink', 'ether2-core', 'bridge-local', 'vlan-operations', 'wg-remote', 'wlan-service'][index] : `interface-${String(index + 1).padStart(5, '0')}`,
    type: types[index % types.length],
    status: index % 17 === 0 ? 'Warning' : index % 11 === 0 ? 'Disabled' : 'Running',
    address: addresses[index % addresses.length],
    rx: `${((index * 37) % 980) + 12}.${index % 10} KiB/s`,
    tx: `${((index * 19) % 720) + 4}.${(index + 3) % 10} KiB/s`,
  }));
}

export const logRows = Array.from({ length: 1000 }, (_, index) => ({ id: `log-${index}`, time: `12:${String(Math.floor(index / 60) % 60).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`, level: index % 19 === 0 ? 'warning' : 'info', source: ['system', 'route', 'interface', 'firewall'][index % 4], message: `State update received for object ${index + 1}` }));

export const routeRows = Array.from({ length: 240 }, (_, index) => ({ id: `route-${index}`, flags: index % 7 === 0 ? 'DAC' : index % 5 === 0 ? 'AS' : 'DA', destination: index === 0 ? '0.0.0.0/0' : `10.${index % 64}.${Math.floor(index / 64)}.0/24`, gateway: index % 4 === 0 ? 'ether1-uplink' : `10.10.0.${(index % 250) + 1}`, distance: index % 4 === 0 ? 1 : 10 + (index % 20), table: index % 9 === 0 ? 'operations' : 'main' }));
export const firewallRows = Array.from({ length: 180 }, (_, index) => ({ id: `rule-${index}`, flags: index % 13 === 0 ? 'X' : index % 5 === 0 ? 'D' : '', chain: ['input', 'forward', 'output'][index % 3], action: index % 11 === 0 ? 'drop' : index % 7 === 0 ? 'log' : 'accept', source: index % 4 === 0 ? '10.0.0.0/8' : '0.0.0.0/0', destination: index % 6 === 0 ? '192.168.40.0/24' : '0.0.0.0/0', packets: (index * 1843).toLocaleString('en-US') }));
export const userRows = ['admin', 'operator', 'monitor', 'automation', 'audit'].map((name, index) => ({ id: `user-${index}`, flags: index === 3 ? 'D' : '', name, group: ['full', 'write', 'read', 'api', 'read'][index], lastSeen: index === 0 ? 'active' : `${index * 12} min ago`, address: index < 2 ? '10.10.0.24' : '—' }));
export const fileRows = Array.from({ length: 70 }, (_, index) => ({ id: `file-${index}`, flags: index % 17 === 0 ? 'D' : '', name: index < 4 ? ['config', 'backup-2026-08-10.backup', 'support.rif', 'flash'][index] : `export-${String(index).padStart(3, '0')}.rsc`, type: index % 11 === 0 ? 'directory' : index % 7 === 0 ? 'backup' : 'script', size: index % 11 === 0 ? '—' : `${(index * 13 + 4)} KiB`, modified: `Aug 10 ${String(8 + (index % 12)).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}` }));
