/* ============================================
   DreamTime — Sleep Cycle Calculator
   Application Logic
   ============================================ */

(function () {
  'use strict';

  // --- Constants ---
  const SLEEP_ONSET_MINUTES = 15;
  const CYCLE_MINUTES = 90;
  const TOTAL_CYCLES = 6;

  // --- DOM References ---
  const inputView = document.getElementById('input-view');
  const bedtimeView = document.getElementById('bedtime-results');
  const wakeupView = document.getElementById('wakeup-results');
  const wakeTimeInput = document.getElementById('wake-time');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnSleepNow = document.getElementById('btn-sleep-now');
  const btnBackBedtime = document.getElementById('btn-back-bedtime');
  const btnBackWakeup = document.getElementById('btn-back-wakeup');
  const targetWakeTimeEl = document.getElementById('target-wake-time');
  const bedtimeList = document.getElementById('bedtime-list');
  const wakeupList = document.getElementById('wakeup-list');

  // --- Helpers ---

  /**
   * Format minutes-since-midnight into a 12-hour time string.
   */
  function formatTime(totalMinutes) {
    // Normalize to 0–1439
    let mins = ((totalMinutes % 1440) + 1440) % 1440;
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;

    const period = hours < 12 ? 'AM' : 'PM';
    let displayHour = hours % 12;
    if (displayHour === 0) displayHour = 12;

    const displayMin = minutes.toString().padStart(2, '0');
    return `${displayHour}:${displayMin} ${period}`;
  }

  /**
   * Parse an HTML time input value "HH:MM" into total minutes since midnight.
   */
  function parseTimeInput(value) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Calculate bedtimes for a given wake-up time (in minutes since midnight).
   * Returns an array of objects sorted from latest bedtime to earliest.
   */
  function calculateBedtimes(wakeMins) {
    const results = [];
    for (let cycle = TOTAL_CYCLES; cycle >= 1; cycle--) {
      const bedtime = wakeMins - SLEEP_ONSET_MINUTES - cycle * CYCLE_MINUTES;
      results.push({
        time: formatTime(bedtime),
        cycles: cycle,
        recommended: cycle === 5 || cycle === 6,
      });
    }
    return results;
  }

  /**
   * Calculate wake-up times from a given start time (in minutes since midnight).
   * Returns an array sorted from earliest wake-up to latest.
   */
  function calculateWakeUps(nowMins) {
    const results = [];
    for (let cycle = 1; cycle <= TOTAL_CYCLES; cycle++) {
      const wakeTime = nowMins + SLEEP_ONSET_MINUTES + cycle * CYCLE_MINUTES;
      results.push({
        time: formatTime(wakeTime),
        cycles: cycle,
        recommended: cycle === 5 || cycle === 6,
      });
    }
    return results;
  }

  // --- Rendering ---

  /**
   * Build result cards HTML from an array of result objects.
   */
  function renderCards(results) {
    return results
      .map((r) => {
        const recClass = r.recommended ? ' result-card--recommended' : '';
        const labelClass = r.recommended ? '' : ' result-card__label--muted';
        const labelText = r.recommended ? 'Recommended' : `${r.cycles} cycle${r.cycles > 1 ? 's' : ''}`;

        return `
          <li class="result-card${recClass}">
            <span class="result-card__time">${r.time}</span>
            <span class="result-card__label${labelClass}">${labelText}</span>
          </li>`;
      })
      .join('');
  }

  // --- View Switching ---

  function showView(view) {
    [inputView, bedtimeView, wakeupView].forEach((v) => {
      v.classList.remove('view--active');
    });

    // Small delay so the CSS transition can trigger
    requestAnimationFrame(() => {
      view.classList.add('view--active');
      // Scroll to top on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function goBack() {
    showView(inputView);
    // Refocus the time input for keyboard users
    setTimeout(() => wakeTimeInput.focus(), 350);
  }

  // --- Event Handlers ---

  btnCalculate.addEventListener('click', () => {
    const wakeMins = parseTimeInput(wakeTimeInput.value);
    const results = calculateBedtimes(wakeMins);

    targetWakeTimeEl.textContent = formatTime(wakeMins);
    bedtimeList.innerHTML = renderCards(results);
    showView(bedtimeView);
  });

  btnSleepNow.addEventListener('click', () => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const results = calculateWakeUps(nowMins);

    wakeupList.innerHTML = renderCards(results);
    showView(wakeupView);
  });

  btnBackBedtime.addEventListener('click', goBack);
  btnBackWakeup.addEventListener('click', goBack);

  // --- Keyboard support for Enter on time input ---
  wakeTimeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnCalculate.click();
    }
  });
})();
