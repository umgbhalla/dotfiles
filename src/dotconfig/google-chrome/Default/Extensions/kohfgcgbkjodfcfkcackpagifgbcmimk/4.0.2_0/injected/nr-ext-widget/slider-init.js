const speedSlider = document.getElementById("nr-ext-speed");
const speedValueSender = document.getElementById("nr-ext-speed-slider-value-sender");
const speedText = document.getElementById("nr-ext-speed-text");
const volumeSlider = document.getElementById("nr-ext-volume");
const volumeValueSender = document.getElementById("nr-ext-volume-slider-value-sender");
const volumeText = document.getElementById("nr-ext-volume-text");
const progressSlider = document.getElementById("nr-ext-progress");
const progressValueSender = document.getElementById("nr-ext-progress-value-sender");
const progressMaxSender = document.getElementById("nr-ext-progress-max-sender");
const progressText = document.getElementById("nr-ext-progress-text");
let progressObj = {
    displayTexts: [],
    marks: [], 
    readOption: 'all',
    type: 'sentence',
    max: 0,
    min: 0,
    curSenIdx: 0,
    curPageIdx: -1,
};
let defaultSentenceCountInOnePage = 10;
$(progressSlider).ionRangeSlider({
    skin: "round",
    type: "single",
    min: 0,
    max: 0,
    from: 0,
    step: 1,
    grid: false,
    hide_min_max: true,
    hide_from_to: true,
    force_edges: true,
    onFinish: function(data) {
        invokeProgressChange(data['from']);
    },
});
$(progressValueSender).on('change', function(e) {
    let value = 0;
    let sliderValue = JSON.parse(e.target.value);
    progressObj.curSenIdx = sliderValue.sentenceIndex;
    progressObj.curPageIdx = sliderValue.pageIndex;
    if (sliderValue.tag !== 'range-slider-init') {
        if (progressObj.type === 'sentence') {
            value = progressObj.curSenIdx;
            if (value < progressObj.marks.length) {
                value = progressObj.marks[value];
            } else {
                value = progressObj.marks[progressObj.marks.length - 1];
            }
        } else {
            value = progressObj.curPageIdx * defaultSentenceCountInOnePage + Math.floor(progressObj.curSenIdx / progressObj.displayTexts.length * 10);
        }
        if (value > $(progressSlider).data("ionRangeSlider").options.max) {
            value = $(progressSlider).data("ionRangeSlider").options.max;
        } else {
            if (value < $(progressSlider).data("ionRangeSlider").options.min) {
                value = $(progressSlider).data("ionRangeSlider").options.min;
            }
        }
        $(progressSlider).data("ionRangeSlider").update({
            from: value
        });
        sliderValue['value'] = value;
        $(progressValueSender).val(JSON.stringify(sliderValue));
    }
});
$(progressMaxSender).on('change', function(e) {
    if (e.target.value) {
        var _maxValue = JSON.parse(e.target.value);
        progressObj.displayTexts = _maxValue.texts;
        progressObj.readOption = _maxValue.readOption;
        if (_maxValue.pageCount > 1 && _maxValue.readOption != 'selection') {
            progressObj.type = 'page';
        } else {
            progressObj.type = 'sentence';
        }
        if (progressObj.type === 'sentence') {
            progressObj.max = getMaxValueByTexts(_maxValue.texts) - 1;
        } else {
            progressObj.max = getMaxValueByPageCount(_maxValue.pageCount) - 1;
        }
        $(progressSlider).data("ionRangeSlider").update({
            max: progressObj.max
        });
        _maxValue['max'] = progressObj.max
        $(progressMaxSender).val(JSON.stringify(_maxValue));
    }
});
function invokeProgressChange(value) {
    var _readValue = {
        sentenceIndex: 0,
        pageIndex: -1,
        percentage: 0,
        lastModified: 'sentence',
        tag: 'range-slider-init',
        value: value
    };
    if (progressObj.type === 'sentence') {
        _readValue.sentenceIndex = getMarkIndexByValue(value);
    } else {
        var rate = value / defaultSentenceCountInOnePage;
        var _page = Math.floor(rate);
        var _decimal = rate - _page;
        if (_page == progressObj.curPageIdx) {
            _readValue.sentenceIndex = Math.floor(progressObj.displayTexts.length * _decimal);
            _readValue.pageIndex = _page;
            _readValue.percentage = 0;
            _readValue.lastModified = 'sentence';
        } else {
            _readValue.pageIndex = _page;
            _readValue.percentage = _decimal;
            _readValue.lastModified = 'page';
        }
    }
    $(progressValueSender).val(JSON.stringify(_readValue));
    const event = new Event('change');
    progressValueSender.dispatchEvent(event);
}
function convertToPercent(num) {
    return (num + 1) / progressObj.max * 100;
}
function addMarks($slider) {
    let html = '';
    let left = 0;
    const constraintNumber = 6;
    let markNumber = 0;
    const pickRate = progressObj.marks.length / constraintNumber;
    const pickMarkIndex = [];
    if (constraintNumber < progressObj.marks.length) {
        markNumber = constraintNumber;
    } else {
        markNumber = progressObj.marks.length;
    }
    for (let mIndex = 1; mIndex < markNumber; mIndex++) {
        if (pickRate > 1) {
            let pickIndex = parseInt(mIndex * pickRate);
            pickMarkIndex.push(pickIndex);
        } else {
            pickMarkIndex.push(mIndex);
        }
    }
    for (let i = 0; i < progressObj.marks.length; i++) {
        if (pickMarkIndex.includes(i)) {
            left = convertToPercent(progressObj.marks[i]);
            html += '<span class="irs-marks clickablemark" tag=' + i + ' style="left: ' + left + '%">' + '</span>';
        }
    }
    $slider.append(html);
    $slider.children(".clickablemark").hover(function() {
        const currentdotposition = $(this).position();
        const containerWidth = $(window).width();
        let maxLeft = currentdotposition.left + 200;
        if (maxLeft >= containerWidth) {
            maxLeft = currentdotposition.left - 100;
        } else {
            maxLeft = currentdotposition.left;
        }
        progressText.style.left = maxLeft + 'px';
        const triggerSliderValue = parseInt($(this).attr("tag"));
        if (progressObj.type === 'sentence') {
            $(progressText).text(progressObj.displayTexts[triggerSliderValue].processed);
        } else {
            $(progressText).text('Page ' + (triggerSliderValue + 1));
        }
        $(progressText).css('display', '-webkit-box');
    }, function() {
        $(progressText).css('display', 'none');
        $(progressText).text('');
    });
    $slider.children(".clickablemark").click(function() {
        $(progressText).css('display', 'none');
        $(progressText).text('');
        var triggerSliderValue = parseInt($(this).attr("tag"));
        var _index = progressObj.marks[triggerSliderValue];
        invokeProgressChange(_index);
        $(progressSlider).data("ionRangeSlider").update({
            from: _index
        });
    });
}
function getMaxValueByTexts(texts) {
    var wordCount = 0;
    progressObj.marks = [];
    for (var i = 0; i < texts.length; i++) {
        progressObj.marks.push(wordCount);
        var _count = texts[i].processed.split(' ').length;
        wordCount += _count;
    }
    return wordCount;
}
function getMaxValueByPageCount(pageCount) {
    progressObj.marks = [];
    var _sliderMax = pageCount * defaultSentenceCountInOnePage;
    for (var i = 0; i < pageCount; i++) {
        progressObj.marks.push(i * defaultSentenceCountInOnePage);
    }
    return _sliderMax;
}
function getMarkIndexByValue(value) {
    for (var i = 0; i < progressObj.marks.length; i++) {
        if (value >= progressObj.marks[i]) {
            if (i + 1 < progressObj.marks.length) {
                if (value < progressObj.marks[i + 1]) {
                    return i;
                }
            } else {
                return i;
            }
        }
    }
    return 0;
}
$(speedSlider).ionRangeSlider({
    skin: "round",
    type: "single",
    min: -9,
    max: 9,
    from: 0,
    step: 1,
    grid: false,
    hide_min_max: true,
    hide_from_to: true,
    force_edges: true,
    onChange: function(data) {
        updateSpeedText(data['from']);
    },
    onFinish: function(data) {
        $(speedValueSender).val(data['from']);
        const event = new Event('change');
        speedValueSender.dispatchEvent(event);
    },
});
$(volumeSlider).ionRangeSlider({
    skin: "round",
    type: "single",
    min: 0.2,
    max: 1,
    from: 0.75,
    step: 0.01,
    grid: false,
    hide_min_max: true,
    hide_from_to: true,
    force_edges: true,
    onChange: function(data) {
        updateVolumeText(data['from']);
    },
    onFinish: function(data) {
        $(volumeValueSender).val(data['from']);
        const event = new Event('change');
        volumeValueSender.dispatchEvent(event);
    },
});
$(speedValueSender).on('change', function(e) {
    let value = 0;
    if (!isNaN(e.target.value)) {
        value = e.target.value;
    }
    if (value > $(speedSlider).data("ionRangeSlider").options.max) {
        value = $(speedSlider).data("ionRangeSlider").options.max;
    } else {
        if (value < $(speedSlider).data("ionRangeSlider").options.min) {
            value = $(speedSlider).data("ionRangeSlider").options.min;
        }
    }
    $(speedSlider).data("ionRangeSlider").update({
        from: value
    });
    updateSpeedText(value);
});
$(volumeValueSender).on('change', function(e) {
    let value = 0;
    if (!isNaN(e.target.value)) {
        value = e.target.value;
    }
    if (value > $(volumeSlider).data("ionRangeSlider").options.max) {
        value = $(volumeSlider).data("ionRangeSlider").options.max;
    } else {
        if (value < $(volumeSlider).data("ionRangeSlider").options.min) {
            value = $(volumeSlider).data("ionRangeSlider").options.min;
        }
    }
    $(volumeSlider).data("ionRangeSlider").update({
        from: value
    });
    updateVolumeText(value);
});
function updateVolumeText(value) {
    const tmpVolume = Math.round(value * 100) + '%';
    $(volumeText).text(tmpVolume);
}
function updateSpeedText(value) {
    let tmpSpeed = value;
    if (value > 0) {
        tmpSpeed = '+' + value;
    }
    $(speedText).text(tmpSpeed);
}
