// Enhanced Contact Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    // Fix form submission issues
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form
      const formData = new FormData(contactForm);
      if (!validateContactForm(formData)) {
        return false;
      }
      
      // Show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      // Convert form data to JSON
      const formJson = {};
      formData.forEach((value, key) => {
        formJson[key] = value;
      });
      
      // Send form data to backend
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formJson)
      })
      .then(response => response.json())
      .then(data => {
        // Reset form
        contactForm.reset();
        
        // Show success message
        showNotification('success', 'Message sent successfully! We will contact you soon.');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        showNotification('error', 'Failed to send message. Please try again later.');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      });
    });
    
    // Add real-time validation to form fields
    const formFields = contactForm.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
      field.addEventListener('blur', function() {
        validateField(field);
      });
    });
  }
});

// Validate contact form
function validateContactForm(formData) {
  let isValid = true;
  const form = document.getElementById('contact-form');
  
  // Clear previous errors
  clearFormErrors(form);
  
  // Required fields validation
  const requiredFields = ['name', 'email', 'service', 'message'];
  requiredFields.forEach(field => {
    const value = formData.get(field);
    const input = form.querySelector(`[name="${field}"]`);
    
    if (!value || value.trim() === '') {
      showFieldError(input, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      isValid = false;
    }
  });
  
  // Email validation
  const email = formData.get('email');
  if (email && !isValidEmail(email)) {
    const emailInput = form.querySelector('[name="email"]');
    showFieldError(emailInput, 'Please enter a valid email address');
    isValid = false;
  }
  
  // Phone validation (if provided)
  const phone = formData.get('phone');
  if (phone && !isValidPhone(phone)) {
    const phoneInput = form.querySelector('[name="phone"]');
    showFieldError(phoneInput, 'Please enter a valid phone number');
    isValid = false;
  }
  
  return isValid;
}

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  const fieldName = field.name;
  
  clearFieldError(field);
  
  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\.]+$/,
      message: 'Name must be 2-100 characters and contain only letters, spaces, and dots'
    },
    email: {
      required: true,
      pattern: /^\S+@\S+\.\S+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[\+]?[0-9\s\-\(\)]{7,20}$/,
      message: 'Please enter a valid phone number'
    },
    service: {
      required: true,
      message: 'Please select a service'
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 2000,
      message: 'Message must be between 10 and 2000 characters'
    }
  };
  
  const rule = validationRules[fieldName];
  if (!rule) return true;
  
  // Check required fields
  if (rule.required && !value) {
    showFieldError(field, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
    return false;
  }
  
  // Check min length
  if (value && rule.minLength && value.length < rule.minLength) {
    showFieldError(field, rule.message);
    return false;
  }
  
  // Check max length
  if (value && rule.maxLength && value.length > rule.maxLength) {
    showFieldError(field, rule.message);
    return false;
  }
  
  // Check pattern
  if (value && rule.pattern && !rule.pattern.test(value)) {
    showFieldError(field, rule.message);
    return false;
  }
  
  return true;
}

// Helper functions
function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\+]?[0-9\s\-\(\)]{7,20}$/.test(phone);
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(el => el.remove());
  
  const invalidFields = form.querySelectorAll('.is-invalid');
  invalidFields.forEach(field => field.classList.remove('is-invalid'));
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const errorElement = field.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
}

function showFieldError(field, message) {
  field.classList.add('is-invalid');
  
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  field.parentNode.appendChild(errorElement);
}

function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 5000);
}