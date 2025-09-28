<?php
/**
 * Example PHP code for embedding the YouTube Comment System
 * 
 * This file shows how to integrate the comment system into a PHP website
 */

// Example data - in real application, these would come from your database
$topicId = 'article_' . $_GET['id'] ?? 'demo-article-1';
$userId = $_SESSION['user_id'] ?? 'guest_' . uniqid();
$username = $_SESSION['username'] ?? 'Guest User';
$userImg = $_SESSION['avatar'] ?? 'https://via.placeholder.com/40';
$userEmail = $_SESSION['email'] ?? null;
$title = 'Demo Article Title';
$url = $_SERVER['REQUEST_URI'];
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .article-content {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .comment-section {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1><?php echo htmlspecialchars($title); ?></h1>
    
    <div class="article-content">
        <p>Đây là nội dung bài viết mẫu. Hệ thống comment sẽ được hiển thị bên dưới.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    </div>

    <!-- Comment System Container -->
    <div class="comment-section">
        <h2>Bình luận</h2>
        
        <!-- Comment Widget -->
        <div id="comment-widget" 
             data-topic-id="<?php echo htmlspecialchars($topicId); ?>"
             data-user-id="<?php echo htmlspecialchars($userId); ?>"
             data-username="<?php echo htmlspecialchars($username); ?>"
             data-user-img="<?php echo htmlspecialchars($userImg); ?>"
             <?php if ($userEmail): ?>
             data-user-email="<?php echo htmlspecialchars($userEmail); ?>"
             <?php endif; ?>
             data-title="<?php echo htmlspecialchars($title); ?>"
             data-url="<?php echo htmlspecialchars($url); ?>">
        </div>
    </div>

    <!-- Load Comment Widget Script -->
    <script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
    
    <!-- Alternative: Load from local file -->
    <!-- <script src="/path/to/comment-widget.js"></script> -->
</body>
</html>

<?php
/**
 * Alternative integration methods:
 */

// Method 1: Using WordPress
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

// Method 2: Using Laravel Blade Template
/*
@extends('layouts.app')

@section('content')
<div class="container">
    <h1>{{ $article->title }}</h1>
    <div class="article-content">
        {!! $article->content !!}
    </div>
    
    <div class="comment-section">
        <h2>Bình luận</h2>
        <div id="comment-widget" 
             data-topic-id="article_{{ $article->id }}"
             data-user-id="{{ auth()->id() }}"
             data-username="{{ auth()->user()->name }}"
             data-user-img="{{ auth()->user()->avatar }}"
             data-user-email="{{ auth()->user()->email }}"
             data-title="{{ $article->title }}"
             data-url="{{ request()->url() }}">
        </div>
    </div>
</div>

<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
@endsection
*/

// Method 3: Using CodeIgniter
/*
class Article extends CI_Controller {
    public function view($id) {
        $data['article'] = $this->article_model->get_article($id);
        $data['user'] = $this->session->userdata('user');
        
        $this->load->view('article_view', $data);
    }
}

// In article_view.php:
<div id="comment-widget" 
     data-topic-id="article_<?php echo $article['id']; ?>"
     data-user-id="<?php echo $user['id']; ?>"
     data-username="<?php echo htmlspecialchars($user['username']); ?>"
     data-user-img="<?php echo htmlspecialchars($user['avatar']); ?>"
     data-title="<?php echo htmlspecialchars($article['title']); ?>"
     data-url="<?php echo current_url(); ?>">
</div>
<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>
*/

// Method 4: Using Drupal
/*
function mymodule_node_view($node, $view_mode, $langcode) {
    if ($view_mode == 'full' && $node->type == 'article') {
        $user = \Drupal::currentUser();
        $comment_html = '
        <div id="comment-widget" 
             data-topic-id="node_' . $node->id() . '"
             data-user-id="' . $user->id() . '"
             data-username="' . $user->getDisplayName() . '"
             data-user-img="' . $user->get('field_avatar')->entity->getFileUri() . '"
             data-title="' . $node->getTitle() . '"
             data-url="' . \Drupal::request()->getUri() . '">
        </div>
        <script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>';
        
        $node->content['comment_system'] = [
            '#markup' => $comment_html,
            '#weight' => 100,
        ];
    }
}
*/

// Method 5: Using Joomla
/*
// In template override or component
$user = JFactory::getUser();
$article = $this->item;
$comment_html = '
<div id="comment-widget" 
     data-topic-id="article_' . $article->id . '"
     data-user-id="' . $user->id . '"
     data-username="' . htmlspecialchars($user->name) . '"
     data-user-img="' . htmlspecialchars($user->avatar) . '"
     data-title="' . htmlspecialchars($article->title) . '"
     data-url="' . JURI::current() . '">
</div>
<script src="https://your-domain.netlify.app/embed/comment-widget.js"></script>';

echo $comment_html;
*/
?>
