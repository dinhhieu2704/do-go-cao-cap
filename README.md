# Mộc Gia Tinh Hoa — Không Gian Nội Thất Gỗ Mỹ Nghệ Cao Cấp Độc Bản

Website trưng bày đồ gỗ mỹ nghệ cao cấp, bàn ăn nguyên tấm, salon hoàng gia đục tay thủ công từ nghệ nhân Việt Nam.

## 🌟 Tính Năng Nổi Bật

- **Realtime Google Sheets Integration:** Dữ liệu sản phẩm, danh mục và cài đặt thương hiệu được nạp động trực tiếp thời gian thực từ Google Sheets qua GViz API (hỗ trợ chống cache trình duyệt).
- **Trang chủ (Showcase):**
  - Hero banner với hiệu ứng parallax và tone màu ấm gỗ quý sang trọng.
  - Lưới sản phẩm chuẩn 3 cột (3 sản phẩm/hàng), phân trang tự động (tối đa 6 sản phẩm/trang).
  - Thẻ sản phẩm hiển thị thông số kích thước và cân nặng chia đều 2 bên sang trọng.
  - Thanh danh mục kiệt tác tự động cuộn (auto-scroll marquee), tạm dừng khi hover, hỗ trợ giữ chuột kéo (drag-to-scroll).
  - Cửa sổ xem nhanh tác phẩm (Quick View Modal) tương tác cao.
- **Trang chi tiết sản phẩm (Product Detail):**
  - Bộ sưu tập ảnh độ phân giải cao và ảnh thu nhỏ chuyển đổi mượt mà.
  - Bento thông số chế tác (chất liệu gỗ, kích thước, cân nặng, chứng chỉ CITES).
  - Bộ ba nút kêu gọi hành động CTA liên hệ đồng bộ (Hotline, Zalo 4K Video, Messenger).
  - Gợi ý các tác phẩm cùng không gian sống.
- **Triển khai GitHub Pages:** Thuần tĩnh (Pure Static HTML/CSS/Vanilla JS), không cần backend, tối ưu 100% đường dẫn tương đối.

## 📁 Cấu Trúc Dự Án

```
├── index.html              # Trang chủ trưng bày kiệt tác
├── product-detail.html     # Trang chi tiết sản phẩm & liên hệ CTA
├── css/
│   ├── style.css           # Toàn bộ thiết kế hệ thống giao diện & responsive
│   └── animations.css      # Hiệu ứng chuyển động mượt mà
├── js/
│   ├── app.js              # Controller trang chủ & engine tải Google Sheets realtime
│   └── detail.js           # Controller trang chi tiết sản phẩm
├── data/                   # Tệp CSV dữ liệu dự phòng offline
└── README.md
```

## 🚀 Triển khai trên GitHub Pages

1. Đẩy code lên nhánh `master` của repository GitHub.
2. Vào **Settings** > **Pages** trên repository GitHub.
3. Chọn nhánh `master` tại mục **Branch**, chọn thư mục `/ (root)` và nhấn **Save**.
4. Truy cập website tại: `https://dinhhieu2704.github.io/do-go-cao-cap/`
