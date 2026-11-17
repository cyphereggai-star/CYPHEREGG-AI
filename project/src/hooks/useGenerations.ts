import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Generation } from '@/lib/types';

export function useGenerations() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) {
      setGenerations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setGenerations((data ?? []) as Generation[]);
      setError(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const addGeneration = useCallback(
    async (g: Omit<Generation, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) return { error: 'Not signed in', data: null };
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: user.id,
          mode: g.mode,
          language: g.language,
          prompt: g.prompt,
          result: g.result,
          status: g.status,
        })
        .select()
        .maybeSingle();
      if (error) return { error: error.message, data: null };
      if (data) {
        setGenerations((prev) => [data as Generation, ...prev]);
      }
      return { error: null, data: data as Generation | null };
    },
    [user]
  );

  const deleteGeneration = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);
      if (!error) {
        setGenerations((prev) => prev.filter((g) => g.id !== id));
      }
      return { error: error?.message ?? null };
    },
    []
  );

  return {
    generations,
    loading,
    error,
    refetch: fetch,
    addGeneration,
    deleteGeneration,
  };
}
