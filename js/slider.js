'use strict';

const totalSlides = document.querySelectorAll('.slide').length;
const imagem = document.getElementById("roleta-sonora");

somRoleta.volume = 0.5; 

function goSlide(idx) {
  if(currentSlide === idx) return;
  const home = document.getElementById("page-home");

  if (home.classList.contains("active")) {
    somRoleta.currentTime = 0;
    somRoleta.play().catch(() => {});
  }
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  dots[currentSlide].setAttribute('aria-selected', 'false');

  currentSlide = idx;

  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  dots[currentSlide].setAttribute('aria-selected', 'true');
  somRoleta.currentTime = 0; 
    somRoleta.play().catch(error => {
        
        console.log("Aguardando interação do usuário para liberar o som.");
    });
}

function nextSlide() {
  goSlide((currentSlide + 1) % totalSlides);
}

sliderInterval = setInterval(nextSlide, 10000);

document.querySelector('.slider-dots')?.addEventListener('click', (e) => {
  const dot = e.target.closest('.dot');
  if (!dot) return;
  const idx = Number(dot.dataset.slide);
  clearInterval(sliderInterval);
  goSlide(idx);
  sliderInterval = setInterval(nextSlide, 10000);
});