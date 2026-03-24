A web chatroom app written in React + Fastify + PostgreSQL. My main goal is to execute its core functionality perfectly, with responsiveness, simplicity and security in mind. I’ve currently taken a hiatus from working on this one, as implementing a real chat app from scratch is time-consuming without taking any shortcuts.

However, it has been a great way for me to learn front-end and server-side development and understand the challenges and trade-offs involved. I plan to continue this project in the future.
It already has a styled UI as well as the main server-side architecture implemented. 

Next steps:
- <p style="color: green">**<b>COMPLETE</b>** Infinite scrolling for the chat itself — messaging apps have very specific needs which means simple virtualization techniques or traditional pagination are not the best choice. The pagination itself is already implemented, but I still have to fix cursor-jumps, which requires managing multiple edge cases.
- Persistent TCP connection to replace polling – I used polling for prototyping, but it is not the optimal solution for some features, especially the real-time chat itself.
