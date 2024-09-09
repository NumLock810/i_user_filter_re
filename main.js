const FLAGS = ["white", "black", "gray"];

// filterのリストに含まれるか判定
function judge(user_name, list){
    return FLAGS.find((flag) => {
        return list[flag].some((pattern) => {
            return pattern && user_name.match(pattern);
        });
    });
}

// filterのリストに対応するuserにflag設定
function add_flag_data(cells, list){
    Array.from(cells).forEach((cell) => {
        const user = cell.querySelector(".username").textContent;
        const userid = cell.querySelector(".username").href.split("/").pop()
        cell.dataset.user = user;
        cell.dataset.userid = userid;
        
        const flag = judge(user, list);
        if (flag)  cell.dataset.flag = flag;
        const idflag = judge(userid, list);
        if (idflag)  cell.dataset.idflag = idflag;
    });
}

// like数での強調のためにcssをいじる
function add_likes_data(cells){
    chrome.storage.local.get({
        likeSettings: [
            {like:50, color:"yellow"},
            {like:100, color:"red"},
            {like:200, color:"deeppink"},
        ]
    }, (settings) => {
        const sortedSetting = settings.likeSettings.concat()
        sortedSetting.sort((a,b) => {
            return a.like - b.like
        })
        sortedSetting.reverse()
        
        Array.from(cells).forEach((cell) => {
            const icon = cell.querySelector(".likes .icon");
            const likes = cell.querySelector(".likes").textContent.trim();
            cell.dataset.likes = likes;
            
            const target = icon;
            if(typeof target !== 'undefined'){
                if (likes >= sortedSetting[0].like){
                    cell.classList.add("likes-threshold-III");
                    target.style.color = sortedSetting[0].color;
                } else if (likes >= sortedSetting[1].like){
                    cell.classList.add("likes-threshold-II");
                    target.style.color = sortedSetting[1].color;
                } else if (likes >= sortedSetting[2].like){
                    cell.classList.add("likes-threshold-I");
                    target.style.color = sortedSetting[2].color;
                }
            }
        })
    })
}

// 非表示・半透明・強調のクラス設定
function rebuild_cells(cells){
    Array.from(cells).forEach((cell) => {
        if (cell.dataset.flag == "black" || cell.dataset.idflag == "black"){
            cell.remove();
        }
        
        if (cell.dataset.flag != "black" && cell.dataset.idflag != "black"){
            if (cell.dataset.flag) cell.classList.add(cell.dataset.flag);
            if (cell.dataset.idflag) cell.classList.add(cell.dataset.idflag);
        }
    })
}


// filterリスト取得
function getUserFilter(saved) {
    const list = {};
    FLAGS.forEach(function(flag) {
        const text = saved[flag].trim();
        list[flag] = text.split(/\r*\n+/);
    });
    return list;
}

// 要素監視と処理の本体
function setupMutationObserver(list) {
    /**** ここをいじればサイトリニューアルにも対応できるはず ****/
    const targetSelector = "#app > div.page.page-videoList > section > div > div.row";
    const videoListSelector = ".page-videoList__item"
    
    const element = document.querySelector(targetSelector);
    if (element) {
        const mo = new MutationObserver((record, observer) => {
            const cells = document.querySelectorAll(videoListSelector);
            add_flag_data(cells, list);
            rebuild_cells(cells);
            add_likes_data(cells);
        });
        
        const config = {
            childList: true,
            subtree: true,
        };
        mo.observe(element, config);
    }
}

// イベント用のコールバック
function initializeExtension() {
    // get時にnullにならないように(わざわざ変数にする必要はない)
    const default_data = {
        white: "",
        black: "",
        gray: ""
    };
    chrome.storage.local.get(default_data, (saved) => {
        const list = processFlags(saved);
        setupMutationObserver(list);
    });
}


// コールバック設定 DOMの構造が準備できたら実行される(画像読み込み前に実行されるといいな)
document.addEventListener('DOMContentLoaded', initializeExtension);