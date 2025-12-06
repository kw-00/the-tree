import { ChatProvider } from "@/features/dashboard/ChatContext"
import ChatPanel from "@/features/dashboard/chat/ChatPanel"
import LogoutButton from "@/components/LogoutButton"
import { HStack, VStack } from "@chakra-ui/react"
import { Provider } from "@/components/ui/provider"
import ChatroomsPanel from "./chatrooms/ChatroomsPanel"
import FriendsPanel from "./friends/FriendsPanel"

export default function Dashboard() {

  return (
    <Provider>
      <ChatProvider>
        <HStack justifyContent="center" alignItems="start" flexGrow={1}>
            <FriendsPanel/>
            <VStack flexGrow={1} alignItems="stretch">
              <ChatroomsPanel p="10"/>
            </VStack>
            <VStack h="100vh" alignItems="stretch" px="8" overflowY="scroll" flexGrow={2} >
              <HStack justifyContent="flex-end" position="sticky" top={0} bg="currentBg" zIndex={1}>
                  <LogoutButton variant="secondary"/>
              </HStack>
              <ChatPanel pe="96" flexGrow={1}/>
          </VStack>
        </HStack>
      </ChatProvider>
    </Provider>
  )
}