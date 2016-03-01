/*!
 * jquery-confirm v2.5.0 (http://craftpip.github.io/jquery-confirm/)
 * Author: Boniface Pereira
 * Website: www.craftpip.com
 * Contact: hey@craftpip.com
 *
 * Copyright 2013-2015 jquery-confirm
 * Licensed under MIT (https://github.com/craftpip/jquery-confirm/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
    throw new Error('jquery-confirm requires jQuery');
}

var jconfirm, Jconfirm;
(function ($) {
    "use strict";

    $.fn.confirm = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false

            };
        /*
         *  Alias of $.confirm to emulate native confirm()
         */
        $(this).each(function () {
            var $this = $(this);
            $this.on('click', function (e) {
                e.preventDefault();
                var jcOption = $.extend({}, options);
                if ($this.attr('data-title'))
                    jcOption['title'] = $this.attr('data-title');
                if ($this.attr('data-content'))
                    jcOption['content'] = $this.attr('data-content');

                jcOption['$target'] = $this;
                if ($this.attr('href') && !options['confirm'])
                    jcOption['confirm'] = function () {
                        location.href = $this.attr('href');
                    };
                $.confirm(jcOption);
            });
        });
        return $(this);
    };
    $.confirm = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false
            };
        /*
         *  Alias of jconfirm
         */
        return jconfirm(options);
    };
    $.alert = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false
            };
        /*
         *  Alias of jconfirm
         */
        options.cancelButton = false;
        return jconfirm(options);
    };
    $.dialog = function (options, option2) {
        if (typeof options === 'undefined') options = {};
        if (typeof options === 'string')
            options = {
                content: options,
                title: (option2) ? option2 : false
            };
        /*
         *  Alias of jconfirm
         */
        options.cancelButton = false;
        options.confirmButton = false;
        options.confirmKeys = [13];
        return jconfirm(options);
    };

    jconfirm = function (options) {
        if (typeof options === 'undefined') options = {};
        /*
         * initial function for calling.
         */
        if (jconfirm.defaults) {
            /*
             * Merge global defaults with plugin defaults
             */
            $.extend(jconfirm.pluginDefaults, jconfirm.defaults);
        }
        /*
         * merge options with plugin defaults.
         */
        var options = $.extend({}, jconfirm.pluginDefaults, options);
        return new Jconfirm(options);
    };
    Jconfirm = function (options) {
        /*
         * constructor function Jconfirm,
         * options = user options.
         */
        $.extend(this, options);
        this._init();
    };
    Jconfirm.prototype = {
        _init: function () {
            var that = this;
            this._rand = Math.round(Math.random() * 99999);
            setTimeout(function () {
                that.open();
            }, 0);
        },
        _buildHTML: function () {
            var that = this;

            // store the last focused element.
            this._lastFocused = $('body').find(':focus');

            /*
             * Append html.
             */
            this.$el = $(this.template).appendTo(this.container);
            this.$jconfirmBoxContainer = this.$el.find('.jconfirm-box-container');
            this.$jconfirmBox = this.$el.find('.jconfirm-box');
            this.$jconfirmBg = this.$el.find('.jconfirm-bg')
                .css(this._getCSS(this.animationSpeed, 1));

            /*restructured code,
             added more methods,
             multiple buttons,
             and more changes.
             * Setup title contents
             */
            this.$title = this.$el.find('.title');
            this.$content = this.$el.find('div.content');
            this.$contentPane = this.$el.find('.content-pane');
            this.$icon = this.$el.find('.icon-c');
            this.$closeIcon = this.$el.find('.closeIcon');
            this.$contentPane.css(this._getCSS(this.animationSpeed, this.animationBounce));
            this.$content.css(this._getCSS(this.animationSpeed, this.animationBounce));
            this.$btnc = this.$el.find('.buttons');

            this.setColumnClass();
            this.setTheme();
            this.setAnimation();
            this.setCloseAnimation();
            this.$body = this.$el.find('.jconfirm-box').addClass(this.animation);
            this.setAnimationBounce();
            this.setAnimationSpeed();

            /*
             * Add rtl class if rtl option has selected
             */
            if (this.rtl)
                this.$el.addClass("rtl");

            // for loading content via URL
            this._contentReady = $.Deferred();
            this._modalReady = $.Deferred();

            this.setTitle();
            this.setIcon();
            this._setButtons();

            // set content and stuff when content is loaded.
            $.when(this._contentReady, this._modalReady).then(function () {
                that.setContent();
                that.setTitle();
                that.setIcon();

                // start countdown after content has loaded.
                if (that.autoClose)
                    that._startCountDown();
            });

            // initial hash for comparison
            that._contentHash = this._hash(that.$content.html());
            that._contentHeight = this.$content.height();

            this._watchContent();
            this._getContent();
        },
        setTheme: function (theme) {
            var that = this;
            /*
             * prefix the theme and set it right away.
             */
            if (typeof theme == 'undefined')
                theme = this.theme;

            theme = theme.split(',');
            $.each(theme, function (k, a) {
                theme[k] = 'jconfirm-' + $.trim(a);
            });
            theme = theme.join(' ').toLowerCase();

            this.$el.removeClass(this.theme).addClass(theme);
            this.theme = theme;
        },
        setAnimation: function (animation) {
            var that = this;
            if (typeof animation !== 'undefined')
                this.animation = animation;

            this.animation = this.animation.split(',');
            $.each(this.animation, function (k, a) {
                that.animation[k] = 'anim-' + $.trim(a);
            });
            this.animation = this.animation.join(' ').toLowerCase();
        },
        setCloseAnimation: function (closeAnimation) {
            var that = this;
            if (typeof closeAnimation !== 'undefined')
                this.closeAnimation = closeAnimation;
            this.closeAnimation = this.closeAnimation.split(',');
            $.each(this.closeAnimation, function (k, a) {
                that.closeAnimation[k] = 'anim-' + $.trim(a);
            });
            this.closeAnimation = this.closeAnimation.join(' ').toLowerCase();
        },
        setAnimationSpeed: function (speed) {
            this.animationSpeed = speed || this.animationSpeed;
            this.$body.css(this._getCSS(this.animationSpeed, this.animationBounce));
        },
        setAnimationBounce: function (bounce) {
            this.animationBounce = bounce || this.animationBounce;
            this.$body.css(this._getCSS(this.animationSpeed, this.animationBounce));
        },
        setColumnClass: function (colClass) {
            this.columnClass = colClass || this.columnClass;
            this.$jconfirmBoxContainer.addClass(this.columnClass);
        },
        _unwatchContent: function () {
            clearInterval(this._timer);
        },
        _hash: function () {
            return btoa((encodeURIComponent(this.$content.html())));
        },
        _watchContent: function () {
            var that = this;
            if (this._timer) clearInterval(this._timer);
            this._timer = setInterval(function () {
                var now = that._hash(that.$content.html());
                var nowHeight = that.$content.height();
                if (that._contentHash != now || that._contentHeight != nowHeight) {
                    that._contentHash = now;
                    that._contentHeight = nowHeight;
                    that.setDialogCenter();
                    that._imagesLoaded();
                }
            }, this.watchInterval);
        },
        _hiLightModal: function () {
            var that = this;
            that.$body.addClass('hilight');
            setTimeout(function () {
                that.$body.removeClass('hilight');
            }, 800);
        },
        _bindEvents: function () {
            var that = this;
            this.boxClicked = false;

            this.$el.find('.jconfirm-scrollpane').click(function (e) { // Ignore propagated clicks
                if (!that.boxClicked) { // Background clicked

                    /*
                     * If backgroundDismiss is a function and its return value is truthy
                     * proceed to close the modal.
                     */
                    console.log(typeof that.backgroundDismiss, that.backgroundDismiss);
                    if (typeof that.backgroundDismiss == 'function') {
                        var res = that.backgroundDismiss();

                        if (typeof res === 'undefined' || res) that.close(); else
                            that._hiLightModal();
                    } else {
                        if (that.backgroundDismiss)
                            that.close();
                        else
                            that._hiLightModal();
                    }
                }
                that.boxClicked = false;
            });

            this.$el.find('.jconfirm-box').click(function (e) {
                that.boxClicked = true;
            });

            if (this.$confirmButton) {
                this.$confirmButton.click(function (e) {
                    e.preventDefault();
                    var r = that.confirm(that.$b);
                    that._stopCountDown();
                    that.onAction('confirm');
                    if (typeof r === 'undefined' || r)
                        that.close();
                });
            }
            if (this.$cancelButton) {
                this.$cancelButton.click(function (e) {
                    e.preventDefault();
                    var r = that.cancel(that.$b);
                    that._stopCountDown();
                    that.onAction('cancel');

                    if (typeof r === 'undefined' || r)
                        that.close();
                });
            }
            if (this.$closeButton) {
                this.$closeButton.click(function (e) {
                    e.preventDefault();
                    that._stopCountDown();
                    that.cancel();
                    that.onAction('close');
                    that.close();
                });
            }
            if (this.keyboardEnabled) {
                setTimeout(function () {
                    $(window).on('keyup.' + this._rand, function (e) {
                        that.reactOnKey(e);
                    });
                }, 500);
            }

            $(window).on('resize.' + this._rand, function () {
                that.setDialogCenter(true);
            });
        },
        _getCSS: function (speed, bounce) {
            return {
                '-webkit-transition-duration': speed / 1000 + 's',
                'transition-duration': speed / 1000 + 's',
                '-webkit-transition-timing-function': 'cubic-bezier(.36,1.1,.2, ' + bounce + ')',
                'transition-timing-function': 'cubic-bezier(.36,1.1,.2, ' + bounce + ')'
            };
        },
        _imagesLoaded: function () {
            // detect if the image is loaded by checking on its height.
            var that = this;
            if (that.imageLoadInterval)
                clearInterval(that.imageLoadInterval);

            $.each(this.$content.find('img:not(.loaded)'), function (i, a) {
                that.imageLoadInterval = setInterval(function () {
                    var h = $(a).css('height');
                    console.log(h);
                    if (h !== '0px') {
                        $(a).addClass('loaded');
                        clearInterval(that.imageLoadInterval);
                        that.setDialogCenter();
                    }
                }, 40);
            });
        },
        _setButtons: function () {
            var that = this;
            /*
             * Settings up buttons
             */

            var total_buttons = 0;
            if (typeof this.buttons !== 'object')
                this.buttons = {};

            $.each(this.buttons, function (key, button) {
                total_buttons += 1;
                console.log(button, key);

                if (typeof button == 'function')
                    button = {
                        action: button,
                    };

                button.text = button.text || key;
                button.class = button.class || 'btn-default';
                button.action = button.action || function () {};

                var buttonEl = $('<button type="button" class="btn ' + button.class + '">' + button.text + '</button>').click(function (e) {
                    e.preventDefault();
                    var res = button.action();
                    if (typeof res === 'undefined' || res)
                        that.close();
                });
                that.buttons[key].el = buttonEl;
                // buttons for quick access.
                that['$_' + key] = buttonEl;
                that.$btnc.append(buttonEl);
            });

            if (total_buttons == 0) {
                // if buttons are not specified, hide the container.
                this.$btnc.hide();
            }

            if (this.closeIcon) {
                if (typeof this.closeIcon == 'function')
                    this.closeIcon = {
                        'class': '',
                        'action': this.closeIcon
                    };

                this.$closeIcon.html('<i class="' + this.closeIcon.class + '"></i>').click(function (e) {
                    e.preventDefault();
                    var res = that.closeIcon.action();
                    if (typeof res === 'undefined' || res)
                        that.close();
                });
            }
        },
        setTitle: function (string) {
            this.title = (typeof string !== 'undefined') ? string : this.title;
            this.$title.html(this.title || '');
        },
        setIcon: function (iconClass) {
            this.title = (typeof string !== 'undefined') ? iconClass : this.title;
            this.$icon.html(this.icon ? '<i class="' + this.icon + '"></i>' : '');
        },
        setContent: function (string) {
            // only set the content on the modal.
            var that = this;
            this.content = (typeof string == 'undefined') ? this.content : string;

            if (this.content == '') {
                this.$content.html(this.content);
                this.$contentPane.hide();
            } else {
                this.$content.html(this.content);
                this.setDialogCenter();
                this.$contentPane.show();
            }

            this.hideLoading(true);
        },
        showLoading: function (disableButtons) {
            this.$jconfirmBox.addClass('loading');
            if (disableButtons)
                this.$btnc.find('button').prop('disabled', true);
        },
        hideLoading: function (enableButtons) {
            this.$jconfirmBox.removeClass('loading');
            if (enableButtons)
                this.$btnc.find('button').prop('disabled', false);
        },
        _getContent: function (string) {
            /*
             * get content from remote & stuff.
             */
            var that = this;
            string = (string) ? string : this.content;
            this._isAjax = false;

            if (!this.content) { // if the content is falsy

                this.content = '';
                this._contentReady.resolve();

            } else if (typeof this.content === 'string') {

                if (this.content.substr(0, 4).toLowerCase() === 'url:') {
                    this._isAjax = true;

                    this.showLoading(true);
                    var url = this.content.substring(4, this.content.length);
                    $.get(url).done(function (html) {
                        that.content = html;
                    }).always(function (data, status, xhr) {
                        that._contentReady.resolve(data, status, xhr);
                    });

                } else {
                    this.setContent(this.content);
                    this._contentReady.resolve();
                }

            } else if (typeof this.content === 'function') {

                this.$content.addClass('loading');
                this.$btnc.find('button').attr('disabled', 'disabled');
                var promise = this.content(this);
                if (typeof promise !== 'object') {
                    console.error('The content function must return jquery promise.');
                } else if (typeof promise.always !== 'function') {
                    console.error('The object returned is not a jquery promise.');
                } else {
                    this._isAjax = true;
                    promise.always(function (data, status) {
                        that._contentReady.resolve();
                    });
                }

            } else {
                console.error('Invalid option for property content, passed: ' + typeof this.content);
            }
            this.setDialogCenter();
        },
        _stopCountDown: function () {
            clearInterval(this.timerInterval);
            if (this.$cd)
                this.$cd.remove();
        },
        _startCountDown: function () {
            var opt = this.autoClose.split('|');
            if (/cancel/.test(opt[0]) && this.type === 'alert') {
                return false;
            } else if (/confirm|cancel/.test(opt[0])) {
                this.$cd = $('<span class="countdown">').appendTo(this['$' + opt[0] + 'Button']);
                var that = this;
                that.$cd.parent().click();
                var time = opt[1] / 1000;
                this.timerInterval = setInterval(function () {
                    that.$cd.html(' (' + (time -= 1) + ')');
                    if (time === 0) {
                        that.$cd.html('');
                        that.$cd.parent().trigger('click');
                        clearInterval(that.timerInterval);
                    }
                }, 1000);
            } else {
                console.error('Invalid option ' + opt[0] + ', must be confirm/cancel');
            }
        },
        reactOnKey: function key(e) {

            /*
             * prevent keyup event if the dialog is not last!
             */
            var a = $('.jconfirm');
            if (a.eq(a.length - 1)[0] !== this.$el[0])
                return false;

            var key = e.which;
            // Do not react if Enter/Space is pressed on input elements
            if (this.contentDiv.find(':input').is(':focus') && /13|32/.test(key))
                return false;

            if ($.inArray(key, this.cancelKeys) !== -1) {
                /*
                 * Cancel key pressed.
                 */
                if (this.$cancelButton) {
                    this.$cancelButton.click();
                } else {
                    this.close();
                }
            }
            if ($.inArray(key, this.confirmKeys) !== -1) {
                /*
                 * Confirm key pressed.
                 */
                if (this.$confirmButton) {
                    this.$confirmButton.click();
                }
            }
        },
        setDialogCenter: function () {
            console.log('setting dialog to center');
            if (this.$contentPane.css('display') == 'none') {
                var contentHeight = 0;
                var paneHeight = 0;
            } else {
                var contentHeight = this.$content.outerHeight();
                var paneHeight = this.$contentPane.height();
                if (paneHeight == 0)
                    paneHeight = contentHeight;
            }
            var off = 100;
            var w = this.$content.outerWidth();

            //var s = '-clip-path: inset(0px 0px '+contentHeight+'px 0px);' +
            //    'clip-path: inset(0px 0px '+contentHeight+'px 0px)';

            this.$content.css({
                'clip': 'rect(0px ' + (off + w) + 'px ' + contentHeight + 'px -' + off + 'px)'
            });

            this.$contentPane.css({
                'height': contentHeight
            });

            var windowHeight = $(window).height();
            var boxHeight = this.$body.outerHeight() - paneHeight + contentHeight;
            var topMargin = (windowHeight - boxHeight) / 2;
            var minMargin = 100;

            console.log(windowHeight, boxHeight, topMargin);

            if (boxHeight > (windowHeight - minMargin)) {
                var style = {
                    'margin-top': minMargin / 2,
                    'margin-bottom': minMargin / 2
                }
                $('body').addClass('jconfirm-noscroll-' + this._rand);
            } else {
                var style = {
                    'margin-top': topMargin
                }
                $('body').removeClass('jconfirm-noscroll-' + this._rand);
            }
            this.$body.css(style);
        },
        close: function () {
            var that = this;

            if (typeof this.onClose === 'function')
                this.onClose();

            this._unwatchContent();
            clearInterval(this.imageLoadInterval);

            /*
             unbind the window resize & keyup event.
             */
            $(window).unbind('resize.' + this._rand);
            if (this.keyboardEnabled)
                $(window).unbind('keyup.' + this._rand);

            $('body').removeClass('jconfirm-noscroll-' + this._rand);
            this.$jconfirmBg.css('opacity', '');

            this.$body.addClass(this.closeAnimation);
            var closeTimer = (this.closeAnimation == 'anim-none') ? 0 : this.animationSpeed;
            setTimeout(function () {
                that.$el.remove();
                that._lastFocused.focus();
            }, closeTimer * 0.40);

            jconfirm.record.closed += 1;
            jconfirm.record.currentlyOpen -= 1;

            return true;
        },
        open: function () {
            var that = this;
            this._buildHTML();
            this._bindEvents();
            this.$body.removeClass(this.animation);
            this.$body.find('input[autofocus]:visible:first').focus();
            jconfirm.record.opened += 1;
            jconfirm.record.currentlyOpen += 1;
            if (typeof this.onOpen === 'function')
                this.onOpen();

            var jcr = 'jconfirm-box' + this._rand;
            this.$body.attr('aria-labelledby', jcr).attr('tabindex', -1).focus();
            if (this.$title)
                this.$title.attr('id', jcr); else if (this.$content)
                this.$content.attr('id', jcr);

            that.$jconfirmBg.css('opacity', this.opacity);

            setTimeout(function () {
                that.$body.css({
                    'transition-property': that.$body.css('transition-property') + ', margin'
                });
                that._modalReady.resolve();
            }, this.animationSpeed);

            return true;
        },
        isClosed: function () {
            return this.$el.css('display') === '';
        }
    };

    jconfirm.pluginDefaults = {
        template: '<div class="jconfirm"><div class="jconfirm-bg"></div><div class="jconfirm-scrollpane"><div class="container"><div class="row"><div class="jconfirm-box-container"><div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1"><div class="closeIcon">&times;</div><div class="title-c"><span class="icon-c"></span><span class="title"></span></div><div class="content-pane"><div class="content"></div></div><div class="buttons"></div><div class="jquery-clear"></div></div></div></div></div></div></div>',
        title: 'Hello',
        content: 'Are you sure to continue?',
        contentLoaded: function () {
        },
        icon: '',
        opacity: 0.2,
        confirmButton: 'Okay',
        cancelButton: 'Close',
        confirmButtonClass: 'btn-default',
        cancelButtonClass: 'btn-default',
        theme: 'white',
        animation: 'zoom',
        closeAnimation: 'scale',
        animationSpeed: 500,
        animationBounce: 1.2,
        keyboardEnabled: false,
        rtl: false,
        confirmKeys: [13], // ENTER key
        cancelKeys: [27], // ESC key
        container: 'body',
        confirm: function () {
        },
        cancel: function () {
        },
        backgroundDismiss: false,
        autoClose: false,
        closeIcon: null,
        closeIconClass: false,
        watchInterval: 100,
        columnClass: 'col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1',
        onOpen: function () {
        },
        onClose: function () {
        },
        onAction: function () {
        }
    };

    jconfirm.record = {
        opened: 0,
        closed: 0,
        currentlyOpen: 0
    };
})(jQuery);
