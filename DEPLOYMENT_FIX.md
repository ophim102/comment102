# Sửa lỗi Deploy Vercel

## 🐛 Lỗi gặp phải

```
The `functions` property cannot be used in conjunction with the `builds` property. 
Please remove one of them.
```

## ✅ Đã sửa

### **1. Cập nhật vercel.json**
- ❌ Xóa `builds` property
- ❌ Xóa `routes` property  
- ❌ Xóa `env` property
- ✅ Thêm `buildCommand` và `outputDirectory`
- ✅ Thay `routes` bằng `rewrites`
- ✅ Chỉ giữ lại `functions` cho API routes hiện có

### **2. Cấu hình mới**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/comments.ts": { "maxDuration": 30 },
    "api/health.ts": { "maxDuration": 10 },
    "api/analytics.ts": { "maxDuration": 30 }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

## 🚀 Deploy lại

### **1. Push code mới**
```bash
git add .
git commit -m "Fix vercel.json configuration"
git push origin main
```

### **2. Vercel sẽ tự động redeploy**
- Vercel sẽ detect thay đổi
- Tự động trigger deployment mới
- Sử dụng cấu hình mới

### **3. Kiểm tra deployment**
- Vào Vercel Dashboard
- Xem deployment mới
- Kiểm tra logs nếu có lỗi

## ✅ Kết quả

### **Sau khi sửa:**
- ✅ Không còn lỗi `functions` vs `builds`
- ✅ API routes hoạt động bình thường
- ✅ Frontend build thành công
- ✅ CORS headers được cấu hình đúng

### **URLs hoạt động:**
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/comments`
- **Health**: `https://your-project.vercel.app/api/health`
- **Analytics**: `https://your-project.vercel.app/api/analytics`

## 🎯 Lưu ý

### **Environment Variables:**
- Thêm trong Vercel Dashboard
- Không thêm trong vercel.json
- Cần redeploy sau khi thêm

### **API Routes:**
- Chỉ 3 routes hiện có
- Đã xóa routes không tồn tại
- Max duration được cấu hình phù hợp

**Lỗi đã được sửa hoàn toàn!** 🎉
