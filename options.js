function save_options() {
    console.log("yea");
    const likeSettingElements = document.getElementById("like_settings").getElementsByClassName("like_setting_wrapper");
    let likeSettingsArr = [];
    for(let i=0; i<likeSettingElements.length; i++){
        likeSettingsArr.push({
            like:document.getElementById("like"+i).value,
            color:document.getElementById("like_color"+i).value
        })
    }
    chrome.storage.local.set({
        likeSettings: likeSettingsArr
    });

    let data = {};
    "white black gray".split(/\s/).forEach((flag) => {
        data[flag] = document.getElementById(flag).value.trim();
    });
    
    chrome.storage.local.set(data, () => {
        const status1 = document.getElementById('status1'); // user filter
        status1.textContent = 'セーブしました。';
        const status2 = document.getElementById('status2'); // likes color
        status2.textContent = 'セーブしました。';
        
        setTimeout(() => {
            status1.textContent = '';
            status2.textContent = '';
        }, 750);
    });
}

function restore_options() {
    const default_data = {
        white: "",
        black: "",
        gray: ""
    };
    
    chrome.storage.local.get(default_data, (data) => {
        document.getElementById('white').value = data.white;
        document.getElementById('black').value = data.black;
        document.getElementById('gray').value = data.gray;
    });
    
    setColorPicker();
    chrome.storage.local.get({
        likeSettings: [
            {like:50, color:"yellow"},
            {like:100, color:"red"},
            {like:200, color:"deeppink"},
        ]
    }, (settings) => {
        const likeSettingElements = document.getElementById("like_settings").getElementsByClassName("like_setting_wrapper");
        for(let i=0; i<likeSettingElements.length; i++){
            document.getElementById("like"+i).value = settings.likeSettings[i].like;
            document.getElementById("like_color"+i).value = settings.likeSettings[i].color;
            document.getElementById("like_color_preview"+i).style.background = settings.likeSettings[i].color;
        }
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save1').addEventListener('click', save_options);
document.getElementById('save2').addEventListener('click', save_options);


function setColorPicker () {
    const likeSettingElements = document.getElementById("like_settings").getElementsByClassName("like_setting_wrapper");
    
    for(let i=0; i<likeSettingElements.length; i++){
        const element = document.getElementById("like_color"+i);
        const previewElement = document.getElementById("like_color_preview"+i);
        const pickr = Pickr.create({
            el: element,
            theme: 'nano',
            useAsButton: true,
            swatches: [
            ],
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: {
                    hex: true,
                    rgba: true,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: true,
                    clear: true,
                    save: true
                }
            },
            strings: {
                save: '保存',
                clear: 'クリア',
                cancel: 'キャンセル'
            }
        }).on('init', pickr => {
        }).on('save', color => {
            element.value = color.toHEXA().toString(0);
            previewElement.style.background = color.toHEXA().toString(0);
            pickr.hide();
        });
    }
}