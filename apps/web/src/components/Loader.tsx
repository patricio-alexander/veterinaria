import { Spinner } from "@heroui/react";

export default function Loader() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center  font-sans dark:bg-black">
      <Spinner />
    </div>
  );
}
