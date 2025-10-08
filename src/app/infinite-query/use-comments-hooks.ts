import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentsResponse } from "../api/comments/route";
import { fetchData, postData } from "@/lib/fetch-utils";
import { Comment } from "../api/comments/data";


const queryKey : QueryKey = ["comments"];

export function useCommentsQuery() {   
    return useInfiniteQuery({
        queryKey,
        queryFn: ({pageParam}) => fetchData<CommentsResponse>(`/api/comments?${pageParam ? `cursor=${pageParam}` : ""}`),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
}

export function useCreateCommentMutation() {   
    const queryClient = useQueryClient();

   return useMutation({
        mutationFn: (newComment: {text: string}) => 
            postData<{comment: Comment}>(`/api/comments`, newComment),
        onSuccess: async ({comment}) => {

          await queryClient.cancelQueries({queryKey});

          queryClient.setQueryData<
          InfiniteData<CommentsResponse, number | undefined>
          >(queryKey,
            oldData => {
               const firstPage = oldData?.pages[0]; 
               if(firstPage){
                return {
                    ...oldData,
                    pages: [
                        {
                            ...firstPage,
                            comments: [comment, ...firstPage.comments],
                            totalComments: firstPage.totalComments + 1
                        },
                        ...oldData.pages.slice(1)
                    ]
                }
               }
               return oldData;
            }
        ) 
      }
   })
}