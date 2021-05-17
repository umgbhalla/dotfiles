'use strict';

var responder;
chrome.runtime.onMessage.addListener(function (request, sender, respond) {
  switch (request.message) {
    case SM_MESSAGE_SHOW_WELCOME:
      responder = respond;
      return true;
  }
});

var main = document.getElementsByTagName('main')[0],
    closeButton = document.getElementById('close'),
    slidesContainer = document.querySelector('section.slides'),
    slides = Array.prototype.slice.call(slidesContainer.children),
    slidesButtons = slidesContainer.querySelectorAll('button:not(#btn-country'),
    lastSlide = Math.max.apply(Math, slides.map(function (slide) {
  return parseInt(slide.getAttribute('step'));
})),
    nameField = document.getElementById('name'),
    emailField = document.getElementById('email'),
    navButtons = document.querySelector('nav.buttons'),
    stepButtons = Array.prototype.slice.call(document.querySelectorAll('nav.steps a')),
    prevButton = navButtons.querySelector('.prev'),
    nextButton = navButtons.querySelector('.next'),
    countryControls = document.getElementById('country-controls'),
    countryButton = document.getElementById('btn-country'),
    countryName = document.getElementById('country-name'),
    countryPicker = null,
    noUser = true;

moveTo(parseInt(location.hash.slice(1)) || 0);

var getUser = new Promise(function (resolve, reject) {
  Startme.getUser(true).then(function (user) {
    noUser = false;

    resolve(user);
  }).catch(function (err) {
    Startme.createAnonymousUser().then(function (user) {

      Startme.getUser(true);
      resolve(user);
    }).catch(reject);
  });
});

getUser.then(function (user) {

  updateUserFields(user);
  initCountries(user);
});

function initCountries(user) {
  var country = determineUserCountry(user);

  buildCountries(country.locale);
  selectCountry(country.locale);

  if (user && !user.country) saveCountry(country.locale);

  countryButton.addEventListener('click', showCountryPicker);
  countryPicker.addEventListener('change', function (event) {
    saveCountry(event.target.value);
    selectCountry(event.target.value);
  });
}

function determineUserCountry(user) {
  var browserLocale = Startme.getLocale();

  if (user && user.country) {
    var country = findCountryByCountryCode(user.country);

    if (country && country.code) return country;
  }

  return findCountryByLocale(browserLocale, true);
}

function selectCountry(locale) {
  var country = findCountryByLocale(locale, true);

  if (country) {
    countryName.innerHTML = country.name;
    showCountryButton();
  } else {
    showCountryPicker();
  }
}

function findCountryByLocale(locale) {
  var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var country = COUNTRIES.find(function (country) {
    return country.locale.toLowerCase() === locale.toLowerCase();
  });

  if (!country && fallback) return findCountryByLocale(Startme.USER_FALLBACK_LOCALE, false);

  return country;
}

function findCountryByCountryCode(countryCode) {
  var country = COUNTRIES.find(function (country) {
    return country.code.toLowerCase() === countryCode.toLowerCase();
  });

  return country;
}

function buildCountries(locale) {
  var select = Startme.crel(countryControls, 'select', 'country-picker', 'hidden');

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = COUNTRIES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var country = _step.value;

      var el = Startme.crel(select, 'option', { value: country.locale }, country.name);

      if (country.locale === locale) el.setAttribute('selected', true);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  countryPicker = select;
}

function showCountryButton() {
  countryButton.classList.remove('hidden');
  countryPicker.classList.add('hidden');
}

function showCountryPicker() {
  countryButton.classList.add('hidden');
  countryPicker.classList.remove('hidden');
}

function updateUserFields(user) {
  if (user.raw_name) nameField.value = user.raw_name.toString().trim();
  if (!user.dummy_email) emailField.value = user.email.toString().trim();
  emailField.disabled = !user.dummy_email;
}

function updateUser(user) {
  getUser = Promise.resolve(user);
  getUser.then(updateUserFields);
}

function lock() {
  document.body.classList.add('locked');
}

function unlock() {
  document.body.classList.remove('locked');
}

function isLocked() {
  return document.body.classList.contains('locked');
}

function getCurrentStep() {
  return parseInt(main.getAttribute('step')) || 0;
}

function moveTo(step) {
  return new Promise(function (resolve, reject) {

    if (isLocked()) return reject();

    var currentStep = getCurrentStep(),
        currentSlide = slides[currentStep];
    step = Math.max(0, Math.min(step, lastSlide));

    if (step === 1 && !noUser) step += 1;

    var move = function move() {

      main.setAttribute('step', step);

      updateCurrentStep();
    };

    if (step > currentStep) {

      var valid = true,
          slideInputs = currentSlide.querySelectorAll('input,select');
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = slideInputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var input = _step2.value;

          valid = valid && input.checkValidity();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      currentSlide.classList.toggle('invalid', !valid);
      if (!valid) return reject();
    }

    if (step >= currentStep) {

      var action = currentSlide.getAttribute('action');
      performAction(action).then(move).then(resolve).catch(reject);
    } else {

      move();
      resolve();
    }
  });
}

function updateCurrentStep() {
  var step = getCurrentStep();

  var slide = slides[step];
  if (document.activeElement) document.activeElement.blur();
  slide.querySelectorAll('.autofocus').forEach(function (input) {
    if (input.tagName == 'INPUT') input.select();else input.focus();

    main.scrollLeft = 0;
  });

  if (!history.state || history.state.step != step) {
    history.pushState({ step: step }, null, '#' + step);
  }
}

function removeStep(number) {
  var isStep = function isStep(element) {
    return parseInt(element.getAttribute('step')) == number;
  };
  var followsStep = function followsStep(element) {
    return parseInt(element.getAttribute('step')) > number;
  };
  var remove = function remove(element) {
    return element.remove();
  };
  var decreaseStep = function decreaseStep(element) {
    return element.setAttribute('step', parseInt(element.getAttribute('step')) - 1);
  };

  slides.filter(isStep).forEach(remove);
  stepButtons.filter(isStep).forEach(remove);

  slides.filter(followsStep).forEach(decreaseStep);
  stepButtons.filter(followsStep).forEach(decreaseStep);

  lastSlide--;
}

function moveRel(delta) {
  var step = getCurrentStep();
  step += delta;
  moveTo(step);
}

function performAction(action) {
  switch (action) {
    case 'get_permissions':
      return getOptionalPermissions();
    case 'go_to_signin':
      return goToSignIn();
    case 'create_anonymous':
      return continueCreation();
    case 'wait_user':
      return waitUser;
    case 'done':
      return getOptionalPermissions().then(done).catch(function (e) {
        return console.error(e);
      });
    case 'import':
      return doImport();
    case 'save_name':
      return saveName();
    case 'save_email':
      return saveEmail();
    default:
      return Promise.resolve();
  }

  function getOptionalPermissions() {

    if (!chrome.permissions) return Promise.resolve();
    return new Promise(function (resolve, reject) {

      chrome.permissions.request({
        permissions: ['contextMenus']
      }, function (granted) {
        if (granted) {
          resolve();
        } else {
          reject(chrome.runtime.lastError);
        }
      });
    }).catch(function (err) {});
  }

  function goToSignIn() {
    if (responder) {
      responder({ isNewUser: false, openSignIn: true });
      window.close();
    } else {
      location.href = Startme.apiURL('/users/sign_in');
    }
  }

  function continueCreation() {
    return Promise.resolve();
  }

  function waitUser() {
    return new Promise(function (resolve, reject) {
      lock();
      getUser.then(function (user) {
        unlock();
        resolve();
      }).catch(function (err) {
        unlock();
        reject();
      });
    });
  }

  function done() {
    return new Promise(function (resolve, reject) {
      getUser.then(function (user) {
        var isNewUser = user.dummy_email && user.is_anonymous;

        if (responder) {
          responder({ isNewUser: isNewUser });
          window.close();
        } else {
          location.href = Startme.apiURL('/users/home' + (isNewUser ? '#tour' : ''));
        }
        resolve();
      }).catch(reject);
    });
  }

  var importId = void 0,
      importPromise = void 0;

  function doImport() {
    if (!importPromise) {
      importPromise = new Promise(function (resolve, reject) {

        var slide = slidesContainer.querySelector('.slide.import');
        var buttons = slide.querySelector('.buttons');
        var working = slide.querySelector('.working');

        getUser.then(function () {
          chrome.runtime.sendMessage({
            message: SM_MESSAGE_IMPORT,
            quiet: true
          }, function (response) {
            if (buttons) buttons.parentNode.removeChild(buttons);
            working.classList.remove('hidden');

            importId = parseInt(response);
            resolve();
          });
        }).catch(reject);
      });

      return Promise.all([importPromise, Startme.timeout(2000)]);
    }

    return importPromise;
  }

  function saveName() {
    return new Promise(function (resolve) {
      getUser.then(function (user) {
        var name = nameField.value.toString().trim();
        if (name && name != user.name) {
          Startme.updateUser({ name: name }).then(function (user) {
            return updateUser(user);
          });
        }
      });
      resolve();
    });
  }

  function saveEmail() {
    return new Promise(function (resolve, reject) {
      lock();
      getUser.then(function (user) {

        emailField.setCustomValidity('');

        var email = emailField.value.toString().trim();
        if (!email || email == user.email) {
          unlock();
          return resolve();
        }

        Startme.updateUser({ email: email }).then(function (user) {
          updateUser(user);
          unlock();
          resolve();
        }).catch(function (errors) {
          unlock();
          if (errors.email) {

            var message = errors.email.join("\n");

            var escapedEmail = email.replace(/\W/, function (match) {
              return '\\' + match;
            });
            emailField.setAttribute('pattern', '^(?!' + escapedEmail + ').+$');
            emailField.select();

            emailField.parentNode.setAttribute('data-error', message);
          }
          return reject();
        });
      });
    });
  }
}

function saveCountry(locale) {
  var country = findCountryByLocale(locale, true);

  return new Promise(function (resolve, reject) {
    lock();

    getUser.then(function (user) {

      if (country.code === user.country) {
        unlock();
        return resolve();
      }

      Startme.updateUser({ country: country.code }).then(function (user) {
        updateUser(user);
        unlock();
        resolve();
      }).catch(function (errors) {
        unlock();
        if (errors.country) {

          countryControls.dataset.error = errors.country.join("\n");
        }
      });
    });
  });
}

nextButton.addEventListener('click', moveRel.bind(undefined, +1));
prevButton.addEventListener('click', moveRel.bind(undefined, -1));
document.addEventListener('keydown', function (event) {
  switch (event.key || event.keyIdentifier) {
    case 'ArrowRight':
      if (event.target.tagName == 'INPUT') return;
      moveRel(+1);
      break;

    case 'Enter':
      if (event.target.tagName == 'BUTTON') return;
      moveRel(+1);
      break;

    case 'Tab':
      moveRel(event.shiftKey ? -1 : +1);
      break;

    case 'ArrowLeft':
    case 'Backspace':
      if (event.target.tagName == 'INPUT') return;
    case 'Escape':
      moveRel(-1);
      break;
    default:
      return;
  }
  event.preventDefault();
});

stepButtons.forEach(function (button) {
  return button.addEventListener('click', function (event) {
    event.preventDefault();
    var step = parseInt(button.getAttribute('step')) || 0;
    if (step < getCurrentStep()) moveTo(step);
  });
});

slidesButtons.forEach(function (button) {
  return button.addEventListener('click', function (event) {

    event.preventDefault();

    var action = button.getAttribute('action') || null;

    if (action === 'show_country_picker') {
      return;
    }

    performAction(action).then(function () {

      moveRel(+1);
    });
  });
});

window.addEventListener('popstate', function (event) {
  var step = parseInt(history.state && history.state.step) || parseInt(location.hash.slice(1));
  if (!isNaN(step)) moveTo(step);
});

closeButton.addEventListener('click', function (event) {
  return performAction('done');
});
