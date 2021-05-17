'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

window.Startme = new function (window) {
    var _this = this;

    this.MINUTE = 60 * 1000;

    this.USER_FALLBACK_LOCALE = 'en_US';

    this.apiURL = function () {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        return SM_API_LOCATION + path;
    };

    this.primaryURL = function () {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        return SM_PRIMARY_LOCATION + path;
    };

    this.crel = function () {

        var argc = arguments.length,
            argp = 0,
            tag = arguments[argp++],
            parent = null;
        if ((typeof tag === 'undefined' ? 'undefined' : _typeof(tag)) == "object") {
            parent = tag;
            tag = arguments[argp++];
        }

        var element = document.createElement(tag);

        var sawAttributes = false;
        while (argp <= argc) {
            var arg = arguments[argp++];
            switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
                case 'string':
                    if (sawAttributes) {

                        element.appendChild(document.createTextNode(arg));
                    } else {

                        element.classList.add(arg);
                    }
                    break;
                case 'object':
                    if (arg == null) {} else if (arg.nodeType) {

                        element.appendChild(arg);
                    } else {

                        sawAttributes = true;
                        for (var attr in arg) {
                            element.setAttribute(attr, arg[attr]);
                        }
                    }
                    break;
            }
        }

        if (parent) parent.appendChild(element);
        return element;
    };

    this.formData = function (object) {
        var data = new FormData();
        for (var property in object) {
            if (object.hasOwnProperty(property)) data.set(property, object[property]);
        }
        return data;
    };

    this.now = function () {
        return new Date().valueOf();
    };

    this.getUser = function (noCache) {
        return new Promise(function (resolve, reject) {

            var cachedUser = false;
            try {
                cachedUser = JSON.parse(localStorage.cachedUser);
                if ((typeof cachedUser === 'undefined' ? 'undefined' : _typeof(cachedUser)) != 'object') cachedUser = false;
            } catch (e) {
                cachedUser = false;
            }

            var fetchNeeded = noCache || !cachedUser || Startme.now() - cachedUser.timestamp > 20 * _this.MINUTE;

            if (!fetchNeeded) return done(cachedUser.user);

            fetch(Startme.apiURL('/logged_in'), { credentials: 'include' }).then(function (response) {
                if (response.status != 200) return reject();

                response.json().then(function (data) {

                    localStorage.cachedUser = JSON.stringify({
                        user: data.user,
                        timestamp: Startme.now()
                    });
                    done(data.user);
                });
            }).catch(function (error) {

                _this.clearCache();
                reject();
            });

            function done(user) {
                if (user) resolve(user);else reject();
            }
        });
    };

    this.clearCache = function () {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        delete localStorage.cachedUser;
        delete localStorage.cachedPages;
        delete localStorage[SM_OPTION_HOMEPAGE_URL];

        if (!options.keepHomepage) {
            delete localStorage[SM_OPTION_HOMEPAGE_ID];
        }
    };

    this.requireUser = function (noCache) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
            _this2.getUser(noCache).then(resolve).catch(function (err) {
                chrome.runtime.sendMessage({ message: SM_MESSAGE_SIGN_IN }, function (success) {
                    if (!success) return reject();

                    chrome.runtime.onMessage.addListener(function (message) {
                        if (message.message == SM_MESSAGE_SIGNED_IN) {

                            _this2.getUser(true).then(resolve).catch(reject);
                        }
                    });
                });
            });
        });
    };

    this.ifLoggedIn = this.getUser;

    this.createAnonymousUser = function () {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
            fetch(_this3.primaryURL('/users/new/anonymous.json?utm_medium=extension&utm_source=' + CURRENT_BROWSER), {
                method: 'POST',
                credentials: 'include'
            }).then(function (response) {
                if (response.status != 201) return reject();
                response.json().then(function (user) {
                    return resolve(user);
                }).catch(reject);
            }).catch(reject);
        });
    };

    this.updateUser = function (properties) {
        var _this4 = this;

        return new Promise(function (resolve, reject) {

            var data = new FormData();
            for (var property in properties) {
                if (!properties.hasOwnProperty(property)) continue;
                data.set('user[' + property + ']', properties[property]);
            }

            fetch(_this4.primaryURL('/users/edit.json'), {
                method: 'PUT',
                credentials: 'include',
                body: data
            }).then(function (response) {
                switch (response.status) {
                    case 200:
                        response.json().then(function (user) {
                            return resolve(user);
                        }).catch(reject);
                        break;
                    case 400:
                        response.json().then(function (errors) {
                            return reject(errors);
                        }).catch(reject);
                        break;
                    default:
                        reject();
                }
            }).catch(reject);
        });
    };

    this.openOptionsPage = function () {
        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage({ message: SM_MESSAGE_OPEN_OPTIONS_PAGE }, function (response) {
                if (response === true) resolve();else reject();
            });
        });
    };

    this.timeout = function () {
        var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        return new Promise(function (resolve, reject) {
            setTimeout(resolve, duration);
        });
    };

    this.hashCode = function (s) {
        var hash = 0,
            char,
            length = s.length;
        if (length == 0) return hash;
        for (var i = 0; i < length; i++) {
            char = s.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash &= 0x7FFFFFFF;
        }
        return hash;
    };

    this.shuffle = function (items) {
        var itemCount = items.length;
        for (var i = itemCount - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            if (i != j) {
                var temp = items[i];
                items[i] = items[j];
                items[j] = temp;
            }
        }
        return items;
    };

    this.titleFromUrl = function (url) {

        var parser = Startme.crel('a', { href: url });
        var host = parser.hostname.replace(/^www\.([a-z]?)/, function (match, cap) {
            return cap.toUpperCase();
        }).trim();
        var path = parser.pathname.replace(/(index)?\.\w+$/, '').replace(/[^a-z0-9]+([a-z]?)/g, function (match, cap) {
            return ' ' + cap.toUpperCase();
        }).trim();
        if (path) return host + ': ' + path;else return host;
    };

    this.getLocale = function () {
        return chrome.i18n.getMessage('@@ui_locale').toLowerCase();
    };
}(window);
