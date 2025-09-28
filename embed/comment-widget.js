/**
 * YouTube Comment System - Embed Widget
 * Version: 1.0.0
 * 
 * Usage:
 * <div id="comment-widget" 
 *      data-topic-id="your-topic-id"
 *      data-user-id="your-user-id"
 *      data-username="User Name"
 *      data-user-img="https://example.com/avatar.jpg"
 *      data-title="Topic Title"
 *      data-url="https://example.com/page">
 * </div>
 * <script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    baseUrl: 'https://your-domain.netlify.app',
    version: '1.0.0',
    cache: new Map(),
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  };

  // Utility functions
  const utils = {
    // Generate unique ID
    generateId: () => Math.random().toString(36).substr(2, 9),
    
    // Format time
    formatTime: (dateString) => {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
      } catch {
        return 'vừa xong';
      }
    },

    // Escape HTML
    escapeHtml: (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Cache management
    cache: {
      set: (key, data, ttl = CONFIG.cacheTTL) => {
        CONFIG.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl
        });
      },
      
      get: (key) => {
        const item = CONFIG.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
          CONFIG.cache.delete(key);
          return null;
        }
        
        return item.data;
      },
      
      clear: (pattern) => {
        if (pattern) {
          for (const key of CONFIG.cache.keys()) {
            if (key.includes(pattern)) {
              CONFIG.cache.delete(key);
            }
          }
        } else {
          CONFIG.cache.clear();
        }
      }
    }
  };

  // API client
  const api = {
    async request(endpoint, options = {}) {
      const url = `${CONFIG.baseUrl}/api/comments${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      return response.json();
    },

    async getComments(topicId, userId) {
      const cacheKey = `comments_${topicId}_${userId || 'anonymous'}`;
      const cached = utils.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const data = await this.request(`/list?topicId=${topicId}&userId=${userId || ''}`);
      utils.cache.set(cacheKey, data);
      return data;
    },

    async createComment(data) {
      const result = await this.request('/create', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      utils.cache.clear(data.topicId);
      return result;
    },

    async updateComment(commentId, content) {
      const result = await this.request('/update', {
        method: 'PUT',
        body: JSON.stringify({ commentId, content }),
      });
      
      utils.cache.clear('comments_');
      return result;
    },

    async deleteComment(commentId) {
      const result = await this.request(`/delete?commentId=${commentId}`, {
        method: 'DELETE',
      });
      
      utils.cache.clear('comments_');
      return result;
    },

    async toggleReaction(commentId, userId, reactionType) {
      const result = await this.request('/reaction', {
        method: 'POST',
        body: JSON.stringify({ commentId, userId, reactionType }),
      });
      
      utils.cache.clear('comments_');
      return result;
    }
  };

  // UI Components
  const components = {
    // Comment item template
    commentItem: (comment, isReply = false) => `
      <div class="comment-item ${isReply ? 'comment-reply' : ''}" data-comment-id="${comment.id}">
        <div class="comment-avatar">
          <img src="${comment.avatar_url || 'https://via.placeholder.com/40'}" 
               alt="${utils.escapeHtml(comment.username)}"
               onerror="this.src='https://via.placeholder.com/40'">
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-username">${utils.escapeHtml(comment.username)}</span>
            <span class="comment-time">${utils.formatTime(comment.created_at)}</span>
            ${comment.is_edited ? '<span class="comment-edited">(đã chỉnh sửa)</span>' : ''}
            ${comment.is_pinned ? '<span class="comment-pinned">📌</span>' : ''}
          </div>
          <div class="comment-text">${utils.escapeHtml(comment.content)}</div>
          <div class="comment-actions">
            <button class="reaction-btn like-btn ${comment.user_reaction === 'like' ? 'active' : ''}" 
                    data-comment-id="${comment.id}" data-reaction="like">
              👍 ${comment.likes_count}
            </button>
            <button class="reaction-btn dislike-btn ${comment.user_reaction === 'dislike' ? 'active' : ''}" 
                    data-comment-id="${comment.id}" data-reaction="dislike">
              👎 ${comment.dislikes_count}
            </button>
            <button class="reply-btn" data-comment-id="${comment.id}">Trả lời</button>
            ${comment.replies_count > 0 ? `
              <button class="show-replies-btn" data-comment-id="${comment.id}">
                ${comment.replies_count} trả lời
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `,

    // Comment form template
    commentForm: (placeholder = 'Viết comment...', buttonText = 'Bình luận') => `
      <div class="comment-form">
        <textarea class="comment-input" placeholder="${placeholder}" maxlength="1000"></textarea>
        <div class="comment-form-actions">
          <span class="char-count">0/1000</span>
          <button class="comment-submit-btn">${buttonText}</button>
        </div>
      </div>
    `,

    // Loading template
    loading: () => `
      <div class="comment-loading">
        <div class="spinner"></div>
        <span>Đang tải comments...</span>
      </div>
    `,

    // Error template
    error: (message) => `
      <div class="comment-error">
        <span>❌ ${utils.escapeHtml(message)}</span>
      </div>
    `
  };

  // Main Comment Widget Class
  class CommentWidget {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        topicId: container.dataset.topicId,
        userId: container.dataset.userId,
        username: container.dataset.username || 'Anonymous',
        userImg: container.dataset.userImg || 'https://via.placeholder.com/40',
        userEmail: container.dataset.userEmail,
        title: container.dataset.title,
        url: container.dataset.url,
        ...options
      };
      
      this.comments = [];
      this.currentUser = null;
      this.currentTopic = null;
      this.replyingTo = null;
      this.editingComment = null;
      this.showReplies = new Set();
      
      this.init();
    }

    async init() {
      try {
        this.render(components.loading());
        await this.loadData();
        this.render();
        this.bindEvents();
      } catch (error) {
        console.error('Error initializing comment widget:', error);
        this.render(components.error('Không thể tải hệ thống comment'));
      }
    }

    async loadData() {
      // Create user and topic (these would typically be handled by the API)
      this.currentUser = {
        id: this.options.userId,
        external_id: this.options.userId,
        username: this.options.username,
        avatar_url: this.options.userImg,
        email: this.options.userEmail
      };

      this.currentTopic = {
        id: this.options.topicId,
        external_id: this.options.topicId,
        title: this.options.title,
        url: this.options.url
      };

      // Load comments
      const data = await api.getComments(this.options.topicId, this.options.userId);
      this.comments = data.comments || [];
    }

    render(customContent = null) {
      if (customContent) {
        this.container.innerHTML = customContent;
        return;
      }

      const html = `
        <div class="comment-widget">
          <div class="comment-header">
            <h3>Comments (${this.comments.length})</h3>
          </div>
          
          ${this.currentUser ? components.commentForm() : ''}
          
          <div class="comments-list">
            ${this.comments.length === 0 ? 
              '<div class="no-comments">Chưa có comment nào. Hãy là người đầu tiên bình luận!</div>' :
              this.comments.map(comment => this.renderComment(comment)).join('')
            }
          </div>
        </div>
      `;
      
      this.container.innerHTML = html;
    }

    renderComment(comment) {
      let html = components.commentItem(comment);
      
      // Add replies if showing
      if (this.showReplies.has(comment.id) && comment.replies && comment.replies.length > 0) {
        html += '<div class="comment-replies">';
        html += comment.replies.map(reply => components.commentItem(reply, true)).join('');
        html += '</div>';
      }
      
      return html;
    }

    bindEvents() {
      // Comment form submission
      const commentForm = this.container.querySelector('.comment-form');
      if (commentForm) {
        const textarea = commentForm.querySelector('.comment-input');
        const submitBtn = commentForm.querySelector('.comment-submit-btn');
        const charCount = commentForm.querySelector('.char-count');
        
        textarea.addEventListener('input', (e) => {
          const count = e.target.value.length;
          charCount.textContent = `${count}/1000`;
          submitBtn.disabled = count === 0 || count > 1000;
        });
        
        submitBtn.addEventListener('click', () => this.handleSubmitComment(textarea.value, this.replyingTo));
        
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.handleSubmitComment(textarea.value, this.replyingTo);
          }
        });
      }

      // Reaction buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('reaction-btn')) {
          const commentId = e.target.dataset.commentId;
          const reaction = e.target.dataset.reaction;
          this.handleReaction(commentId, reaction);
        }
      });

      // Reply buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('reply-btn')) {
          const commentId = e.target.dataset.commentId;
          this.handleReply(commentId);
        }
      });

      // Show replies buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-replies-btn')) {
          const commentId = e.target.dataset.commentId;
          this.handleToggleReplies(commentId);
        }
      });
    }

    async handleSubmitComment(content, parentId = null) {
      if (!content.trim() || !this.currentUser) return;

      try {
        await api.createComment({
          topicId: this.options.topicId,
          userId: this.options.userId,
          content: content.trim(),
          parentId,
          username: this.options.username,
          userImg: this.options.userImg,
          userEmail: this.options.userEmail,
          title: this.options.title,
          url: this.options.url
        });

        // Reload comments
        await this.loadData();
        this.render();
        this.bindEvents();
        
        // Clear form
        const textarea = this.container.querySelector('.comment-input');
        if (textarea) textarea.value = '';
        
        this.replyingTo = null;
      } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Không thể thêm comment. Vui lòng thử lại.');
      }
    }

    async handleReaction(commentId, reactionType) {
      if (!this.currentUser) return;

      try {
        await api.toggleReaction(commentId, this.options.userId, reactionType);
        
        // Reload comments
        await this.loadData();
        this.render();
        this.bindEvents();
      } catch (error) {
        console.error('Error toggling reaction:', error);
      }
    }

    handleReply(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      // Re-render to show/hide reply form
      this.render();
      this.bindEvents();
    }

    handleToggleReplies(commentId) {
      if (this.showReplies.has(commentId)) {
        this.showReplies.delete(commentId);
      } else {
        this.showReplies.add(commentId);
      }
      this.render();
      this.bindEvents();
    }
  }

  // CSS Styles
  const styles = `
    <style>
      .comment-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 20px;
      }
      
      .comment-header h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 18px;
      }
      
      .comment-form {
        margin-bottom: 20px;
      }
      
      .comment-input {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        box-sizing: border-box;
      }
      
      .comment-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
      
      .comment-form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
      }
      
      .char-count {
        font-size: 12px;
        color: #666;
      }
      
      .comment-submit-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .comment-submit-btn:hover:not(:disabled) {
        background: #0056b3;
      }
      
      .comment-submit-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      .comment-item {
        display: flex;
        margin-bottom: 16px;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 6px;
      }
      
      .comment-reply {
        margin-left: 40px;
        background: #f9f9f9;
      }
      
      .comment-avatar {
        margin-right: 12px;
      }
      
      .comment-avatar img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .comment-content {
        flex: 1;
      }
      
      .comment-header {
        margin-bottom: 8px;
      }
      
      .comment-username {
        font-weight: 600;
        color: #333;
        margin-right: 8px;
      }
      
      .comment-time {
        color: #666;
        font-size: 12px;
      }
      
      .comment-edited {
        color: #666;
        font-size: 12px;
        font-style: italic;
      }
      
      .comment-pinned {
        color: #007bff;
        margin-left: 8px;
      }
      
      .comment-text {
        color: #333;
        line-height: 1.5;
        margin-bottom: 8px;
      }
      
      .comment-actions {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      
      .reaction-btn, .reply-btn, .show-replies-btn {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      .reaction-btn:hover, .reply-btn:hover, .show-replies-btn:hover {
        background: #f0f0f0;
      }
      
      .reaction-btn.active {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      .comment-loading, .comment-error, .no-comments {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      
      .spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-right: 8px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .comment-replies {
        margin-top: 16px;
        border-left: 2px solid #eee;
        padding-left: 16px;
      }
    </style>
  `;

  // Initialize widget when DOM is ready
  function init() {
    // Add styles to head
    if (!document.querySelector('#comment-widget-styles')) {
      const styleElement = document.createElement('div');
      styleElement.id = 'comment-widget-styles';
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }

    // Find all comment widgets
    const widgets = document.querySelectorAll('[id="comment-widget"]');
    
    widgets.forEach(container => {
      if (!container.dataset.topicId) {
        console.error('Comment widget: topicId is required');
        return;
      }
      
      if (!container.dataset.userId) {
        console.error('Comment widget: userId is required');
        return;
      }
      
      new CommentWidget(container);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for global access
  window.CommentWidget = CommentWidget;
})();
