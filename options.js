function save_options() {
    console.log("yea");
    let data = {};
    "white black gray".split(/\s/).forEach((flag) => {
        data[flag] = document.getElementById(flag).value.trim();
    });
    
    chrome.storage.local.set(data, () => {
        const status = document.getElementById('status');
        status.textContent = 'セーブしました。';
        
        setTimeout(function() {
            status.textContent = '';
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
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
