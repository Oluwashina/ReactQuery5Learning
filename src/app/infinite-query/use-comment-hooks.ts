import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentsResponse } from "../api/comments/route";
import { fetchData, postData } from "@/lib/fetch-utils";


export function useCommentsQuery() {   
    return useInfiniteQuery({
        queryKey: ["comments"],
        queryFn: ({pageParam}) => fetchData<CommentsResponse>(`/api/comments?${pageParam ? `cursor=${pageParam}` : ""}`),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
}

export function useCreateCommentMutation() {   
    const queryClient = useQueryClient();

   return useMutation({
        mutationFn: (newComment: {text: string}) => postData<Comment>(`/api/comments`, newComment),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["comments"]})
        }
   })
}