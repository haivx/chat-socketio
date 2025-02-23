import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    // limit file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size is too big. The maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file ngẫu nhiên với extension gốc
    const originalName = file.name;
    const extension = originalName.split(".").pop();
    const nameFile = originalName.split(".").shift();
    const randomName = crypto.randomBytes(2).toString("hex");
    const fileName = `${nameFile}.${randomName}.${extension}`;

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
      name: fileName,
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Error upload:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Thiết lập giới hạn kích thước request
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "10mb",
  },
};
