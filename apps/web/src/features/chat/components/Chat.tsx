import { Avatar, Input } from "@heroui/react";
import { MessageItem } from "./MessageItem";

export default function Chat() {
  const username = "Maria";

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 px-4 gap-3 items-center border-b">
        <Avatar>
          <Avatar.Image alt="John Doe" src="https://i.pravatar.cc/150?img=47" />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <p className="font-medium">{username}</p>
      </div>
      <div className="flex-1 p-2">
        <MessageItem
          username="cris"
          hour="10:30 AM"
          isOwnMessage={true}
          message="hola pato"
        />
      </div>
      <div className="h-14  border-t flex items-center px-3">
        <input
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-full px-4 py-2 outline-none w-full"
        />
      </div>
    </div>
  );
}
