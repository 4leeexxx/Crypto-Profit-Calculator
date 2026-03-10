// ===========================
//   CRYPTOCALC — script.js
// ===========================

function formatCurrency(value) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: abs < 0.01 ? 6 : 2
  });
}

function formatROI(value) {
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}

// Map an ROI value (-100 … +200) to a 0–100% position on the bar
function roiToBarPercent(roi) {
  const min = -100, max = 200;
  const clamped = Math.max(min, Math.min(max, roi));
  return ((clamped - min) / (max - min)) * 100;
}

function getVerdict(isProfit, roi, profit) {
  if (isProfit) {
    if (roi >= 200) return {
      emoji: '🚀', title: 'To the moon!',
      sub: `A ${roi.toFixed(0)}% gain — absolutely incredible.`
    };
    if (roi >= 100) return {
      emoji: '🎉', title: 'More than doubled!',
      sub: `${roi.toFixed(0)}% return — that's a brilliant trade.`
    };
    if (roi >= 50) return {
      emoji: '😍', title: 'Fantastic profit!',
      sub: `+${roi.toFixed(1)}% ROI — you're doing great.`
    };
    if (roi >= 20) return {
      emoji: '😊', title: 'Solid gain!',
      sub: `+${roi.toFixed(1)}% — a healthy return on your investment.`
    };
    return {
      emoji: '👍', title: 'In the green!',
      sub: `Every bit of profit counts. +${roi.toFixed(1)}% so far.`
    };
  } else {
    if (roi <= -70) return {
      emoji: '😬', title: 'Rough one…',
      sub: `Down ${Math.abs(roi).toFixed(0)}%. The market can always recover though!`
    };
    if (roi <= -30) return {
      emoji: '😔', title: 'Feeling the dip',
      sub: `−${Math.abs(roi).toFixed(1)}% — hang tight, the charts change fast.`
    };
    return {
      emoji: '😅', title: 'Slightly in the red',
      sub: `−${Math.abs(roi).toFixed(1)}% — not far from break even!`
    };
  }
}

function calculate() {
  const buyPrice  = parseFloat(document.getElementById('buyPrice').value);
  const sellPrice = parseFloat(document.getElementById('sellPrice').value);
  const amount    = parseFloat(document.getElementById('amount').value);

  // Validation
  if (isNaN(buyPrice) || isNaN(sellPrice) || isNaN(amount)) {
    return showError('Please fill in all three fields to calculate. 🙏');
  }
  if (buyPrice <= 0) {
    return showError('Buy price needs to be greater than zero! 😊');
  }
  if (amount <= 0) {
    return showError('Amount needs to be greater than zero! 😊');
  }

  const invested  = buyPrice  * amount;
  const returnVal = sellPrice * amount;
  const profit    = returnVal - invested;
  const roi       = ((sellPrice - buyPrice) / buyPrice) * 100;
  const isProfit  = profit >= 0;

  // Fill in values
  document.getElementById('val-invested').textContent = formatCurrency(invested);
  document.getElementById('val-return').textContent   = formatCurrency(returnVal);

  const profitEl = document.getElementById('val-profit');
  const roiEl    = document.getElementById('val-roi');

  profitEl.textContent = (isProfit ? '+' : '') + formatCurrency(profit);
  profitEl.className   = 'res-value res-large ' + (isProfit ? 'profit' : 'loss');

  roiEl.textContent = formatROI(roi);
  roiEl.className   = 'res-value res-large ' + (isProfit ? 'profit' : 'loss');

  // Accent cards
  const profitCard = document.getElementById('res-profit-card');
  const profitIcon = document.getElementById('profit-icon');
  if (isProfit) {
    profitCard.classList.remove('loss-card');
    profitIcon.textContent = '🏆';
  } else {
    profitCard.classList.add('loss-card');
    profitIcon.textContent = '📉';
  }

  // Verdict banner
  const banner = document.getElementById('verdict-banner');
  const verdict = getVerdict(isProfit, roi, profit);
  document.getElementById('verdict-emoji').textContent = verdict.emoji;
  document.getElementById('verdict-title').textContent = verdict.title;
  document.getElementById('verdict-sub').textContent   = verdict.sub;
  banner.className = 'verdict-banner ' + (isProfit ? 'win' : 'loss');

  // ROI bar
  const pct    = roiToBarPercent(roi);
  const needle = document.getElementById('roi-needle');
  const fill   = document.getElementById('roi-fill');

  needle.style.left = pct + '%';
  needle.style.borderColor = isProfit ? 'var(--green)' : 'var(--red)';

  fill.style.width      = pct + '%';
  fill.style.background = isProfit
    ? 'linear-gradient(90deg, rgba(39,174,96,0.15), rgba(39,174,96,0.35))'
    : 'linear-gradient(90deg, rgba(231,76,60,0.35), rgba(231,76,60,0.15))';

  // Show panel
  const panel = document.getElementById('results');
  panel.style.display = 'block';
  panel.style.animation = 'none';
  void panel.offsetWidth;
  panel.style.animation = 'pop-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)';

  document.getElementById('resetBtn').style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(msg) {
  const panel  = document.getElementById('results');
  const banner = document.getElementById('verdict-banner');
  document.getElementById('verdict-emoji').textContent = '⚠️';
  document.getElementById('verdict-title').textContent = 'Oops!';
  document.getElementById('verdict-sub').textContent   = msg;
  banner.className = 'verdict-banner loss';

  // Show only the banner within the panel
  document.getElementById('val-invested').textContent = '—';
  document.getElementById('val-return').textContent   = '—';
  document.getElementById('val-profit').textContent   = '—';
  document.getElementById('val-roi').textContent      = '—';

  panel.style.display = 'block';
  panel.style.animation = 'none';
  void panel.offsetWidth;
  panel.style.animation = 'pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)';

  // Shake the card
  const card = document.querySelector('.calc-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'shake 0.4s ease';

  document.getElementById('resetBtn').style.display = 'block';
}

function resetCalc() {
  ['buyPrice','sellPrice','amount'].forEach(id => {
    document.getElementById(id).value = '';
  });

  const panel = document.getElementById('results');
  panel.style.display = 'none';
  document.getElementById('resetBtn').style.display = 'none';

  document.getElementById('roi-needle').style.left  = '33%';
  document.getElementById('roi-fill').style.width   = '0%';

  document.getElementById('buyPrice').focus();
}

// Inject keyframes for shake
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%   { transform: translateX(0); }
    18%  { transform: translateX(-7px); }
    36%  { transform: translateX(7px); }
    54%  { transform: translateX(-4px); }
    72%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
  }
`;
document.head.appendChild(style);

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') calculate();
});

// Init: hide results and reset on load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('results').style.display  = 'none';
  document.getElementById('resetBtn').style.display = 'none';
});