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

  const { openChat, sendMessage, messages, active, activeUsers } =
    useRealtimeChat();
  const [user, setUser] = useState<{ username: string; photo: string } | null>(
    null,
  );

  const viewChat = (userB: string) => {
    openChat({ userA: authUser?.id, userB });
    setIsOpen(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="grid grid-cols-[320px_1fr] h-screen">
      <div className="border-r p-2">
        {conversations?.map((c: any, i: number) => {
          const active = activeUsers.find((a) => a.userId === c.profile_id);

          return (
            <div
              className={`flex items-center hover:bg-zinc-100 p-3 gap-3 cursor-pointer rounded-lg ${user?.username == c.username && "bg-zinc-200"}`}
              key={i}
              onClick={() => {
                viewChat(c.profile_id);
                setUser({ username: c.username, photo: c.photo });
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
              {c.unread > 0 && (
                <span className="bg-blue-400 text-white text-xs px-2 py-1 rounded-full">
                  {c.unread}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {isOpen && (
        <Chat
          active={active}
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
