'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiCalendarLine, RiUser3Line } from '@remixicon/react';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subheadings: [''], // Array for multiple inputs
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubheadingChange = (index: number, value: string) => {
    const newSubheadings = [...formData.subheadings];
    newSubheadings[index] = value;
    setFormData({ ...formData, subheadings: newSubheadings });
  };

  const addSubheading = () => {
    setFormData({ ...formData, subheadings: [...formData.subheadings, ''] });
  };

  const removeSubheading = (index: number) => {
    const newSubheadings = formData.subheadings.filter((_, i) => i !== index);
    setFormData({ ...formData, subheadings: newSubheadings.length ? newSubheadings : [''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter empty strings and join with newline
      const subheadingString = formData.subheadings
        .map(s => s.trim())
        .filter(s => s)
        .join('\n');

      const payload = {
        name: formData.name,
        event_date: formData.date,
        subheading: subheadingString
      };

      const res = await fetch('/api/admin/legacy/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const client = await res.json();
        router.push(`/admin/client/${client.id}`);
      } else {
        const error = await res.json().catch(() => ({}));
        console.error('Create client error', error);
        alert(error.error || 'Failed to create client');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 text-title-h4 font-bold text-text-strong-950">
        Create New Client
      </h2>

      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-strong-950">
              Client Name / Event Title
            </label>
            <div className="relative">
              <RiUser3Line className="absolute left-3 top-2.5 text-text-sub-600" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. John & Jane Wedding"
                className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-2.5 pl-10 pr-4 text-sm text-text-strong-950 placeholder:text-text-sub-600 focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
             <label className="mb-1.5 block text-sm font-medium text-text-strong-950">
               Subtitle / Location
             </label>
             <div className="flex flex-col gap-2">
                {formData.subheadings.map((sub, index) => (
                    <div key={index} className="flex gap-2">
                        <input 
                            type="text"
                            placeholder={index === 0 ? "e.g. Lagos, Nigeria" : "Additional info"}
                            className="flex-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-2.5 px-4 text-sm text-text-strong-950 placeholder:text-text-sub-600 focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base"
                            value={sub}
                            onChange={(e) => handleSubheadingChange(index, e.target.value)}
                        />
                        {formData.subheadings.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSubheading(index)}
                                className="px-3 text-text-sub-600 hover:text-error-base text-sm font-medium"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                {formData.subheadings.length < 3 && (
                    <button
                        type="button"
                        onClick={addSubheading}
                        className="self-start text-sm text-primary-base font-medium hover:underline mt-1"
                    >
                        + Add Another Subtitle
                    </button>
                )}
             </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-strong-950">
              Event Date
            </label>
            <div className="relative">
              <RiCalendarLine className="absolute left-3 top-2.5 text-text-sub-600" size={18} />
              <input
                type="date"
                required
                className="w-full rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-2.5 pl-10 pr-4 text-sm text-text-strong-950 focus:border-primary-base focus:outline-none focus:ring-1 focus:ring-primary-base"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-base px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
