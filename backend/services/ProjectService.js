const Project = require('../models/Project_model');
const ImageOptimizationService = require('./ImageOptimizationService');
const SEOService = require('./SEOService');

class ProjectService {
  constructor(projectRepository = null, imageService = null, seoService = null) {
    this.projectRepository = projectRepository || Project;
    this.imageService = imageService || new ImageOptimizationService();
    this.seoService = seoService || new SEOService();
  }

  /**
   * Create a new project with enhanced features
   */
  async createProject(projectData, createdBy) {
    try {
      // Generate SEO-friendly slug
      const slug = this.seoService.generateSlug(projectData.title);

      // Optimize images if provided
      if (projectData.images && projectData.images.length > 0) {
        projectData.images = await this.imageService.optimizeProjectImages(projectData.images);
      }

      // Enhance project data
      const enhancedData = {
        ...projectData,
        slug,
        // Auto-generate meta fields if not provided
        metaTitle: projectData.metaTitle || projectData.title,
        metaDescription: projectData.metaDescription || this.generateMetaDescription(projectData),
        // Set default status
        status: projectData.status || 'completed'
      };

      const project = new this.projectRepository(enhancedData);
      await project.save();

      console.log(`✅ New project created: ${project.title} by ${createdBy}`);

      return project;
    } catch (error) {
      console.error('❌ ProjectService.createProject error:', error);
      throw error;
    }
  }

  /**
   * Get projects with advanced filtering and search
   */
  async getProjects(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        status,
        featured,
        search,
        sortBy = 'completionDate',
        sortOrder = 'desc'
      } = { ...filters, ...pagination };

      // Build filter object
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (featured !== undefined) filter.featured = featured === 'true';

      // Search filter
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { clientName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [projects, total] = await Promise.all([
        this.projectRepository.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        this.projectRepository.countDocuments(filter)
      ]);

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ ProjectService.getProjects error:', error);
      throw error;
    }
  }

  /**
   * Get single project by ID or slug
   */
  async getProject(identifier) {
    try {
      let project;

      // Try to find by ID first, then by slug
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        project = await this.projectRepository.findById(identifier);
      } else {
        project = await this.projectRepository.findOne({ slug: identifier });
      }

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error) {
      console.error('❌ ProjectService.getProject error:', error);
      throw error;
    }
  }

  /**
   * Update project with validation and optimization
   */
  async updateProject(projectId, updateData, updatedBy) {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Update slug if title changed
      if (updateData.title && updateData.title !== project.title) {
        updateData.slug = this.seoService.generateSlug(updateData.title);
      }

      // Optimize new images if provided
      if (updateData.images && updateData.images.length > 0) {
        updateData.images = await this.imageService.optimizeProjectImages(updateData.images);
      }

      // Update meta description if description changed
      if (updateData.description && !updateData.metaDescription) {
        updateData.metaDescription = this.generateMetaDescription(updateData);
      }

      const updatedProject = await this.projectRepository.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true, runValidators: true }
      );

      console.log(`📝 Project updated: ${updatedProject.title} by ${updatedBy}`);

      return updatedProject;
    } catch (error) {
      console.error('❌ ProjectService.updateProject error:', error);
      throw error;
    }
  }

  /**
   * Delete project with cleanup
   */
  async deleteProject(projectId, deletedBy) {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Clean up associated images
      if (project.images && project.images.length > 0) {
        await this.imageService.cleanupProjectImages(project.images);
      }

      await this.projectRepository.findByIdAndDelete(projectId);

      console.log(`🗑️ Project deleted: ${project.title} by ${deletedBy}`);

      return { success: true, deletedProject: project };
    } catch (error) {
      console.error('❌ ProjectService.deleteProject error:', error);
      throw error;
    }
  }

  /**
   * Get featured projects with caching
   */
  async getFeaturedProjects(limit = 6) {
    try {
      const projects = await this.projectRepository.find({ featured: true })
        .sort({ completionDate: -1, createdAt: -1 })
        .limit(limit);

      return projects;
    } catch (error) {
      console.error('❌ ProjectService.getFeaturedProjects error:', error);
      throw error;
    }
  }

  /**
   * Get project statistics and analytics
   */
  async getProjectStatistics() {
    try {
      const [
        totalProjects,
        categoryBreakdown,
        statusBreakdown,
        featuredCount,
        recentProjects,
        valueStats,
        completionTrend
      ] = await Promise.all([
        this.projectRepository.countDocuments(),
        this.getCategoryBreakdown(),
        this.getStatusBreakdown(),
        this.projectRepository.countDocuments({ featured: true }),
        this.getRecentProjects(),
        this.getValueStatistics(),
        this.getCompletionTrend()
      ]);

      return {
        overview: {
          totalProjects,
          featuredProjects: featuredCount,
          completedProjects: statusBreakdown.find(s => s._id === 'completed')?.count || 0,
          inProgressProjects: statusBreakdown.find(s => s._id === 'in-progress')?.count || 0
        },
        breakdowns: {
          category: categoryBreakdown,
          status: statusBreakdown
        },
        trends: {
          completion: completionTrend
        },
        performance: {
          totalValue: valueStats.totalValue || 0,
          averageValue: valueStats.averageValue || 0,
          averageDuration: valueStats.averageDuration || 0
        },
        recent: recentProjects
      };
    } catch (error) {
      console.error('❌ ProjectService.getProjectStatistics error:', error);
      throw error;
    }
  }

  /**
   * Toggle project featured status
   */
  async toggleFeatured(projectId, updatedBy) {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      project.featured = !project.featured;
      await project.save();

      console.log(`⭐ Project featured status toggled: ${project.title} (${project.featured ? 'featured' : 'unfeatured'}) by ${updatedBy}`);

      return project;
    } catch (error) {
      console.error('❌ ProjectService.toggleFeatured error:', error);
      throw error;
    }
  }

  /**
   * Bulk update project status
   */
  async bulkUpdateStatus(projectIds, status, updatedBy) {
    try {
      const validStatuses = ['planning', 'in-progress', 'completed', 'on-hold'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const result = await this.projectRepository.updateMany(
        { _id: { $in: projectIds } },
        { status },
        { runValidators: true }
      );

      console.log(`📝 Bulk status update: ${result.modifiedCount} projects updated to ${status} by ${updatedBy}`);

      return result;
    } catch (error) {
      console.error('❌ ProjectService.bulkUpdateStatus error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Generate meta description from project data
   */
  generateMetaDescription(projectData) {
    const { title, description, location, category } = projectData;
    let metaDesc = `${title} - ${category} project`;
    
    if (location) {
      metaDesc += ` in ${location}`;
    }
    
    if (description) {
      const shortDesc = description.substring(0, 100).trim();
      metaDesc += `. ${shortDesc}${shortDesc.length < description.length ? '...' : ''}`;
    }

    return metaDesc.substring(0, 160); // SEO limit
  }

  async getCategoryBreakdown() {
    return this.projectRepository.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$projectValue' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  async getStatusBreakdown() {
    return this.projectRepository.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getRecentProjects(limit = 5) {
    return this.projectRepository.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title category status createdAt');
  }

  async getValueStatistics() {
    const stats = await this.projectRepository.aggregate([
      {
        $match: { projectValue: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$projectValue' },
          averageValue: { $avg: '$projectValue' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average duration
    const durationStats = await this.projectRepository.aggregate([
      {
        $match: {
          startDate: { $exists: true },
          completionDate: { $exists: true }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$completionDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$duration' }
        }
      }
    ]);

    return {
      ...stats[0],
      averageDuration: durationStats[0]?.averageDuration || 0
    };
  }

  async getCompletionTrend() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.projectRepository.aggregate([
      {
        $match: {
          completionDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completionDate' },
            month: { $month: '$completionDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }
}

module.exports = ProjectService;