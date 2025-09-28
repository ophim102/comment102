# Hướng dẫn Deploy lên Vercel

## 🚀 Deploy nhanh (5 phút)

### **Bước 1: Tạo tài khoản Vercel**
1. Truy cập: https://vercel.com
2. Đăng ký/đăng nhập bằng GitHub
3. Xác thực email

### **Bước 2: Deploy từ GitHub**
1. **Fork repository này** (nếu chưa có)
2. **Push code lên GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
3. **Vào Vercel Dashboard**:
   - Click "New Project"
   - Import từ GitHub
   - Chọn repository
   - Click "Deploy"

### **Bước 3: Cấu hình Environment Variables**
Sau khi deploy xong, vào **Project Settings > Environment Variables** và thêm:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Bước 4: Truy cập Setup Wizard**
```
https://your-project.vercel.app/setup
```

## ✅ Hoàn thành!

### **Sau khi deploy:**
- ✅ Website đã live trên Vercel
- ✅ Setup Wizard hoạt động
- ✅ Admin Panel sẵn sàng
- ✅ Comment System hoạt động

### **URLs quan trọng:**
- **Setup Wizard**: `https://your-project.vercel.app/setup`
- **Comment System**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin`
- **Embed Code**: `https://your-project.vercel.app/admin?tab=embed`

## 🎯 Lợi ích deploy lên Vercel

### **1. Không cần cài đặt local**
- Không cần Node.js
- Không cần npm
- Chỉ cần browser

### **2. Tự động deploy**
- Push code = auto deploy
- Preview deployments
- Rollback dễ dàng

### **3. Performance tốt**
- Global CDN
- Edge functions
- Auto scaling

### **4. Free Plan**
- 100GB bandwidth/month
- 100k function invocations/month
- Custom domains
- SSL certificates

## 📊 Khả năng chịu tải

### **Vercel Free Plan:**
- **300,000+ page views/day**
- **30,000+ users/day**
- **Chi phí $0/tháng**

## 🎉 Kết luận

**Chỉ cần deploy lên Vercel là có thể sử dụng ngay!**

Không cần cài đặt gì trên máy local! 🚀
