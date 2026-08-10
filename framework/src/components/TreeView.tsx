import { useEffect, useMemo, useRef } from 'react';
import { SelectionModel } from '../framework';
import { DataView, type DataViewColumn } from './DataView';
import type { IconName } from './Icon';

export type TreeNode = { id: string; label: string; icon?: IconName; children?: TreeNode[] };

/** Compatibility composition. New code should use DataView mode="tree" or "tree-table" directly. */
export function TreeView({ nodes, selected, onSelect, label = 'Navigation' }: { nodes: TreeNode[]; selected: string; onSelect: (id: string) => void; label?: string }) {
  const model = useRef(new SelectionModel<string>()).current;
  const allKeys = useMemo(() => { const keys: string[] = []; const visit = (items: TreeNode[]) => items.forEach((item) => { keys.push(item.id); if (item.children) visit(item.children); }); visit(nodes); return keys; }, [nodes]);
  useEffect(() => { if (selected && !model.isSelected(selected)) model.select(selected, allKeys); }, [allKeys, model, selected]);
  const columns: DataViewColumn<TreeNode>[] = useMemo(() => [{ key: 'label', label: label, width: 250 }], [label]);
  return <DataView rows={nodes} columns={columns} mode="tree" height={Math.max(120, nodes.length * 70)} ariaLabel={label} storageKey={`tree-${label}`} selectionModel={model} getChildren={(node) => node.children} onSelectionChange={(items) => { const item = items.at(-1); if (item && item.id !== selected) onSelect(item.id); }} />;
}
