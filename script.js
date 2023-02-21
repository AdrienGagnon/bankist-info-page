'use strict';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const nav = document.querySelector('.nav');
// Smooth scrolling
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
// Tabbed components
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

///////////////////////////////////////
// Modal window

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// Button scrolling
btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect(); // get the coordinates to scroll to, returns DOMRect
  console.log(e.target.getBoundingClientRect(), s1coords);

  console.log('Current scroll (X/Y)', window.pageXOffset, window.pageYOffset); // get where we are in the page (scrolling wise)

  console.log(
    'height/width viewport',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );

  // Scrolling
  // window.scrollTo(
  //   s1coords.left + window.pageXOffset,
  //   s1coords.top + window.pageYOffset
  // );

  // first way
  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  // Second way, much better
  section1.scrollIntoView({
    behavior: 'smooth',
  });
});

////////////////////////////////////////
// Page navigation

// Not clean:
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();
//     const id = this.getAttribute('href');
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// Cleaner:
// 1. Add event listener to common parent element (the box containing Features, Operations and Testimonials)
// 2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  // event to click on any element in the box
  e.preventDefault();

  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    // only if the link (without an 's') exists in the classes
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// tabs.forEach(t=>t.addEventListener('click', ()=>console.log('TAB');)) bad practice !!

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause: cleaner than if
  if (!clicked) return;

  // Deactivate tab
  tabs.forEach(t => t.classList.remove('operations__tab--active'));

  // Remove active content
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Active tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Menu fade animation
const handleHover = function (e) {
  e.preventDefault();
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// Passing an "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));

nav.addEventListener('mouseout', handleHover.bind(1));

// Sticky navigation

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

// const initialCoords = section1.getBoundingClientRect();
// window.addEventListener('scroll', function () {
//   // Usually we dont use scroll !!!
//   // console.log(window.scrollY);

//   if (window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });

// Way better solution:
// Intersection Observer API
const stickyNav = function (entries) {
  // Loop only necessary when the threshold is an array
  const [entry] = entries;
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`, // margin applied outside the target section
});
headerObserver.observe(header);

// Sliding in sections:
// Reveal sections
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  observer.unobserve(entry.target);
};

// Call the revealSection function when intersecting
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

// Adding the hidden class to the sections
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

// Lazy loading images
const imgTargets = document.querySelectorAll('img[data-src]'); // all the images that have the data-src property

const loadImg = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  // Remove blur: only when loading is done
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  // Stop observing the images
  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // To load before the threshold is reached
});
imgTargets.forEach(img => imgObserver.observe(img));

////////////////////////////////////////
// Slider component
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const maxSlide = slides.length;
  const dotContainer = document.querySelector('.dots');
  let curSlide = 0;

  slides.forEach((s, i) => (s.style.transform = `translateX(${i * 100}%)`));

  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));
    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${(i - slide) * 100}%)`)
    );
  };

  // Next slide
  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Previous slide
  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  init();

  // Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // Slide with left and right arrow keys
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  // Click on the dots to go to the corresponding slide
  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};

slider();

////////////////////////////////////////////////////////////
/* 
// Selecting elements
console.log(document.documentElement); // select the entire html
console.log(document.head);
console.log(document.body);

const header = document.querySelector('.header');
const allSections = document.querySelectorAll('.section'); // returns nodeLists
console.log(allSections); // doesnt update if we delete an element

document.getElementById('section--1'); // no need for '#' before
const allButtons = document.getElementsByTagName('button');
console.log(allButtons); // returns html collection

console.log(document.getElementsByClassName('btn')); // no need for '.'

// Creating and inserting elements
// .insertAdgacentHTML

const message = document.createElement('div');
message.classList.add('cookie-message');
// message.textContent =
//   'We use cookies for improved functionality and analytics.'; // textContent and innerHTML -> both to read and set content
message.innerHTML =
  'We use cookies for improved functionality and analytics. <button class="btn btn--close-cookie">Got it!</button>';
// header.prepend(message); // prepend adds as the first child of header element
header.append(message); // Cant do prepend AND prepend -> will do only the last one -> can be used to move them
// To put multiple ones:
// header.append(message.cloneNode(true)); // clone it so it appears at the top and bottom

// header.before(message);
// header.after(message);

// Delete elements when the button is clicked:
document
  .querySelector('.btn--close-cookie')
  .addEventListener('click', function () {
    // message.remove();
    message.parentElement.removeChild(message); //old way
  });

//////////////////////
// Advenced DOM effects

// Styles
message.style.backgroundColor = '#37383d';
message.style.width = '120%';

console.log(message.style.height); // doesnt work, only for inline styles, the ones we set ourself
console.log(message.style.backgroundColor);

console.log(getComputedStyle(message).height); // the way to get the styles
console.log(getComputedStyle(message).color);

message.style.height =
  Number.parseFloat(getComputedStyle(message), 10).height + 30 + 'px';

document.documentElement.style.setProperty('--color-primary', 'orangered'); // changing the :root --color-primary color !!! directly from the css file !!!

// Property: variables in css file

// Attributes: ex: src, rel, href...
const logo = document.querySelector('.nav__logo');
console.log(logo.alt); // directly access the attributes
console.log(logo.src);
console.log(logo.className);

logo.alt = 'Beautiful minimalist logo'; // change the value of the alt attribute

console.log(logo.designer); // cant access attributes that are not standard -> undefined
console.log(logo.getAttribute('designer'));

logo.setAttribute('company', 'Bankist');

console.log(logo.src); // Not the same link!!!
console.log(logo.getAttribute('src'));

const link = document.querySelector('.nav__link--btn');
console.log(link.href); // returns absolute URL
console.log(link.getAttribute('href')); // returns the one written in the html

// Data attributes
console.log(logo.dataset.versionNumber); // turning version-number into camelCase

// Classes
logo.classList.add('c', 'js');
logo.classList.remove('c');
logo.classList.toggle('c');
logo.classList.contains('c'); // like includes for arrays

// Overwrites the existing classe:
logo.className = 'jonas' // DONT USE !!!
 */

///////////////////////////////////////////////

/* 
// Events
const h1 = document.querySelector('h1');

const alertH1 = function (e) {
  alert('addEventListener: Great! You are reading the heading');
  h1.removeEventListener('mouseenter', alertH1); // Only once !!
};

// h1.addEventListener('mouseenter', function (e) {
//   alert('addEventListener: Great! You are reading the heading');
// });

h1.addEventListener('mouseenter', alertH1);

// see mdn documentation for all the event references

// h1.onmouseenter = function (e) {
//   alert('addEventListener: Good! You are reading the heading');
// }; // same thing, but oldschool. addEventListener is better
 */

/////////////////////////////////////////
// Bubbling and capturing
/* 
// rgb(255, 255, 255)
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
const randomColor = () =>
  `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;
console.log(randomColor(0, 255));

// nav link (child)
document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('LINK', e.target, e.currentTarget);
  console.log(e.currentTarget === this);

  // Stop propagation, usually not a good idea
  // e.stopPropagation();
});

// nav links (parent)
document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor();
  console.log('CONTAINER', e.target, e.currentTarget); // not the same !!
  console.log(e.currentTarget === this); // always true
});

document.querySelector('.nav').addEventListener(
  'click',
  function (e) {
    this.style.backgroundColor = randomColor();
    console.log('NAV', e.target, e.currentTarget);
  },
  true
); // true -> listens to capturing events and not bubbling events, so it is the first to be activated !!! Rarely used
 */
/* 
// DOM traversing
const h1 = document.querySelector('h1');

// Going downwards: child
console.log(h1.querySelectorAll('.highlight'));
console.log(h1.childNodes);
console.log(h1.children);

h1.firstElementChild.style.color = 'white';
h1.lastElementChild.style.color = 'orangered';

// Going upwards: parents
console.log(h1.parentNode);
console.log(h1.parentElement);

h1.closest('.header').style.background = 'var(--gradient-secondary)';
h1.closest('h1').style.background = 'var(--gradient-primary)';

// querySelector: finds CHILDREN element no matter how deep in the DOM tree
// closest: finds PARENT element no matter how up in the DOM tree

// Going sideways: siblings:
console.log(h1.previousElementSibling);
console.log(h1.nextElementSibling);

console.log(h1.previousSibling);
console.log(h1.nextSibling);

// To get all siblings
console.log(h1.parentElement.children);

// Change all siblings, except itself
[...h1.parentElement.children].forEach(function (el) {
  if (el !== h1) {
    el.style.transform = 'scale(0.5)';
  }
});
 */
/* 
// Intersection Observer API

const obsCallback = function (entries, observer) {
  entries.forEach(entry => {
    console.log(entry);
  });
};

const obsOptions = {
  root: null,
  threshold: [0, 0.2], // 1 is impossible because we cant see 100% of section 1 at the same time
};

const observer = new IntersectionObserver(obsCallback, obsOptions);
observer.observe(section1);
 */
/* 
// Life cycle
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built!', e);
});

// jQuery : document.ready

// When everthing is loaded (including CSS and images)
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});

// Before exiting, only when really necessary
window.addEventListener('beforeunload', function (e) {
  e.preventDefault(); // for some browsers
  console.log(e);
  e.returnValue = '';
});
 */
