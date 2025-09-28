# Comment System - YouTube-like Comments for Vercel + Supabase

## 🚀 Deploy nhanh (5 phút)

### **1. Deploy lên Vercel**
1. **Fork repository này**
2. **Push code lên GitHub**
3. **Vào Vercel Dashboard**:
   - Click "New Project"
   - Import từ GitHub
   - Chọn repository
   - Click "Deploy"

### **2. Cài đặt Supabase**
```
Truy cập: https://your-project.vercel.app/setup
Làm theo 9 bước trong Setup Wizard
```

### **3. Sử dụng**
```
Comment System: https://your-project.vercel.app
Admin Panel: https://your-project.vercel.app/admin
Embed Code: https://your-project.vercel.app/admin?tab=embed
```

## ✨ Tính năng

### **Comment System**
- ✅ Giao diện giống YouTube
- ✅ Like/Dislike comments
- ✅ Reply comments
- ✅ Real-time updates
- ✅ User avatars
- ✅ Comment timestamps

### **Admin Panel**
- ✅ Cấu hình Supabase
- ✅ Quản lý database
- ✅ Theo dõi trạng thái
- ✅ Tạo code embed
- ✅ Analytics dashboard

### **Setup Wizard**
- ✅ Hướng dẫn từng bước
- ✅ Tự động cài đặt
- ✅ Test kết nối
- ✅ Download .env.local

## 📊 Khả năng chịu tải

### **Vercel Free Plan + Supabase Free Plan:**
- **300,000+ page views/day**
- **30,000+ users/day**
- **Chi phí $0/tháng**

## 🎯 Embed vào Website

### **PHP Integration**
```php
<?php
$userId = "user123";
$userImg = "https://example.com/avatar.jpg";
$topicId = "topic456";
?>

<div id="comment-system"></div>
<script src="https://your-project.vercel.app/embed/comment-widget.js"></script>
<script>
  CommentSystem.init({
    apiUrl: 'https://your-project.vercel.app/api',
    userId: '<?php echo $userId; ?>',
    userImg: '<?php echo $userImg; ?>',
    topicId: '<?php echo $topicId; ?>'
  });
</script>
```

### **JavaScript Integration**
```html
<div id="comment-system"></div>
<script src="https://your-project.vercel.app/embed/comment-widget.js"></script>
<script>
  CommentSystem.init({
    apiUrl: 'https://your-project.vercel.app/api',
    userId: 'user123',
    userImg: 'https://example.com/avatar.jpg',
    topicId: 'topic456'
  });
</script>
```

## 📁 Cấu trúc dự án

```
comment/
├── api/                          # Vercel API Routes
│   ├── comments.ts              # Comment CRUD operations
│   ├── analytics.ts             # Analytics API
│   └── health.ts                # Health check API
├── embed/                       # Embed files
│   ├── comment-widget.js        # Standalone widget
│   ├── php-example.php          # PHP integration example
│   └── README.md                # Embed documentation
├── src/                         # Source code
│   ├── components/              # React components
│   │   ├── CommentSystem.tsx    # Main comment system
│   │   ├── CommentForm.tsx      # Comment form
│   │   ├── CommentList.tsx      # Comment list
│   │   ├── CommentItem.tsx      # Individual comment
│   │   ├── AdminPage.tsx        # Admin panel
│   │   ├── SupabaseSetup.tsx    # Setup wizard
│   │   └── ...                  # Other components
│   ├── lib/                     # Utilities
│   │   ├── api.ts               # API client
│   │   ├── cache.ts             # Client-side caching
│   │   ├── supabase.ts          # Supabase client
│   │   └── analytics.ts         # Analytics
│   └── pages/                   # Pages
├── supabase/                    # Supabase configuration
│   ├── config.toml              # Supabase config
│   └── schema.sql               # Database schema
├── public/                      # Static files
│   └── sw.js                    # Service worker
├── vercel.json                  # Vercel configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 🛠️ Development

### **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Environment Variables**
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📚 Tài liệu

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt
- [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md) - Hướng dẫn deploy
- [FEATURES_GUIDE.md](./FEATURES_GUIDE.md) - Hướng dẫn tính năng
- [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) - Chi tiết deployment

## 🎉 Kết luận

**Comment System hoàn chỉnh với:**
- ✅ Giao diện đẹp như YouTube
- ✅ Performance cao (300k+ page views/day)
- ✅ Dễ sử dụng (Setup Wizard)
- ✅ Miễn phí (Vercel + Supabase Free)
- ✅ Dễ embed (PHP + JavaScript)

**Chỉ cần deploy lên Vercel và làm theo Setup Wizard!** 🚀