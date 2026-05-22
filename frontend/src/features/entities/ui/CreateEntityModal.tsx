'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEntity } from '../api/entities.api';
import { createEntitySchema, type CreateEntityInput } from '../model/schemas';
import { HttpError } from '@/shared/lib/http';
import { Button } from '@/shared/ui/Button';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

interface Props {
  onCreated: () => void;
  onClose: () => void;
}

export function CreateEntityModal({ onCreated, onClose }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEntityInput>({
    resolver: zodResolver(createEntitySchema),
  });

  const onSubmit = async (data: CreateEntityInput) => {
    setServerError(null);
    try {
      await createEntity(data.name);
      onCreated();
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        setServerError('An entity with this name already exists.');
      } else {
        setServerError(err instanceof Error ? err.message : 'Unexpected error');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Create entity"
    >
      <div className="bg-surface-container-high w-full max-w-md p-6 border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-on-surface uppercase tracking-widest">
            Register Entity
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block mb-4">
            <span className="block text-xs uppercase tracking-wider text-on-surface-variant mb-1.5">
              Entity Name
            </span>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g. Death Star Reactor Core"
              className="w-full bg-surface-container border border-outline-variant px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error">{errors.name.message}</p>
            )}
          </label>

          <ErrorMessage message={serverError} className="mb-4" />

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering…' : 'Register'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
