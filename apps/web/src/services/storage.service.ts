import { supabase } from "@/lib/supabase/client";

type DestinationFile = {
  from: string;
  path: string;
};

export const downloadFile = async ({ from, path }: DestinationFile) =>
  await supabase.storage.from(from).download(path);

export const removeFile = async ({ from, path }: DestinationFile) =>
  await supabase.storage.from(from).remove([path]);
