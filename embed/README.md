# YouTube Comment System - Embed Guide

Hướng dẫn nhúng hệ thống comment giống YouTube vào website PHP của bạn.

## Cài đặt nhanh

### 1. Thêm HTML vào trang của bạn

```html
<div id="comment-widget" 
     data-topic-id="your-topic-id"
     data-user-id="your-user-id"
     data-username="User Name"
     data-user-img="https://example.com/avatar.jpg"
     data-title="Topic Title"
     data-url="https://example.com/page">
</div>
<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
```

### 2. Các thuộc tính bắt buộc

- `data-topic-id`: ID duy nhất của chủ đề/bài viết
- `data-user-id`: ID duy nhất của người dùng
- `data-username`: Tên hiển thị của người dùng

### 3. Các thuộc tính tùy chọn

- `data-user-img`: URL avatar của người dùng
- `data-user-email`: Email của người dùng
- `data-title`: Tiêu đề chủ đề/bài viết
- `data-url`: URL của trang hiện tại

## Ví dụ tích hợp với PHP

### WordPress

```php
function add_comment_system_to_post($content) {
    if (is_single()) {
        $post_id = get_the_ID();
        $user_id = get_current_user_id();
        $username = wp_get_current_user()->display_name;
        $user_avatar = get_avatar_url(get_current_user_id());
        
        $comment_html = '
        <div id="comment-widget" 
             data-topic-id="post_' . $post_id . '"
             data-user-id="' . $user_id . '"
             data-username="' . esc_attr($username) . '"
             data-user-img="' . esc_url($user_avatar) . '"
             data-title="' . esc_attr(get_the_title()) . '"
             data-url="' . esc_url(get_permalink()) . '">
        </div>
        <script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>';
        
        return $content . $comment_html;
    }
    return $content;
}
add_filter('the_content', 'add_comment_system_to_post');
```

### Laravel

```blade
<div id="comment-widget" 
     data-topic-id="article_{{ $article->id }}"
     data-user-id="{{ auth()->id() }}"
     data-username="{{ auth()->user()->name }}"
     data-user-img="{{ auth()->user()->avatar }}"
     data-title="{{ $article->title }}"
     data-url="{{ request()->url() }}">
</div>
<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
```

### CodeIgniter

```php
<div id="comment-widget" 
     data-topic-id="article_<?php echo $article['id']; ?>"
     data-user-id="<?php echo $user['id']; ?>"
     data-username="<?php echo htmlspecialchars($user['username']); ?>"
     data-user-img="<?php echo htmlspecialchars($user['avatar']); ?>"
     data-title="<?php echo htmlspecialchars($article['title']); ?>"
     data-url="<?php echo current_url(); ?>">
</div>
<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
```

## Tùy chỉnh giao diện

### CSS Customization

```css
/* Tùy chỉnh màu sắc */
.comment-widget {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
}

/* Tùy chỉnh font */
.comment-widget {
    font-family: 'Your Custom Font', sans-serif;
}

/* Tùy chỉnh kích thước */
.comment-widget {
    max-width: 1000px; /* Thay đổi chiều rộng tối đa */
}

/* Tùy chỉnh màu nền */
.comment-widget {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}
```

### JavaScript Customization

```javascript
// Tùy chỉnh cấu hình
window.CommentWidgetConfig = {
    baseUrl: 'https://your-domain.netlify.app',
    theme: 'light', // 'light' hoặc 'dark'
    language: 'vi', // 'vi' hoặc 'en'
    maxComments: 100,
    autoLoad: true,
    showReplies: true,
    allowReplies: true,
    allowReactions: true
};
```

## API Endpoints

### Lấy comments

```
GET /api/comments/list?topicId=your-topic-id&userId=your-user-id
```

### Tạo comment

```
POST /api/comments/create
Content-Type: application/json

{
    "topicId": "your-topic-id",
    "userId": "your-user-id",
    "content": "Nội dung comment",
    "parentId": "parent-comment-id", // Tùy chọn cho reply
    "username": "User Name",
    "userImg": "https://example.com/avatar.jpg",
    "userEmail": "user@example.com",
    "title": "Topic Title",
    "url": "https://example.com/page"
}
```

### Cập nhật comment

```
PUT /api/comments/update
Content-Type: application/json

{
    "commentId": "comment-id",
    "content": "Nội dung đã chỉnh sửa"
}
```

### Xóa comment

```
DELETE /api/comments/delete?commentId=comment-id
```

### Toggle reaction

```
POST /api/comments/reaction
Content-Type: application/json

{
    "commentId": "comment-id",
    "userId": "user-id",
    "reactionType": "like" // hoặc "dislike"
}
```

## Bảo mật

### CORS Configuration

```javascript
// Trong netlify.toml
[[headers]]
  for = "/embed/*"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    Content-Security-Policy = "frame-ancestors *"
```

### Rate Limiting

```javascript
// Trong Netlify Functions
const rateLimit = new Map();

function checkRateLimit(userId, action) {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10; // 10 requests per minute
    
    if (!rateLimit.has(key)) {
        rateLimit.set(key, []);
    }
    
    const requests = rateLimit.get(key);
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
        throw new Error('Rate limit exceeded');
    }
    
    validRequests.push(now);
    rateLimit.set(key, validRequests);
}
```

## Performance Optimization

### Caching Strategy

1. **Client-side caching**: 5 phút cho comments
2. **Server-side caching**: 5 phút cho API responses
3. **CDN caching**: 10 phút cho static assets
4. **Database indexing**: Tối ưu queries

### Lazy Loading

```javascript
// Lazy load comments khi scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadComments();
        }
    });
});

observer.observe(document.getElementById('comment-widget'));
```

## Troubleshooting

### Lỗi thường gặp

1. **CORS Error**: Kiểm tra cấu hình CORS trong netlify.toml
2. **Script không load**: Kiểm tra URL script và network
3. **Comments không hiển thị**: Kiểm tra console log và API response
4. **Reactions không hoạt động**: Kiểm tra user permissions

### Debug Mode

```javascript
// Bật debug mode
window.CommentWidgetDebug = true;

// Xem logs trong console
console.log('Comment Widget Debug:', window.CommentWidget);
```

## Support

- **Documentation**: [Link to docs]
- **GitHub**: [Link to repo]
- **Issues**: [Link to issues]
- **Email**: support@example.com

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.
