const form = document.getElementById('feedback-form');
const formCard = document.querySelector('.form-card');
const errorBox = document.getElementById('feedback-error');
const successBox = document.getElementById('feedback-success');
const stars = Array.from(document.querySelectorAll('.star-btn'));
const ratingLabel = document.getElementById('rating-label');
const feedbackCount = document.getElementById('feedback-count');
const feedbackAverage = document.getElementById('feedback-average');
const recentList = document.getElementById('recent-feedback-list');
const successState = document.getElementById('feedback-success-state');
const anotherFeedbackButton = document.getElementById('feedback-another-btn');

let selectedRating = 0;

function toggleSuccessState(show) {
  if (successState) {
    successState.classList.toggle('hidden', !show);
  }
  if (formCard) {
    formCard.classList.toggle('is-success', show);
  }
}

async function getFeedbackEntries() {
  try {
    const response = await fetch('FeedbackServlet');
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn('Unable to fetch feedback from database:', error);
  }
  return [];
}

function renderStars(value) {
  return Array.from({ length: 5 }, (_, index) => (index < value ? '&#9733;' : '&#9734;')).join('');
}

async function renderFeedbackSummary() {
  const entries = await getFeedbackEntries();
  if (!feedbackCount || !feedbackAverage || !recentList) return;

  feedbackCount.textContent = String(entries.length);

  if (entries.length === 0) {
    feedbackAverage.textContent = '0.0 / 5';
    recentList.innerHTML = '<p class="empty-feedback">No feedback yet. Be the first to share your experience.</p>';
    return;
  }

  const average = (entries.reduce((sum, entry) => sum + Number(entry.rating || 5), 0) / entries.length).toFixed(1);
  feedbackAverage.textContent = `${average} / 5`;

  recentList.innerHTML = entries.slice(0, 4).map(entry => `
    <article class="feedback-item">
      <div class="feedback-item-top">
        <strong>${entry.comments && entry.comments.includes('From:') ? entry.comments.split('From:')[1].split('-')[0].trim() : 'Customer'}</strong>
        <span>${renderStars(Number(entry.rating) || 5)}</span>
      </div>
      <p class="feedback-item-category">Feedback #${entry.feedbackId || ''}</p>
      <p>${entry.comments || 'No comment provided.'}</p>
    </article>
  `).join('');
}

function setRating(rating) {
  selectedRating = rating;

  stars.forEach((star, index) => {
    star.classList.toggle('active', index < rating);
    star.setAttribute('aria-pressed', String(index < rating));
  });

  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  if (ratingLabel) {
    ratingLabel.textContent = rating ? labels[rating - 1] : 'Select a rating';
  }
}

function resetFormState() {
  if (!form) return;

  form.reset();
  setRating(0);
  toggleSuccessState(false);

  if (errorBox) errorBox.textContent = '';
  if (successBox) successBox.textContent = '';

  const firstField = form.querySelector('input, select, textarea');
  if (firstField) firstField.focus();
}

stars.forEach(star => {
  star.addEventListener('click', () => {
    setRating(Number(star.dataset.value));
  });
});

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const name = document.getElementById('feedback-name').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const category = document.getElementById('feedback-category').value;
    const comment = document.getElementById('feedback-comment').value.trim();

    if (errorBox) errorBox.textContent = '';
    if (successBox) successBox.textContent = '';

    if (!selectedRating) {
      if (errorBox) errorBox.textContent = 'Please choose a rating before submitting.';
      return;
    }

    if (!category) {
      if (errorBox) errorBox.textContent = 'Please choose a feedback category.';
      return;
    }

    if (!comment) {
      if (errorBox) errorBox.textContent = 'Please add a short comment for your feedback.';
      return;
    }

    try {
      const params = new URLSearchParams({
        rating: String(selectedRating),
        name: name || 'Anonymous',
        email: email || '',
        category: category || '',
        comment: comment || ''
      });

      const response = await fetch('FeedbackServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (response.ok) {
        if (successBox) successBox.textContent = 'Your feedback has been saved to database!';
        toggleSuccessState(true);
        form.reset();
        setRating(0);
        renderFeedbackSummary();
      } else {
        if (errorBox) errorBox.textContent = 'Failed to save feedback to database. Please try again.';
      }
    } catch (e) {
      console.error('Feedback submit error:', e);
      if (errorBox) errorBox.textContent = 'Unable to connect to database server.';
    }
  });
}

if (anotherFeedbackButton) {
  anotherFeedbackButton.addEventListener('click', resetFormState);
}

renderFeedbackSummary();
toggleSuccessState(false);
setRating(0);

// Logout Session
function logoutSession() {
  try {
    sessionStorage.clear();
  } catch (e) {
    console.warn("sessionStorage is unavailable or blocked:", e);
  }
  window.location.href = 'index.html';
}
