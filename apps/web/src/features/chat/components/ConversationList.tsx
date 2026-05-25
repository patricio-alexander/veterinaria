import { initialName } from "@/src/utilities/initials-name";
import { Avatar, Badge } from "@heroui/react";
import Chat from "./Chat";
import { useState } from "react";
import { useAuthStore } from "@/src/store/auth.store";
import { useRealtimeChat } from "../hooks/useRealtimeChat";
import { useConversations } from "../hooks/useConversations";
import Loader from "@/src/components/Loader";

export default function ConversationList() {
  const [isOpen, setIsOpen] = useState(false);
  const { user: authUser } = useAuthStore();

  const { data: conversations, isLoading } = useConversations();

  const { openChat, sendMessage, messages, activeUsers, readMessage } =
    useRealtimeChat();
  const [user, setUser] = useState<{
    username: string;
    photo: string;
    id: string;
  } | null>(null);

  const viewChat = (userB: string) => {
    openChat({ userA: authUser?.id, userB });
    setIsOpen(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-[320px_1fr] h-full min-h-0">
      <div className="border-r p-2">
        {conversations?.map((c: any, i: number) => {
          const active = activeUsers.find((a) => a.userId === c.profile_id);

          return (
            <div
              className={`flex items-center hover:bg-zinc-100 p-3 gap-3 cursor-pointer rounded-lg ${user?.username == c.username && "bg-zinc-200"}`}
              key={i}
              onClick={() => {
                viewChat(c.profile_id);
                setUser({
                  username: c.username,
                  photo: c.photo,
                  id: c.profile_id,
                });
              }}
            >
              <Badge.Anchor>
                <Avatar>
                  <Avatar.Image alt="John Doe" src={c.photo} />

                  <Avatar.Fallback>{initialName(c.username)}</Avatar.Fallback>
                </Avatar>
                {!!active ? (
                  <Badge color="success" placement="bottom-right" size="sm" />
                ) : (
                  <Badge color="warning" placement="bottom-right" size="sm" />
                )}
              </Badge.Anchor>

              <div className="flex-1">
                <p className="font-medium">{c.username}</p>
                <p className="text-xs text-zinc-500 truncate">
                  {c.last_message}
                </p>
              </div>
              {c.total_unread > 0 && (
                <span className="shrink-0 bg-blue-500 text-white text-xs font-medium min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                  {c.total_unread > 99 ? "99+" : c.total_unread}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {isOpen && (
        <Chat
          onReadLastMessage={(msg) => {
            readMessage({
              conversationId: msg.conversationId,
              messageId: msg.id,
              userId: authUser?.id as string,
            });
          }}
          active={activeUsers.find((u) => u.userId === user?.id) ? true : false}
          user={user}
          messages={messages}
          onSend={(content) => {
            sendMessage(content);
          }}
        />
      )}
    </div>
  );
}
