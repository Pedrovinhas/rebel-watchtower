'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEntity } from '../api/entities.api';
import { createEntitySchema, type CreateEntityInput } from '../model/schemas';
import { HttpError } from '@/shared/lib/http';

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

          {serverError && (
            <p className="mb-4 text-sm text-error border border-error/40 bg-error-container/20 px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-on-surface-variant border border-outline-variant hover:border-outline hover:text-on-surface transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-primary text-on-primary font-bold uppercase tracking-wide hover:bg-yellow-400 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
