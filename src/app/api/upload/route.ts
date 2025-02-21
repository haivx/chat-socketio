// app/api/upload/route.ts
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file hình ảnh" },
        { status: 400 }
      );
    }

    // Kiểm tra loại file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Loại file không được hỗ trợ. Vui lòng upload JPEG, PNG, WebP hoặc GIF",
        },
        { status: 400 }
      );
    }

    // Giới hạn kích thước file (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File quá lớn. Kích thước tối đa là 10MB" },
        { status: 400 }
      );
    }

    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file ngẫu nhiên với extension gốc
    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const randomName = crypto.randomBytes(16).toString("hex");
    const fileName = `${randomName}.${extension}`;

    // Đường dẫn lưu file (trong thư mục public)
    const uploadDir = join(process.cwd(), "public", "uploads");
    const path = join(uploadDir, fileName);

    // Lưu file
    await writeFile(path, buffer);

    // Trả về đường dẫn để truy cập file
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      message: "Upload thành công",
    });
  } catch (error) {
    console.error("Lỗi upload:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi upload file" },
      { status: 500 }
    );
  }
}

// Thiết lập giới hạn kích thước request
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "12mb",
  },
};
