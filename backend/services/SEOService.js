class SEOService {
  constructor() {
    // SEO utility service for generating SEO-friendly content
  }

  /**
   * Generate SEO-friendly slug from title
   */
  generateSlug(title) {
    try {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    } catch (error) {
      console.error('❌ SEOService.generateSlug error:', error);
      return 'untitled';
    }
  }

  /**
   * Generate meta description from content
   */
  generateMetaDescription(content, maxLength = 160) {
    try {
      if (!content) return '';

      // Remove HTML tags and extra whitespace
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanContent.length <= maxLength) {
        return cleanContent;
      }

      // Truncate at word boundary
      const truncated = cleanContent.substring(0, maxLength);
      const lastSpace = truncated.lastIndexOf(' ');
      
      return lastSpace > 0 
        ? truncated.substring(0, lastSpace) + '...'
        : truncated + '...';
    } catch (error) {
      console.error('❌ SEOService.generateMetaDescription error:', error);
      return '';
    }
  }

  /**
   * Extract keywords from content
   */
  extractKeywords(content, maxKeywords = 10) {
    try {
      if (!content) return [];

      // Remove HTML tags and convert to lowercase
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .toLowerCase();

      // Common stop words to exclude
      const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
      ]);

      // Extract words and count frequency
      const words = cleanContent
        .match(/\b[a-z]{3,}\b/g) || [];

      const wordCount = {};
      words.forEach(word => {
        if (!stopWords.has(word)) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });

      // Sort by frequency and return top keywords
      return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxKeywords)
        .map(([word]) => word);
    } catch (error) {
      console.error('❌ SEOService.extractKeywords error:', error);
      return [];
    }
  }

  /**
   * Generate structured data for projects
   */
  generateProjectStructuredData(project) {
    try {
      return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": project.title,
        "description": project.description,
        "creator": {
          "@type": "Organization",
          "name": "MB Construction"
        },
        "dateCreated": project.startDate,
        "dateModified": project.updatedAt,
        "image": project.images?.[0]?.url,
        "keywords": project.tags?.join(', '),
        "locationCreated": project.location
      };
    } catch (error) {
      console.error('❌ SEOService.generateProjectStructuredData error:', error);
      return {};
    }
  }

  /**
   * Generate Open Graph meta tags
   */
  generateOpenGraphTags(data) {
    try {
      const { title, description, image, url, type = 'website' } = data;

      return {
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:url': url,
        'og:type': type,
        'og:site_name': 'MB Construction'
      };
    } catch (error) {
      console.error('❌ SEOService.generateOpenGraphTags error:', error);
      return {};
    }
  }

  /**
   * Generate Twitter Card meta tags
   */
  generateTwitterCardTags(data) {
    try {
      const { title, description, image } = data;

      return {
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image
      };
    } catch (error) {
      console.error('❌ SEOService.generateTwitterCardTags error:', error);
      return {};
    }
  }

  /**
   * Validate and optimize meta title
   */
  optimizeMetaTitle(title, maxLength = 60) {
    try {
      if (!title) return '';

      const cleanTitle = title.trim();
      
      if (cleanTitle.length <= maxLength) {
        return cleanTitle;
      }

      // Truncate at word boundary
      const truncated = cleanTitle.substring(0, maxLength);
      const lastSpace = truncated.lastIndexOf(' ');
      
      return lastSpace > 0 
        ? truncated.substring(0, lastSpace)
        : truncated;
    } catch (error) {
      console.error('❌ SEOService.optimizeMetaTitle error:', error);
      return title || '';
    }
  }

  /**
   * Generate canonical URL
   */
  generateCanonicalUrl(baseUrl, path) {
    try {
      const cleanPath = path.replace(/\/+/g, '/').replace(/\/$/, '');
      return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
    } catch (error) {
      console.error('❌ SEOService.generateCanonicalUrl error:', error);
      return baseUrl;
    }
  }

  /**
   * Generate sitemap entry
   */
  generateSitemapEntry(url, lastModified, changeFreq = 'monthly', priority = 0.5) {
    try {
      return {
        url,
        lastModified: lastModified instanceof Date 
          ? lastModified.toISOString().split('T')[0]
          : lastModified,
        changeFreq,
        priority
      };
    } catch (error) {
      console.error('❌ SEOService.generateSitemapEntry error:', error);
      return { url, lastModified: new Date().toISOString().split('T')[0] };
    }
  }

  /**
   * Analyze content for SEO score
   */
  analyzeSEOScore(content, targetKeyword) {
    try {
      const score = {
        total: 0,
        factors: {}
      };

      // Title optimization (20 points)
      if (content.title) {
        if (content.title.length >= 30 && content.title.length <= 60) {
          score.factors.titleLength = 20;
        } else {
          score.factors.titleLength = 10;
        }

        if (targetKeyword && content.title.toLowerCase().includes(targetKeyword.toLowerCase())) {
          score.factors.titleKeyword = 15;
        } else {
          score.factors.titleKeyword = 0;
        }
      }

      // Meta description (15 points)
      if (content.metaDescription) {
        if (content.metaDescription.length >= 120 && content.metaDescription.length <= 160) {
          score.factors.metaDescLength = 15;
        } else {
          score.factors.metaDescLength = 8;
        }
      }

      // Content length (20 points)
      if (content.description) {
        const wordCount = content.description.split(/\s+/).length;
        if (wordCount >= 300) {
          score.factors.contentLength = 20;
        } else if (wordCount >= 150) {
          score.factors.contentLength = 15;
        } else {
          score.factors.contentLength = 5;
        }
      }

      // Image optimization (10 points)
      if (content.images && content.images.length > 0) {
        const hasAltText = content.images.some(img => img.alt);
        score.factors.imageOptimization = hasAltText ? 10 : 5;
      }

      // Calculate total score
      score.total = Object.values(score.factors).reduce((sum, value) => sum + value, 0);
      score.percentage = Math.round((score.total / 100) * 100);

      return score;
    } catch (error) {
      console.error('❌ SEOService.analyzeSEOScore error:', error);
      return { total: 0, percentage: 0, factors: {} };
    }
  }
}

module.exports = SEOService;