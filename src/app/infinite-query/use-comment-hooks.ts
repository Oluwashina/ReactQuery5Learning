import { useInfiniteQuery } from "@tanstack/react-query";
import { CommentsResponse } from "../api/comments/route";
import { fetchData } from "@/lib/fetch-utils";


export function useCommentsQuery() {   
    return useInfiniteQuery({
        queryKey: ["comments"],
        queryFn: ({pageParam}) => fetchData<CommentsResponse>(`/api/comments?${pageParam ? `cursor=${pageParam}` : ""}`),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

}