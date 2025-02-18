import { PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";

export const initializePublicRoom = async (): Promise<any> => {
  const existingRoom = await db.conversation.findUnique({
    where: { id: PUBLIC_ROOM_ID },
  });
  let room = null;
  if (!existingRoom) {
    room = await db.conversation.create({
      data: {
        id: PUBLIC_ROOM_ID,
      },
    });
  }

  return room;
};
