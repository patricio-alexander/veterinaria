import { supabase } from "@/lib/supabase/client";

export const getMessages = async (conversationId: number) => {
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, sender_id, content, created_at, conversation_id,profiles(name)",
    )
    .eq("conversation_id", conversationId);
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getConversations = async () => {
  const { data, error } = await supabase.rpc("get_my_conversations");

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
