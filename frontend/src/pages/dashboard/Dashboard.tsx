import { ChatProvider } from "../../contexts/ChatContext"
import Chat from "./sections/chat/Chat"
import ChatList from "./sections/chat-list/ChatList"
import LogoutButton from "../../components/LogoutButton"
import { Button, HStack, VStack } from "@chakra-ui/react"
import { Provider } from "@/components/ui/provider"
import Conversation from "./sections/chat/components/Conversation"

export default function Dashboard() {
  let numbers: number[] = []
  for (let i = 0; i < 100; i++) {
    numbers = numbers.concat([i])
  }

  return (
    <Provider>
      <ChatProvider>
        <HStack justifyContent="center" flexGrow={1}>
            <VStack flexGrow={1}>
              <ChatList/>
            </VStack>
            <VStack h="100vh" alignItems="stretch" px="8" overflowY="scroll" flexGrow={2} >
              <HStack justifyContent="flex-end" position="sticky" top={0} bg="currentBg">
                  <LogoutButton variant="secondary"/>
              </HStack>
              <Chat pe="96"/>
          </VStack>
        </HStack>
      </ChatProvider>
    </Provider>


    // <Provider>
    //   <VStack>
    //     <VStack h="100vh" overflow="scroll">
    //         {
    //           numbers.map(() => {
    //             return (<p>fsadf</p>)
    //           })
    //         }
    //     </VStack>

    //     <Button variant="primary">Click me!</Button>
    //     <Button variant="secondary">Click me too!</Button>
    //   </VStack>

    // </Provider>



    // <Provider>
    //   <VStack >
    //     <Conversation messages={[{senderLogin: "me", content: "Hello"}]}></Conversation>
    //   </VStack>

    // </Provider>


  )
}