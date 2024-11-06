<template>
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Movie App</h3>
          <p>영화 정보 제공 서비스</p>
        </div>
        <div class="footer-section">
          <h4>메뉴</h4>
          <router-link to="/">홈</router-link>
          <router-link to="/popular">대세 콘텐츠</router-link>
          <router-link to="/search">찾아보기</router-link>
          <router-link to="/wishlist">찜한 목록</router-link>
        </div>
        <div class="footer-section">
          <h4>Powered By</h4>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener">
            TMDB API
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Movie App. All rights reserved.</p>
      </div>
    </footer>
  </template>
  
  <style scoped>
  .footer {
    background: #141414;
    padding: 40px 20px 20px;
    margin-top: auto;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .footer-section h3 {
    color: #e50914;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .footer-section h4 {
    color: #fff;
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  
  .footer-section a {
    color: #999;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .footer-section a:hover {
    color: #e50914;
  }
  
  .footer-bottom {
    max-width: 1200px;
    margin: 40px auto 0;
    padding-top: 20px;
    border-top: 1px solid #333;
    text-align: center;
    color: #999;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .footer-content {
      grid-template-columns: 1fr;
    }
  }
  </style>