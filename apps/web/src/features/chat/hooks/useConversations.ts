import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversations } from "../services/chat.services";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export const useConversations = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("conversations");

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
        },
        () => {
          //console.log("actualiza contador mensajes no leidos");
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => await getConversations(),
  });
};
