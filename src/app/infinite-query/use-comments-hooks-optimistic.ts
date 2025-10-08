import { postData } from "@/lib/fetch-utils";
import { InfiniteData, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentsResponse } from "../api/comments/route";



const queryKey : QueryKey = ["comments"];

export function useCreateCommentMutationOptimistic() {
   const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newComment: {text: string}) => 
            postData<Comment>(`/api/comments`, newComment),
        // optimistic update
        onMutate: async (newComment) => {
            await queryClient.cancelQueries({queryKey});

            const previousData = queryClient.getQueryData<
            InfiniteData<CommentsResponse, number | undefined>
            >(queryKey);

            // create a fake comment for optimistic UI
            const optimisticComment = {
                id: Date.now(),
                user: { name: "Current User", avatar: "CU" },
                text: newComment.text,
                createdAt: new Date().toISOString()
            }

            queryClient.setQueryData<
            InfiniteData<CommentsResponse, number | undefined>
            >(queryKey, (oldData) =>{
                const firstPage = oldData?.pages[0];

                if(firstPage){
                    return {
                        ...oldData,
                        pages: [
                            {
                                ...firstPage,
                                comments: [optimisticComment, ...firstPage.comments],
                                totalComments: firstPage.totalComments + 1
                            },
                            ...oldData.pages.slice(1)
                        ]
                    }
                }
            })
            return { previousData };
        },
        // rollback on error
        onError: (_err, _newComment, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
        // refetch after success or error
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    })
}