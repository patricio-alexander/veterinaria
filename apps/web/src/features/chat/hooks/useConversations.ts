import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../services/chat.services";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => await getConversations(),
  });
};
