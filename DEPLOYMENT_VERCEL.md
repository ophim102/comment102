# Hướng dẫn Deploy lên Vercel

## 🚀 Tổng quan

Dự án đã được migrate từ Netlify sang Vercel với các thay đổi chính:
- Netlify Functions → Vercel API Routes
- Netlify Edge Functions → Vercel Edge Functions
- Cấu hình build và deploy mới

## 📁 Cấu trúc Files

### **API Routes (thay thế Netlify Functions)**
```
api/
├── comments.ts          # API chính cho comments
├── comments-ultra.ts    # API tối ưu với caching
├── health.ts            # Health check
├── analytics.ts         # Analytics tracking
└── performance-monitor.ts # Performance monitoring
```

### **Cấu hình Vercel**
```
vercel.json              # Cấu hình Vercel
package.json             # Scripts và dependencies
```

## 🔧 Cài đặt

### 1. **Cài đặt Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Login vào Vercel**
```bash
vercel login
```

### 3. **Cài đặt Dependencies**
```bash
npm install
```

## 🚀 Deploy

### **Deploy lần đầu**
```bash
vercel
```

### **Deploy Production**
```bash
vercel --prod
```

### **Deploy với Environment Variables**
```bash
vercel --prod --env VITE_SUPABASE_URL=your-url --env VITE_SUPABASE_ANON_KEY=your-key
```

## ⚙️ Environment Variables

### **Thiết lập trong Vercel Dashboard**
1. Vào project settings
2. Chọn "Environment Variables"
3. Thêm các biến:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Thiết lập qua CLI**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## 📊 Cấu hình Vercel

### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/comments.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔄 Migration từ Netlify

### **Thay đổi chính:**

#### 1. **API Endpoints**
```javascript
// Trước (Netlify)
const response = await fetch('/.netlify/functions/comments')

// Sau (Vercel)
const response = await fetch('/api/comments')
```

#### 2. **Function Structure**
```typescript
// Trước (Netlify Functions)
export const handler = async (event, context) => {
  // Logic
}

// Sau (Vercel API Routes)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Logic
}
```

#### 3. **Build Scripts**
```json
// Trước
{
  "scripts": {
    "dev": "netlify dev",
    "build": "npm run build:functions && npm run build:frontend",
    "deploy": "netlify deploy --prod"
  }
}

// Sau
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "vercel-build": "npm run build",
    "deploy": "vercel --prod"
  }
}
```

## 🎯 Tính năng Vercel

### **1. Edge Functions**
- Chạy gần user hơn
- Tốc độ response nhanh
- Global distribution

### **2. API Routes**
- Serverless functions
- Auto-scaling
- Pay-per-use

### **3. Static Generation**
- Pre-rendered pages
- CDN distribution
- Fast loading

## 📈 Performance

### **So sánh Netlify vs Vercel**

| Tính năng | Netlify | Vercel |
|-----------|---------|--------|
| Build Time | ~2-3 phút | ~1-2 phút |
| Cold Start | ~500ms | ~200ms |
| Global CDN | ✅ | ✅ |
| Edge Functions | ✅ | ✅ |
| Auto Deploy | ✅ | ✅ |

### **Tối ưu Performance**
1. **Edge Functions** cho API calls
2. **Static Generation** cho pages
3. **Image Optimization** tự động
4. **Bundle Analysis** tích hợp

## 🔍 Monitoring

### **Vercel Analytics**
- Real-time metrics
- Performance insights
- Error tracking
- User analytics

### **Custom Monitoring**
```typescript
// API performance tracking
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now()
  
  try {
    // API logic
    const result = await processRequest(req)
    
    // Log performance
    console.log(`API took ${Date.now() - start}ms`)
    
    res.json(result)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### 1. **Build Failures**
```bash
# Check build logs
vercel logs

# Local build test
npm run build
```

#### 2. **Environment Variables**
```bash
# List environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local
```

#### 3. **API Routes Not Working**
- Check function timeout settings
- Verify CORS headers
- Check request/response format

### **Debug Commands**
```bash
# Local development
vercel dev

# Check deployment status
vercel ls

# View function logs
vercel logs --follow
```

## 📚 Tài liệu tham khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel API Routes](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)
- [Migration Guide](https://vercel.com/docs/concepts/functions/serverless-functions#migrating-from-netlify-functions)

## 🎉 Kết luận

Migration từ Netlify sang Vercel hoàn tất với:
- ✅ API Routes thay thế Netlify Functions
- ✅ Cấu hình build và deploy mới
- ✅ Environment variables setup
- ✅ Performance optimizations
- ✅ Monitoring và debugging tools

**Dự án sẵn sàng deploy lên Vercel! 🚀**
