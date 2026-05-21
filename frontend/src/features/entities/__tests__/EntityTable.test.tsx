import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityTable } from '../ui/EntityTable';
import type { Entity } from '../model/types';

function makeEntity(overrides: Partial<Entity>): Entity {
  return {
    id: 1,
    name: 'Test Entity',
    status: 'active',
    critical_events_count: 0,
    total_events_count: 0,
    last_event_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('EntityTable', () => {
  it('renders entity names', () => {
    const entities = [makeEntity({ name: 'Rebel Base' })];
    render(<EntityTable entities={entities} />);
    expect(screen.getByText('Rebel Base')).toBeInTheDocument();
  });

  it('applies row-active class for active entities', () => {
    const entities = [makeEntity({ status: 'active', critical_events_count: 0 })];
    const { container } = render(<EntityTable entities={entities} />);
    const row = container.querySelector('tbody tr');
    expect(row?.className).toMatch(/row-active/);
  });

  it('applies row-suspended class for suspended entities', () => {
    const entities = [makeEntity({ status: 'suspended' })];
    const { container } = render(<EntityTable entities={entities} />);
    const row = container.querySelector('tbody tr');
    expect(row?.className).toMatch(/row-suspended/);
  });

  it('applies row-warning class for near-threshold active entities', () => {

    const entities = [makeEntity({ status: 'active', critical_events_count: 8 })];
    const { container } = render(<EntityTable entities={entities} />);
    const row = container.querySelector('tbody tr');
    expect(row?.className).toMatch(/row-warning/);
  });

  it('does not apply row-warning class for suspended near-threshold entities', () => {

    const entities = [makeEntity({ status: 'suspended', critical_events_count: 9 })];
    const { container } = render(<EntityTable entities={entities} />);
    const row = container.querySelector('tbody tr');
    expect(row?.className).toMatch(/row-suspended/);
    expect(row?.className).not.toMatch(/row-warning/);
  });

  it('renders — for null last_event_at', () => {
    const entities = [makeEntity({ last_event_at: null })];
    render(<EntityTable entities={entities} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
