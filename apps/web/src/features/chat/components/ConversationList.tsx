import { PageContainer } from "@/src/components/PageContainer";
import { initialName } from "@/src/utilities/initials-name";
import { Avatar } from "@heroui/react";
import Chat from "./Chat";

export default function ConversationList() {
  const conversations = [
    {
      id: 1,
      name: "Juan Pérez",
      lastMessage: "Gracias, quedo atento a la cita",
      lastMessageAt: "2026-05-14T10:04:00Z",
      unread: 2,
      avatar: "https://i.pravatar.cc/150?img=12",
      online: true,
    },
    {
      id: 2,
      name: "María Gómez",
      lastMessage: "¿A qué hora puedo llevar a mi gato?",
      lastMessageAt: "2026-05-14T09:40:00Z",
      unread: 0,
      avatar: "https://i.pravatar.cc/150?img=32",
      online: false,
    },
    {
      id: 3,
      name: "Carlos Ramírez",
      lastMessage: "Perfecto, muchas gracias",
      lastMessageAt: "2026-05-13T18:20:00Z",
      unread: 1,
      avatar: "https://i.pravatar.cc/150?img=5",
      online: false,
    },
    {
      id: 4,
      name: "Ana Torres",
      lastMessage: "Necesito una cita urgente",
      lastMessageAt: "2026-05-14T08:15:00Z",
      unread: 5,
      avatar: "https://i.pravatar.cc/150?img=47",
      online: true,
    },
  ];

  return (
    <div className="grid grid-cols-[320px_1fr] h-screen">
      <div className="border-r p-2">
        {conversations.map((c) => (
          <div
            className="flex items-center hover:bg-zinc-100 p-3 gap-3 cursor-pointer rounded-lg"
            key={c.id}
          >
            <Avatar>
              <Avatar.Image alt="John Doe" src={c.avatar} />
              <Avatar.Fallback>{initialName(c.name)}</Avatar.Fallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-zinc-500 truncate">{c.lastMessage}</p>
            </div>
            {c.unread > 0 && (
              <span className="bg-blue-400 text-white text-xs px-2 py-1 rounded-full">
                {c.unread}
              </span>
            )}
          </div>
        ))}
      </div>
      <Chat />
    </div>
  );
}
