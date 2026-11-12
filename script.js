const btnNo = document.getElementById('btnNo');
const btnYes = document.getElementById('btnYes');
const funnyHint = document.getElementById('funnyHint');
const screen1 = document.getElementById('screen-1');
const screen2 = document.getElementById('screen-2');

let isFixed = false;
let currentX = 0;
let currentY = 0;
let escapeCount = 0;
let lastQuoteTime = 0;

const funnyQuotes = [
  "Basamazsın ki kanka 😂",
  "Kaçarım böyle 🏃💨",
  "Zorlama brom, tek seçenek EVET! 😎",
  "MİLF oldun artık kaçış yok 💅",
  "Hala kovalıyor musun cidden? 🤣",
  "Kaderinden kaçamazsın... 🎂",
  "Bana yetişemezsin brom! ⚡"
];

function showFunnyHint() {
  const now = Date.now();
  if (now - lastQuoteTime > 1100) {
    lastQuoteTime = now;
    escapeCount++;
    const quoteIndex = (escapeCount - 1) % funnyQuotes.length;
    funnyHint.textContent = funnyQuotes[quoteIndex];
    funnyHint.classList.add('visible');

    // Evet butonunu dikkat çekmek için hafif büyüt
    if (escapeCount <= 6) {
      const scale = 1 + escapeCount * 0.04;
      btnYes.style.transform = `scale(${scale})`;
    }
  }
}

// Butonu ilk kaçış anında layout'u bozmadan fixed konuma geçir ve tüm ekranda özgürce dolaşabilmesi için body'ye taşı
function ensureFixedPosition() {
  if (!isFixed) {
    const rect = btnNo.getBoundingClientRect();
    
    // Evet butonunun yerinin kaymaması için yerine görünmez bir placeholder ekle
    const placeholder = document.createElement('div');
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.visibility = 'hidden';
    placeholder.style.pointerEvents = 'none';
    placeholder.id = 'btnNoPlaceholder';
    btnNo.parentNode.insertBefore(placeholder, btnNo);

    currentX = rect.left;
    currentY = rect.top;

    // Kartın (backdrop-filter / transform) sınırından kurtulup TÜM EKRANDA gezebilmesi için body'ye ekle
    document.body.appendChild(btnNo);

    btnNo.style.position = 'fixed';
    btnNo.style.left = `${currentX}px`;
    btnNo.style.top = `${currentY}px`;
    btnNo.style.margin = '0';
    btnNo.style.zIndex = '99999';

    isFixed = true;
  }
}

// İmleç veya parmak yaklaştıkça butonu tüm ekran içinde kaçıran fonksiyon
function evadePointer(clientX, clientY, forceDistance = null) {
  ensureFixedPosition();

  const btnWidth = btnNo.offsetWidth;
  const btnHeight = btnNo.offsetHeight;

  const btnCenterX = currentX + btnWidth / 2;
  const btnCenterY = currentY + btnHeight / 2;

  const distX = btnCenterX - clientX;
  const distY = btnCenterY - clientY;
  const distance = Math.hypot(distX, distY);

  const threshold = forceDistance !== null ? forceDistance : 150;

  // İmleç yaklaşma sınırındaysa kaç
  if (distance < threshold) {
    showFunnyHint();

    // İmlecin tam tersi yönünde kaçış açısı
    const angle = distance > 0 ? Math.atan2(distY, distX) : Math.random() * Math.PI * 2;
    const pushFactor = (threshold - distance) * 1.8 + 70;

    let targetX = currentX + Math.cos(angle) * pushFactor;
    let targetY = currentY + Math.sin(angle) * pushFactor;

    // Ekran sınırları (güvenli boşluk ile - asla dışarı çıkamaz)
    const padding = 25;
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);

    const minX = padding;
    const maxX = viewportWidth - btnWidth - padding;
    const minY = padding;
    const maxY = viewportHeight - btnHeight - padding;

    // Köşeye / kenara sıkışırsa duvar boyunca kaysın, imlecin arkasına dolansın
    if (targetX < minX) {
      targetX = minX;
      targetY += (clientY < btnCenterY) ? 100 : -100;
    } else if (targetX > maxX) {
      targetX = maxX;
      targetY += (clientY < btnCenterY) ? 100 : -100;
    }

    if (targetY < minY) {
      targetY = minY;
      targetX += (clientX < btnCenterX) ? 100 : -100;
    } else if (targetY > maxY) {
      targetY = maxY;
      targetX += (clientX < btnCenterX) ? 100 : -100;
    }

    // "Evet" butonunun üstüne binmesini engelle
    const yesRect = btnYes.getBoundingClientRect();
    const yesCenterX = yesRect.left + yesRect.width / 2;
    const yesCenterY = yesRect.top + yesRect.height / 2;
    const predictedCenterX = targetX + btnWidth / 2;
    const predictedCenterY = targetY + btnHeight / 2;
    const distToYes = Math.hypot(predictedCenterX - yesCenterX, predictedCenterY - yesCenterY);

    if (distToYes < 110) {
      const angleAwayFromYes = Math.atan2(predictedCenterY - yesCenterY, predictedCenterX - yesCenterX);
      targetX += Math.cos(angleAwayFromYes) * 85;
      targetY += Math.sin(angleAwayFromYes) * 85;
    }

    // KESİN SINIR KONTROLÜ (Tüm ekran sınırları içinde)
    currentX = Math.max(minX, Math.min(maxX, targetX));
    currentY = Math.max(minY, Math.min(maxY, targetY));

    // Yeni pozisyonu yumuşakça uygula
    btnNo.style.left = `${currentX}px`;
    btnNo.style.top = `${currentY}px`;
  }
}

// Masaüstü imleç takibi
window.addEventListener('mousemove', (e) => {
  evadePointer(e.clientX, e.clientY);
});

// İmleç doğrudan butonun üzerine gelirse hızlıca it
btnNo.addEventListener('mouseenter', (e) => {
  evadePointer(e.clientX, e.clientY, 160);
});
btnNo.addEventListener('mouseover', (e) => {
  evadePointer(e.clientX, e.clientY, 160);
});

// Mobil & Dokunmatik kontroller
function handleTouch(e) {
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    evadePointer(touch.clientX, touch.clientY, 160);
  }
}

window.addEventListener('touchmove', handleTouch, { passive: true });
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleTouch(e);
}, { passive: false });

// Tıklama ve klavye engeli
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  evadePointer(e.clientX, e.clientY, 200);
});

btnNo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    evadePointer(currentX + btnNo.offsetWidth / 2, currentY + btnNo.offsetHeight / 2, 200);
  }
});

// Pencere boyutu değiştiğinde butonun ekran dışında kalmasını önle
window.addEventListener('resize', () => {
  if (isFixed) {
    const btnWidth = btnNo.offsetWidth;
    const btnHeight = btnNo.offsetHeight;
    const padding = 20;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    currentX = Math.max(padding, Math.min(maxX, currentX));
    currentY = Math.max(padding, Math.min(maxY, currentY));
    btnNo.style.left = `${currentX}px`;
    btnNo.style.top = `${currentY}px`;
  }
});

// Evet butonuna tıklandığında
btnYes.addEventListener('click', () => {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  }

  setTimeout(() => {
    screen1.style.opacity = '0';
    screen1.style.transform = 'scale(0.9)';
    btnNo.style.display = 'none'; // Ekran 2'ye geçerken Hayır butonunu kaldır
    
    setTimeout(() => {
      screen1.classList.add('hidden');
      screen2.classList.remove('hidden');
      screen2.style.opacity = '1';
      screen2.style.transform = 'scale(1)';
    }, 300);
  }, 600);
});

// Başa Dön (Tekrar Oyna) Butonu
const btnRestart = document.getElementById('btnRestart');
if (btnRestart) {
  btnRestart.addEventListener('click', () => {
    screen2.classList.add('hidden');
    screen1.classList.remove('hidden');
    screen1.style.opacity = '1';
    screen1.style.transform = 'scale(1)';

    const placeholder = document.getElementById('btnNoPlaceholder');
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.insertBefore(btnNo, placeholder);
      placeholder.remove();
    }

    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.margin = '';
    btnNo.style.zIndex = '';
    btnNo.style.display = '';
    btnYes.style.transform = '';
    funnyHint.textContent = '';
    funnyHint.classList.remove('visible');

    isFixed = false;
    escapeCount = 0;
  });
}
