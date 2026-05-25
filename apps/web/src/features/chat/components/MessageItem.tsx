interface MessageItemProps {
  username: string;
  hour: string;
  message: string;
  isOwnMessage: boolean;
}

export const MessageItem = ({
  hour,
  message,
  username,
  isOwnMessage,
}: MessageItemProps) => {
  return (
    <div
      className={`flex mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[50%] flex-col flex`}>
        <div className="flex gap-1 items-center mb-1 text-xs text-zinc-500">
          <p className="font-medium">{username}</p>
          <p>{hour}</p>
        </div>
        <div
          className={` ${isOwnMessage ? "bg-zinc-300" : "bg-zinc-100"}  px-2 py-1 rounded-lg break-words`}
        >
          <p className="text-base">{message}</p>
        </div>
      </div>
    </div>
  );
};
