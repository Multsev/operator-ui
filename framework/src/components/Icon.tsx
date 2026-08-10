import type { SVGProps } from 'react';

export type IconName = 'add' | 'remove' | 'refresh' | 'filter' | 'search' | 'settings' | 'check' | 'warning' | 'error' | 'info' | 'chevron' | 'copy' | 'external' | 'edit' | 'network' | 'log';

const paths: Record<IconName, string> = {
  add: 'M8 2v12M2 8h12', remove: 'M2 8h12', refresh: 'M13 5V2l-2 2A6 6 0 1 0 13 9',
  filter: 'M2 3h12L9 8v5l-2 1V8z', search: 'm11 11 3 3M7 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z',
  settings: 'M8 5.5A2.5 2.5 0 1 0 8 10a2.5 2.5 0 0 0 0-5Zm0-4v2m0 9v2m6.5-6.5h-2m-9 0h-2m11-4.5-1.5 1.5m-6 6-1.5 1.5m9 0L11 11m-6-6L3.5 3.5',
  check: 'm2 8 4 4 8-9', warning: 'M8 2 1 14h14L8 2Zm0 4v4m0 2v.1', error: 'M3 3l10 10M13 3 3 13',
  info: 'M8 7v5m0-8v.1', chevron: 'm5 3 5 5-5 5', copy: 'M5 5h8v9H5zM3 11H2V2h8v1', external: 'M9 2h5v5M14 2 7 9M12 8v5H3V4h5',
  edit: 'm3 11-1 3 3-1 8-8-2-2-8 8Z', network: 'M3 3h4v4H3zm6 6h4v4H9zM5 7v2h6M5 9v4h2',
  log: 'M3 2h10v12H3zM5 5h6M5 8h6m-6 3h4',
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg className="ou-icon" viewBox="0 0 16 16" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
