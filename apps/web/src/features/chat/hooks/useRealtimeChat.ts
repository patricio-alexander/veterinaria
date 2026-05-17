import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/src/store/auth.store";
import { Content } from "next/font/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { da } from "zod/v4/locales";
import { getMessages } from "../services/chat.services";
import { Message } from "@reservacion-veterinaria/types";

export const useRealtimeChat = () => {
  const [channel, setChannel] = useState<typeof supabase.channel | null>(null);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [conversationId, setConversationId] = useState<null | number>(null);
  const { user } = useAuthStore();
  const [active, setActive] = useState(false);
  const [activeUsers, setUsersActive] = useState<{ userId: string }[] | []>([]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel) {
        return;
      }

      const { data, error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content,
        sender_id: user?.id,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error(error);
      }
    },
    [channel],
  );

  const openChat = async ({
    userA,
    userB,
  }: {
    userA: string | undefined;
    userB: string;
  }) => {
    if (channel) {
      await supabase.removeChannel(channel);
    }

    const { data: conversationId, error } = await supabase.rpc(
      "get_or_create_conversation",
      {
        user_a: userA,
        user_b: userB,
      },
    );

    if (!conversationId || error) {
      console.error(error);
      return;
    }

    setConversationId(conversationId);

    const newChannel = supabase.channel(`chat:${conversationId}`);

    newChannel
      .on("presence", { event: "sync" }, () => {
        const state = newChannel.presenceState();
        const values = Object.entries(state);

        const onlyActiveUsers = values
          .filter(([key, value]) => value[0]?.userId !== user?.id)
          .map(([_, value]) => ({ userId: value[0]?.userId }));

        const active = values
          .map(([key, value], i) => ({
            userId: value[0]?.userId,
          }))
          .find(({ userId }) => userId === userB);

        setUsersActive(onlyActiveUsers);

        setActive(!!active);
      })

      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          (async () => {
            const { data, error } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", payload.new.sender_id)
              .single();

            if (error) {
              console.error(error);
              return;
            }

            setMessages((prev) => [
              ...prev,
              {
                content: payload.new.content,
                isOwnMessage: user?.id === payload.new.sender_id,
                createdAt: payload.new.created_at,
                username: data?.name,
              },
            ]);
          })();
        },
      )

      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        await newChannel.track({
          userId: user?.id,
        });
      });

    setChannel(newChannel);
  };

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const fechtMessage = async () => {
      try {
        const msgs = await getMessages(conversationId);

        const messages = msgs.map<Message>((m) => ({
          content: m.content,
          isOwnMessage: user?.id === m.sender_id,
          createdAt: m.created_at,
          username: m.profiles?.name,
        }));
        setMessages(messages);
      } catch (error) {
        console.error(error);
      }
    };

    fechtMessage();
  }, [conversationId]);

  return { openChat, sendMessage, messages, active, activeUsers };
};
