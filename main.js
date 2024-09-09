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
        sortedSetting.forEach((value) => {
            value.like = parseInt(value.like, 10);
        });
        sortedSetting.sort((a,b) => {
            return a.like - b.like
        });
        sortedSetting.reverse();
        
        Array.from(cells).forEach((cell) => {
            const icon = cell.querySelector(".likes .icon");
            const likes = cell.querySelector(".likes").textContent.trim();
            cell.dataset.likes = likes;
            
            const target = icon;
            if(typeof target !== 'undefined'){
                const likesNumber = likes.substr(-1) === "K" ? parseFloat(likes) * 1000 : parseInt(likes);
                if (likesNumber >= sortedSetting[0].like){
                    cell.classList.add("likes-threshold-III");
                    target.style.color = sortedSetting[0].color;
                } else if (likesNumber >= sortedSetting[1].like){
                    cell.classList.add("likes-threshold-II");
                    target.style.color = sortedSetting[1].color;
                } else if (likesNumber >= sortedSetting[2].like){
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
    
    // 実際にフィルターとか掛ける関数
    const rebuildstart = () => {
        const mo = new MutationObserver((record, observer) => {
            const cells = document.querySelectorAll(videoListSelector);
            add_flag_data(cells, list);
            rebuild_cells(cells);
            add_likes_data(cells);
        });
        const element = document.querySelector(targetSelector);
        const config = {
            childList: true,
            subtree: true,
        };
        
        mo.observe(element, config);
    }
    
    // targetSelectorが追加されるまで#appの変更を監視する関数
    const app_mo = new MutationObserver((record, observer) => {
        if(document.querySelector(targetSelector) != null){
            rebuildstart();
            app_mo.disconnect();
        }
    });
    const app_dom = document.querySelector("#app")
    const app_config = {
        childList: true,
    };

    app_mo.observe(app_dom, app_config);
}

// イベント用のコールバック
function filtering() {
    // get時にnullにならないように(わざわざ変数にする必要はない)
    const default_data = {
        white: "",
        black: "",
        gray: ""
    };
    chrome.storage.local.get(default_data, (saved) => {
        const list = getUserFilter(saved);
        setupMutationObserver(list);
    });
}


// "DOMContentLoaded"の発火はinteractiveが始まった瞬間 なんか読み込み早すぎてイベント登録間に合わないのでその対策
// すでにMutationObserver周りの処理があるので，こんなことしなくても直接実行すればいいようになってると思う
if (document.readyState === 'loading') {
    // 読み込み中ならDOMContentLoadedで関数を実行
    // コールバック設定 DOMの構造が準備できたら実行される(画像読み込み前に実行されるといいな)
    document.addEventListener('DOMContentLoaded', filtering);
} else {
    // そうでなければ即実行
    filtering()
}
