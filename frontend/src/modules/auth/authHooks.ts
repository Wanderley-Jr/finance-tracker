import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as authService from "./authService"

const currentUserQueryKey = ["auth", "me"]

export function useCurrentUser() {
    return useQuery({
        queryKey: currentUserQueryKey,
        queryFn: authService.getCurrentUser,
        retry: false
    })
}

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authService.login,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
        }
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: authService.register,
    });
}

export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authService.logout,
        onSuccess: async () => {
            queryClient.setQueryData(currentUserQueryKey, null)
        }
    })
}