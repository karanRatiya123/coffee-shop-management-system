const FEEDBACK_STORAGE_KEY = 'brewos_feedback_entries';

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

function getFeedbackEntries() {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read feedback storage:', error);
    return [];
  }
}

function saveFeedbackEntries(entries) {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Unable to save feedback storage:', error);
  }
}

function renderStars(value) {
  return Array.from({ length: 5 }, (_, index) => (index < value ? '&#9733;' : '&#9734;')).join('');
}

function renderFeedbackSummary() {
  const entries = getFeedbackEntries();
  if (!feedbackCount || !feedbackAverage || !recentList) return;

  feedbackCount.textContent = String(entries.length);

  if (entries.length === 0) {
    feedbackAverage.textContent = '0.0 / 5';
    recentList.innerHTML = '<p class="empty-feedback">No feedback yet. Be the first to share your experience.</p>';
    return;
  }

  const average = (entries.reduce((sum, entry) => sum + Number(entry.rating), 0) / entries.length).toFixed(1);
  feedbackAverage.textContent = `${average} / 5`;

  recentList.innerHTML = entries.slice(0, 4).map(entry => `
    <article class="feedback-item">
      <div class="feedback-item-top">
        <strong>${entry.name || 'Anonymous'}</strong>
        <span>${renderStars(Number(entry.rating) || 0)}</span>
      </div>
      <p class="feedback-item-category">${entry.category || 'General'}</p>
      <p>${entry.comment || 'No comment provided.'}</p>
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
  form.addEventListener('submit', event => {
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

    const entries = getFeedbackEntries();
    const newEntry = {
      id: Date.now(),
      name: name || 'Anonymous',
      email,
      rating: selectedRating,
      category,
      comment,
      createdAt: new Date().toISOString()
    };

    entries.unshift(newEntry);
    saveFeedbackEntries(entries);
    renderFeedbackSummary();

    if (successBox) successBox.textContent = 'Your feedback has been saved locally.';
    toggleSuccessState(true);
    form.reset();
    setRating(0);
  });
}

if (anotherFeedbackButton) {
  anotherFeedbackButton.addEventListener('click', resetFormState);
}

renderFeedbackSummary();
toggleSuccessState(false);
setRating(0);
