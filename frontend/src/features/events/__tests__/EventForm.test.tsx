import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventForm } from '../ui/EventForm';

vi.mock('@/features/entities/api/entities.api', () => ({
  getEntities: vi.fn().mockResolvedValue({
    data: [
      { id: 1, name: 'Death Star', status: 'active' },
      { id: 2, name: 'Echo Base', status: 'suspended' },
    ],
    meta: { total: 2, page: 1, limit: 100, pages: 1 },
  }),
}));

vi.mock('../api/events.api', () => ({
  registerEvent: vi.fn(),
}));

import { registerEvent } from '../api/events.api';
import { HttpError } from '@/shared/lib/http';

const mockRegisterEvent = registerEvent as ReturnType<typeof vi.fn>;

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('option', { name: /death star/i });

  await user.selectOptions(screen.getByRole('combobox', { name: /entity/i }), '1');

  await user.type(screen.getByPlaceholderText(/unique event identifier/i), 'ext-test-1');

  await user.selectOptions(screen.getByRole('combobox', { name: /severity/i }), 'critical');
}

describe('EventForm', () => {
  beforeEach(() => {
    mockRegisterEvent.mockReset();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<EventForm />);

    await screen.findByRole('button', { name: /submit event/i });
    await user.click(screen.getByRole('button', { name: /submit event/i }));

    await waitFor(() => {
      expect(screen.getByText(/select an entity/i)).toBeInTheDocument();
    });
  });

  it('shows success message on 201', async () => {
    const user = userEvent.setup();
    mockRegisterEvent.mockResolvedValue({
      id: 1,
      entity_id: 1,
      external_id: 'ext-test-1',
      type: 'critical',
      payload: {},
      created_at: new Date().toISOString(),
    });

    render(<EventForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /submit event/i }));

    await waitFor(() => {
      expect(screen.getByText(/event registered successfully/i)).toBeInTheDocument();
    });
  });

  it('shows duplicate message on idempotent response', async () => {
    const user = userEvent.setup();
    mockRegisterEvent.mockResolvedValue({
      id: 1,
      entity_id: 1,
      external_id: 'ext-test-1',
      type: 'critical',
      payload: {},
      created_at: new Date().toISOString(),
      idempotent: true,
    });

    render(<EventForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /submit event/i }));

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });

  it('shows suspension error on 422 entity_suspended', async () => {
    const user = userEvent.setup();
    mockRegisterEvent.mockRejectedValue(
      new HttpError(422, 'entity_suspended', 'Entity is suspended'),
    );

    render(<EventForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /submit event/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/suspended and cannot accept events/i),
      ).toBeInTheDocument();
    });
  });

  it('shows generic error on unknown failure', async () => {
    const user = userEvent.setup();
    mockRegisterEvent.mockRejectedValue(
      new HttpError(500, 'internal_error', 'Something went wrong'),
    );

    render(<EventForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /submit event/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
