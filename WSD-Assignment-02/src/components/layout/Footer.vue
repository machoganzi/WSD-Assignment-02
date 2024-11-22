<template>
  <footer :class="['footer', { 'dark-mode': themeStore.isDarkMode }]">
    <div class="footer-content">
      <!-- 브랜드 섹션 -->
      <div class="footer-section">
        <h3>MovieVerse</h3>
        <div class="footer-powered">
          Powered by 
          <a href="https://www.themoviedb.org" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="tmdb-link">
            TMDB
          </a>
        </div>
      </div>

      <!-- 법적 고지 섹션 -->
      <div class="footer-section">
        <div class="legal-links">
          <a href="#" class="legal-link">이용약관</a>
          <span class="divider">|</span>
          <a href="#" class="legal-link">개인정보처리방침</a>
          <span class="divider">|</span>
          <a href="#" class="legal-link">문의하기</a>
        </div>
        <p class="copyright">&copy; {{ currentYear }} MovieVerse. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background: rgba(20, 20, 20, 0.9);
  padding: 24px 20px;
  margin-top: auto;
}

.dark-mode .footer {
  background: rgba(18, 18, 18, 0.98);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.footer-section h3 {
  color: #e50914;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.footer-powered {
  color: #999;
  font-size: 0.85rem;
}

.tmdb-link {
  color: #01b4e4;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.tmdb-link:hover {
  color: #0197c0;
  text-decoration: underline;
}

.legal-links {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.legal-link {
  color: #999;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: #fff;
}

.divider {
  color: #666;
  font-size: 0.85rem;
}

.copyright {
  color: #666;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .footer-section {
    width: 100%;
  }

  .legal-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .legal-links {
    flex-direction: column;
    gap: 8px;
  }

  .divider {
    display: none;
  }
}
</style>