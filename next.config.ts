/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cho phép sử dụng ảnh từ thư mục public/uploads
    unoptimized: true, // Vì ảnh trong public/ không cần tối ưu hóa
  },
};

module.exports = nextConfig;
