import { loadChatRooms, saveChatRooms, type ChatRoom } from "@/lib/chat-rooms-store";

export type RoomCategory = "Academic" | "Scholarships" | "Study Abroad" | "Programming" | "Careers";

export function createChatRoom(input: {
  name: string;
  slug: string;
  category: RoomCategory;
  description: string;
  icon: string;
}) {
  const rooms = loadChatRooms();
  const cleanSlug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!input.name.trim() || !cleanSlug) return rooms;

  const exists = rooms.some((room) => room.slug === cleanSlug);
  if (exists) return rooms;

  const nextRoom: ChatRoom = {
    id: `room-${cleanSlug}`,
    name: input.name.trim(),
    slug: cleanSlug,
    category: input.category,
    description: input.description.trim() || "A CollegeDiscourse community room.",
    members: 1,
    online: 1,
    icon: input.icon.trim() || "💬",
    onlineUsers: ["Demo Student"],
    messages: [
      {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        roomId: `room-${cleanSlug}`,
        author: "System",
        role: "Room Bot",
        body: `Welcome to the ${input.name.trim()} room.`,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const next = [nextRoom, ...rooms];
  saveChatRooms(next);
  return next;
}

export function updateChatRoom(
  roomId: string,
  input: {
    name: string;
    category: RoomCategory;
    description: string;
    icon: string;
  },
) {
  const rooms = loadChatRooms();
  const next = rooms.map((room) =>
    room.id === roomId
      ? {
          ...room,
          name: input.name.trim() || room.name,
          category: input.category,
          description: input.description.trim() || room.description,
          icon: input.icon.trim() || room.icon,
        }
      : room,
  );
  saveChatRooms(next);
  return next;
}

export function clearRoomMessages(roomId: string) {
  const rooms = loadChatRooms();
  const next = rooms.map((room) =>
    room.id === roomId
      ? {
          ...room,
          messages: [
            {
              id: crypto.randomUUID?.() ?? String(Date.now()),
              roomId,
              author: "System",
              role: "Room Bot",
              body: "Room messages were reset by a moderator.",
              createdAt: new Date().toISOString(),
            },
          ],
        }
      : room,
  );
  saveChatRooms(next);
  return next;
}

export function deleteChatRoom(roomId: string) {
  const rooms = loadChatRooms();
  const next = rooms.filter((room) => room.id !== roomId);
  saveChatRooms(next);
  return next;
}
