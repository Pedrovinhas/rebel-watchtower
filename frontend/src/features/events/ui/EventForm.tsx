'use client';

import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useEventForm } from '../hooks/useEventForm';
import { getEntities } from '@/features/entities/api/entities.api';
import type { Entity } from '@/features/entities/model/types';
import clsx from 'clsx';

interface EventFormProps {
  onSuccess?: () => void;
}

export function EventForm({ onSuccess }: EventFormProps = {}) {
  const { form, status, errorMessage, onSubmit } = useEventForm({ onSuccess });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  const [entities, setEntities] = useState<Entity[]>([]);

  const regenerateExternalId = () => {
    setValue('external_id', crypto.randomUUID(), { shouldValidate: true });
  };

  useEffect(() => {
    getEntities(1, 100)
      .then((res) => setEntities(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    regenerateExternalId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'success') {
      regenerateExternalId();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fieldClass =
    'w-full bg-surface-container border border-outline-variant px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary';
  const labelClass = 'block text-xs uppercase tracking-wider text-on-surface-variant mb-1.5';
  const errorClass = 'mt-1 text-xs text-error';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-surface-container-high border border-outline-variant p-6 max-w-xl"
    >
      <h2 className="text-lg font-bold text-on-surface uppercase tracking-widest mb-6">
        Register Event
      </h2>

      <label className="block mb-4">
        <span className={labelClass}>Entity</span>
        <Controller
          name="entity_id"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              className={clsx(fieldClass, 'cursor-pointer')}
            >
              <option value="">— Select entity —</option>
              {entities.map((e) => (
                <option key={e.id} value={e.id} disabled={e.status === 'suspended'}>
                  {e.name}
                  {e.status === 'suspended' ? ' (suspended)' : ''}
                </option>
              ))}
            </select>
          )}
        />
        {errors.entity_id && (
          <p className={errorClass}>{errors.entity_id.message}</p>
        )}
      </label>

      <div className="block mb-4">
        <span className={labelClass}>External ID</span>
        <div className="flex gap-2">
          <input
            {...register('external_id')}
            type="text"
            placeholder="Unique event identifier"
            className={clsx(fieldClass, 'flex-1')}
          />
          <button
            type="button"
            onClick={regenerateExternalId}
            title="Generate new UUID"
            className="px-3 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-sm"
          >
            ↻
          </button>
        </div>
        {errors.external_id && (
          <p className={errorClass}>{errors.external_id.message}</p>
        )}
      </div>

      <label className="block mb-4">
        <span className={labelClass}>Severity</span>
        <select {...register('severity')} className={clsx(fieldClass, 'cursor-pointer')}>
          <option value="">— Select severity —</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        {errors.severity && (
          <p className={errorClass}>{errors.severity.message}</p>
        )}
      </label>

      <label className="block mb-6">
        <span className={labelClass}>Payload (JSON)</span>
        <textarea
          {...register('payload')}
          rows={4}
          placeholder='{"key": "value"}'
          className={clsx(fieldClass, 'font-mono resize-y')}
        />
        {errors.payload && (
          <p className={errorClass}>{errors.payload.message}</p>
        )}
      </label>

      {status === 'success' && (
        <div className="mb-4 px-3 py-2 text-sm border border-primary/60 bg-primary/10 text-primary">
          ✓ Event registered successfully.
        </div>
      )}
      {status === 'duplicate' && (
        <div className="mb-4 px-3 py-2 text-sm border border-outline text-on-surface-variant bg-surface-container">
          ℹ This event was already registered (duplicate external_id).
        </div>
      )}
      {status === 'error' && errorMessage && (
        <div className="mb-4 px-3 py-2 text-sm border border-error/60 bg-error-container/20 text-error">
          ✗ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-2 bg-primary text-on-primary text-sm font-bold uppercase tracking-wide hover:bg-yellow-400 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? 'Submitting…' : 'Submit Event'}
      </button>
    </form>
  );
}
