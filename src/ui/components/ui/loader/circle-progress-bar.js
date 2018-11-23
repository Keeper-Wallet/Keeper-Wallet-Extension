/**
 * Circle Progress Bar
 * @param {Element} canvas
 * @param {Object} options
 * @constructor
 * @author nikitchenko.sergey@yandex.ru
 */
export const CircleProgressBar = function(canvas, options)
{
    /**
     * @type {CircleProgressBar}
     */
    var self = this;

    /**
     * Current value
     * @type {number}
     * @private
     */
    this._value = 0;

    /**
     * Canvas element
     * @type {Element}
     * @private
     */
    this._canvas = null;

    /**
     * Canvas context
     * @type {CanvasRenderingContext2D}
     * @private
     */
    this._context = null;

    /**
     * Default options
     * @type {Object}
     * @private
     */
    this._defaultOptions = {
        colors: ['#9400D3', '#4B0082', '#0000FF'],
        x: null,
        y: null,
        radius: 120,
        lineWidth: 15,
        frameInterval: 10,
        frameStep: 0.1,
        startPosition: -(Math.PI / 2),
        lineCap: 'round',
        trackLineColor: '#eee',
        maxColorsCountByValue: {
            0.05: 2,
            0.2: 2,
            0.3: 3,
            0.4: 4,
            0.6: 5
        }
    };

    /**
     * Global options
     * @type {Object}
     * @private
     */
    this._options = null;

    /**
     * Current length of arc
     * @type {number}
     * @private
     */
    this._currentPartLength = 0.1;

    /**
     * Current colors count
     * @type {int}
     * @private
     */
    this._colorsCount = null;

    /**
     * Options setter
     * @param options
     */
    this.setOptions = function(options) {
        var currentOptions = self._options ? self._options : self._defaultOptions;
        self._options = self.extend(currentOptions, options, true);
    };

    /**
     * Get current value
     * @returns {number}
     */
    this.getValue = function() {
        return self._value;
    };

    /**
     * Set value
     * @param value
     */
    this.setValue = function(value) {
        value = parseFloat(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }

        self._value = value;

        // render value
        self.draw();
    };

    /**
     * Set current arc length
     * @param {number} value
     * @returns {boolean}
     */
    this.setCurrentPartLength = function(value)
    {
        value = parseFloat(value);
        if (isNaN(value)) {
            return false;
        }
        this._currentPartLength = value;
        return true;
    };

    /**
     * Send event
     * @param {string} eventName
     * @param {Object} data
     */
    this.sendEvent = function(eventName, data)
    {
        var event = new CustomEvent('circleProgressBar.' + eventName, {detail: data});
        self._canvas.dispatchEvent(event);
    };

    /**
     * Initialization
     * @param {Element} canvas
     * @param {Object} options
     */
    this.init = function (canvas, options) {
        if (!canvas) {
            throw 'Canvas not set';
        }

        self.setOptions(options);

        self._canvas = canvas;
        self._context = canvas.getContext('2d');
        self._context.lineCap = self._options.lineCap;

        if (!self._options.x) {
            self._options.x = self._canvas.width / 2;
        }

        if (!self._options.y) {
            self._options.y = self._canvas.height / 2;
        }

        self.sendEvent('init', self._options);
    };

    /**
     * Getting gradient colors
     * @returns {Array}
     */
    this.getColors = function() {
        var colors = self.clone(self._options.colors);
        var value = self.getValue();
        // for work properly colors count must be more 2
        // one color
        if (!self.isArray(colors)) {
            colors = [colors];
        }

        // cut spare colors
        var colorsCountByValue = self._options.maxColorsCountByValue;
        var maxColors = null;
        if (colorsCountByValue) {
            Object.keys(colorsCountByValue).map(function(objectKey, index) {
                var maxColorsValue = colorsCountByValue[objectKey];
                if (!maxColors && value <= objectKey) {
                    maxColors = maxColorsValue;
                }
            });
        }

        if (maxColors > 0) {
            colors = self.cutArrayFromCenter(colors, maxColors);
        }

        // 1 colors - adding 1 copies
        if (colors.length === 1) {
            colors.push(colors[0]);
        }

        // 2 colors and value == 1 - adding 2 copies
        if (colors.length === 2 && value == 1) {
            colors.push(colors[1]);
            colors.unshift(colors[0]);
        }

        return colors;
    };

    /**
     * Draw progress bar for current value and options
     */
    this.draw = function() {
        var context = self._context;
        var startColor = null,
            endColor = null;

        var colors = self.getColors();

        var currentPartLength = self._currentPartLength;

        var value = self.getValue();

        if (self._colorsCount > 0) {
            currentPartLength = currentPartLength * (self._colorsCount / colors.length);
        }

        self._colorsCount = colors.length;
        var partLength = (((2 * Math.PI) / (colors.length - 1))) * value;

        if (partLength <= 0) {
            partLength = 0.03;
        }

        var partLengthStep = self._options.frameStep / colors.length;
        var lineWidth = self._options.lineWidth;
        var trackLineColor = self._options.trackLineColor;
        var startPosition = self._options.startPosition;

        var gradient = null;

        var x = self._options.x,
            y = self._options.y,
            radius = self._options.radius;

        var acrInterval = setInterval (function() {
            var start = startPosition;

            if (currentPartLength === partLength) {
                clearInterval(acrInterval);
                self.sendEvent('afterDraw', {
                    self: self
                });
                return false;
            }

            var partLengthDelta = Math.abs(currentPartLength - partLength);
            if (partLengthDelta < partLengthStep) {
                partLengthStep = partLengthDelta;
            }

            if (currentPartLength > partLength) {
                partLengthStep = -1 * Math.abs(partLengthStep);
            } else {
                partLengthStep = Math.abs(partLengthStep);
            }

            currentPartLength += partLengthStep;

            self.clear();

            if (trackLineColor) {
                self.drawArc(x, y, radius, (Math.PI / 180) * 270, (Math.PI / 180) * (270 + 360), trackLineColor, lineWidth);
            }

            for (var i = 0; i < colors.length - 1; i++) {
                startColor = colors[i];
                endColor = colors[(i + 1)];

                // x start / end of the next arc to draw
                var xStart = x + Math.cos(start) * radius;
                var xEnd = x + Math.cos(start + currentPartLength) * radius;
                // y start / end of the next arc to draw
                var yStart = y + Math.sin(start) * radius;
                var yEnd = y + Math.sin(start + currentPartLength) * radius;

                gradient = context.createLinearGradient(xStart, yStart, xEnd, yEnd);
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(1, endColor);

                self.drawArc(x, y, radius, start, start + currentPartLength, gradient, lineWidth);

                start += currentPartLength;
            }

            self.setCurrentPartLength(currentPartLength);

            self.sendEvent('afterFrameDraw', {
                self: self,
                progress: currentPartLength / partLength
            });

        }, self._options.frameInterval);
    };

    /**
     * Draw arc
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {number} start
     * @param {number} end
     * @param strokeStyle
     * @param {number} lineWidth
     */
    this.drawArc = function(x, y, radius, start, end, strokeStyle, lineWidth) {
        self._context.beginPath();
        self._context.strokeStyle = strokeStyle;
        self._context.arc(x, y, radius, start, end);
        self._context.lineWidth = lineWidth;
        self._context.stroke();
        self._context.closePath();
    };

    /**
     * Clear rect with progress bar
     */
    this.clear = function() {
        var outerRadius = self._options.radius + self._options.lineWidth;
        var x = self._options.x,
            y = self._options.y;
        self._context.clearRect(x - outerRadius, y - outerRadius, x + outerRadius, y + outerRadius);
    };

    /**
     * Check param fo array
     * @param obj
     * @returns {boolean}
     */
    this.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    /**
     * Check param for object
     * @param obj
     * @returns {boolean}
     */
    this.isObject = function(obj) {
        if (self.isArray(obj)) {
            return false;
        }

        var type = typeof obj;
        return type === 'object' && !!obj;
    };

    /**
     * Cut array from center
     * @param {Array} array
     * @param {int} maxLength
     * @returns {Array}
     */
    this.cutArrayFromCenter = function(array, maxLength) {
        if (!self.isArray(array)) {
            return false;
        }
        var length = array.length;
        if (length <= maxLength) {
            return array;
        }

        var delta = length - maxLength;
        var result = [];
        array.forEach(function(element, index, array) {
            if (index == 0 || delta < index) {
                result.push(element);
            }
        });

        return result;
    };

    /**
     * Copy all attributes from source object to destination object.
     * destination object is mutated.
     * @param {Object} destination
     * @param {Object} source
     * @param {boolean} recursive
     * @returns {*|{}}
     */
    this.extend = function(destination, source, recursive) {
        destination = destination || {};
        source = source || {};
        recursive = recursive || false;

        for (var attrName in source) {
            if (source.hasOwnProperty(attrName)) {
                var destVal = destination[attrName];
                var sourceVal = source[attrName];
                if (recursive && self.isObject(destVal) && self.isObject(sourceVal)) {
                    destination[attrName] = self.extend(destVal, sourceVal, recursive);
                } else {
                    destination[attrName] = sourceVal;
                }
            }
        }

        return destination;
    };

    /**
     * Clone object
     * @param obj
     */
    this.clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Init current object
     */
    this.init(canvas, options);
};

