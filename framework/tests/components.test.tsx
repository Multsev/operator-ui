import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DataGrid, type GridColumn } from '../src/components/DataGrid';
import { Dialog, Tabs } from '../src/components/shell';
import { FormRow, TextField } from '../src/components/controls';

type Row = { id: string; name: string; value: number };
const rows: Row[] = Array.from({ length: 10000 }, (_, index) => ({ id: String(index), name: `Object ${index}`, value: index }));
const columns: GridColumn<Row>[] = [{ key: 'name', label: 'Name', width: 140 }, { key: 'value', label: 'Value', width: 80 }];

describe('DataGrid', () => {
  it.each([10, 100, 1000, 10000])('supports a %i-row dataset', (count) => {
    render(<DataGrid rows={rows.slice(0, count)} columns={columns} height={240} storageKey={`rows-${count}`} />);
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', String(count + 1));
  });
  it('virtualizes 10,000 rows and exposes full row count', () => {
    render(<DataGrid rows={rows} columns={columns} height={240} storageKey="test-grid" />);
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-rowcount', '10001');
    expect(screen.getAllByRole('row').length).toBeLessThan(30);
  });

  it('sorts by a column and selects with keyboard', async () => {
    const user = userEvent.setup();
    render(<DataGrid rows={rows.slice(0, 10)} columns={columns} height={200} storageKey="sort-grid" />);
    await user.click(screen.getByRole('columnheader', { name: /Name/ }).querySelector('button')!);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
    const grid = screen.getByRole('grid'); await user.click(grid); await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('row')[2]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('desktop primitives', () => {
  it('moves tabs with arrow keys', async () => {
    const user = userEvent.setup();
    function Example() { return <Tabs tabs={['General', 'Network']} active="General" onChange={() => undefined} />; }
    render(<Example />); const first = screen.getByRole('tab', { name: 'General' }); await user.click(first); await user.keyboard('{ArrowRight}'); expect(screen.getByRole('tab', { name: 'Network' })).toHaveFocus();
  });

  it('closes a dialog with Escape', async () => {
    const user = userEvent.setup(); let closed = false;
    render(<Dialog open title="Properties" onClose={() => { closed = true; }}>Body</Dialog>);
    document.querySelector<HTMLButtonElement>('.ou-window-close')!.focus();
    await user.keyboard('{Escape}'); expect(closed).toBe(true);
  });

  it('gives form controls an accessible label', () => {
    render(<FormRow label="Host" required><TextField /></FormRow>);
    expect(screen.getByRole('textbox', { name: /Host/ })).toHaveAttribute('aria-required', 'true');
  });
});
