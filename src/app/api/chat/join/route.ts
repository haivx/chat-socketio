import { PUBLIC_ROOM_ID } from "@/constants";
import { db } from "@/db";

export const handleJoinChat = async (req, res) => {
  const { userId } = req.body; // Lấy từ session user

  try {
    // Kiểm tra xem user đã trong room chưa
    const existingParticipant = await db.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: PUBLIC_ROOM_ID,
        },
      },
    });

    if (!existingParticipant) {
      // Thêm user vào room
      await db.conversationParticipant.create({
        data: {
          userId,
          conversationId: PUBLIC_ROOM_ID,
        },
      });
    }

    // Lấy 50 tin nhắn gần nhất
    const recentMessages = await db.message.findMany({
      where: {
        conversationId: PUBLIC_ROOM_ID,
      },
      include: {
        sender: {
          select: {
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return res.json({
      success: true,
      messages: recentMessages.reverse(),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to join chat" });
  }
};
