'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEvent } from '../api/events.api';
import { createEventSchema, type CreateEventInput } from '../model/schemas';
import { HttpError } from '@/shared/lib/http';

type FormStatus = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

interface UseEventFormOptions {
  onSuccess?: () => void;
}

interface UseEventFormResult {
  form: ReturnType<typeof useForm<CreateEventInput>>;
  status: FormStatus;
  errorMessage: string | null;
  onSubmit: (data: CreateEventInput) => Promise<void>;
}

export function useEventForm({ onSuccess }: UseEventFormOptions = {}): UseEventFormResult {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { payload: '{}' },
  });

  const onSubmit = async (data: CreateEventInput) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await registerEvent({
        entity_id: data.entity_id,
        external_id: data.external_id,
        severity: data.severity,
        payload: JSON.parse(data.payload) as Record<string, unknown>,
      });

      if (result.idempotent) {
        setStatus('duplicate');
      } else {
        setStatus('success');
        form.reset();
        onSuccess?.();
      }
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.code === 'entity_suspended') {
          setStatus('error');
          setErrorMessage('This entity is suspended and cannot accept events.');
        } else if (err.status === 422) {
          setStatus('error');
          setErrorMessage(err.message);
        } else {
          setStatus('error');
          setErrorMessage(err.message);
        }
      } else {
        setStatus('error');
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  return { form, status, errorMessage, onSubmit };
}
