const BaseError = require('./BaseError');

/**
 * Business Logic Error for domain-specific validation and rules
 */
class BusinessLogicError extends BaseError {
  constructor(message, errorCode = 'BUSINESS_LOGIC_ERROR', context = {}) {
    super(message, 400, errorCode, true);
    
    this.context = context;
  }

  /**
   * Create invalid state error
   */
  static invalidState(currentState, requiredState, entity = 'entity') {
    return new BusinessLogicError(
      `Invalid ${entity} state. Current: ${currentState}, Required: ${requiredState}`,
      'INVALID_STATE',
      { currentState, requiredState, entity }
    );
  }

  /**
   * Create business rule violation error
   */
  static ruleViolation(rule, details = null) {
    return new BusinessLogicError(
      `Business rule violation: ${rule}`,
      'RULE_VIOLATION',
      { rule, details }
    );
  }

  /**
   * Create insufficient resources error
   */
  static insufficientResources(resource, required, available) {
    return new BusinessLogicError(
      `Insufficient ${resource}. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_RESOURCES',
      { resource, required, available }
    );
  }

  /**
   * Create operation not allowed error
   */
  static operationNotAllowed(operation, reason) {
    return new BusinessLogicError(
      `Operation '${operation}' is not allowed: ${reason}`,
      'OPERATION_NOT_ALLOWED',
      { operation, reason }
    );
  }

  /**
   * Create deadline exceeded error
   */
  static deadlineExceeded(deadline, currentTime = new Date()) {
    return new BusinessLogicError(
      `Deadline exceeded. Deadline: ${deadline}, Current: ${currentTime}`,
      'DEADLINE_EXCEEDED',
      { deadline, currentTime }
    );
  }

  /**
   * Create quota exceeded error
   */
  static quotaExceeded(quotaType, limit, current) {
    return new BusinessLogicError(
      `${quotaType} quota exceeded. Limit: ${limit}, Current: ${current}`,
      'QUOTA_EXCEEDED',
      { quotaType, limit, current }
    );
  }

  /**
   * Create dependency not met error
   */
  static dependencyNotMet(dependency, requirement) {
    return new BusinessLogicError(
      `Dependency not met: ${dependency} requires ${requirement}`,
      'DEPENDENCY_NOT_MET',
      { dependency, requirement }
    );
  }

  /**
   * Create workflow violation error
   */
  static workflowViolation(currentStep, requiredStep, workflow = 'process') {
    return new BusinessLogicError(
      `Workflow violation in ${workflow}. Current step: ${currentStep}, Required: ${requiredStep}`,
      'WORKFLOW_VIOLATION',
      { currentStep, requiredStep, workflow }
    );
  }

  /**
   * Contact-specific business logic errors
   */
  static contactAlreadyProcessed(contactId) {
    return new BusinessLogicError(
      'Contact inquiry has already been processed',
      'CONTACT_ALREADY_PROCESSED',
      { contactId }
    );
  }

  static invalidContactStatus(currentStatus, targetStatus) {
    return BusinessLogicError.invalidState(currentStatus, targetStatus, 'contact');
  }

  static contactAssignmentConflict(contactId, currentAssignee, newAssignee) {
    return new BusinessLogicError(
      `Contact is already assigned to ${currentAssignee}`,
      'CONTACT_ASSIGNMENT_CONFLICT',
      { contactId, currentAssignee, newAssignee }
    );
  }

  /**
   * Project-specific business logic errors
   */
  static projectNotEditable(projectId, status) {
    return new BusinessLogicError(
      `Project cannot be edited in ${status} status`,
      'PROJECT_NOT_EDITABLE',
      { projectId, status }
    );
  }

  static projectDependencyMissing(projectId, dependency) {
    return BusinessLogicError.dependencyNotMet(`Project ${projectId}`, dependency);
  }

  static maxFeaturedProjectsExceeded(limit) {
    return BusinessLogicError.quotaExceeded('Featured projects', limit, limit + 1);
  }

  /**
   * Admin-specific business logic errors
   */
  static cannotDeleteSelf() {
    return BusinessLogicError.operationNotAllowed('delete own account', 'self-deletion not permitted');
  }

  static lastAdminDeletion() {
    return BusinessLogicError.operationNotAllowed('delete admin', 'cannot delete the last admin user');
  }

  static adminRoleRequired(operation) {
    return new BusinessLogicError(
      `Admin role required for operation: ${operation}`,
      'ADMIN_ROLE_REQUIRED',
      { operation }
    );
  }

  getUserMessage() {
    switch (this.errorCode) {
      case 'INVALID_STATE':
        return `This action cannot be performed in the current state.`;
      case 'RULE_VIOLATION':
        return `This action violates business rules: ${this.context.rule}`;
      case 'INSUFFICIENT_RESOURCES':
        return `Insufficient ${this.context.resource} to complete this action.`;
      case 'OPERATION_NOT_ALLOWED':
        return `This operation is not allowed: ${this.context.reason}`;
      case 'DEADLINE_EXCEEDED':
        return 'The deadline for this action has passed.';
      case 'QUOTA_EXCEEDED':
        return `${this.context.quotaType} limit has been exceeded.`;
      case 'DEPENDENCY_NOT_MET':
        return `Required dependency not met: ${this.context.requirement}`;
      case 'WORKFLOW_VIOLATION':
        return 'This action cannot be performed at this stage of the process.';
      case 'CONTACT_ALREADY_PROCESSED':
        return 'This contact inquiry has already been processed.';
      case 'CONTACT_ASSIGNMENT_CONFLICT':
        return 'This contact is already assigned to another team member.';
      case 'PROJECT_NOT_EDITABLE':
        return 'This project cannot be edited in its current status.';
      case 'ADMIN_ROLE_REQUIRED':
        return 'Administrator privileges are required for this action.';
      default:
        return this.message;
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      context: this.context
    };
  }
}

module.exports = BusinessLogicError;