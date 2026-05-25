import { Avatar, Button, Chip } from "@heroui/react";
import { MessageItem } from "./MessageItem";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message } from "@reservacion-veterinaria/types";
import { format } from "date-fns";
import { initialName } from "@/src/utilities/initials-name";

interface ChatProps {
  onSend: (msg: string) => void;
  messages: Message[];
  active: boolean;
  user: {
    username: string;
    photo: string;
    id: string;
  };
  onReadLastMessage: (msg: Message) => void;
}

export default function Chat({
  onSend,
  messages,
  user,
  active,
  onReadLastMessage,
}: ChatProps) {
  const [message, setMessage] = useState("");

  const chatRef = useRef<HTMLDivElement>(null);

  const send = () => {
    onSend(message);
    setMessage("");
  };

  const readLastMessage = () => {
    const msgs = messages.filter((m) => !m.isOwnMessage);
    const lastMessage = msgs[msgs.length - 1];

    if (lastMessage) {
      onReadLastMessage(lastMessage);
    }
  };

  useEffect(() => {
    const el = chatRef.current;

    if (!el) return;
    if (!messages.length) return;

    const hasScroll = el.scrollHeight > el.clientHeight;

    if (!hasScroll) {
      readLastMessage();
    }

    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;

    const isBottom = el?.scrollTop + el?.clientHeight >= el?.scrollHeight - 20;

    if (isBottom) {
      readLastMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex h-16 px-4 gap-3 items-center border-b">
        <Avatar>
          <Avatar.Image alt="John Doe" src={user.photo} />

          <Avatar.Fallback> {initialName(user.username)}</Avatar.Fallback>
        </Avatar>

        <div>
          <p className="font-medium">{user.username}</p>
          {active ? (
            <Chip variant="soft" color="success">
              En línea
            </Chip>
          ) : (
            <Chip variant="soft" color="warning">
              Desconectado
            </Chip>
          )}
        </div>
      </div>
      <div
        className="flex-1 p-2 h-screen overflow-y-auto "
        ref={chatRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, i) => (
          <MessageItem
            key={i}
            username={msg.username}
            hour={format(new Date(msg.createdAt), "hh:mm bbb")}
            isOwnMessage={msg.isOwnMessage}
            message={msg.content}
          />
        ))}
      </div>
      <div className="h-14  border-t flex items-center px-3 gap-3">
        <input
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 outline-none w-full"
          value={message}
          onChange={(v) => setMessage(v.target.value)}
        />
        <Button isIconOnly onClick={send}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
