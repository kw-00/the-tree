import { ChatProvider } from "@/features/dashboard/ChatContext"
import ChatPanel from "@/features/dashboard/chat/ChatPanel"
import ChatroomList from "./chatrooms/ChatroomsList"
import LogoutButton from "@/components/LogoutButton"
import { HStack, VStack } from "@chakra-ui/react"
import { Provider } from "@/components/ui/provider"

export default function Dashboard() {
  let numbers: number[] = []
  for (let i = 0; i < 100; i++) {
    numbers = numbers.concat([i])
  }

  return (
    <Provider>
      <ChatProvider>
        <HStack justifyContent="center" alignItems="start" flexGrow={1}>
            <VStack flexGrow={1} alignItems="stretch">
              <ChatroomList p="10"/>
            </VStack>
            <VStack h="100vh" alignItems="stretch" px="8" overflowY="scroll" flexGrow={2} >
              <HStack justifyContent="flex-end" position="sticky" top={0} bg="currentBg" zIndex={1}>
                  <LogoutButton variant="secondary"/>
              </HStack>
              <ChatPanel pe="96"/>
          </VStack>
        </HStack>
      </ChatProvider>
    </Provider>
  )
}