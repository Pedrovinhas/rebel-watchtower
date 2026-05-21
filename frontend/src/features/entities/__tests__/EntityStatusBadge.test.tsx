import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntityStatusBadge } from '../ui/EntityTable';

describe('EntityStatusBadge', () => {
  it('renders "active" text for active status', () => {
    render(<EntityStatusBadge status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders "suspended" text for suspended status', () => {
    render(<EntityStatusBadge status="suspended" />);
    expect(screen.getByText('suspended')).toBeInTheDocument();
  });

  it('applies primary border class for active status', () => {
    const { container } = render(<EntityStatusBadge status="active" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/border-primary/);
  });

  it('applies error border class for suspended status', () => {
    const { container } = render(<EntityStatusBadge status="suspended" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/border-error/);
  });
});
